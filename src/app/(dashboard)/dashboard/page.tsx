"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useCurrentMembership } from "@/hooks/use-membership";
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

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const m = useTranslations("months");
  const d = useTranslations("daysShort");
  const supabase = createClient();
  const { membership, loading: memLoading, isManager } = useCurrentMembership();
  const [dataLoading, setDataLoading] = useState(true);

  // Manager stats
  const [employeeCount, setEmployeeCount] = useState(0);
  const [currentScheduleStatus, setCurrentScheduleStatus] = useState<string | null>(null);
  const [pendingSwaps, setPendingSwaps] = useState(0);

  // Shared
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

  const vacationQuota = membership?.vacationQuota ?? 22;

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
        .select("requester_id, requester:profiles!swap_requests_requester_id_fkey(org_id)")
        .eq("status", "pending"),
    ]);
    setEmployeeCount(empRes.count || 0);
    setCurrentScheduleStatus(schedRes.data?.status || null);
    // Filter pending swaps to current org (swap_requests has no org_id column)
    const orgPendingSwaps = (swapRes.data || []).filter(
      (s: { requester?: { org_id?: string } | null }) => s.requester?.org_id === orgId
    );
    setPendingSwaps(orgPendingSwaps.length);
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

  // Initial load — waits for membership to resolve
  useEffect(() => {
    if (memLoading) return;
    if (!membership) {
      // No membership means no org — redirect to onboarding
      window.location.href = "/onboarding";
      return;
    }

    const userId = membership.userId;
    const orgId = membership.orgId;

    (async () => {
      setDataLoading(true);
      await Promise.all([
        fetchVacationBalance(userId),
        ...(isManager ? [fetchManagerStats(orgId)] : []),
        fetchMyEntries(userId, orgId, calMonth, calYear),
        fetchUpcoming(userId, orgId),
        fetchPendingRequests(userId),
      ]);
      setDataLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memLoading, membership]);

  // Refetch calendar when month changes
  useEffect(() => {
    if (!membership) return;
    fetchMyEntries(membership.userId, membership.orgId, calMonth, calYear);
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

  const loading = memLoading || dataLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-[color:var(--border-light)] rounded animate-pulse" />
          <div className="h-4 w-32 bg-[color:var(--border-light)] rounded animate-pulse mt-2" />
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

  if (!membership) return null;

  const firstName = membership.fullName.split(" ")[0];
  const calDays = buildCalendarDays(calMonth, calYear);
  const todayStr = now.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)] font-display tracking-tight">{(() => {
          const h = now.getHours();
          if (h < 12) return t("goodMorning");
          if (h < 19) return t("goodAfternoon");
          return t("goodEvening");
        })()}, {firstName}</h1>
        <p className="text-[color:var(--text-muted)] mt-1">
          {m(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][currentMonth - 1])} {currentYear}
        </p>
      </div>

      {/* Stats grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isManager ? "lg:grid-cols-4" : "lg:grid-cols-4"} gap-4`}>
        {isManager && (
          <>
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[color:var(--accent-soft)] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[color:var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">{t("equipa")}</p>
                  <p className="text-2xl font-bold text-[color:var(--text-primary)]">{employeeCount}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">{t("horarioMonth")} · {m(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][currentMonth - 1])} {currentYear}</p>
                  {currentScheduleStatus ? (
                    <Badge variant={currentScheduleStatus === "published" ? "success" : "warning"}>
                      {currentScheduleStatus === "published" ? t("publicado") : t("rascunho")}
                    </Badge>
                  ) : (
                    <Badge variant="default">{t("nao_criado")}</Badge>
                  )}
                </div>
              </div>
            </Card>

            <Link href="/swaps" className="block group">
              <Card className="transition-shadow group-hover:shadow-[var(--shadow-md)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[color:var(--warning-soft)] rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-[color:var(--warning)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[color:var(--text-muted)]">{t("trocasPendentes")}</p>
                    <p className="text-2xl font-bold text-[color:var(--text-primary)]">{pendingSwaps}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </>
        )}

        {!isManager && (
          <>
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[color:var(--accent-soft)] rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[color:var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">{t("turnos_esta_semana")}</p>
                  <p className="text-2xl font-bold text-[color:var(--text-primary)]">{upcomingShifts.length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[color:var(--warning-soft)] rounded-xl flex items-center justify-center">
                  <CalendarOff className="w-6 h-6 text-[color:var(--warning)]" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">{t("pedidos_pendentes")}</p>
                  <p className="text-2xl font-bold text-[color:var(--text-primary)]">{pendingTimeOff.length + pendingAvailability}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[color:var(--success-soft)] rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[color:var(--success)]" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">{t("horas_este_mes")}</p>
                  <p className="text-2xl font-bold text-[color:var(--text-primary)]">
                    {(() => {
                      const totalMin = myEntries.reduce((sum, e) => {
                        if (!e.shift_template) return sum;
                        const [sh, sm] = e.shift_template.start_time.split(":").map(Number);
                        const [eh, em] = e.shift_template.end_time.split(":").map(Number);
                        let mins = eh * 60 + em - (sh * 60 + sm);
                        if (mins < 0) mins += 24 * 60;
                        return sum + mins;
                      }, 0);
                      return Math.round(totalMin / 60);
                    })()}h
                  </p>
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
              <p className="text-sm text-[color:var(--text-muted)]">{t("ferias_disponiveis")}</p>
              <p className={`text-2xl font-bold ${remainingDays <= 3 ? "text-[color:var(--warning)]" : "text-[color:var(--text-primary)]"}`}>
                {formatNum(remainingDays)}
                <span className="text-sm font-normal text-[color:var(--text-muted)] ml-1">/ {vacationQuota}</span>
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
                <CardTitle>{t("meu_horario")}</CardTitle>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-[color:var(--surface-sunken)] transition-colors">
                    <ChevronLeft className="w-5 h-5 text-[color:var(--text-secondary)]" />
                  </button>
                  <span className="text-sm font-medium text-[color:var(--text-secondary)] min-w-[120px] text-center">
                    {m(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][calMonth - 1])} {calYear}
                  </span>
                  <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-[color:var(--surface-sunken)] transition-colors">
                    <ChevronRight className="w-5 h-5 text-[color:var(--text-secondary)]" />
                  </button>
                </div>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-[color:var(--border-light)] rounded-xl overflow-hidden">
                {["mon", "tue", "wed", "qua", "thu", "fri", "sat", "sun"].map((dayKey) => (
                  <div key={dayKey} className="bg-[color:var(--surface-sunken)] py-2 text-center text-xs font-medium text-[color:var(--text-muted)]">
                    {d(dayKey)}
                  </div>
                ))}
                {calDays.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="bg-[color:var(--surface)] min-h-[60px]" />;
                  }
                  const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday = dateStr === todayStr;
                  const entries = getEntriesForDay(day);
                  const isWeekend = (i % 7) >= 5;

                  return (
                    <div
                      key={`day-${day}`}
                      className={`bg-[color:var(--surface)] min-h-[60px] p-1 ${isToday ? "ring-2 ring-teal-500 ring-inset" : ""} ${isWeekend ? "bg-[color:var(--surface-sunken)]" : ""}`}
                    >
                      <span className={`text-xs font-medium ${isToday ? "text-[color:var(--accent)]" : "text-[color:var(--text-secondary)]"}`}>
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
                <CardTitle>{t("proximos_turnos")}</CardTitle>
                {upcomingShifts.length === 0 ? (
                  <p className="text-sm text-[color:var(--text-muted)] mt-3">{t("sem_turnos_proximos_7")}</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {upcomingShifts.map((entry) => {
                      const d = new Date(entry.date + "T00:00:00");
                      const dayLabel = d.toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" });
                      return (
                        <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-[color:var(--border-light)] last:border-0">
                          <div
                            className="w-2 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.shift_template?.color || "#78716c" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[color:var(--text-primary)]">{entry.shift_template?.name || "Turno"}</p>
                            <p className="text-xs text-[color:var(--text-muted)]">
                              {dayLabel} &middot; {entry.shift_template?.start_time?.slice(0, 5)} - {entry.shift_template?.end_time?.slice(0, 5)}
                            </p>
                          </div>
                          {entry.date === todayStr && (
                            <Badge variant="success">{t("hoje")}</Badge>
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
                  <CardTitle>{t("pedidos_pendentes_card")}</CardTitle>
                  <div className="mt-3 space-y-2">
                    {pendingTimeOff.map((req) => (
                      <div key={req.id} className="flex items-center gap-3 py-2 border-b border-[color:var(--border-light)] last:border-0">
                        <div className="w-8 h-8 bg-[color:var(--warning-soft)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Palmtree className="w-4 h-4 text-[color:var(--warning)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[color:var(--text-primary)]">
                            {req.type === "ferias" ? "Férias" : req.type === "baixa" ? "Baixa" : req.type === "pessoal" ? "Pessoal" : "Ausência"}
                          </p>
                          <p className="text-xs text-[color:var(--text-muted)]">
                            {req.start_date}{req.period === "full_day" && req.start_date !== req.end_date ? ` a ${req.end_date}` : ""}
                            {req.period !== "full_day" ? ` (${req.period === "morning" ? "Manhã" : "Tarde"})` : ""}
                          </p>
                        </div>
                        <Badge variant="warning">Pendente</Badge>
                      </div>
                    ))}
                    {pendingAvailability > 0 && (
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 bg-[color:var(--warning-soft)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <CalendarOff className="w-4 h-4 text-[color:var(--warning)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[color:var(--text-primary)]">{t("indisponibilidades")}</p>
                          <p className="text-xs text-[color:var(--text-muted)]">{pendingAvailability} {pendingAvailability !== 1 ? t("dias_pendentes") : t("dia_pendente")}</p>
                        </div>
                        <Badge variant="warning">{t("pendente")}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quick links for employee */}
            <Card>
              <div className="p-4">
                <CardTitle>{t("acoes_rapidas")}</CardTitle>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="/time-off"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--text-secondary)] rounded-lg border border-[color:var(--border-light)] hover:bg-[color:var(--surface-sunken)] transition-colors"
                  >
                    <Palmtree className="w-4 h-4" />
                    {t("pedir_ferias")}
                  </a>
                  <a
                    href="/availability"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--text-secondary)] rounded-lg border border-[color:var(--border-light)] hover:bg-[color:var(--surface-sunken)] transition-colors"
                  >
                    <CalendarOff className="w-4 h-4" />
                    {t("marcar_indisponibilidade")}
                  </a>
                  <a
                    href="/swaps"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--text-secondary)] rounded-lg border border-[color:var(--border-light)] hover:bg-[color:var(--surface-sunken)] transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {t("trocar_turno")}
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
          <CardTitle>{t("acoes_rapidas")}</CardTitle>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/schedule"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[color:var(--accent-hover)] transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              {currentScheduleStatus ? t("ver_horario") : t("criar_horario")}
            </a>
            <a
              href="/employees"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--surface)] text-[color:var(--text-secondary)] text-sm font-medium rounded-lg border border-[color:var(--border-light)] hover:bg-[color:var(--surface-sunken)] transition-colors"
            >
              <Users className="w-4 h-4" />
              {t("gerir_equipa")}
            </a>
            <a
              href="/availability"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--surface)] text-[color:var(--text-secondary)] text-sm font-medium rounded-lg border border-[color:var(--border-light)] hover:bg-[color:var(--surface-sunken)] transition-colors"
            >
              <CalendarOff className="w-4 h-4" />
              {t("disponibilidades")}
            </a>
            <a
              href="/time-off"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--surface)] text-[color:var(--text-secondary)] text-sm font-medium rounded-lg border border-[color:var(--border-light)] hover:bg-[color:var(--surface-sunken)] transition-colors"
            >
              <Palmtree className="w-4 h-4" />
              {t("ferias")}
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
