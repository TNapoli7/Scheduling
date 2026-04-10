"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  AlertTriangle,
  Palmtree,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRightLeft,
  CalendarOff,
} from "lucide-react";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import type { Profile, ScheduleEntry, ShiftTemplate, TimeOffRequest } from "@/types/database";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

export default function DashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Manager stats
  const [employeeCount, setEmployeeCount] = useState(0);
  const [currentScheduleStatus, setCurrentScheduleStatus] = useState<string | null>(null);
  const [pendingSwaps, setPendingSwaps] = useState(0);

  // Shared
  const [vacationQuota, setVacationQuota] = useState(22);
  const [usedDays, setUsedDays] = useState(0);
  const [remainingDays, setRemainingDays] = useState(22);

  // Employee view
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [myEntries, setMyEntries] = useState<(ScheduleEntry & { shift_template?: ShiftTemplate })[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<(ScheduleEntry & { shift_template?: ShiftTemplate })[]>([]);
  const [pendingTimeOff, setPendingTimeOff] = useState<TimeOffRequest[]>([]);
  const [pendingAvailability, setPendingAvailability] = useState(0);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const isManager = profile?.role === "admin" || profile?.role === "manager";

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!p?.org_id) { window.location.href = "/onboarding"; return; }
    setProfile(p as Profile);
    setVacationQuota((p as Record<string, unknown>).vacation_quota as number ?? 22);
    return { user, profile: p };
  }, [supabase]);

  // Fetch manager stats
  const fetchManagerStats = useCallback(async (orgId: string) => {
    const [empRes, schedRes, swapRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("is_active", true),
      supabase
        .from("schedules")
        .select("*")
        .eq("org_id", orgId)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single(),
      supabase
        .from("swap_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);
    setEmployeeCount(empRes.count || 0);
    setCurrentScheduleStatus(schedRes.data?.status || null);
    setPendingSwaps(swapRes.count || 0);
  }, [supabase, currentMonth, currentYear]);

  // Fetch vacation balance
  const fetchVacationBalance = useCallback(async (userId: string) => {
    const { data: approved } = await supabase
      .from("time_off_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "ferias")
      .eq("status", "approved")
      .gte("start_date", `${currentYear}-01-01`)
      .lte("start_date", `${currentYear}-12-31`);

    const used = (approved || []).reduce((sum: number, r: Record<string, unknown>) => {
      const period = r.period as string;
      if (period === "morning" || period === "afternoon") return sum + 0.5;
      const s = new Date(r.start_date as string);
      const e = new Date(r.end_date as string);
      return sum + Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }, 0);

    setUsedDays(used);
  }, [supabase, currentYear]);

  // Fetch employee calendar entries for a given month
  const fetchMyEntries = useCallback(async (userId: string, orgId: string, month: number, year: number) => {
    const { data: schedule } = await supabase
      .from("schedules")
      .select("id")
      .eq("org_id", orgId)
      .eq("month", month)
      .eq("year", year)
      .single();

    if (!schedule) { setMyEntries([]); return; }

    const { data: entries } = await supabase
      .from("schedule_entries")
      .select("*, shift_template:shift_templates(*)")
      .eq("schedule_id", schedule.id)
      .eq("user_id", userId)
      .order("date");

    setMyEntries((entries || []) as (ScheduleEntry & { shift_template?: ShiftTemplate })[]);
  }, [supabase]);

  // Fetch upcoming shifts (next 7 days)
  const fetchUpcoming = useCallback(async (userId: string, orgId: string) => {
    const today = new Date();
    const in7 = new Date();
    in7.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split("T")[0];
    const in7Str = in7.toISOString().split("T")[0];

    const { data: schedules } = await supabase
      .from("schedules")
      .select("id")
      .eq("org_id", orgId)
      .in("status", ["published", "draft"]);

    if (!schedules || schedules.length === 0) { setUpcomingShifts([]); return; }

    const scheduleIds = schedules.map((s: { id: string }) => s.id);
    const { data: entries } = await supabase
      .from("schedule_entries")
      .select("*, shift_template:shift_templates(*)")
      .in("schedule_id", scheduleIds)
      .eq("user_id", userId)
      .gte("date", todayStr)
      .lte("date", in7Str)
      .order("date");

    setUpcomingShifts((entries || []) as (ScheduleEntry & { shift_template?: ShiftTemplate })[]);
  }, [supabase]);

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async (userId: string) => {
    const [timeOffRes, availRes] = await Promise.all([
      supabase
        .from("time_off_requests")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("availability")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("approval_status", "pending"),
    ]);
    setPendingTimeOff((timeOffRes.data || []) as TimeOffRequest[]);
    setPendingAvailability(availRes.count || 0);
  }, [supabase]);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await fetchProfile();
      if (!result) return;

      const { user, profile: p } = result;
      const role = p.role as string;
      const orgId = p.org_id as string;

      await Promise.all([
        fetchVacationBalance(user.id),
        ...(role === "admin" || role === "manager" ? [fetchManagerStats(orgId)] : []),
        fetchMyEntries(user.id, orgId, calMonth, calYear),
        fetchUpcoming(user.id, orgId),
        fetchPendingRequests(user.id),
      ]);

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch calendar when month changes
  useEffect(() => {
    if (!profile) return;
    fetchMyEntries(profile.id, profile.org_id || "", calMonth, calYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calMonth, calYear]);

  // Update remaining days when quota or used changes
  useEffect(() => {
    setRemainingDays(vacationQuota - usedDays);
  }, [vacationQuota, usedDays]);

  function prevMonth() {
    if (calMonth === 1) { setCalMonth(12); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  }
  function nextMonth() {
    if (calMonth === 12) { setCalMonth(1); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  }

  function formatNum(n: number): string {
    if (n % 1 === 0) return String(n);
    return n.toFixed(1).replace(".", ",");
  }

  // Build calendar grid
  function buildCalendarDays(month: number, year: number) {
    const firstDay = new Date(year, month - 1, 1);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  function getEntriesForDay(day: number): (ScheduleEntry & { shift_template?: ShiftTemplate })[] {
    const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return myEntries.filter((e) => e.date === dateStr);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-stone-200 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }

  if (!profile) return null;

  const firstName = profile.full_name.split(" ")[0];
  const calDays = buildCalendarDays(calMonth, calYear);
  const todayStr = now.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Ola, {firstName}</h1>
        <p className="text-stone-500 mt-1">
          {MONTH_NAMES[currentMonth - 1]} {currentYear}
        </p>
      </div>

      {/* Stats grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isManager ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
        {isManager && (
          <>
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Equipa</p>
                  <p className="text-2xl font-bold text-stone-900">{employeeCount}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Horario {MONTH_NAMES[currentMonth - 1]}</p>
                  {currentScheduleStatus ? (
                    <Badge variant={currentScheduleStatus === "published" ? "success" : "warning"}>
                      {currentScheduleStatus === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  ) : (
                    <Badge variant="default">Nao criado</Badge>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Trocas pendentes</p>
                  <p className="text-2xl font-bold text-stone-900">{pendingSwaps}</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {!isManager && (
          <>
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Turnos esta semana</p>
                  <p className="text-2xl font-bold text-stone-900">{upcomingShifts.length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <CalendarOff className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Pedidos pendentes</p>
                  <p className="text-2xl font-bold text-stone-900">{pendingTimeOff.length + pendingAvailability}</p>
                </div>
              </div>
            </Card>
          </>
        )}

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <Palmtree className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Ferias disponiveis</p>
              <p className={`text-2xl font-bold ${remainingDays <= 3 ? "text-amber-600" : "text-stone-900"}`}>
                {formatNum(remainingDays)}
                <span className="text-sm font-normal text-stone-400 ml-1">/ {vacationQuota}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Employee: Personal calendar + upcoming shifts */}
      {!isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal calendar */}
          <Card className="lg:col-span-2">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <CardTitle>O meu horario</CardTitle>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-stone-100 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-stone-600" />
                  </button>
                  <span className="text-sm font-medium text-stone-700 min-w-[120px] text-center">
                    {MONTH_NAMES[calMonth - 1]} {calYear}
                  </span>
                  <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-stone-100 transition-colors">
                    <ChevronRight className="w-5 h-5 text-stone-600" />
                  </button>
                </div>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-stone-200 rounded-xl overflow-hidden">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="bg-stone-50 py-2 text-center text-xs font-medium text-stone-500">
                    {d}
                  </div>
                ))}
                {calDays.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="bg-white min-h-[60px]" />;
                  }
                  const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday = dateStr === todayStr;
                  const entries = getEntriesForDay(day);
                  const isWeekend = (i % 7) >= 5;

                  return (
                    <div
                      key={`day-${day}`}
                      className={`bg-white min-h-[60px] p-1 ${isToday ? "ring-2 ring-indigo-500 ring-inset" : ""} ${isWeekend ? "bg-stone-50" : ""}`}
                    >
                      <span className={`text-xs font-medium ${isToday ? "text-indigo-600" : "text-stone-700"}`}>
                        {day}
                      </span>
                      <div className="mt-0.5 space-y-0.5">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="text-[10px] leading-tight px-1 py-0.5 rounded truncate"
                            style={{
                              backgroundColor: entry.shift_template?.color ? `${entry.shift_template.color}20` : "#e7e5e4",
                              color: entry.shift_template?.color || "#44403c",
                            }}
                            title={`${entry.shift_template?.name}: ${entry.shift_template?.start_time?.slice(0, 5)} - ${entry.shift_template?.end_time?.slice(0, 5)}`}
                          >
                            {entry.shift_template?.name || "Turno"}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Right sidebar: upcoming shifts + pending requests */}
          <div className="space-y-4">
            {/* Upcoming shifts */}
            <Card>
              <div className="p-4">
                <CardTitle>Proximos turnos</CardTitle>
                {upcomingShifts.length === 0 ? (
                  <p className="text-sm text-stone-500 mt-3">Sem turnos nos proximos 7 dias.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {upcomingShifts.map((entry) => {
                      const d = new Date(entry.date + "T00:00:00");
                      const dayLabel = d.toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" });
                      return (
                        <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                          <div
                            className="w-2 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.shift_template?.color || "#78716c" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900">{entry.shift_template?.name || "Turno"}</p>
                            <p className="text-xs text-stone-500">
                              {dayLabel} &middot; {entry.shift_template?.start_time?.slice(0, 5)} - {entry.shift_template?.end_time?.slice(0, 5)}
                            </p>
                          </div>
                          {entry.date === todayStr && (
                            <Badge variant="success">Hoje</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            {/* Pending requests */}
            {(pendingTimeOff.length > 0 || pendingAvailability > 0) && (
              <Card>
                <div className="p-4">
                  <CardTitle>Pedidos pendentes</CardTitle>
                  <div className="mt-3 space-y-2">
                    {pendingTimeOff.map((req) => (
                      <div key={req.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Palmtree className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900">
                            {req.type === "ferias" ? "Ferias" : req.type === "baixa" ? "Baixa" : req.type === "pessoal" ? "Pessoal" : "Ausencia"}
                          </p>
                          <p className="text-xs text-stone-500">
                            {req.start_date}{req.period === "full_day" && req.start_date !== req.end_date ? ` a ${req.end_date}` : ""}
                            {req.period !== "full_day" ? ` (${req.period === "morning" ? "Manha" : "Tarde"})` : ""}
                          </p>
                        </div>
                        <Badge variant="warning">Pendente</Badge>
                      </div>
                    ))}
                    {pendingAvailability > 0 && (
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CalendarOff className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-900">Indisponibilidades</p>
                          <p className="text-xs text-stone-500">{pendingAvailability} dia{pendingAvailability !== 1 ? "s" : ""} pendente{pendingAvailability !== 1 ? "s" : ""}</p>
                        </div>
                        <Badge variant="warning">Pendente</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quick links for employee */}
            <Card>
              <div className="p-4">
                <CardTitle>Acoes rapidas</CardTitle>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="/time-off"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-700 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                  >
                    <Palmtree className="w-4 h-4" />
                    Pedir ferias
                  </a>
                  <a
                    href="/availability"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-700 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                  >
                    <CalendarOff className="w-4 h-4" />
                    Marcar indisponibilidade
                  </a>
                  <a
                    href="/swaps"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-700 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Trocar turno
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Manager: Quick actions */}
      {isManager && (
        <Card>
          <CardTitle>Acoes rapidas</CardTitle>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/schedule"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              {currentScheduleStatus ? "Ver horario" : "Criar horario"}
            </a>
            <a
              href="/employees"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-stone-700 text-sm font-medium rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Gerir equipa
            </a>
            <a
              href="/availability"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-stone-700 text-sm font-medium rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <CalendarOff className="w-4 h-4" />
              Disponibilidades
            </a>
            <a
              href="/time-off"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-stone-700 text-sm font-medium rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <Palmtree className="w-4 h-4" />
              Ferias
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
