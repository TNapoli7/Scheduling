"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  validateCompliance,
  getViolationsForCell,
  type ComplianceViolation,
} from "@/lib/compliance";
import { getPortugueseHolidaysRange } from "@/lib/holidays";
import { exportSchedulePDF, exportScheduleExcel } from "@/lib/export";
import { SkeletonTable } from "@/components/ui/skeleton";
import { logActivity } from "@/lib/activity-log";
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

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
// Indexed by Date.getDay() (0 = Sunday ... 6 = Saturday) to match organizations.operating_hours keys
const WEEKDAY_LONG_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

// Diagonal stripes overlay for closures (national holidays, company-closed days, municipal holidays).
// Applied on top of a base background color (red-soft for holidays, gray-sunken for closures).
const CLOSURE_STRIPES: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 3px, transparent 3px, transparent 9px)",
};
const HOLIDAY_STRIPES: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(220,38,38,0.22) 0px, rgba(220,38,38,0.22) 3px, transparent 3px, transparent 9px)",
};

function dayOfWeekPt(dateStr: string, getTranslation: (key: string) => string): string {
  const d = new Date(dateStr + "T00:00:00");
  return getTranslation(DAY_KEYS[d.getDay()]);
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

type OperatingHours = Record<string, { open?: string; close?: string; closed?: boolean }>;

function isCompanyClosedDay(
  dateStr: string,
  operatingHours: OperatingHours | null,
  municipalHoliday: string | null,
): boolean {
  if (municipalHoliday && municipalHoliday === dateStr) return true;
  if (!operatingHours) return false;
  const d = new Date(dateStr + "T00:00:00");
  const key = WEEKDAY_LONG_KEYS[d.getDay()];
  return operatingHours[key]?.closed === true;
}

interface PreviewResult {
  totalEntries: number;
  unfilled: {
    date: string;
    shift_id: string;
    shift_name: string;
    needed: number;
    assigned: number;
  }[];
  hours: {
    user_id: string;
    full_name: string;
    hours: number;
    weekly_hours: number;
  }[];
}

export default function SchedulePage() {
  const t = useTranslations("schedulePage");
  const m = useTranslations("months");
  const d = useTranslations("daysShort");

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const [layoutMode, setLayoutMode] = useState<"grid" | "byDay">("byDay");
  const [weekStart, setWeekStart] = useState(0);
  const [emptyPublishModal, setEmptyPublishModal] = useState(false);
  const [unpublishConfirm, setUnpublishConfirm] = useState(false);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [entries, setEntries] = useState<EntryWithShift[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
  const [municipalHoliday, setMunicipalHoliday] = useState<string | null>(null);

  const [assignModal, setAssignModal] = useState<{
    userId: string;
    date: string;
    userName: string;
  } | null>(null);
  const [assignSelection, setAssignSelection] = useState<Set<string>>(new Set());

  const [violationModal, setViolationModal] =
    useState<ComplianceViolation[] | null>(null);
  const [violationFilter, setViolationFilter] = useState<"all" | "block" | "warning">("all");

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [staffOverrides, setStaffOverrides] = useState<Record<string, number>>(
    {}
  );
  const [generating, setGenerating] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(
    null
  );
  const [confirming, setConfirming] = useState(false);
  const [generateDone, setGenerateDone] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [orgName, setOrgName] = useState("");

  const [unavailableDays, setUnavailableDays] = useState<
    Record<string, Set<string>>
  >({});

  const supabase = createClient();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const nationalHolidays = useMemo(
    () => getPortugueseHolidaysRange(year - 1, year + 1),
    [year]
  );
  const visibleDays = useMemo(() => {
    if (viewMode === "month") return days;
    const start = Math.max(0, Math.min(weekStart, days.length - 1));
    return days.slice(start, start + 7);
  }, [viewMode, weekStart, days]);

  const generateIssues = useMemo(() => {
    const issues: string[] = [];
    if (employees.length === 0) {
      issues.push(t("addEmployeesFirst"));
    }
    if (shifts.length === 0) {
      issues.push(t("createShiftsFirst"));
    }
    return issues;
  }, [employees, shifts, t]);
  const canGenerate = generateIssues.length === 0;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: emps } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .order("full_name");

    const { data: shiftData } = await supabase
      .from("shift_templates")
      .select("*")
      .eq("is_active", true)
      .order("start_time");

    let { data: sched } = await supabase
      .from("schedules")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single();

    if (!sched) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (profile?.org_id) {
          const { data: org } = await supabase
            .from("organizations")
            .select("name, operating_hours, municipal_holiday")
            .eq("id", profile.org_id)
            .single();
          if (org) {
            setOrgName(org.name);
            setOperatingHours((org.operating_hours as OperatingHours) || null);
            setMunicipalHoliday(org.municipal_holiday || null);
          }

          const { data: newSched } = await supabase
            .from("schedules")
            .insert({
              org_id: profile.org_id,
              year,
              month,
              status: "draft",
              created_by: user.id,
            })
            .select()
            .single();
          sched = newSched;
          if (newSched) {
            logActivity("schedule_created", "schedule", newSched.id, { month, year });
          }
        }
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();
        if (profile?.org_id) {
          const { data: org } = await supabase
            .from("organizations")
            .select("name, operating_hours, municipal_holiday")
            .eq("id", profile.org_id)
            .single();
          if (org) {
            setOrgName(org.name);
            setOperatingHours((org.operating_hours as OperatingHours) || null);
            setMunicipalHoliday(org.municipal_holiday || null);
          }
        }
      }
    }

    let entryData: EntryWithShift[] = [];
    if (sched) {
      const { data: rawEntries } = await supabase
        .from("schedule_entries")
        .select("*, shift_template:shift_templates(*)")
        .eq("schedule_id", sched.id);
      entryData = (rawEntries || []) as EntryWithShift[];
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

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

    const unavail: Record<string, Set<string>> = {};
    for (const a of (availData || []) as Availability[]) {
      if (!unavail[a.user_id]) unavail[a.user_id] = new Set();
      unavail[a.user_id].add(a.date);
    }
    for (const t of (timeOffData || []) as TimeOffRequest[]) {
      if (!unavail[t.user_id]) unavail[t.user_id] = new Set();
      const start = new Date(t.start_date);
      const end = new Date(t.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        if (dateStr >= startDate && dateStr <= endDate) {
          unavail[t.user_id].add(dateStr);
        }
      }
    }

    const empList = emps || [];
    const shiftList = shiftData || [];

    setEmployees(empList);
    setShifts(shiftList);
    setSchedule(sched);
    setEntries(entryData);
    setUnavailableDays(unavail);

    const overrides: Record<string, number> = {};
    for (const s of shiftList) {
      overrides[s.id] = s.min_staff;
    }
    setStaffOverrides(overrides);

    const v = validateCompliance(entryData, empList);
    setViolations(v);

    setLoading(false);
  }, [supabase, year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Persist layoutMode preference across sessions
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("shiftera.schedule.layoutMode") : null;
      if (saved === "grid" || saved === "byDay") {
        setLayoutMode(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("shiftera.schedule.layoutMode", layoutMode);
      }
    } catch {}
  }, [layoutMode]);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else setMonth(month + 1);
  }

  function getEntries(userId: string, date: string): EntryWithShift[] {
    return entries
      .filter((e) => e.user_id === userId && e.date === date)
      .sort((a, b) =>
        (a.shift_template?.start_time || "").localeCompare(b.shift_template?.start_time || ""),
      );
  }

  function getCellViolations(userId: string, date: string) {
    return getViolationsForCell(violations, userId, date);
  }

  function isUnavailable(userId: string, date: string): boolean {
    return unavailableDays[userId]?.has(date) || false;
  }

  function openAssignModal(userId: string, date: string, userName: string) {
    const existing = getEntries(userId, date).map((e) => e.shift_template_id);
    setAssignSelection(new Set(existing));
    setAssignModal({ userId, date, userName });
  }

  function toggleSelectedShift(shiftId: string) {
    setAssignSelection((prev) => {
      const next = new Set(prev);
      if (next.has(shiftId)) next.delete(shiftId);
      else next.add(shiftId);
      return next;
    });
  }

  async function saveAssignedShifts() {
    if (!assignModal || !schedule) return;
    setSaving(true);

    const existingEntries = getEntries(assignModal.userId, assignModal.date);
    const existingIds = new Set(existingEntries.map((e) => e.shift_template_id));
    const desiredIds = assignSelection;

    // Delete shifts that were removed
    const toDelete = existingEntries.filter((e) => !desiredIds.has(e.shift_template_id));
    if (toDelete.length > 0) {
      await supabase
        .from("schedule_entries")
        .delete()
        .in("id", toDelete.map((e) => e.id));
    }

    // Insert new shifts
    const toInsert = Array.from(desiredIds).filter((id) => !existingIds.has(id));
    if (toInsert.length > 0) {
      await supabase.from("schedule_entries").insert(
        toInsert.map((shiftId) => ({
          schedule_id: schedule.id,
          user_id: assignModal.userId,
          date: assignModal.date,
          shift_template_id: shiftId,
          is_holiday: !!nationalHolidays[assignModal.date],
        })),
      );
    }

    if (toInsert.length > 0 || toDelete.length > 0) {
      logActivity("shift_assigned", "schedule", schedule?.id, {
        employee_id: assignModal.userId,
        date: assignModal.date,
        added: toInsert,
        removed: toDelete.map((e) => e.shift_template_id),
      });
    }

    setAssignModal(null);
    setAssignSelection(new Set());
    setSaving(false);
    fetchData();
  }

  async function removeAllAssignments() {
    if (!assignModal) return;
    const existing = getEntries(assignModal.userId, assignModal.date);
    if (existing.length > 0) {
      setSaving(true);
      await supabase
        .from("schedule_entries")
        .delete()
        .in("id", existing.map((e) => e.id));
      logActivity("shift_removed", "schedule", schedule?.id, {
        employee_id: assignModal.userId,
        date: assignModal.date,
      });
      setAssignModal(null);
      setAssignSelection(new Set());
      setSaving(false);
      fetchData();
    }
  }

  async function handleGenerate() {
    if (!schedule) return;
    setGenerating(true);
    setPreviewResult(null);
    setGenerateError(null);

    const res = await fetch("/api/schedule/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleId: schedule.id,
        staffOverrides,
        dryRun: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
      setGenerateError("Erro ao gerar: " + (err.error || res.statusText));
      setGenerating(false);
      return;
    }

    const data = (await res.json()) as PreviewResult;
    setPreviewResult(data);
    setGenerating(false);
  }

  async function confirmGenerate() {
    if (!schedule) return;
    setConfirming(true);

    const res = await fetch("/api/schedule/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleId: schedule.id,
        staffOverrides,
        dryRun: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
      setGenerateError("Erro ao confirmar: " + (err.error || res.statusText));
      setConfirming(false);
      return;
    }

    setConfirming(false);
    setGenerateDone(true);
    fetchData();
  }

  async function clearSchedule() {
    if (!schedule) return;
    setSaving(true);
    await supabase
      .from("schedule_entries")
      .delete()
      .eq("schedule_id", schedule.id);
    logActivity("schedule_cleared", "schedule", schedule.id);
    setSaving(false);
    fetchData();
  }

  async function publishSchedule(skipEmptyCheck = false) {
    if (!schedule) return;

    const blocks = violations.filter((v) => v.severity === "block");
    if (blocks.length > 0) {
      setViolationModal(blocks);
      return;
    }

    if (!skipEmptyCheck && entries.length === 0) {
      setEmptyPublishModal(true);
      return;
    }

    setSaving(true);
    await supabase
      .from("schedules")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", schedule.id);

    logActivity("schedule_published", "schedule", schedule.id);
    const monthKey = MONTH_KEYS[month - 1];
    const notifications = employees.map((emp) => ({
      user_id: emp.id,
      type: "schedule_published",
      title: t("publishedTitle"),
      body: `O horário de ${m(monthKey)} ${year} foi publicado.`,
      metadata: { month, year, schedule_id: schedule.id },
    }));
    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }

    setEmptyPublishModal(false);
    setSaving(false);
    fetchData();
  }

  function unpublishSchedule() {
    setUnpublishConfirm(true);
  }

  async function doUnpublish() {
    if (!schedule) return;
    setSaving(true);
    await supabase
      .from("schedules")
      .update({ status: "draft", published_at: null })
      .eq("id", schedule.id);
    logActivity("schedule_unpublished", "schedule", schedule.id);
    setUnpublishConfirm(false);
    setSaving(false);
    fetchData();
  }

  function closeGenerateModal() {
    setShowGenerateModal(false);
    setPreviewResult(null);
    setGenerateDone(false);
    setGenerateError(null);
  }

  const blockCount = violations.filter((v) => v.severity === "block").length;
  const warnCount = violations.filter(
    (v) => v.severity === "warning"
  ).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <div className="h-8 w-32 bg-[color:var(--border-light)] rounded animate-pulse" />
          <div className="h-4 w-24 bg-[color:var(--border-light)] rounded animate-pulse mt-2" />
        </div>
        <div className="flex justify-center">
          <div className="h-6 w-48 bg-[color:var(--border-light)] rounded animate-pulse" />
        </div>
        <SkeletonTable rows={6} cols={10} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)] font-display tracking-tight">{t("title")}</h1>
          <p className="text-sm text-[color:var(--text-muted)] mt-1">
            {schedule?.status === "published" ? (
              <Badge variant="success">{t("statusPublished")}</Badge>
            ) : (
              <Badge variant="default">{t("statusDraft")}</Badge>
            )}
            {blockCount > 0 && (
              <span className="ml-2 text-[color:var(--danger)] font-medium">
                {blockCount} {blockCount !== 1 ? t("violationsPlural") : t("violation")}
              </span>
            )}
            {warnCount > 0 && (
              <span className="ml-2 text-[color:var(--warning)]">
                {warnCount} {warnCount !== 1 ? t("warningsPlural") : t("warningLabel")}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {violations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViolationModal(violations)}
            >
              <svg
                className="w-4 h-4 mr-1 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              {t("complianceIssuesTitle")}
            </Button>
          )}
          {schedule?.status === "draft" && entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSchedule}
              loading={saving}
              className="text-[color:var(--danger)] hover:bg-[color:var(--danger-soft)]"
            >
              {t("clearButton")}
            </Button>
          )}
          {schedule?.status === "draft" && (
            <Button
              variant="secondary"
              onClick={() => setShowGenerateModal(true)}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {t("autoGenerateTitle")}
            </Button>
          )}
          {schedule?.status === "draft" && (
            <Button onClick={() => publishSchedule()} loading={saving}>
              {t("publishButton")}
            </Button>
          )}
          {schedule?.status === "published" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={unpublishSchedule}
              loading={saving}
              className="text-[color:var(--warning)] hover:bg-[color:var(--warning-soft)]"
            >
              {t("unpublishButton")}
            </Button>
          )}
          {entries.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  exportSchedulePDF(employees, entries, shifts, month, year, orgName)
                }
              >
                PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  exportScheduleExcel(employees, entries, shifts, month, year, orgName)
                }
              >
                Excel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          &lt;
        </Button>
        <h2 className="text-lg font-semibold text-[color:var(--text-primary)] min-w-[180px] text-center font-display tracking-tight">
          {m(MONTH_KEYS[month - 1])} {year}
        </h2>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          &gt;
        </Button>
        <div className="flex items-center gap-1 ml-2 border-l border-[color:var(--border)] pl-3">
          <Button
            variant={layoutMode === "byDay" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("byDay")}
          >
            {t("viewByDay")}
          </Button>
          <Button
            variant={layoutMode === "grid" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("grid")}
          >
            {t("viewByEmployee")}
          </Button>
        </div>
        <div className="flex items-center gap-1 border-l border-[color:var(--border)] pl-3">
          <Button
            variant={viewMode === "month" ? "primary" : "ghost"}
            size="sm"
            onClick={() => { setViewMode("month"); setWeekStart(0); }}
          >
            {t("viewMonth")}
          </Button>
          <Button
            variant={viewMode === "week" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            {t("viewWeek")}
          </Button>
        </div>
        {viewMode === "week" && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekStart(Math.max(0, weekStart - 7))}
              disabled={weekStart === 0}
              title={t("prevWeek")}
            >
              ◀
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekStart(Math.min(days.length - 7, weekStart + 7))}
              disabled={weekStart + 7 >= days.length}
              title={t("nextWeek")}
            >
              ▶
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 px-1">
        {shifts.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-1.5 text-xs text-[color:var(--text-secondary)]"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span>
              {s.name} ({s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)})
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-secondary)]">
          <div className="w-3 h-3 rounded bg-stone-300" />
          <span>{t("unavailable")}</span>
        </div>
      </div>

      <div className="min-h-[640px]">
      {employees.length === 0 || shifts.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-[color:var(--text-muted)]">
            {employees.length === 0
              ? t("addEmployeesFirst")
              : t("createShiftsFirst")}
          </div>
        </Card>
      ) : layoutMode === "byDay" ? (
        <Card>
          <div className="p-3 sm:p-4">
            {visibleDays.length === 0 ? (
              <p className="text-center py-8 text-sm text-[color:var(--text-muted)]">
                {t("dayViewEmptyMonth")}
              </p>
            ) : (
              <div className="divide-y divide-[color:var(--border-light)]">
                {visibleDays.map((day) => {
                  const dayEntries = entries
                    .filter((e) => e.date === day)
                    .sort((a, b) =>
                      (a.shift_template?.start_time || "").localeCompare(
                        b.shift_template?.start_time || ""
                      )
                    );
                  const weekend = isWeekend(day);
                  const nationalHol = nationalHolidays[day];
                  const isMunicipal = municipalHoliday === day;
                  const isHoliday = !!nationalHol || isMunicipal;
                  const isClosure = !isHoliday && isCompanyClosedDay(day, operatingHours, null);
                  const dow = dayOfWeekPt(day, (key: string) => d(key));
                  const dayNum = parseInt(day.slice(8));

                  const rowClass = `py-2.5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 -mx-3 sm:-mx-4 px-3 sm:px-4 ${
                    isHoliday
                      ? "bg-[color:var(--danger-soft)]/40"
                      : isClosure
                      ? "bg-[color:var(--surface-sunken)]"
                      : weekend
                      ? "bg-[color:var(--surface-sunken)]/60"
                      : ""
                  }`;
                  const rowStyle = isHoliday
                    ? HOLIDAY_STRIPES
                    : isClosure
                    ? CLOSURE_STRIPES
                    : undefined;

                  return (
                    <div key={day} className={rowClass} style={rowStyle}>
                      <div className="sm:min-w-[160px] flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs text-[color:var(--text-muted)] uppercase tracking-wide">
                          {dow}
                        </span>
                        <span className="text-lg font-semibold text-[color:var(--text-primary)]">
                          {dayNum}
                        </span>
                        {nationalHol && (
                          <Badge variant="danger" className="ml-1">
                            {nationalHol}
                          </Badge>
                        )}
                        {isMunicipal && !nationalHol && (
                          <Badge variant="danger" className="ml-1">
                            {t("municipalHolidayLabel")}
                          </Badge>
                        )}
                        {isClosure && (
                          <Badge variant="default" className="ml-1">
                            {t("closedDayLabel")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 flex flex-wrap gap-1.5">
                        {dayEntries.length === 0 ? (
                          <span className="text-xs italic text-[color:var(--text-muted)]">
                            {t("noOneWorking")}
                          </span>
                        ) : (
                          dayEntries.map((entry) => {
                            const emp = employees.find((e) => e.id === entry.user_id);
                            const start = entry.shift_template?.start_time?.slice(0, 5) || "";
                            const end = entry.shift_template?.end_time?.slice(0, 5) || "";
                            return (
                              <span
                                key={entry.id}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-[color:var(--surface)] border border-[color:var(--border-light)]"
                              >
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      entry.shift_template?.color || "#6B7280",
                                  }}
                                />
                                <span className="font-medium text-[color:var(--text-primary)]">
                                  {emp?.full_name || "—"}
                                </span>
                                <span className="text-[color:var(--text-muted)]">
                                  {entry.shift_template?.name}
                                  {start && end ? ` · ${start}–${end}` : ""}
                                </span>
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="border border-[color:var(--border-light)] rounded-lg overflow-x-auto bg-[color:var(--surface)]">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="bg-[color:var(--surface-sunken)]">
                <th className="sticky left-0 z-10 bg-[color:var(--surface-sunken)] px-3 py-2 text-left font-medium text-[color:var(--text-secondary)] border-b border-r border-[color:var(--border-light)] min-w-[140px]">
                  {t("employeeHeader")}
                </th>
                {visibleDays.map((day) => {
                  const weekend = isWeekend(day);
                  const nationalHol = nationalHolidays[day];
                  const isMunicipal = municipalHoliday === day;
                  const isHoliday = !!nationalHol || isMunicipal;
                  const isClosure = !isHoliday && isCompanyClosedDay(day, operatingHours, null);
                  const dayNum = day.slice(8);
                  const dow = dayOfWeekPt(day, (key: string) => d(key));
                  const thClass =
                    "px-1 py-2 text-center font-medium border-b border-[color:var(--border-light)] min-w-[44px] " +
                    (isHoliday
                      ? "bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
                      : isClosure
                      ? "bg-[color:var(--surface-sunken)] text-[color:var(--text-muted)]"
                      : weekend
                      ? "bg-[color:var(--surface-sunken)] text-[color:var(--text-muted)]"
                      : "text-[color:var(--text-secondary)]");
                  const thStyle = isHoliday
                    ? HOLIDAY_STRIPES
                    : isClosure
                    ? CLOSURE_STRIPES
                    : undefined;
                  const thTitle = nationalHol
                    ? nationalHol
                    : isMunicipal
                    ? t("municipalHolidayLabel")
                    : isClosure
                    ? t("closedDayLabel")
                    : undefined;
                  return (
                    <th
                      key={day}
                      className={thClass}
                      style={thStyle}
                      title={thTitle}
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
                <tr key={emp.id} className="hover:bg-[color:var(--surface-sunken)]/50">
                  <td className="sticky left-0 z-10 bg-[color:var(--surface)] px-3 py-1.5 font-medium text-[color:var(--text-primary)] border-b border-r border-[color:var(--border-light)] truncate max-w-[140px]">
                    <div className="truncate" title={emp.full_name}>
                      {emp.full_name}
                    </div>
                    <div className="text-[10px] text-[color:var(--text-muted)] font-normal">
                      {emp.contract_type === "full_time"
                        ? emp.weekly_hours + "h"
                        : "PT " + emp.weekly_hours + "h"}
                    </div>
                  </td>
                  {visibleDays.map((day) => {
                    const cellEntries = getEntries(emp.id, day);
                    const cellViolations = getCellViolations(emp.id, day);
                    const hasBlock = cellViolations.some(
                      (v) => v.severity === "block"
                    );
                    const hasWarn = cellViolations.some(
                      (v) => v.severity === "warning"
                    );
                    const weekend = isWeekend(day);
                    const nationalHol = !!nationalHolidays[day];
                    const isMunicipal = municipalHoliday === day;
                    const isHoliday = nationalHol || isMunicipal;
                    const isClosure = !isHoliday && isCompanyClosedDay(day, operatingHours, null);
                    const unavailable = isUnavailable(emp.id, day);
                    const hasEntry = cellEntries.length > 0;

                    const tdClass =
                      "border-b border-[color:var(--border-light)] text-center cursor-pointer transition-colors p-0.5 " +
                      (unavailable && !hasEntry
                        ? "bg-[color:var(--border-light)] "
                        : isHoliday
                        ? "bg-[color:var(--danger-soft)]/50 "
                        : isClosure
                        ? "bg-[color:var(--surface-sunken)] "
                        : weekend
                        ? "bg-[color:var(--surface-sunken)] "
                        : "") +
                      (hasBlock ? "ring-2 ring-inset ring-red-400 " : "") +
                      (hasWarn && !hasBlock
                        ? "ring-1 ring-inset ring-amber-300 "
                        : "") +
                      "hover:bg-[color:var(--accent-soft)]";

                    const tdStyle =
                      !hasEntry && isHoliday
                        ? HOLIDAY_STRIPES
                        : !hasEntry && isClosure
                        ? CLOSURE_STRIPES
                        : undefined;

                    const tdTitle =
                      unavailable && !hasEntry
                        ? t("unavailable")
                        : cellViolations.length > 0
                        ? cellViolations.map((v) => v.rule).join("\n")
                        : undefined;

                    return (
                      <td
                        key={day}
                        className={tdClass}
                        style={tdStyle}
                        onClick={() =>
                          schedule?.status === "draft" &&
                          openAssignModal(emp.id, day, emp.full_name)
                        }
                        title={tdTitle}
                      >
                        {hasEntry ? (
                          <div className="flex flex-col gap-[1px]">
                            {cellEntries.slice(0, 2).map((entry) => (
                              <div
                                key={entry.id}
                                className="rounded px-0.5 py-0.5 text-white font-medium text-[10px] leading-tight"
                                style={{
                                  backgroundColor:
                                    entry.shift_template?.color || "#6B7280",
                                }}
                              >
                                {entry.shift_template?.name?.slice(0, 3) || "?"}
                              </div>
                            ))}
                            {cellEntries.length > 2 && (
                              <div className="text-[9px] text-[color:var(--text-muted)] font-medium">
                                +{cellEntries.length - 2}
                              </div>
                            )}
                          </div>
                        ) : unavailable ? (
                          <div className="py-1 text-[color:var(--text-muted)] text-[10px] font-medium">
                            IND
                          </div>
                        ) : (
                          <div className="py-1 text-stone-300">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      <Modal
        open={!!assignModal}
        onClose={() => {
          setAssignModal(null);
          setAssignSelection(new Set());
        }}
        title={t("assignShiftTitle")}
        size="sm"
      >
        {assignModal && (
          <div className="space-y-3">
            <p className="text-sm text-[color:var(--text-secondary)]">
              <span className="font-medium">{assignModal.userName}</span>
              {" — "}
              {parseInt(assignModal.date.slice(8))}{" "}
              {m(MONTH_KEYS[parseInt(assignModal.date.slice(5, 7)) - 1])}
              {nationalHolidays[assignModal.date] && (
                <Badge variant="danger" className="ml-2">
                  {nationalHolidays[assignModal.date]}
                </Badge>
              )}
              {isUnavailable(assignModal.userId, assignModal.date) && (
                <Badge variant="warning" className="ml-2">
                  {t("unavailable")}
                </Badge>
              )}
            </p>
            <p className="text-xs text-[color:var(--text-muted)]">
              {t("multipleShiftsHint")}
            </p>
            <div className="space-y-2">
              {shifts.map((shift) => {
                const checked = assignSelection.has(shift.id);
                return (
                  <label
                    key={shift.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
                        : "border-[color:var(--border-light)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelectedShift(shift.id)}
                      disabled={saving}
                      className="w-4 h-4 accent-[color:var(--accent)] flex-shrink-0"
                    />
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: shift.color }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-[color:var(--text-primary)] text-sm">
                        {shift.name}
                      </p>
                      <p className="text-xs text-[color:var(--text-muted)]">
                        {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[color:var(--border-light)]">
              {getEntries(assignModal.userId, assignModal.date).length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeAllAssignments}
                  loading={saving}
                  className="text-[color:var(--danger)] hover:text-[color:var(--danger)] hover:bg-[color:var(--danger-soft)]"
                >
                  {t("removeAssignment")}
                </Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAssignModal(null);
                    setAssignSelection(new Set());
                  }}
                  disabled={saving}
                >
                  {t("cancel")}
                </Button>
                <Button size="sm" onClick={saveAssignedShifts} loading={saving}>
                  {t("confirmAssign")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!violationModal}
        onClose={() => {
          setViolationModal(null);
          setViolationFilter("all");
        }}
        title={t("complianceIssuesTitle")}
        size="lg"
      >
        {violationModal && (() => {
          const totalBlock = violationModal.filter((v) => v.severity === "block").length;
          const totalWarn = violationModal.filter((v) => v.severity === "warning").length;
          const filtered = violationModal
            .filter((v) => violationFilter === "all" || v.severity === violationFilter)
            .slice()
            .sort((a, b) => {
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              // Within same date, blocks first then warnings
              if (a.severity !== b.severity) return a.severity === "block" ? -1 : 1;
              return a.rule.localeCompare(b.rule);
            });

          const pillBase =
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors";
          const pillActive = (variant: "all" | "warning" | "block") => {
            if (violationFilter !== variant) return "";
            if (variant === "block")
              return " bg-[color:var(--danger-soft)] border-[color:var(--danger)] text-[color:var(--danger)]";
            if (variant === "warning")
              return " bg-[color:var(--warning-soft)] border-[color:var(--warning)] text-[color:var(--warning)]";
            return " bg-[color:var(--accent-soft)] border-[color:var(--accent)] text-[color:var(--accent)]";
          };
          const pillInactive =
            " bg-[color:var(--surface)] border-[color:var(--border-light)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-sunken)]";

          return (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={pillBase + (violationFilter === "all" ? pillActive("all") : pillInactive)}
                  onClick={() => setViolationFilter("all")}
                >
                  {t("complianceFilterAll")} · {violationModal.length}
                </button>
                <button
                  type="button"
                  className={pillBase + (violationFilter === "block" ? pillActive("block") : pillInactive)}
                  onClick={() => setViolationFilter("block")}
                  disabled={totalBlock === 0}
                >
                  <span className="w-2 h-2 rounded-full bg-[color:var(--danger)]" />
                  {t("complianceFilterViolations")} · {totalBlock}
                </button>
                <button
                  type="button"
                  className={pillBase + (violationFilter === "warning" ? pillActive("warning") : pillInactive)}
                  onClick={() => setViolationFilter("warning")}
                  disabled={totalWarn === 0}
                >
                  <span className="w-2 h-2 rounded-full bg-[color:var(--warning)]" />
                  {t("complianceFilterWarnings")} · {totalWarn}
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filtered.length === 0 ? (
                  <p className="text-sm text-[color:var(--text-muted)] py-4 text-center">
                    {t("noIssuesFound")}
                  </p>
                ) : (
                  filtered.map((v, i) => {
                    const cardClass =
                      "p-3 rounded-lg border text-sm " +
                      (v.severity === "block"
                        ? "bg-[color:var(--danger-soft)] border-[color:var(--danger-soft)] text-[color:var(--danger)]"
                        : "bg-[color:var(--warning-soft)] border-[color:var(--warning-soft)] text-[color:var(--warning)]");
                    const dayNum = parseInt(v.date.slice(8));
                    const monthName = m(MONTH_KEYS[parseInt(v.date.slice(5, 7)) - 1]);
                    return (
                      <div key={i} className={cardClass}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant={v.severity === "block" ? "danger" : "warning"}>
                            {v.code}
                          </Badge>
                          <span className="font-medium">{v.message}</span>
                        </div>
                        <p className="text-xs opacity-80">
                          {dayNum} {monthName} — {v.rule}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={showGenerateModal}
        onClose={closeGenerateModal}
        title={t("autoGenerateTitle")}
        size="md"
      >
        <div className="space-y-4">
          {!previewResult && !generateDone && (
            <>
              {generateError && (
                <div className="text-sm text-[color:var(--danger)] bg-[color:var(--danger-soft)] border border-[color:var(--danger-soft)] rounded-md px-3 py-2">
                  {generateError}
                </div>
              )}
              {!canGenerate && (
                <div className="text-sm text-[color:var(--warning)] bg-[color:var(--warning-soft)] border border-[color:var(--warning-soft)] rounded-md px-3 py-2">
                  <p className="font-medium mb-1">{t("cannotGenerateYet")}:</p>
                  <ul className="list-disc ml-5 space-y-0.5">
                    {generateIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-[color:var(--text-secondary)]">
                {t("algorithmDescription")}
                {entries.length > 0 && (
                  <span className="block mt-1 text-[color:var(--warning)] font-medium">
                    {t("noteAlreadyAssignments")} {entries.length}. {t("algorithmFillsOnly")}. {t("clearFirstToRestart")}
                  </span>
                )}
              </p>

              <div>
                <h4 className="text-sm font-medium text-[color:var(--text-primary)] mb-2">
                  {t("staffPerShift")}
                </h4>
                <div className="space-y-2">
                  {shifts.map((shift) => (
                    <div key={shift.id} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: shift.color }}
                      />
                      <span className="text-sm text-[color:var(--text-secondary)] min-w-[100px]">
                        {shift.name}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        max={employees.length}
                        value={staffOverrides[shift.id] ?? shift.min_staff}
                        onChange={(e) =>
                          setStaffOverrides((prev) => ({
                            ...prev,
                            [shift.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-20"
                      />
                      <span className="text-xs text-[color:var(--text-muted)]">
                        (default: {shift.min_staff})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {Object.keys(unavailableDays).length > 0 && (
                <p className="text-xs text-[color:var(--text-muted)]">
                  {t("employeesWithUnavailability")} {Object.keys(unavailableDays).length}
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={closeGenerateModal}>
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleGenerate}
                  loading={generating}
                  disabled={!canGenerate}
                >
                  {t("preview")}
                </Button>
              </div>
            </>
          )}

          {previewResult && !generateDone && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">
                  {t("preview")}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {t("notSavedYet")}
                </p>
              </div>

              <div className="text-center py-2">
                <p className="text-2xl font-bold text-[color:var(--text-primary)]">
                  {previewResult.totalEntries}
                </p>
                <p className="text-xs text-[color:var(--text-muted)]">
                  {t("shiftsToAssign")}
                </p>
              </div>

              {previewResult.unfilled.length > 0 && (
                <div className="bg-[color:var(--warning-soft)] border border-[color:var(--warning-soft)] rounded-lg p-3">
                  <p className="text-sm font-medium text-[color:var(--warning)] mb-2">
                    {t("shiftsToFill", { count: previewResult.unfilled.length })}
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {previewResult.unfilled.slice(0, 10).map((u, i) => (
                      <div
                        key={i}
                        className="text-xs text-[color:var(--warning)] flex justify-between"
                      >
                        <span>
                          {u.date} — {u.shift_name}
                        </span>
                        <span className="font-mono">
                          {u.assigned}/{u.needed}
                        </span>
                      </div>
                    ))}
                    {previewResult.unfilled.length > 10 && (
                      <div className="text-xs text-[color:var(--warning)] italic">
                        {t("andMoreShifts", { count: previewResult.unfilled.length - 10 })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {previewResult.hours.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--text-primary)] mb-2">
                    {t("hoursPerEmployee")}
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {previewResult.hours.map((h) => {
                      const expected = (h.weekly_hours || 0) * 4.3;
                      const ratio = expected > 0 ? h.hours / expected : 0;
                      const warn = ratio < 0.7 || ratio > 1.1;
                      const hoursClass =
                        "font-mono " +
                        (warn ? "text-[color:var(--warning)]" : "text-[color:var(--text-muted)]");
                      return (
                        <div
                          key={h.user_id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-[color:var(--text-secondary)]">{h.full_name}</span>
                          <span className={hoursClass}>
                            {h.hours.toFixed(0)}h / ~{expected.toFixed(0)}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setPreviewResult(null)}
                  disabled={confirming}
                >
                  {t("back")}
                </Button>
                <Button onClick={confirmGenerate} loading={confirming}>
                  {t("confirmAndSave")}
                </Button>
              </div>
            </>
          )}

          {generateDone && (
            <>
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  {t("scheduleGenerated")}
                </h3>
                <p className="text-sm text-[color:var(--text-muted)] mt-1">
                  {t("assignmentsSaved")}
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button onClick={closeGenerateModal}>{t("reviewSchedule")}</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        open={emptyPublishModal}
        onClose={() => setEmptyPublishModal(false)}
        title={t("emptyScheduleTitle")}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[color:var(--text-secondary)]">
            {t("emptyScheduleBody")}
          </p>
          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="ghost"
              onClick={() => setEmptyPublishModal(false)}
              disabled={saving}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={() => publishSchedule(true)}
              loading={saving}
              className="bg-[color:var(--warning)] hover:opacity-90"
            >
              {t("continuePublish")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!unpublishConfirm}
        onClose={() => setUnpublishConfirm(false)}
        title={t("unpublishButton")}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[color:var(--text-secondary)]">
            {t("confirmUnpublish")}
          </p>
          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="ghost"
              onClick={() => setUnpublishConfirm(false)}
              disabled={saving}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={doUnpublish}
              loading={saving}
              className="text-[color:var(--warning)]"
            >
              {t("unpublishButton")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
