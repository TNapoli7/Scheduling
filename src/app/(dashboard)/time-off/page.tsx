"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/dates";
import { Modal } from "@/components/ui/modal";
import { Palmtree } from "lucide-react";
import { SkeletonCard, SkeletonList } from "@/components/ui/skeleton";
import type { Profile, TimeOffRequest } from "@/types/database";

const STATUS_VARIANT: Record<string, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default function TimeOffPage() {
  const t = useTranslations("timeOff");

  const TYPE_LABELS: Record<string, string> = {
    ferias: t("types.ferias"),
    baixa: t("types.baixa"),
    pessoal: t("types.pessoal"),
    outro: t("types.outro"),
  };

  const PERIOD_LABELS: Record<string, string> = {
    full_day: t("fullDay"),
    morning: t("morning"),
    afternoon: t("afternoon"),
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: t("statuses.pending"),
    approved: t("statuses.approved"),
    rejected: t("statuses.rejected"),
  };
  const [myRole, setMyRole] = useState<string>("employee");
  const [myId, setMyId] = useState<string>("");
  const [orgId, setOrgId] = useState<string>("");
  const [requests, setRequests] = useState<(TimeOffRequest & { profile?: Profile })[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [vacationQuota, setVacationQuota] = useState<number>(22);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  // New request form
  const [newType, setNewType] = useState("ferias");
  const [newPeriod, setNewPeriod] = useState("full_day");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newReason, setNewReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  /** When admin creates on behalf of an employee — "self" means own request */
  const [newOnBehalf, setNewOnBehalf] = useState<string>("self");

  const supabase = createClient();
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
    setOrgId(profile.org_id || "");
    setVacationQuota(profile.vacation_quota ?? 22);

    // Fetch employees for manager view
    if (profile.role === "admin" || profile.role === "manager") {
      const { data: emps } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true)
        .order("full_name");
      setEmployees(emps || []);
    }

    // Fetch requests
    let query = supabase
      .from("time_off_requests")
      .select("*, profile:profiles!time_off_requests_user_id_fkey(*)")
      .order("created_at", { ascending: false });

    if (profile.role === "employee") {
      query = query.eq("user_id", user.id);
    }

    const { data: reqs } = await query;
    setRequests((reqs || []) as (TimeOffRequest & { profile?: Profile })[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Create new request
  async function createRequest() {
    setFormError(null);
    if (!newStart) {
      setFormError(t("errorMissingStart"));
      return;
    }
    if (newPeriod === "full_day" && !newEnd) {
      setFormError(t("errorMissingEnd"));
      return;
    }
    if (!myId || !orgId) {
      setFormError(t("errorAuth"));
      return;
    }

    // Who is the target employee?
    const isOnBehalf = isManager && newOnBehalf !== "self";
    const targetUserId = isOnBehalf ? newOnBehalf : myId;

    // Defensive: if end before start on full_day, align end to start
    const effectiveEnd =
      newPeriod !== "full_day"
        ? newStart
        : newEnd < newStart
        ? newStart
        : newEnd;
    setSaving(true);

    // When admin creates on behalf → auto-approved immediately
    const autoApproved = isOnBehalf;

    const { error: insertError } = await supabase
      .from("time_off_requests")
      .insert({
        user_id: targetUserId,
        org_id: orgId,
        start_date: newStart,
        end_date: effectiveEnd,
        type: newType,
        period: newPeriod,
        reason: newReason || null,
        status: autoApproved ? "approved" : "pending",
        reviewed_by: autoApproved ? myId : null,
        reviewed_at: autoApproved ? new Date().toISOString() : null,
      });

    if (insertError) {
      console.error("time_off insert failed:", insertError);
      setFormError(insertError.message || t("errorGeneric"));
      setSaving(false);
      return;
    }

    logActivity(
      autoApproved ? "timeoff_created_by_admin" : "timeoff_requested",
      "timeoff",
      null,
      { type: newType, start_date: newStart, end_date: effectiveEnd, on_behalf_of: isOnBehalf ? targetUserId : undefined },
    );

    if (!isOnBehalf) {
      // Notify managers (regular employee flow)
      const managers = employees.filter((e) => e.role === "admin" || e.role === "manager");
      if (managers.length > 0 && isManager === false) {
        const me = employees.find((e) => e.id === myId);
        for (const mgr of managers) {
          await supabase.from("notifications").insert({
            user_id: mgr.id,
            type: "time_off_request",
            title: "Novo pedido de férias",
            body: `${me?.full_name || "Funcionário"} pediu ${TYPE_LABELS[newType]?.toLowerCase()}${newPeriod !== "full_day" ? ` (${PERIOD_LABELS[newPeriod]?.toLowerCase()})` : ""} de ${formatDate(newStart)}${newPeriod === "full_day" ? ` a ${formatDate(effectiveEnd)}` : ""}.`,
            metadata: { requester_id: myId, type: newType, period: newPeriod, start_date: newStart, end_date: effectiveEnd },
          });
        }
      }
    } else {
      // Notify the employee that admin booked time-off for them
      const emp = employees.find((e) => e.id === targetUserId);
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "time_off_approved",
        title: t("notifAdminBookedTitle"),
        body: `${TYPE_LABELS[newType]} ${formatDate(newStart)}${newPeriod === "full_day" ? ` a ${formatDate(effectiveEnd)}` : ""} — ${t("notifAdminBookedBody")}`,
        metadata: { booked_by: myId, type: newType, period: newPeriod, start_date: newStart, end_date: effectiveEnd },
      });
    }

    setShowNew(false);
    setNewType("ferias");
    setNewPeriod("full_day");
    setNewStart("");
    setNewEnd("");
    setNewReason("");
    setNewOnBehalf("self");
    setSaving(false);
    fetchData();
  }

  // Review request (manager)
  async function reviewRequest(requestId: string, status: "approved" | "rejected") {
    setSaving(true);

    await supabase
      .from("time_off_requests")
      .update({
        status,
        reviewed_by: myId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (status === "approved") {
      logActivity("timeoff_approved", "timeoff", requestId);
    } else if (status === "rejected") {
      logActivity("timeoff_rejected", "timeoff", requestId);
    }

    // Notify the employee
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      await supabase.from("notifications").insert({
        user_id: req.user_id,
        type: status === "approved" ? "time_off_approved" : "time_off_rejected",
        title: status === "approved" ? "Pedido de férias aprovado" : "Pedido de férias rejeitado",
        body: `O seu pedido de ${TYPE_LABELS[req.type]?.toLowerCase()} para ${formatDate(req.start_date)} a ${formatDate(req.end_date)} foi ${status === "approved" ? "aprovado" : "rejeitado"}.`,
        metadata: { request_id: requestId },
      });
    }

    setSaving(false);
    fetchData();
  }

  // Count days in a request
  function countDays(req: TimeOffRequest & { profile?: Profile }): number {
    const s = new Date(req.start_date);
    const e = new Date(req.end_date);
    const fullDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (req.period === "morning" || req.period === "afternoon") return 0.5;
    return fullDays;
  }

  function formatDays(n: number): string {
    if (n === 0.5) return "0,5 dia";
    return `${n} dia${n !== 1 ? "s" : ""}`;
  }

  // Filter
  const filtered = tab === "all"
    ? requests
    : requests.filter((r) => r.status === tab);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  // Calculate vacation balance for current year
  const currentYear = new Date().getFullYear();
  const approvedFerias = requests.filter(
    (r) =>
      r.type === "ferias" &&
      r.status === "approved" &&
      new Date(r.start_date).getFullYear() === currentYear
  );
  const usedDays = approvedFerias.reduce((sum, r) => sum + countDays(r), 0);
  const pendingFerias = requests.filter(
    (r) =>
      r.type === "ferias" &&
      r.status === "pending" &&
      new Date(r.start_date).getFullYear() === currentYear
  );
  const pendingDays = pendingFerias.reduce((sum, r) => sum + countDays(r), 0);
  const remainingDays = vacationQuota - usedDays;

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-stone-200 rounded animate-pulse mt-2" />
        </div>
        <SkeletonCard />
        <SkeletonList count={3} />
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
              ? t("subtitle")
              : t("subtitleEmployee")}
          </p>
        </div>
        <Button onClick={() => { setShowNew(true); setFormError(null); }}>{t("newRequest")}</Button>
      </div>

      {/* Vacation balance */}
      <Card>
        <div className="p-4">
          <p className="text-sm font-medium text-stone-500 mb-3">{t("vacationBalance")} {currentYear}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-stone-900">{vacationQuota}</p>
              <p className="text-xs text-stone-500">{t("total")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600">{remainingDays % 1 === 0 ? remainingDays : remainingDays.toFixed(1).replace(".", ",")}</p>
              <p className="text-xs text-stone-500">{t("disponiveis")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{usedDays % 1 === 0 ? usedDays : usedDays.toFixed(1).replace(".", ",")}</p>
              <p className="text-xs text-stone-500">{t("utilizados")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingDays % 1 === 0 ? pendingDays : pendingDays.toFixed(1).replace(".", ",")}</p>
              <p className="text-xs text-stone-500">{t("pendentes")}</p>
            </div>
          </div>
          {remainingDays <= 3 && remainingDays > 0 && (
            <p className="text-xs text-orange-600 mt-2">{t("attention")}</p>
          )}
          {remainingDays <= 0 && (
            <p className="text-xs text-red-600 mt-2">{t("noVacation")}</p>
          )}
        </div>
      </Card>

      {/* Tabs */}
      {(() => {
        const approvedCount = requests.filter((r) => r.status === "approved").length;
        const rejectedCount = requests.filter((r) => r.status === "rejected").length;
        const allCount = requests.length;
        const tabs = [
          { key: "pending" as const, label: t("tabPending"), count: pendingCount, variant: "pending" as const },
          { key: "approved" as const, label: t("tabApproved"), count: approvedCount, variant: "neutral" as const },
          { key: "rejected" as const, label: t("tabRejected"), count: rejectedCount, variant: "neutral" as const },
          { key: "all" as const, label: t("tabAll"), count: allCount, variant: "neutral" as const },
        ];
        return (
          <div className="flex gap-1 bg-stone-100 rounded-lg p-1 w-fit">
            {tabs.map((item) => {
              const isActive = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {item.label}
                  {item.count > 0 && (
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full leading-none ${
                        item.variant === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : isActive
                          ? "bg-stone-200 text-stone-600"
                          : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Request list */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <Palmtree className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500 mb-3">
              {tab === "pending" ? t("noPendingRequests") : tab === "approved" ? t("noApprovedRequests") : tab === "rejected" ? t("noRejectedRequests") : t("noRequestsFound")}
            </p>
            {!isManager && (
              <Button size="sm" onClick={() => { setShowNew(true); setFormError(null); }}>{t("newRequest")}</Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => {
            const emp = req.profile || employees.find((e) => e.id === req.user_id);
            const dayCount = countDays(req);
            return (
              <Card key={req.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isManager && (
                        <span className="font-medium text-stone-900 text-sm">
                          {emp?.full_name || "—"}
                        </span>
                      )}
                      <Badge variant={STATUS_VARIANT[req.status] || "default"}>
                        {STATUS_LABELS[req.status]}
                      </Badge>
                      <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {TYPE_LABELS[req.type] || req.type}
                      </span>
                      {req.period && req.period !== "full_day" && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {PERIOD_LABELS[req.period] || req.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-700">
                      {req.period && req.period !== "full_day"
                        ? formatDate(req.start_date)
                        : `${formatDate(req.start_date)} a ${formatDate(req.end_date)}`}
                      <span className="text-stone-400 ml-2">({formatDays(dayCount)})</span>
                    </p>
                    {req.reason && (
                      <p className="text-xs text-stone-500 mt-1">{req.reason}</p>
                    )}
                  </div>
                  {isManager && req.status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reviewRequest(req.id, "rejected")}
                        loading={saving}
                        className="text-red-600 hover:bg-red-50"
                      >
                        {t("reject")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => reviewRequest(req.id, "approved")}
                        loading={saving}
                      >
                        {t("approve")}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New request modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title={isManager ? t("modalTitleAdmin") : t("modalTitle")} size="sm">
        <div className="space-y-4">
          {/* Employee picker — admin/manager only */}
          {isManager && employees.length > 0 && (
            <Select
              label={t("onBehalfLabel")}
              value={newOnBehalf}
              onChange={(e) => setNewOnBehalf(e.target.value)}
            >
              <option value="self">{t("onBehalfSelf")}</option>
              {employees
                .filter((e) => e.id !== myId && e.is_active)
                .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""))
                .map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name}</option>
                ))}
            </Select>
          )}

          {/* Auto-approved notice when booking on behalf */}
          {isManager && newOnBehalf !== "self" && (
            <div className="text-xs rounded-md px-3 py-2 border border-[color:var(--primary-soft)] bg-[color:var(--primary-soft)] text-[color:var(--primary)]">
              {t("autoApprovedNotice")}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t("typeLabel")}
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <option value="ferias">{t("types.ferias")}</option>
              <option value="baixa">{t("types.baixa")}</option>
              <option value="pessoal">{t("types.pessoal")}</option>
              <option value="outro">{t("types.outro")}</option>
            </Select>
            <Select
              label={t("periodLabel")}
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
            >
              <option value="full_day">{t("fullDay")}</option>
              <option value="morning">{t("morning")} (0,5 dia)</option>
              <option value="afternoon">{t("afternoon")} (0,5 dia)</option>
            </Select>
          </div>
          <div className={`grid gap-3 ${newPeriod === "full_day" ? "grid-cols-2" : "grid-cols-1"}`}>
            <Input
              type="date"
              label={newPeriod === "full_day" ? t("startDateLabel") : t("dateLabel")}
              value={newStart}
              onChange={(e) => {
                const v = e.target.value;
                setNewStart(v);
                // Auto-correct: if end date is before new start, align end to start
                if (newPeriod === "full_day" && newEnd && v && newEnd < v) {
                  setNewEnd(v);
                }
              }}
            />
            {newPeriod === "full_day" && (
              <Input
                type="date"
                label={t("endDateLabel")}
                value={newEnd}
                min={newStart || undefined}
                onChange={(e) => {
                  const v = e.target.value;
                  // Auto-correct: never allow end before start
                  if (newStart && v && v < newStart) {
                    setNewEnd(newStart);
                  } else {
                    setNewEnd(v);
                  }
                }}
              />
            )}
          </div>
          <Textarea
            label={t("reasonLabel")}
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            rows={2}
            placeholder={t("reasonPlaceholder")}
          />
          {newType === "ferias" && newStart && (newPeriod !== "full_day" || newEnd) && (() => {
            const days = countDays({
              start_date: newStart,
              end_date: newPeriod !== "full_day" ? newStart : newEnd,
              period: newPeriod,
            } as TimeOffRequest & { profile?: Profile });

            // When booking on behalf, compute the TARGET employee's balance
            const isOnBehalf = isManager && newOnBehalf !== "self";
            const targetId = isOnBehalf ? newOnBehalf : myId;
            const targetQuota = isOnBehalf
              ? (employees.find((e) => e.id === targetId)?.vacation_quota ?? 22)
              : vacationQuota;
            const targetUsed = requests.filter(
              (r) =>
                r.user_id === targetId &&
                r.type === "ferias" &&
                r.status === "approved" &&
                new Date(r.start_date).getFullYear() === currentYear
            ).reduce((sum, r) => sum + countDays(r), 0);
            const targetRemaining = targetQuota - targetUsed;

            const afterRemaining = targetRemaining - days;
            const overBudget = afterRemaining < 0;
            return (
              <div
                className={`text-xs rounded-md px-3 py-2 border ${
                  overBudget
                    ? "border-[color:var(--danger)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
                    : "border-[color:var(--border-light)] bg-[color:var(--surface-sunken)] text-[color:var(--text-secondary)]"
                }`}
              >
                {overBudget
                  ? t("balanceOver", { days: formatDays(days), available: formatDays(remainingDays) })
                  : t("balancePreview", {
                      days: formatDays(days),
                      remaining: formatDays(afterRemaining),
                    })}
              </div>
            );
          })()}
          {formError && (
            <div className="text-sm rounded-md border border-[color:var(--danger)] bg-[color:var(--danger-soft)] px-3 py-2 text-[color:var(--danger)]">
              {formError}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setShowNew(false); setFormError(null); }}>{t("cancel")}</Button>
            <Button onClick={createRequest} loading={saving} disabled={!newStart || (newPeriod === "full_day" && !newEnd)}>
              {t("submitRequest")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
