"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useCurrentMembership } from "@/hooks/use-membership";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarOff } from "lucide-react";
import type { Profile, Availability, TimeOffRequest } from "@/types/database";

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

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;

function dayOfWeekPt(dateStr: string, tDays: (key: string) => string): string {
  const d = new Date(dateStr + "T00:00:00");
  return tDays(DAY_KEYS[d.getDay()]);
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

export default function AvailabilityPage() {
  const t = useTranslations("availability");
  const tMonths = useTranslations("months");
  const tDays = useTranslations("daysShort");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { membership, loading: memLoading, isManager } = useCurrentMembership();
  const myRole = membership?.role ?? "employee";
  const myId = membership?.userId ?? "";
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [availabilities, setAvailabilities] = useState<(Availability & { profile?: Profile })[]>([]);
  // Per-user set of dates covered by an approved time-off (férias/baixa/etc.).
  // Used to overlay vacation blocks on top of the availability grid, so that
  // approved férias automatically read as "indisponível" here without needing
  // a separate availability record.
  const [timeOffByUser, setTimeOffByUser] = useState<
    Record<string, Record<string, { type: string; period: string }>>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const fetchData = useCallback(async () => {
    if (!membership) return;
    setLoading(true);

    // Fetch employees (for manager view)
    if (membership.role === "admin" || membership.role === "manager") {
      const { data: emps } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true)
        .order("full_name");
      setEmployees(emps || []);
    } else {
      // For employees, fetch own profile row for grid display
      const { data: selfProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", membership.userId)
        .single();
      setEmployees(selfProfile ? [selfProfile] : []);
    }

    // Fetch availabilities for the month
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

    let query = supabase
      .from("availability")
      .select("*, profile:profiles!availability_user_id_fkey(*)")
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("available", false); // Only indisponibilidades

    if (membership.role === "employee") {
      query = query.eq("user_id", membership.userId);
    }

    const { data: avail } = await query;
    setAvailabilities((avail || []) as (Availability & { profile?: Profile })[]);

    // Fetch approved time-off requests overlapping the visible month and
    // expand each into a per-user day map. These will be overlaid on the grid.
    let timeOffQuery = supabase
      .from("time_off_requests")
      .select("*")
      .eq("status", "approved")
      .lte("start_date", endDate)
      .gte("end_date", startDate);
    if (membership.role === "employee") {
      timeOffQuery = timeOffQuery.eq("user_id", membership.userId);
    }
    const { data: offs } = await timeOffQuery;

    const map: Record<string, Record<string, { type: string; period: string }>> = {};
    for (const r of (offs || []) as TimeOffRequest[]) {
      const s = new Date(r.start_date + "T00:00:00");
      const e = new Date(r.end_date + "T00:00:00");
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const key = `${y}-${mm}-${dd}`;
        if (!map[r.user_id]) map[r.user_id] = {};
        // Don't overwrite an existing entry — first match wins (rare overlap).
        if (!map[r.user_id][key]) {
          map[r.user_id][key] = { type: r.type, period: r.period || "full_day" };
        }
      }
    }
    setTimeOffByUser(map);

    setLoading(false);
  }, [supabase, year, month, membership]);

  useEffect(() => { if (!memLoading && membership) fetchData(); }, [fetchData, memLoading, membership]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  // Get availability for a cell
  function getAvail(userId: string, date: string): (Availability & { profile?: Profile }) | undefined {
    return availabilities.find((a) => a.user_id === userId && a.date === date);
  }

  // Toggle unavailable (employee only)
  async function toggleUnavailable(userId: string, date: string) {
    if (isManager && userId !== myId) return; // Managers don't mark for others here
    setSaving(true);
    const existing = getAvail(userId, date);

    if (existing) {
      // Remove the unavailability
      await supabase.from("availability").delete().eq("id", existing.id);
    } else {
      // Mark as unavailable (pending)
      await supabase.from("availability").insert({
        user_id: userId,
        date,
        available: false,
        preference: "neutral",
        approval_status: "pending",
      });
      logActivity("availability_submitted", "availability");
    }

    setSaving(false);
    fetchData();
  }

  // Approve/reject all pending (manager only) for the current month view.
  async function reviewAllPending(status: "approved" | "rejected") {
    const pending = availabilities.filter((a) => a.approval_status === "pending");
    if (pending.length === 0) return;
    setSaving(true);
    const ids = pending.map((a) => a.id);
    await supabase
      .from("availability")
      .update({
        approval_status: status,
        reviewed_by: myId,
        reviewed_at: new Date().toISOString(),
      })
      .in("id", ids);
    logActivity(
      status === "approved" ? "availability_bulk_approved" : "availability_bulk_rejected",
      "availability",
      null,
      { count: ids.length },
    );
    // Fire notifications per user (grouped).
    const byUser: Record<string, typeof pending> = {};
    for (const a of pending) {
      if (!byUser[a.user_id]) byUser[a.user_id] = [];
      byUser[a.user_id].push(a);
    }
    for (const uid of Object.keys(byUser)) {
      const list = byUser[uid];
      await supabase.from("notifications").insert({
        user_id: uid,
        type: status === "approved" ? "availability_approved" : "availability_rejected",
        title:
          status === "approved"
            ? `${list.length} indisponibilidade${list.length !== 1 ? "s" : ""} aprovada${list.length !== 1 ? "s" : ""}`
            : `${list.length} indisponibilidade${list.length !== 1 ? "s" : ""} rejeitada${list.length !== 1 ? "s" : ""}`,
        body: list.map((a) => a.date).join(", "),
        metadata: { bulk: true, count: list.length },
      });
    }
    setSaving(false);
    fetchData();
  }

  // Approve/reject (manager only)
  async function reviewAvailability(availId: string, status: "approved" | "rejected") {
    setSaving(true);
    await supabase
      .from("availability")
      .update({
        approval_status: status,
        reviewed_by: myId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", availId);

    if (status === "approved") {
      logActivity("availability_approved", "availability", availId);
    } else if (status === "rejected") {
      logActivity("availability_rejected", "availability", availId);
    }

    // Create notification for the employee
    const avail = availabilities.find((a) => a.id === availId);
    if (avail) {
      await supabase.from("notifications").insert({
        user_id: avail.user_id,
        type: status === "approved" ? "availability_approved" : "availability_rejected",
        title: status === "approved" ? "Indisponibilidade aprovada" : "Indisponibilidade rejeitada",
        body: `A sua indisponibilidade para ${avail.date} foi ${status === "approved" ? "aprovada" : "rejeitada"}.`,
        metadata: { availability_id: availId, date: avail.date },
      });
    }

    setSaving(false);
    fetchData();
  }

  // Pending count
  const pendingCount = availabilities.filter((a) => a.approval_status === "pending").length;

  if (loading || memLoading) {
    return (
      <div className="space-y-4">
        <div>
          <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-stone-200 rounded animate-pulse mt-2" />
        </div>
        <div className="flex justify-center">
          <div className="h-6 w-48 bg-stone-200 rounded animate-pulse" />
        </div>
        <SkeletonTable rows={5} cols={10} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
          <p className="text-sm text-stone-500 mt-1">
            {isManager
              ? t("subtitleManager")
              : t("subtitleEmployee")}
            {pendingCount > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </p>
        </div>
      </div>

      {/* Bulk-review bar (manager only, when there are pending items) */}
      {isManager && pendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            {t("bulkReviewPrompt", { count: pendingCount })}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => reviewAllPending("rejected")}
              disabled={saving}
              className="!text-[color:var(--danger)] !border-[color:var(--danger-soft)] hover:!bg-[color:var(--danger-soft)]"
            >
              {t("rejectAll")}
            </Button>
            <Button
              size="sm"
              onClick={() => reviewAllPending("approved")}
              loading={saving}
            >
              {t("approveAll")}
            </Button>
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h2 className="text-lg font-semibold text-stone-900 min-w-[180px] text-center">
          {tMonths(MONTH_KEYS[month - 1])} {year}
        </h2>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1 text-xs text-stone-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          <span>{t("legendAvailable")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-100 border border-yellow-300" />
          <span>{t("legendPending")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          <span>{t("legendApproved")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-stone-100 border border-stone-300 line-through" />
          <span>{t("legendRejected")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300 flex items-center justify-center text-[7px] font-bold text-red-700">
            F
          </div>
          <span>{t("legendVacation")}</span>
        </div>
      </div>

      {/* Grid */}
      {employees.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="Sem disponibilidades"
          description="Marca os dias em que não estás disponível para que o gestor possa planear a escala."
        />
      ) : (
      <div className="border border-stone-200 rounded-lg overflow-x-auto bg-white">
        <table className="text-xs w-full border-collapse">
          <thead>
            <tr className="bg-stone-50">
              <th className="sticky left-0 z-10 bg-stone-50 px-3 py-2 text-left font-medium text-stone-600 border-b border-r border-stone-200 min-w-[140px]">
                {t("employeeHeader")}
              </th>
              {days.map((day) => {
                const weekend = isWeekend(day);
                const dayNum = day.slice(8);
                const dow = dayOfWeekPt(day, tDays);
                return (
                  <th
                    key={day}
                    className={`px-1 py-2 text-center font-medium border-b border-stone-200 min-w-[44px] ${
                      weekend ? "bg-stone-100 text-stone-500" : "text-stone-600"
                    }`}
                  >
                    <div>{dow}</div>
                    <div className="font-bold">{parseInt(dayNum)}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-stone-50/50">
                <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium text-stone-800 border-b border-r border-stone-200 truncate max-w-[140px]">
                  <div className="truncate" title={emp.full_name}>{emp.full_name}</div>
                </td>
                {days.map((day) => {
                  const avail = getAvail(emp.id, day);
                  const timeOff = timeOffByUser[emp.id]?.[day];
                  const weekend = isWeekend(day);
                  const isPast = new Date(day + "T23:59:59") < new Date();
                  // Can't edit a cell that is already covered by an approved time-off.
                  const canClick =
                    !isPast && !timeOff && (emp.id === myId || (!isManager));

                  let bgClass = weekend ? "bg-stone-50" : "";
                  let content = "";
                  let title = t("legendAvailable");
                  let textClass = "text-transparent";

                  if (timeOff) {
                    // Time-off takes precedence over availability entries.
                    bgClass = "bg-red-100";
                    content =
                      timeOff.type === "ferias"
                        ? "F"
                        : timeOff.type === "baixa"
                        ? "B"
                        : timeOff.type === "pessoal"
                        ? "P"
                        : "A";
                    title =
                      timeOff.type === "ferias"
                        ? t("legendVacation")
                        : timeOff.type === "baixa"
                        ? t("legendSickLeave")
                        : t("legendAbsence");
                    textClass = "text-red-700";
                  } else if (avail) {
                    if (avail.approval_status === "approved") {
                      bgClass = "bg-red-100";
                      content = "X";
                      title = t("legendApproved");
                      textClass = "text-red-600";
                    } else if (avail.approval_status === "pending") {
                      bgClass = "bg-amber-100";
                      content = "?";
                      title = t("legendPending");
                      textClass = "text-amber-600";
                    } else if (avail.approval_status === "rejected") {
                      bgClass = "bg-stone-100";
                      content = "—";
                      title = t("legendRejected");
                      textClass = "text-stone-400 line-through";
                    }
                  }

                  return (
                    <td
                      key={day}
                      className={`border-b border-stone-100 text-center p-0.5 transition-colors ${bgClass} ${
                        canClick ? "cursor-pointer hover:bg-indigo-50" : ""
                      } ${isPast ? "opacity-50" : ""} ${
                        timeOff ? "cursor-not-allowed" : ""
                      }`}
                      title={title}
                      onClick={() => {
                        if (canClick && !saving) toggleUnavailable(emp.id, day);
                      }}
                    >
                      <div className={`py-1 text-[10px] font-bold ${textClass}`}>
                        {content || "·"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Manager approval panel */}
      {isManager && pendingCount > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-stone-900 mb-3">
              {t("pendingRequests")} ({pendingCount})
            </h3>
            <div className="space-y-2">
              {availabilities
                .filter((a) => a.approval_status === "pending")
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((avail) => {
                  const emp = employees.find((e) => e.id === avail.user_id);
                  return (
                    <div
                      key={avail.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-amber-50/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {emp?.full_name || "—"}
                        </p>
                        <p className="text-xs text-stone-500">
                          {parseInt(avail.date.slice(8))} {tMonths(MONTH_KEYS[parseInt(avail.date.slice(5, 7)) - 1])}
                          {avail.reason && ` — ${avail.reason}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => reviewAvailability(avail.id, "rejected")}
                          loading={saving}
                          className="text-red-600 hover:bg-red-50"
                        >
                          {t("rejectButton")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => reviewAvailability(avail.id, "approved")}
                          loading={saving}
                        >
                          {t("approveButton")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
