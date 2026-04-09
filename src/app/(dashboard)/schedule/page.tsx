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
import { generateSchedule, type SchedulerInput } from "@/lib/scheduler";
import type {
  Profile,
  ShiftTemplate,
  Schedule,
  ScheduleEntry,
  Availability,
  TimeOffRequest,
} from "@/types/database";

type EntryWithShift = ScheduleEntry & { shift_template: ShiftTemplate };

// Portuguese public holidays 2025/2026
const NATIONAL_HOLIDAYS: Record<string, string> = {
  "2025-01-01": "Ano Novo",
  "2025-04-18": "Sexta-feira Santa",
  "2025-04-20": "Pascoa",
  "2025-04-25": "Dia da Liberdade",
  "2025-05-01": "Dia do Trabalhador",
  "2025-06-10": "Dia de Portugal",
  "2025-06-19": "Corpo de Deus",
  "2025-08-15": "Assuncao de Nossa Senhora",
  "2025-10-05": "Implantacao da Republica",
  "2025-11-01": "Todos os Santos",
  "2025-12-01": "Restauracao da Independencia",
  "2025-12-08": "Imaculada Conceicao",
  "2025-12-25": "Natal",
  "2026-01-01": "Ano Novo",
  "2026-04-03": "Sexta-feira Santa",
  "2026-04-05": "Pascoa",
  "2026-04-25": "Dia da Liberdade",
  "2026-05-01": "Dia do Trabalhador",
  "2026-06-04": "Corpo de Deus",
  "2026-06-10": "Dia de Portugal",
  "2026-08-15": "Assuncao de Nossa Senhora",
  "2026-10-05": "Implantacao da Republica",
  "2026-11-01": "Todos os Santos",
  "2026-12-01": "Restauracao da Independencia",
  "2026-12-08": "Imaculada Conceicao",
  "2026-12-25": "Natal",
};

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
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

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

  // Cell assignment modal
  const [assignModal, setAssignModal] = useState<{
    userId: string;
    date: string;
    userName: string;
  } | null>(null);

  // Violations detail modal
  const [violationModal, setViolationModal] = useState<ComplianceViolation[] | null>(null);

  // Generate schedule modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [staffOverrides, setStaffOverrides] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{
    total: number;
    unfilled: { date: string; shift_id: string; needed: number; assigned: number }[];
    hours: Record<string, number>;
  } | null>(null);

  // Unavailability data
  const [unavailableDays, setUnavailableDays] = useState<Record<string, Set<string>>>({});

  const supabase = createClient();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch active employees
    const { data: emps } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .order("full_name");

    // Fetch active shift templates
    const { data: shiftData } = await supabase
      .from("shift_templates")
      .select("*")
      .eq("is_active", true)
      .order("start_time");

    // Find or create schedule for this month
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
    }

    // Fetch entries for this schedule
    let entryData: EntryWithShift[] = [];
    if (sched) {
      const { data: rawEntries } = await supabase
        .from("schedule_entries")
        .select("*, shift_template:shift_templates(*)")
        .eq("schedule_id", sched.id);
      entryData = (rawEntries || []) as EntryWithShift[];
    }

    // Fetch unavailabilities (approved only) for this month
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

    // Fetch approved time-off for this month
    const { data: timeOffData } = await supabase
      .from("time_off_requests")
      .select("*")
      .eq("status", "approved")
      .lte("start_date", endDate)
      .gte("end_date", startDate);

    // Build unavailable days map
    const unavail: Record<string, Set<string>> = {};
    for (const a of (availData || []) as Availability[]) {
      if (!unavail[a.user_id]) unavail[a.user_id] = new Set();
      unavail[a.user_id].add(a.date);
    }
    for (const t of (timeOffData || []) as TimeOffRequest[]) {
      if (!unavail[t.user_id]) unavail[t.user_id] = new Set();
      // Add all dates in the range
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

    // Initialize staff overrides from shift defaults
    const overrides: Record<string, number> = {};
    for (const s of shiftList) {
      overrides[s.id] = s.min_staff;
    }
    setStaffOverrides(overrides);

    // Run compliance
    const v = validateCompliance(entryData, empList);
    setViolations(v);

    setLoading(false);
  }, [supabase, year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation
  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  // Get entry for a cell
  function getEntry(userId: string, date: string): EntryWithShift | undefined {
    return entries.find((e) => e.user_id === userId && e.date === date);
  }

  // Get violations for a cell
  function getCellViolations(userId: string, date: string) {
    return getViolationsForCell(violations, userId, date);
  }

  // Is employee unavailable on date?
  function isUnavailable(userId: string, date: string): boolean {
    return unavailableDays[userId]?.has(date) || false;
  }

  // Assign shift
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
        is_holiday: !!NATIONAL_HOLIDAYS[assignModal.date],
      });
    }

    setAssignModal(null);
    setSaving(false);
    fetchData();
  }

  // Remove assignment
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

  // Generate schedule
  async function handleGenerate() {
    if (!schedule) return;
    setGenerating(true);
    setGenerateResult(null);

    const holidaySet = new Set(
      Object.keys(NATIONAL_HOLIDAYS).filter((d) => d >= days[0] && d <= days[days.length - 1])
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

    // Insert all generated entries
    if (result.entries.length > 0) {
      const toInsert = result.entries.map((e) => ({
        schedule_id: schedule.id,
        user_id: e.user_id,
        date: e.date,
        shift_template_id: e.shift_template_id,
        is_holiday: holidaySet.has(e.date),
      }));

      // Batch insert in chunks of 50
      for (let i = 0; i < toInsert.length; i += 50) {
        const chunk = toInsert.slice(i, i + 50);
        await supabase.from("schedule_entries").insert(chunk);
      }
    }

    setGenerateResult({
      total: result.entries.length,
      unfilled: result.stats.unfilled,
      hours: result.stats.employeeHours,
    });

    setGenerating(false);
    fetchData();
  }

  // Clear all entries (before regenerating)
  async function clearSchedule() {
    if (!schedule) return;
    setSaving(true);
    await supabase.from("schedule_entries").delete().eq("schedule_id", schedule.id);
    setSaving(false);
    fetchData();
  }

  // Publish schedule
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
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", schedule.id);

    // Notify all employees
    for (const emp of employees) {
      await supabase.from("notifications").insert({
        user_id: emp.id,
        type: "schedule_published",
        title: "Horario publicado",
        body: `O horario de ${MONTH_NAMES[month - 1]} ${year} foi publicado.`,
        metadata: { month, year, schedule_id: schedule.id },
      });
    }

    setSaving(false);
    fetchData();
  }

  // Stats
  const blockCount = violations.filter((v) => v.severity === "block").length;
  const warnCount = violations.filter((v) => v.severity === "warning").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Horario</h1>
        <div className="text-center py-12 text-gray-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horario</h1>
          <p className="text-sm text-gray-500 mt-1">
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
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Ver problemas
            </Button>
          )}
          {schedule?.status === "draft" && entries.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSchedule} loading={saving} className="text-red-600 hover:bg-red-50">
              Limpar
            </Button>
          )}
          {schedule?.status === "draft" && (
            <Button
              variant="secondary"
              onClick={() => setShowGenerateModal(true)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Gerar Horario
            </Button>
          )}
          {schedule?.status === "draft" && (
            <Button onClick={publishSchedule} loading={saving}>
              Publicar
            </Button>
          )}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Shift Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {shifts.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span>
              {s.name} ({s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)})
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-3 rounded bg-gray-300" />
          <span>Indisponivel</span>
        </div>
      </div>

      {/* Schedule Grid */}
      {employees.length === 0 || shifts.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            {employees.length === 0
              ? "Adiciona funcionarios na pagina Equipa primeiro."
              : "Cria turnos na pagina Turnos primeiro."}
          </div>
        </Card>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-600 border-b border-r border-gray-200 min-w-[140px]">
                  Funcionario
                </th>
                {days.map((day) => {
                  const weekend = isWeekend(day);
                  const holiday = NATIONAL_HOLIDAYS[day];
                  const dayNum = day.slice(8);
                  const dow = dayOfWeekPt(day);
                  return (
                    <th
                      key={day}
                      className={`px-1 py-2 text-center font-medium border-b border-gray-200 min-w-[44px] ${
                        holiday ? "bg-red-50 text-red-700" : weekend ? "bg-gray-100 text-gray-500" : "text-gray-600"
                      }`}
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
                <tr key={emp.id} className="hover:bg-gray-50/50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium text-gray-800 border-b border-r border-gray-200 truncate max-w-[140px]">
                    <div className="truncate" title={emp.full_name}>
                      {emp.full_name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {emp.contract_type === "full_time"
                        ? `${emp.weekly_hours}h`
                        : `PT ${emp.weekly_hours}h`}
                    </div>
                  </td>
                  {days.map((day) => {
                    const entry = getEntry(emp.id, day);
                    const cellViolations = getCellViolations(emp.id, day);
                    const hasBlock = cellViolations.some((v) => v.severity === "block");
                    const hasWarn = cellViolations.some((v) => v.severity === "warning");
                    const weekend = isWeekend(day);
                    const holiday = !!NATIONAL_HOLIDAYS[day];
                    const unavailable = isUnavailable(emp.id, day);

                    return (
                      <td
                        key={day}
                        className={`border-b border-gray-100 text-center cursor-pointer transition-colors p-0.5 ${
                          unavailable && !entry
                            ? "bg-gray-200"
                            : holiday
                            ? "bg-red-50/50"
                            : weekend
                            ? "bg-gray-50"
                            : ""
                        } ${hasBlock ? "ring-2 ring-inset ring-red-400" : ""} ${
                          hasWarn && !hasBlock ? "ring-1 ring-inset ring-amber-300" : ""
                        } hover:bg-blue-50`}
                        onClick={() =>
                          schedule?.status === "draft" &&
                          setAssignModal({
                            userId: emp.id,
                            date: day,
                            userName: emp.full_name,
                          })
                        }
                        title={
                          unavailable && !entry
                            ? "Indisponivel"
                            : cellViolations.length > 0
                            ? cellViolations.map((v) => v.rule).join("\n")
                            : undefined
                        }
                      >
                        {entry ? (
                          <div
                            className="rounded px-0.5 py-1 text-white font-medium text-[10px] leading-tight"
                            style={{
                              backgroundColor: entry.shift_template?.color || "#6B7280",
                            }}
                          >
                            {entry.shift_template?.name?.slice(0, 3) || "?"}
                          </div>
                        ) : unavailable ? (
                          <div className="py-1 text-gray-400 text-[10px] font-medium">IND</div>
                        ) : (
                          <div className="py-1 text-gray-300">—</div>
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

      {/* Assign Shift Modal */}
      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Atribuir turno"
        size="sm"
      >
        {assignModal && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{assignModal.userName}</span>
              {" — "}
              {parseInt(assignModal.date.slice(8))}{" "}
              {MONTH_NAMES[parseInt(assignModal.date.slice(5, 7)) - 1]}
              {NATIONAL_HOLIDAYS[assignModal.date] && (
                <Badge variant="danger" className="ml-2">
                  {NATIONAL_HOLIDAYS[assignModal.date]}
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
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: shift.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{shift.name}</p>
                    <p className="text-xs text-gray-500">
                      {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {getEntry(assignModal.userId, assignModal.date) && (
              <div className="pt-3 border-t border-gray-200">
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

      {/* Violations Modal */}
      <Modal
        open={!!violationModal}
        onClose={() => setViolationModal(null)}
        title="Problemas de conformidade"
        size="lg"
      >
        {violationModal && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {violationModal.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum problema encontrado.</p>
            ) : (
              violationModal.map((v, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-sm ${
                    v.severity === "block"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={v.severity === "block" ? "danger" : "warning"}>
                      {v.code}
                    </Badge>
                    <span className="font-medium">{v.message}</span>
                  </div>
                  <p className="text-xs opacity-80">
                    {v.date} — {v.rule}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* Generate Schedule Modal */}
      <Modal
        open={showGenerateModal}
        onClose={() => { setShowGenerateModal(false); setGenerateResult(null); }}
        title="Gerar Horario Automaticamente"
        size="md"
      >
        <div className="space-y-4">
          {!generateResult ? (
            <>
              <p className="text-sm text-gray-600">
                O algoritmo distribui os turnos pelos funcionarios respeitando as regras de compliance,
                indisponibilidades aprovadas e equilibrio de fairness.
                {entries.length > 0 && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    Nota: Ja existem {entries.length} atribuicoes. O algoritmo apenas preenche os turnos em falta.
                    Para recomecar, limpe o horario primeiro.
                  </span>
                )}
              </p>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Pessoas por turno (pode ajustar)
                </h4>
                <div className="space-y-2">
                  {shifts.map((shift) => (
                    <div key={shift.id} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: shift.color }}
                      />
                      <span className="text-sm text-gray-700 min-w-[100px]">{shift.name}</span>
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
                      <span className="text-xs text-gray-400">
                        (default: {shift.min_staff})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {Object.keys(unavailableDays).length > 0 && (
                <p className="text-xs text-gray-500">
                  {Object.keys(unavailableDays).length} funcionario(s) com indisponibilidades aprovadas este mes.
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowGenerateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerate} loading={generating}>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Gerar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Horario gerado!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {generateResult.total} turno{generateResult.total !== 1 ? "s" : ""} atribuido{generateResult.total !== 1 ? "s" : ""}.
                </p>
              </div>

              {generateResult.unfilled.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Turnos por preencher ({generateResult.unfilled.length})
                  </p>
                  <p className="text-xs text-amber-600">
                    Nao foi possivel preencher todos os turnos. Pode atribuir manualmente os que faltam.
                  </p>
                </div>
              )}

              {Object.keys(generateResult.hours).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Horas atribuidas</h4>
                  <div className="space-y-1">
                    {employees
                      .filter((e) => generateResult.hours[e.id])
                      .sort((a, b) => (generateResult.hours[b.id] || 0) - (generateResult.hours[a.id] || 0))
                      .map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{emp.full_name}</span>
                          <span className="text-gray-500 font-mono">
                            {generateResult.hours[emp.id]?.toFixed(0)}h
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button onClick={() => { setShowGenerateModal(false); setGenerateResult(null); }}>
                  Rever horario
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
