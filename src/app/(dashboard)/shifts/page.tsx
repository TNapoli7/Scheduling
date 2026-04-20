"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useCurrentMembership } from "@/hooks/use-membership";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { ShiftTemplate } from "@/types/database";

type ShiftForm = {
  name: string;
  start_time: string;
  end_time: string;
  min_staff: number;
  color: string;
};

const emptyForm: ShiftForm = {
  name: "",
  start_time: "09:00",
  end_time: "17:00",
  min_staff: 1,
  color: "#3B82F6",
};

function computeDuration(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60; // overnight shift
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

export default function ShiftsPage() {
  const t = useTranslations("shifts");

  const defaultColors = [
    { value: "#3B82F6", label: t("colors.blue") },
    { value: "#10B981", label: t("colors.green") },
    { value: "#F59E0B", label: t("colors.yellow") },
    { value: "#EF4444", label: t("colors.red") },
    { value: "#8B5CF6", label: t("colors.purple") },
    { value: "#EC4899", label: t("colors.pink") },
    { value: "#06B6D4", label: t("colors.cyan") },
    { value: "#F97316", label: t("colors.orange") },
  ];
  const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ShiftForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeactivate, setConfirmDeactivate] = useState<ShiftTemplate | null>(null);

  const { membership } = useCurrentMembership();
  const supabase = createClient();

  const fetchShifts = useCallback(async () => {
    const { data } = await supabase
      .from("shift_templates")
      .select("*")
      .order("start_time");
    if (data) setShifts(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(shift: ShiftTemplate) {
    setEditingId(shift.id);
    setForm({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      min_staff: shift.min_staff,
      color: shift.color,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    if (!form.name.trim()) {
      setError(t("errorRequired"));
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      start_time: form.start_time,
      end_time: form.end_time,
      min_staff: form.min_staff,
      color: form.color,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from("shift_templates")
        .update(payload)
        .eq("id", editingId);

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }

      logActivity("shift_updated", "shift", editingId);
    } else {
      if (!membership?.orgId) {
        setError(t("errorRequired"));
        setSaving(false);
        return;
      }

      const { error: err } = await supabase
        .from("shift_templates")
        .insert({ ...payload, org_id: membership.orgId });

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }

      logActivity("shift_created", "shift", null, { name: form.name });
    }

    setShowModal(false);
    setSaving(false);
    fetchShifts();
  }

  async function toggleActive(shift: ShiftTemplate) {
    await supabase
      .from("shift_templates")
      .update({ is_active: !shift.is_active })
      .eq("id", shift.id);
    logActivity(shift.is_active ? "shift_deactivated" : "shift_activated", "shift", shift.id);
    fetchShifts();
  }

  async function loadPresets() {
    if (!membership?.orgId) return;

    const presets = [
      { name: t("presets.morning"), start_time: "08:00", end_time: "16:00", min_staff: 2, color: "#F59E0B", org_id: membership.orgId },
      { name: t("presets.afternoon"), start_time: "14:00", end_time: "22:00", min_staff: 2, color: "#3B82F6", org_id: membership.orgId },
      { name: t("presets.night"), start_time: "22:00", end_time: "08:00", min_staff: 1, color: "#8B5CF6", org_id: membership.orgId },
      { name: t("presets.split"), start_time: "09:00", end_time: "13:00", min_staff: 1, color: "#10B981", org_id: membership.orgId },
    ];

    await supabase.from("shift_templates").insert(presets);
    fetchShifts();
  }

  const activeShifts = shifts.filter((s) => s.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
          <p className="text-sm text-stone-500 mt-1">
            {activeShifts.length} {t("title")} {activeShifts.length === 1 ? t("subtitle") : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {shifts.length === 0 && (
            <Button variant="secondary" onClick={loadPresets}>
              {t("loadPresetsButton")}
            </Button>
          )}
          <Button onClick={openAdd}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("newShiftButton")}
          </Button>
        </div>
      </div>

      {/* Shift cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : shifts.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-stone-500 mb-4">{t("noShifts")}</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={loadPresets}>
                {t("loadPresetsButton")}
              </Button>
              <Button onClick={openAdd}>
                {t("newShiftButton")}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shifts.map((shift) => (
            <Card key={shift.id} padding="sm" className={!shift.is_active ? "opacity-60" : ""}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: shift.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-stone-900">{shift.name}</h3>
                    <p className="text-sm text-stone-500">
                      {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                      <span className="ml-2 text-stone-400">
                        ({computeDuration(shift.start_time, shift.end_time)})
                      </span>
                    </p>
                  </div>
                </div>
                {!shift.is_active && <Badge variant="danger">{t("inactiveStatus")}</Badge>}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  {t("minStaffInline", { count: shift.min_staff })}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(shift)}>
                    {t("editButton")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      shift.is_active
                        ? setConfirmDeactivate(shift)
                        : toggleActive(shift)
                    }
                  >
                    {shift.is_active ? t("deactivateButton") : t("activateButton")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? t("modalEditTitle") : t("modalAddTitle")}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label={t("nameLabel")}
            placeholder={t("namePlaceholder")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("startTimeLabel")}
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
            <Input
              label={t("endTimeLabel")}
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </div>

          {form.start_time && form.end_time && (
            <p className="text-sm text-stone-500">
              {t("durationLabel")}: {computeDuration(form.start_time, form.end_time)}
            </p>
          )}

          <Input
            label={t("minStaffLabel")}
            type="number"
            min={1}
            max={20}
            value={form.min_staff}
            onChange={(e) => setForm({ ...form, min_staff: parseInt(e.target.value) || 1 })}
            hint={t("minStaffHint")}
          />

          {/* Color picker */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700">{t("colorLabel")}</label>
            <div className="flex gap-2 flex-wrap">
              {defaultColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.color === c.value ? "border-stone-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t("cancelButton")}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingId ? t("saveButton") : t("createButton")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm deactivate shift modal */}
      <Modal
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        title={t("confirmDeactivateTitle")}
        size="sm"
      >
        {confirmDeactivate && (
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--text-secondary)]">
              {t("confirmDeactivateBody", { name: confirmDeactivate.name })}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmDeactivate(null)}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  const sh = confirmDeactivate;
                  setConfirmDeactivate(null);
                  await toggleActive(sh);
                }}
              >
                {t("deactivateButton")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
