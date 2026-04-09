"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  validateCompliance,
  getViolationsForCell,
  type ComplianceViolation,
} from "@/lib/compliance";
import type {
  Profile,
  ShiftTemplate,
  Schedule,
  ScheduleEntry,
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
      // Auto-create draft schedule
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

    const empList = emps || [];
    const shiftList = shiftData || [];

    setEmployees(empList);
    setShifts(shiftList);
    setSchedule(sched);
    setEntries(entryData);

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
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  // Get entry for a cell
  function getEntry(userId: string, date: string): EntryWithShift | undefined {
    return entries.find((e) => e.user_id === userId && e.date === date);
  }

  // Get violations for a cell
  function getCellViolations(userId: string, date: string) {
    return getViolationsForCell(violations, userId, date);
  }

  // Assign shift
  async function assignShift(shiftId: string) {
    if (!assignModal || !schedule) return;
    setSaving(true);

    const existing = getEntry(assignModal.userId, assignModal.date);
    if (existing) {
      // Update
      await supabase
        .from("schedule_entries")
        .update({ shift_template_id: shiftId })
        .eq("id", existing.id);
    } else {
      // Insert
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
      await supabase
        .from("schedule_entries")
        .delete()
        .eq("id", existing.id);
      setAssignModal(null);
      setSaving(false);
      fetchData();
    }
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
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>

      {/* Shift Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {shifts.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span>
              {s.name} ({s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)})
            </span>
          </div>
        ))}
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
                        holiday
                          ? "bg-red-50 text-red-700"
                          : weekend
                          ? "bg-gray-100 text-gray-500"
                          : "text-gray-600"
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
                    const hasBlock = cellViolations.some(
                      (v) => v.severity === "block"
                    );
                    const hasWarn = cellViolations.some(
                      (v) => v.severity === "warning"
                    );
                    const weekend = isWeekend(day);
                    const holiday = !!NATIONAL_HOLIDAYS[day];

                    return (
                      <td
                        key={day}
                        className={`border-b border-gray-100 text-center cursor-pointer transition-colors p-0.5 ${
                          holiday
                            ? "bg-red-50/50"
                            : weekend
                            ? "bg-gray-50"
                            : ""
                        } ${hasBlock ? "ring-2 ring-inset ring-red-400" : ""} ${
                          hasWarn && !hasBlock
                            ? "ring-1 ring-inset ring-amber-300"
                            : ""
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
                          cellViolations.length > 0
                            ? cellViolations.map((v) => v.rule).join("\n")
                            : undefined
                        }
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
        title={`Atribuir turno`}
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
                    <p className="font-medium text-gray-900 text-sm">
                      {shift.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shift.start_time.slice(0, 5)} -{" "}
                      {shift.end_time.slice(0, 5)}
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
              <p className="text-sm text-gray-500">
                Nenhum problema encontrado.
              </p>
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
                    <Badge
                      variant={
                        v.severity === "block" ? "danger" : "warning"
                      }
                    >
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
    </div>
  );
}
