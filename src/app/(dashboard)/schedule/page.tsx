"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

function dayOfWeekPt(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][d.getDay()];
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

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
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [entries, setEntries] = useState<EntryWithShift[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [assignModal, setAssignModal] = useState<{
    userId: string;
    date: string;
    userName: string;
  } | null>(null);

  const [violationModal, setViolationModal] =
    useState<ComplianceViolation[] | null>(null);

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
            .select("name")
            .eq("id", profile.org_id)
            .single();
          if (org) setOrgName(org.name);

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
            .select("name")
            .eq("id", profile.org_id)
            .single();
          if (org) setOrgName(org.name);
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

  function getEntry(userId: string, date: string): EntryWithShift | undefined {
    return entries.find((e) => e.user_id === userId && e.date === date);
  }

  function getCellViolations(userId: string, date: string) {
    return getViolationsForCell(violations, userId, date);
  }

  function isUnavailable(userId: string, date: string): boolean {
    return unavailableDays[userId]?.has(date) || false;
  }

  async function assignShift(shiftId: string) {
    if (!assignModal || !schedule) return;
    setSaving(true);

    const existing = getEntry(assignModal.userId, assignModal.date);

    if (existing) {
      await supabase
        .from("schedule_entries")
        .update({ shift_template_id: shiftId })
        .eq("id", existing.id);
    } else {
      await supabase.from("schedule_entries").insert({
        schedule_id: schedule.id,
        user_id: assignModal.userId,
        date: assignModal.date,
        shift_template_id: shiftId,
        is_holiday: !!nationalHolidays[assignModal.date],
      });
    }

    setAssignModal(null);
    setSaving(false);
    fetchData();
  }

  async function removeAssignment() {
    if (!assignModal) return;
    const existing = getEntry(assignModal.userId, assignModal.date);
    if (existing) {
      setSaving(true);
      await supabase.from("schedule_entries").delete().eq("id", existing.id);
      setAssignModal(null);
      setSaving(false);
      fetchData();
    }
  }

  async function handleGenerate() {
    if (!schedule) return;
    setGenerating(true);
    setPreviewResult(null);

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
      alert("Erro ao gerar: " + (err.error || res.statusText));
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
      alert("Erro ao confirmar: " + (err.error || res.statusText));
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
    setSaving(false);
    fetchData();
  }

  async function publishSchedule() {
    if (!schedule) return;

    const blocks = violations.filter((v) => v.severity === "block");
    if (blocks.length > 0) {
      setViolationModal(blocks);
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

    const notifications = employees.map((emp) => ({
      user_id: emp.id,
      type: "schedule_published",
      title: "Horario publicado",
      body: `O horario de ${MONTH_NAMES[month - 1]} ${year} foi publicado.`,
      metadata: { month, year, schedule_id: schedule.id },
    }));
    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }

    setSaving(false);
    fetchData();
  }

  async function unpublishSchedule() {
    if (!schedule) return;
    if (
      !confirm(
        "Tem a certeza que quer despublicar? O horario volta a rascunho e pode ser editado."
      )
    ) {
      return;
    }
    setSaving(true);
    await supabase
      .from("schedules")
      .update({ status: "draft", published_at: null })
      .eq("id", schedule.id);
    setSaving(false);
    fetchData();
  }

  function closeGenerateModal() {
    setShowGenerateModal(false);
    setPreviewResult(null);
    setGenerateDone(false);
  }

  const blockCount = violations.filter((v) => v.severity === "block").length;
  const warnCount = violations.filter(
    (v) => v.severity === "warning"
  ).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <div className="h-8 w-32 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-stone-200 rounded animate-pulse mt-2" />
        </div>
        <div className="flex justify-center">
          <div className="h-6 w-48 bg-stone-200 rounded animate-pulse" />
        </div>
        <SkeletonTable rows={6} cols={10} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Horario</h1>
          <p className="text-sm text-stone-500 mt-1">
            {schedule?.status === "published" ? (
              <Badge variant="success">Publicado</Badge>
            ) : (
              <Badge variant="default">Rascunho</Badge>
            )}
            {blockCount > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                {blockCount} violacao{blockCount !== 1 ? "oes" : ""}
              </span>
            )}
            {warnCount > 0 && (
              <span className="ml-2 text-amber-600">
                {warnCount} aviso{warnCount !== 1 ? "s" : ""}
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
              Ver problemas
            </Button>
          )}
          {schedule?.status === "draft" && entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSchedule}
              loading={saving}
              className="text-red-600 hover:bg-red-50"
            >
              Limpar
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
              Gerar Horario
            </Button>
          )}
          {schedule?.status === "draft" && (
            <Button onClick={publishSchedule} loading={saving}>
              Publicar
            </Button>
          )}
          {schedule?.status === "published" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={unpublishSchedule}
              loading={saving}
              className="text-amber-600 hover:bg-amber-50"
            >
              Despublicar
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

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          &lt;
        </Button>
        <h2 className="text-lg font-semibold text-stone-900 min-w-[180px] text-center">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          &gt;
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 px-1">
        {shifts.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-1.5 text-xs text-stone-600"
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
        <div className="flex items-center gap-1.5 text-xs text-stone-600">
          <div className="w-3 h-3 rounded bg-stone-300" />
          <span>Indisponivel</span>
        </div>
      </div>

      {employees.length === 0 || shifts.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-stone-500">
            {employees.length === 0
              ? "Adiciona funcionarios na pagina Equipa primeiro."
              : "Cria turnos na pagina Turnos primeiro."}
          </div>
        </Card>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-x-auto bg-white">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="sticky left-0 z-10 bg-stone-50 px-3 py-2 text-left font-medium text-stone-600 border-b border-r border-stone-200 min-w-[140px]">
                  Funcionario
                </th>
                {days.map((day) => {
                  const weekend = isWeekend(day);
                  const holiday = nationalHolidays[day];
                  const dayNum = day.slice(8);
                  const dow = dayOfWeekPt(day);
                  const thClass =
                    "px-1 py-2 text-center font-medium border-b border-stone-200 min-w-[44px] " +
                    (holiday
                      ? "bg-red-50 text-red-700"
                      : weekend
                      ? "bg-stone-100 text-stone-500"
                      : "text-stone-600");
                  return (
                    <th
                      key={day}
                      className={thClass}
                      title={holiday || undefined}
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
                    <div className="truncate" title={emp.full_name}>
                      {emp.full_name}
                    </div>
                    <div className="text-[10px] text-stone-400 font-normal">
                      {emp.contract_type === "full_time"
                        ? emp.weekly_hours + "h"
                        : "PT " + emp.weekly_hours + "h"}
                    </div>
                  </td>
                  {days.map((day) => {
                    const entry = getEntry(emp.id, day);
                    const cellViolations = getCellViolations(emp.id, day);
                    const hasBlock = cellViolations.some(
                      (v) => v.severity === "block"
                    );
                    const hasWarn = cellViolations.some(
                      (v) => v.severity === "warning"
                    );
                    const weekend = isWeekend(day);
                    const holiday = !!nationalHolidays[day];
                    const unavailable = isUnavailable(emp.id, day);

                    const tdClass =
                      "border-b border-stone-100 text-center cursor-pointer transition-colors p-0.5 " +
                      (unavailable && !entry
                        ? "bg-stone-200 "
                        : holiday
                        ? "bg-red-50/50 "
                        : weekend
                        ? "bg-stone-50 "
                        : "") +
                      (hasBlock ? "ring-2 ring-inset ring-red-400 " : "") +
                      (hasWarn && !hasBlock
                        ? "ring-1 ring-inset ring-amber-300 "
                        : "") +
                      "hover:bg-indigo-50";

                    const tdTitle =
                      unavailable && !entry
                        ? "Indisponivel"
                        : cellViolations.length > 0
                        ? cellViolations.map((v) => v.rule).join("\n")
                        : undefined;

                    return (
                      <td
                        key={day}
                        className={tdClass}
                        onClick={() =>
                          schedule?.status === "draft" &&
                          setAssignModal({
                            userId: emp.id,
                            date: day,
                            userName: emp.full_name,
                          })
                        }
                        title={tdTitle}
                      >
                        {entry ? (
                          <div
                            className="rounded px-0.5 py-1 text-white font-medium text-[10px] leading-tight"
                            style={{
                              backgroundColor:
                                entry.shift_template?.color || "#6B7280",
                            }}
                          >
                            {entry.shift_template?.name?.slice(0, 3) || "?"}
                          </div>
                        ) : unavailable ? (
                          <div className="py-1 text-stone-400 text-[10px] font-medium">
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

      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Atribuir turno"
        size="sm"
      >
        {assignModal && (
          <div className="space-y-3">
            <p className="text-sm text-stone-600">
              <span className="font-medium">{assignModal.userName}</span>
              {" — "}
              {parseInt(assignModal.date.slice(8))}{" "}
              {MONTH_NAMES[parseInt(assignModal.date.slice(5, 7)) - 1]}
              {nationalHolidays[assignModal.date] && (
                <Badge variant="danger" className="ml-2">
                  {nationalHolidays[assignModal.date]}
                </Badge>
              )}
              {isUnavailable(assignModal.userId, assignModal.date) && (
                <Badge variant="warning" className="ml-2">
                  Indisponivel
                </Badge>
              )}
            </p>
            <div className="space-y-2">
              {shifts.map((shift) => (
                <button
                  key={shift.id}
                  onClick={() => assignShift(shift.id)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-blue-300 hover:bg-indigo-50 transition-colors text-left disabled:opacity-50"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: shift.color }}
                  />
                  <div>
                    <p className="font-medium text-stone-900 text-sm">
                      {shift.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {shift.start_time.slice(0, 5)} -{" "}
                      {shift.end_time.slice(0, 5)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {getEntry(assignModal.userId, assignModal.date) && (
              <div className="pt-3 border-t border-stone-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeAssignment}
                  loading={saving}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                >
                  Remover atribuicao
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!violationModal}
        onClose={() => setViolationModal(null)}
        title="Problemas de conformidade"
        size="lg"
      >
        {violationModal && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {violationModal.length === 0 ? (
              <p className="text-sm text-stone-500">
                Nenhum problema encontrado.
              </p>
            ) : (
              violationModal.map((v, i) => {
                const cardClass =
                  "p-3 rounded-lg border text-sm " +
                  (v.severity === "block"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-800");
                return (
                  <div key={i} className={cardClass}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={v.severity === "block" ? "danger" : "warning"}
                      >
                        {v.code}
                      </Badge>
                      <span className="font-medium">{v.message}</span>
                    </div>
                    <p className="text-xs opacity-80">
                      {v.date} — {v.rule}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={showGenerateModal}
        onClose={closeGenerateModal}
        title="Gerar Horario Automaticamente"
        size="md"
      >
        <div className="space-y-4">
          {!previewResult && !generateDone && (
            <>
              <p className="text-sm text-stone-600">
                O algoritmo distribui os turnos pelos funcionarios respeitando
                as regras de compliance, indisponibilidades aprovadas e
                equilibrio de fairness.
                {entries.length > 0 && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    Nota: Ja existem {entries.length} atribuicoes. O algoritmo
                    apenas preenche os turnos em falta. Para recomecar, limpe o
                    horario primeiro.
                  </span>
                )}
              </p>

              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-2">
                  Pessoas por turno (pode ajustar)
                </h4>
                <div className="space-y-2">
                  {shifts.map((shift) => (
                    <div key={shift.id} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: shift.color }}
                      />
                      <span className="text-sm text-stone-700 min-w-[100px]">
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
                      <span className="text-xs text-stone-400">
                        (default: {shift.min_staff})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {Object.keys(unavailableDays).length > 0 && (
                <p className="text-xs text-stone-500">
                  {Object.keys(unavailableDays).length} funcionario(s) com
                  indisponibilidades aprovadas este mes.
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={closeGenerateModal}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerate} loading={generating}>
                  Pre-visualizar
                </Button>
              </div>
            </>
          )}

          {previewResult && !generateDone && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">
                  Pre-visualizacao
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Ainda nada foi guardado. Revise antes de confirmar.
                </p>
              </div>

              <div className="text-center py-2">
                <p className="text-2xl font-bold text-stone-900">
                  {previewResult.totalEntries}
                </p>
                <p className="text-xs text-stone-500">
                  turno{previewResult.totalEntries !== 1 ? "s" : ""} ser
                  {previewResult.totalEntries !== 1 ? "ao" : "a"} atribuido
                  {previewResult.totalEntries !== 1 ? "s" : ""}
                </p>
              </div>

              {previewResult.unfilled.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    {previewResult.unfilled.length} turno
                    {previewResult.unfilled.length !== 1 ? "s" : ""} por
                    preencher
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {previewResult.unfilled.slice(0, 10).map((u, i) => (
                      <div
                        key={i}
                        className="text-xs text-amber-700 flex justify-between"
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
                      <div className="text-xs text-amber-600 italic">
                        + {previewResult.unfilled.length - 10} mais…
                      </div>
                    )}
                  </div>
                </div>
              )}

              {previewResult.hours.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-stone-900 mb-2">
                    Horas por funcionario
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {previewResult.hours.map((h) => {
                      const expected = (h.weekly_hours || 0) * 4.3;
                      const ratio = expected > 0 ? h.hours / expected : 0;
                      const warn = ratio < 0.7 || ratio > 1.1;
                      const hoursClass =
                        "font-mono " +
                        (warn ? "text-amber-600" : "text-stone-500");
                      return (
                        <div
                          key={h.user_id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-stone-700">{h.full_name}</span>
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
                  Voltar
                </Button>
                <Button onClick={confirmGenerate} loading={confirming}>
                  Confirmar e gravar
                </Button>
              </div>
            </>
          )}

          {generateDone && (
            <>
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-stone-900">
                  Horario gerado!
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  As atribuicoes foram guardadas.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button onClick={closeGenerateModal}>Rever horario</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
