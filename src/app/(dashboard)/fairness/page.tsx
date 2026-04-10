"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, SkeletonList } from "@/components/ui/skeleton";
import { exportHoursReportExcel } from "@/lib/export";
import type { Profile, ShiftTemplate, ScheduleEntry } from "@/types/database";

interface EntryRow {
  id: string;
  user_id: string;
  date: string;
  shift_template_id: string;
  is_holiday: boolean;
  overtime_hours: number;
  shift_template: ShiftTemplate;
}

interface EmployeeMetrics {
  employee: Profile;
  totalShifts: number;
  totalHours: number;
  nightShifts: number;
  weekendShifts: number;
  holidayShifts: number;
  overtimeHours: number;
  fairnessScore: number;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function shiftDuration(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60; // overnight
  return mins / 60;
}

function isNightShift(start: string): boolean {
  const hour = parseInt(start.split(":")[0]);
  return hour >= 20 || hour < 6;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

export default function FairnessPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [metrics, setMetrics] = useState<EmployeeMetrics[]>([]);
  const [rawEntries, setRawEntries] = useState<(ScheduleEntry & { shift_template?: ShiftTemplate })[]>([]);
  const [rawEmployees, setRawEmployees] = useState<Profile[]>([]);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchMetrics = useCallback(async () => {
    setLoading(true);

    // Get schedule for this month
    const { data: schedule } = await supabase
      .from("schedules")
      .select("id")
      .eq("year", year)
      .eq("month", month)
      .single();

    if (!schedule) {
      setMetrics([]);
      setLoading(false);
      return;
    }

    // Get all entries with shift templates
    const { data: entries } = await supabase
      .from("schedule_entries")
      .select("*, shift_template:shift_templates(*)")
      .eq("schedule_id", schedule.id);

    // Get employees
    const { data: employees } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .order("full_name");

    const typedEntries = (entries || []) as EntryRow[];
    const empList = employees || [];
    setRawEntries((entries || []) as (ScheduleEntry & { shift_template?: ShiftTemplate })[]);
    setRawEmployees(empList);

    // Fetch org name
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
      if (prof?.org_id) {
        const { data: org } = await supabase.from("organizations").select("name").eq("id", prof.org_id).single();
        if (org) setOrgName(org.name);
      }
    }

    // Compute metrics per employee
    const empMetrics: EmployeeMetrics[] = empList.map((emp) => {
      const empEntries = typedEntries.filter((e) => e.user_id === emp.id);

      let totalHours = 0;
      let nightShifts = 0;
      let weekendShifts = 0;
      let holidayShifts = 0;
      let overtimeHours = 0;

      for (const entry of empEntries) {
        const st = entry.shift_template;
        if (st) {
          totalHours += shiftDuration(st.start_time, st.end_time);
          if (isNightShift(st.start_time)) nightShifts++;
        }
        if (isWeekend(entry.date)) weekendShifts++;
        if (entry.is_holiday) holidayShifts++;
        overtimeHours += entry.overtime_hours || 0;
      }

      return {
        employee: emp,
        totalShifts: empEntries.length,
        totalHours: Math.round(totalHours * 10) / 10,
        nightShifts,
        weekendShifts,
        holidayShifts,
        overtimeHours,
        fairnessScore: 0, // computed below
      };
    });

    // Compute fairness score (0-100, deviation from average)
    const activeMetrics = empMetrics.filter((m) => m.totalShifts > 0);
    if (activeMetrics.length > 0) {
      const avgHours =
        activeMetrics.reduce((s, m) => s + m.totalHours, 0) /
        activeMetrics.length;
      const avgNights =
        activeMetrics.reduce((s, m) => s + m.nightShifts, 0) /
        activeMetrics.length;
      const avgWeekends =
        activeMetrics.reduce((s, m) => s + m.weekendShifts, 0) /
        activeMetrics.length;

      for (const m of empMetrics) {
        if (m.totalShifts === 0) {
          m.fairnessScore = 0;
          continue;
        }
        // Score based on deviation from averages (100 = perfectly fair)
        const hoursDev = avgHours > 0 ? Math.abs(m.totalHours - avgHours) / avgHours : 0;
        const nightsDev = avgNights > 0 ? Math.abs(m.nightShifts - avgNights) / avgNights : 0;
        const weekendsDev = avgWeekends > 0 ? Math.abs(m.weekendShifts - avgWeekends) / avgWeekends : 0;

        const avgDev = (hoursDev * 0.5 + nightsDev * 0.3 + weekendsDev * 0.2);
        m.fairnessScore = Math.round(Math.max(0, 100 - avgDev * 100));
      }
    }

    setMetrics(empMetrics);
    setLoading(false);
  }, [supabase, year, month]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Averages
  const activeMetrics = useMemo(
    () => metrics.filter((m) => m.totalShifts > 0),
    [metrics]
  );
  const avgScore =
    activeMetrics.length > 0
      ? Math.round(
          activeMetrics.reduce((s, m) => s + m.fairnessScore, 0) /
            activeMetrics.length
        )
      : 0;
  const avgHours =
    activeMetrics.length > 0
      ? Math.round(
          (activeMetrics.reduce((s, m) => s + m.totalHours, 0) /
            activeMetrics.length) *
            10
        ) / 10
      : 0;

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

  function scoreColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  function scoreBg(score: number): string {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-yellow-50";
    return "bg-red-50";
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fairness</h1>
          <p className="text-sm text-gray-500 mt-1">
            Distribuicao justa de turnos e horas
          </p>
        </div>
        {activeMetrics.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportHoursReportExcel(rawEmployees, rawEntries, month, year, orgName)}
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </Button>
        )}
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Score medio</p>
          <p className={`text-3xl font-bold mt-1 ${scoreColor(avgScore)}`}>
            {avgScore}
            <span className="text-lg text-gray-400 font-normal">/100</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Media de horas</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">
            {avgHours}
            <span className="text-lg text-gray-400 font-normal">h</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Funcionarios escalados</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">
            {activeMetrics.length}
            <span className="text-lg text-gray-400 font-normal">
              /{metrics.length}
            </span>
          </p>
        </Card>
      </div>

      {/* Per-employee table */}
      {metrics.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            Nenhum dado para este mes.
          </div>
        </Card>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">
                  Funcionario
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">
                  Turnos
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">
                  Horas
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">
                  Noites
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">
                  Fins-de-semana
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">
                  Feriados
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.map((m) => (
                <tr
                  key={m.employee.id}
                  className={`${m.totalShifts === 0 ? "opacity-40" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {m.employee.full_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {m.employee.contract_type === "full_time"
                        ? `${m.employee.weekly_hours}h/semana`
                        : `Part-time ${m.employee.weekly_hours}h`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {m.totalShifts}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {m.totalHours}h
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {m.nightShifts}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {m.weekendShifts}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {m.holidayShifts}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.totalShifts > 0 ? (
                      <span
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${scoreBg(
                          m.fairnessScore
                        )} ${scoreColor(m.fairnessScore)}`}
                      >
                        {m.fairnessScore}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
          80-100: Distribuicao justa
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300" />
          60-79: Atenção necessaria
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300" />
          0-59: Desequilibrio
        </div>
      </div>
    </div>
  );
}
