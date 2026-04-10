import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSchedule, type SchedulerInput } from "@/lib/scheduler";
import { getPortugueseHolidaysRange } from "@/lib/holidays";
import type {
  Profile,
  ShiftTemplate,
  Schedule,
  ScheduleEntry,
  Availability,
  TimeOffRequest,
} from "@/types/database";

type EntryWithShift = ScheduleEntry & { shift_template: ShiftTemplate };

function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${d}`);
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      scheduleId,
      staffOverrides = {},
      dryRun = true,
    }: {
      scheduleId: string;
      staffOverrides?: Record<string, number>;
      dryRun?: boolean;
    } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: "scheduleId required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, org_id")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.org_id) {
      return NextResponse.json({ error: "No profile" }, { status: 403 });
    }

    if (profile.role !== "admin" && profile.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: schedule } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", scheduleId)
      .single();

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const typedSchedule = schedule as Schedule;

    if (typedSchedule.org_id !== profile.org_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (typedSchedule.status !== "draft") {
      return NextResponse.json(
        { error: "Schedule is not in draft" },
        { status: 400 }
      );
    }

    const year = typedSchedule.year;
    const month = typedSchedule.month;
    const days = getDaysInMonth(year, month);
    const startDate = days[0];
    const endDate = days[days.length - 1];

    const { data: empData } = await supabase
      .from("profiles")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("is_active", true)
      .order("full_name");

    const { data: shiftData } = await supabase
      .from("shift_templates")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("is_active", true)
      .order("start_time");

    const { data: rawEntries } = await supabase
      .from("schedule_entries")
      .select("*, shift_template:shift_templates(*)")
      .eq("schedule_id", scheduleId);

    const { data: availData } = await supabase
      .from("availability")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("available", false)
      .eq("approval_status", "approved");

    const { data: timeOffData } = await supabase
      .from("time_off_requests")
      .select("*")
      .eq("status", "approved")
      .lte("start_date", endDate)
      .gte("end_date", startDate);

    const employees = (empData || []) as Profile[];
    const shifts = (shiftData || []) as ShiftTemplate[];
    const entries = (rawEntries || []) as EntryWithShift[];

    const unavailableDays: Record<string, Set<string>> = {};
    for (const a of (availData || []) as Availability[]) {
      if (!unavailableDays[a.user_id]) unavailableDays[a.user_id] = new Set();
      unavailableDays[a.user_id].add(a.date);
    }
    for (const t of (timeOffData || []) as TimeOffRequest[]) {
      if (!unavailableDays[t.user_id]) unavailableDays[t.user_id] = new Set();
      const start = new Date(t.start_date);
      const end = new Date(t.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        if (dateStr >= startDate && dateStr <= endDate) {
          unavailableDays[t.user_id].add(dateStr);
        }
      }
    }

    const holidaysMap = getPortugueseHolidaysRange(year, year);
    const holidaySet = new Set(
      Object.keys(holidaysMap).filter((d) => d >= startDate && d <= endDate)
    );

    const input: SchedulerInput = {
      employees,
      shifts,
      days,
      staffOverrides,
      unavailableDays,
      existingEntries: entries,
      holidays: holidaySet,
    };

    const result = generateSchedule(input);

    const unfilledWithNames = result.stats.unfilled.map((u) => {
      const shift = shifts.find((s) => s.id === u.shift_id);
      return {
        date: u.date,
        shift_id: u.shift_id,
        shift_name: shift?.name || u.shift_id,
        needed: u.needed,
        assigned: u.assigned,
      };
    });

    const hoursList = employees
      .filter((e) => result.stats.employeeHours[e.id])
      .map((e) => ({
        user_id: e.id,
        full_name: e.full_name,
        hours: result.stats.employeeHours[e.id],
        weekly_hours: e.weekly_hours,
      }))
      .sort((a, b) => b.hours - a.hours);

    const response = {
      dryRun,
      totalEntries: result.entries.length,
      unfilled: unfilledWithNames,
      hours: hoursList,
      violations: result.violations,
      entries: result.entries,
    };

    if (dryRun) {
      return NextResponse.json(response);
    }

    if (result.entries.length > 0) {
      const toInsert = result.entries.map((e) => ({
        schedule_id: scheduleId,
        user_id: e.user_id,
        date: e.date,
        shift_template_id: e.shift_template_id,
        is_holiday: holidaySet.has(e.date),
      }));

      for (let i = 0; i < toInsert.length; i += 50) {
        const chunk = toInsert.slice(i, i + 50);
        const { error } = await supabase
          .from("schedule_entries")
          .insert(chunk);
        if (error) {
          return NextResponse.json(
            { error: "Insert failed: " + error.message },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
