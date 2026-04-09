"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Profile, Availability } from "@/types/database";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

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

export default function AvailabilityPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [myRole, setMyRole] = useState<string>("employee");
  const [myId, setMyId] = useState<string>("");
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [availabilities, setAvailabilities] = useState<(Availability & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const isManager = myRole === "admin" || myRole === "manager";

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) return;
    setMyRole(profile.role);
    setMyId(user.id);

    // Fetch employees (for manager view)
    if (profile.role === "admin" || profile.role === "manager") {
      const { data: emps } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true)
        .order("full_name");
      setEmployees(emps || []);
    } else {
      setEmployees([profile]);
    }

    // Fetch availabilities for the month
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

    let query = supabase
      .from("availability")
      .select("*, profile:profiles(*)")
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("available", false); // Only indisponibilidades

    if (profile.role === "employee") {
      query = query.eq("user_id", user.id);
    }

    const { data: avail } = await query;
    setAvailabilities((avail || []) as (Availability & { profile?: Profile })[]);
    setLoading(false);
  }, [supabase, year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Disponibilidades</h1>
        <div className="text-center py-12 text-gray-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disponibilidades</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isManager
              ? "Visualize e aprove indisponibilidades da equipa."
              : "Marque os dias em que nao esta disponivel."}
            {pendingCount > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </p>
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          <span>Disponivel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
          <span>Indisponivel (pendente)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          <span>Indisponivel (aprovado)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300 line-through" />
          <span>Rejeitado</span>
        </div>
      </div>

      {/* Grid */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white">
        <table className="text-xs w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-600 border-b border-r border-gray-200 min-w-[140px]">
                Funcionario
              </th>
              {days.map((day) => {
                const weekend = isWeekend(day);
                const dayNum = day.slice(8);
                const dow = dayOfWeekPt(day);
                return (
                  <th
                    key={day}
                    className={`px-1 py-2 text-center font-medium border-b border-gray-200 min-w-[44px] ${
                      weekend ? "bg-gray-100 text-gray-500" : "text-gray-600"
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
              <tr key={emp.id} className="hover:bg-gray-50/50">
                <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium text-gray-800 border-b border-r border-gray-200 truncate max-w-[140px]">
                  <div className="truncate" title={emp.full_name}>{emp.full_name}</div>
                </td>
                {days.map((day) => {
                  const avail = getAvail(emp.id, day);
                  const weekend = isWeekend(day);
                  const isPast = new Date(day + "T23:59:59") < new Date();
                  const canClick = !isPast && (emp.id === myId || (!isManager));

                  let bgClass = weekend ? "bg-gray-50" : "";
                  let content = "";
                  let title = "Disponivel";

                  if (avail) {
                    if (avail.approval_status === "approved") {
                      bgClass = "bg-red-100";
                      content = "X";
                      title = "Indisponivel (aprovado)";
                    } else if (avail.approval_status === "pending") {
                      bgClass = "bg-yellow-100";
                      content = "?";
                      title = "Indisponivel (pendente)";
                    } else if (avail.approval_status === "rejected") {
                      bgClass = "bg-gray-100";
                      content = "—";
                      title = "Rejeitado";
                    }
                  }

                  return (
                    <td
                      key={day}
                      className={`border-b border-gray-100 text-center p-0.5 transition-colors ${bgClass} ${
                        canClick ? "cursor-pointer hover:bg-blue-50" : ""
                      } ${isPast ? "opacity-50" : ""}`}
                      title={title}
                      onClick={() => {
                        if (canClick && !saving) toggleUnavailable(emp.id, day);
                      }}
                    >
                      <div className={`py-1 text-[10px] font-bold ${
                        avail?.approval_status === "approved" ? "text-red-600" :
                        avail?.approval_status === "pending" ? "text-yellow-600" :
                        avail?.approval_status === "rejected" ? "text-gray-400 line-through" :
                        "text-transparent"
                      }`}>
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

      {/* Manager approval panel */}
      {isManager && pendingCount > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Pedidos pendentes ({pendingCount})
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
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-yellow-50/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {emp?.full_name || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {parseInt(avail.date.slice(8))} {MONTH_NAMES[parseInt(avail.date.slice(5, 7)) - 1]}
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
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => reviewAvailability(avail.id, "approved")}
                          loading={saving}
                        >
                          Aprovar
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
