"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { Profile, ScheduleEntry, ShiftTemplate } from "@/types/database";
import { formatDate } from "@/lib/dates";

interface SwapWithDetails {
  id: string;
  requester_id: string;
  target_id: string;
  entry_id: string;
  target_entry_id: string | null;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  requester: Profile;
  target: Profile;
  entry: ScheduleEntry & { shift_template: ShiftTemplate };
  target_entry: (ScheduleEntry & { shift_template: ShiftTemplate }) | null;
}

type TabFilter = "pending" | "approved" | "rejected" | "all";

export default function SwapsPage() {
  const t = useTranslations("swaps");
  const [swaps, setSwaps] = useState<SwapWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // New swap request
  const [showNewSwap, setShowNewSwap] = useState(false);
  const [myEntries, setMyEntries] = useState<
    (ScheduleEntry & { shift_template: ShiftTemplate })[]
  >([]);
  const [colleagues, setColleagues] = useState<Profile[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string>("");
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [swapReason, setSwapReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get current user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setCurrentUser(profile);

    if (!profile?.org_id) return;

    // Fetch swap requests for this org
    const { data: swapData } = await supabase
      .from("swap_requests")
      .select(
        `
        *,
        requester:profiles!swap_requests_requester_id_fkey(*),
        target:profiles!swap_requests_target_id_fkey(*),
        entry:schedule_entries!swap_requests_entry_id_fkey(*, shift_template:shift_templates(*))
      `
      )
      .order("created_at", { ascending: false });

    // For target entries, fetch separately if they exist
    const swapsWithTargetEntries: SwapWithDetails[] = [];
    for (const swap of swapData || []) {
      let targetEntry = null;
      if (swap.target_entry_id) {
        const { data } = await supabase
          .from("schedule_entries")
          .select("*, shift_template:shift_templates(*)")
          .eq("id", swap.target_entry_id)
          .single();
        targetEntry = data;
      }
      swapsWithTargetEntries.push({
        ...swap,
        target_entry: targetEntry,
      } as SwapWithDetails);
    }

    setSwaps(swapsWithTargetEntries);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open new swap modal
  async function openNewSwap() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch my upcoming schedule entries
    const today = new Date().toISOString().slice(0, 10);
    const { data: entries } = await supabase
      .from("schedule_entries")
      .select("*, shift_template:shift_templates(*)")
      .eq("user_id", user.id)
      .gte("date", today)
      .order("date");

    setMyEntries(
      (entries || []) as (ScheduleEntry & { shift_template: ShiftTemplate })[]
    );

    // Fetch colleagues
    const { data: cols } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .neq("id", user.id)
      .order("full_name");

    setColleagues(cols || []);
    setSelectedEntry("");
    setSelectedTarget("");
    setSwapReason("");
    setShowNewSwap(true);
  }

  // Submit swap request
  async function submitSwap() {
    if (!selectedEntry || !selectedTarget || !currentUser) return;
    setSubmitting(true);

    await supabase.from("swap_requests").insert({
      requester_id: currentUser.id,
      target_id: selectedTarget,
      entry_id: selectedEntry,
      reason: swapReason || null,
      status: "pending",
    });

    logActivity("swap_requested", "swap");

    setSubmitting(false);
    setShowNewSwap(false);
    fetchData();
  }

  // Approve / Reject
  async function handleAction(
    swapId: string,
    action: "approved" | "rejected"
  ) {
    if (!currentUser) return;
    setProcessing(swapId);

    await supabase
      .from("swap_requests")
      .update({
        status: action,
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", swapId);

    if (action === "approved") {
      logActivity("swap_approved", "swap", swapId);
    } else if (action === "rejected") {
      logActivity("swap_rejected", "swap", swapId);
    }

    // If approved, actually swap the shifts
    if (action === "approved") {
      const swap = swaps.find((s) => s.id === swapId);
      if (swap) {
        // Swap the user_ids on the entries
        await supabase
          .from("schedule_entries")
          .update({ user_id: swap.target_id })
          .eq("id", swap.entry_id);

        if (swap.target_entry_id) {
          await supabase
            .from("schedule_entries")
            .update({ user_id: swap.requester_id })
            .eq("id", swap.target_entry_id);
        }
      }
    }

    setProcessing(null);
    fetchData();
  }

  const filtered =
    tab === "all" ? swaps : swaps.filter((s) => s.status === tab);

  const isManager =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    {
      key: "pending",
      label: t("tabPending"),
      count: swaps.filter((s) => s.status === "pending").length,
    },
    {
      key: "approved",
      label: t("tabApproved"),
      count: swaps.filter((s) => s.status === "approved").length,
    },
    {
      key: "rejected",
      label: t("tabRejected"),
      count: swaps.filter((s) => s.status === "rejected").length,
    },
    { key: "all", label: t("tabAll"), count: swaps.length },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
        <div className="text-center py-12 text-stone-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
        <Button onClick={openNewSwap}>{t("newSwapButton")}</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  tab === t.key
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Swap list */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-stone-500">
            {tab === "pending"
              ? t("noPendingSwaps")
              : t("noSwapsFound")}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((swap) => (
            <Card key={swap.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Left: swap details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        swap.status === "pending"
                          ? "warning"
                          : swap.status === "approved"
                          ? "success"
                          : "danger"
                      }
                    >
                      {swap.status === "pending"
                        ? t("statuses.pending")
                        : swap.status === "approved"
                        ? t("statuses.approved")
                        : t("statuses.rejected")}
                    </Badge>
                    <span className="text-xs text-stone-400">
                      {new Date(swap.created_at).toLocaleDateString("pt-PT")}
                    </span>
                  </div>

                  <p className="text-sm text-stone-900">
                    <span className="font-medium">
                      {swap.requester?.full_name}
                    </span>{" "}
                    pede troca com{" "}
                    <span className="font-medium">
                      {swap.target?.full_name}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-600">
                    {swap.entry?.shift_template && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              swap.entry.shift_template.color || "#6B7280",
                          }}
                        />
                        <span>
                          {formatDate(swap.entry.date)} ·{" "}
                          <span className="font-medium">
                            {swap.entry.shift_template.name}
                          </span>{" "}
                          <span className="text-stone-400">
                            {swap.entry.shift_template.start_time?.slice(0, 5)}–
                            {swap.entry.shift_template.end_time?.slice(0, 5)}
                          </span>
                        </span>
                      </div>
                    )}
                    {swap.target_entry?.shift_template && (
                      <>
                        <span className="text-stone-400">↔</span>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                swap.target_entry.shift_template.color ||
                                "#6B7280",
                            }}
                          />
                          <span>
                            {formatDate(swap.target_entry.date)} ·{" "}
                            <span className="font-medium">
                              {swap.target_entry.shift_template.name}
                            </span>{" "}
                            <span className="text-stone-400">
                              {swap.target_entry.shift_template.start_time?.slice(
                                0,
                                5,
                              )}
                              –
                              {swap.target_entry.shift_template.end_time?.slice(
                                0,
                                5,
                              )}
                            </span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {swap.reason && (
                    <p className="text-xs text-stone-500 mt-1 italic">
                      &ldquo;{swap.reason}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right: actions */}
                {swap.status === "pending" && isManager && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleAction(swap.id, "approved")}
                      loading={processing === swap.id}
                    >
                      {t("approveButton")}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAction(swap.id, "rejected")}
                      loading={processing === swap.id}
                      className="!text-[color:var(--danger)] !border-[color:var(--danger-soft)] hover:!bg-[color:var(--danger-soft)]"
                    >
                      {t("rejectButton")}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Swap Modal */}
      <Modal
        open={showNewSwap}
        onClose={() => setShowNewSwap(false)}
        title={t("modalTitle")}
        size="md"
      >
        <div className="space-y-4">
          {/* Select my shift */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {t("myShiftLabel")}
            </label>
            {myEntries.length === 0 ? (
              <p className="text-sm text-stone-500">
                {t("noFutureShifts")}
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {myEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${
                      selectedEntry === entry.id
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          entry.shift_template?.color || "#6B7280",
                      }}
                    />
                    <div>
                      <p className="font-medium text-stone-900">
                        {formatDate(entry.date)} — {entry.shift_template?.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {entry.shift_template?.start_time?.slice(0, 5)} -{" "}
                        {entry.shift_template?.end_time?.slice(0, 5)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Select colleague */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {t("selectColleagueLabel")}
            </label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("selectColleagueOption")}</option>
              {colleagues.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {t("reasonLabel")}
            </label>
            <textarea
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              rows={2}
              className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowNewSwap(false)}>
              {t("cancelButton")}
            </Button>
            <Button
              onClick={submitSwap}
              disabled={!selectedEntry || !selectedTarget}
              loading={submitting}
            >
              {t("submitButton")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
