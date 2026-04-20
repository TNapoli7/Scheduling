"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { Organization } from "@/types/database";
import { ActivityLogPanel } from "@/components/settings/ActivityLog";
import { History, Settings as SettingsIcon, CreditCard, Bell, Camera, Loader2, Trash2 } from "lucide-react";

type TabKey = "general" | "plan" | "notifications" | "activity";

type OperatingHours = Record<
  string,
  { open: string; close: string; closed: boolean }
>;

const WEEKDAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function SettingsPage() {
  const t = useTranslations("settingsPage");
  const ts = useTranslations("settings");
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [address, setAddress] = useState("");
  const [municipalHoliday, setMunicipalHoliday] = useState("");
  const [hours, setHours] = useState<OperatingHours>({});

  // Icon upload state
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Track whether the form has unsaved changes so we can warn before leaving
  // (browser beforeunload) and before switching tab inside the page.
  const initialRef = useRef<string>("");

  const supabase = createClient();

  const fetchOrg = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) return;

    const { data: orgData } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.org_id)
      .single();

    if (orgData) {
      setOrg(orgData);
      setName(orgData.name || "");
      setSector(orgData.sector || "");
      setAddress(orgData.address || "");
      setMunicipalHoliday(orgData.municipal_holiday || "");
      setIconUrl(orgData.icon_url || null);

      // Init operating hours with defaults
      const defaultHours: OperatingHours = {};
      for (const dayKey of WEEKDAY_KEYS) {
        const existing = orgData.operating_hours?.[dayKey];
        defaultHours[dayKey] = existing || {
          open: "09:00",
          close: "18:00",
          closed: dayKey === "sunday",
        };
      }
      setHours(defaultHours);

      // Snapshot the loaded state so we can diff on every render to detect
      // unsaved edits. JSON.stringify is cheap for this small object.
      initialRef.current = JSON.stringify({
        name: orgData.name || "",
        sector: orgData.sector || "",
        address: orgData.address || "",
        municipalHoliday: orgData.municipal_holiday || "",
        hours: defaultHours,
      });
    }

    setLoading(false);
  }, [supabase]);

  const isDirty =
    initialRef.current !== "" &&
    initialRef.current !==
      JSON.stringify({ name, sector, address, municipalHoliday, hours });

  // Warn on tab/window close if there are unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !org) return;

    if (!file.type.startsWith("image/")) {
      setSuccess(false);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      // Max 2 MB for org icon
      return;
    }

    setUploadingIcon(true);

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${org.id}/icon-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("org-icons")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      setUploadingIcon(false);
      return;
    }

    const { data: pub } = supabase.storage.from("org-icons").getPublicUrl(path);
    const url = pub.publicUrl;

    await supabase
      .from("organizations")
      .update({ icon_url: url, updated_at: new Date().toISOString() })
      .eq("id", org.id);

    setIconUrl(url);
    setUploadingIcon(false);
    logActivity("org_icon_updated", "settings", org.id);
  }

  async function removeIcon() {
    if (!org || !iconUrl) return;
    setUploadingIcon(true);

    await supabase
      .from("organizations")
      .update({ icon_url: null, updated_at: new Date().toISOString() })
      .eq("id", org.id);

    setIconUrl(null);
    setUploadingIcon(false);
    logActivity("org_icon_removed", "settings", org.id);
  }

  async function handleSave() {
    if (!org) return;
    setSaving(true);
    setSuccess(false);

    await supabase
      .from("organizations")
      .update({
        name,
        sector,
        address: address || null,
        municipal_holiday: municipalHoliday || null,
        operating_hours: hours,
        updated_at: new Date().toISOString(),
      })
      .eq("id", org.id);

    logActivity("settings_updated", "settings", org?.id);

    // Reset the baseline so the form is no longer "dirty" right after save.
    initialRef.current = JSON.stringify({
      name,
      sector,
      address,
      municipalHoliday,
      hours,
    });

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  // Tab-switch gate: ask before abandoning unsaved edits in the General tab.
  function trySwitchTab(next: TabKey) {
    if (activeTab === "general" && isDirty) {
      const proceed = window.confirm(t("unsavedPrompt"));
      if (!proceed) return;
    }
    setActiveTab(next);
  }

  function updateHours(day: string, field: string, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
        {success && (
          <Badge variant="success">{t("savedSuccess")}</Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[color:var(--border-light)] overflow-x-auto">
        {([
          { key: "general" as const, label: t("tabGeneral"), icon: SettingsIcon },
          { key: "plan" as const, label: t("tabPlan"), icon: CreditCard },
          { key: "notifications" as const, label: t("tabNotifications"), icon: Bell },
          { key: "activity" as const, label: t("tabHistory"), icon: History },
        ]).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => trySwitchTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                  : "border-transparent text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:border-[color:var(--border)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Activity log tab */}
      {activeTab === "activity" && <ActivityLogPanel />}

      {/* General settings tab */}
      {activeTab === "general" && (
        <>

      {/* Company info */}
      <Card>
        <CardTitle>{t("companyInfoTitle")}</CardTitle>
        <div className="mt-4 space-y-4">

          {/* Org icon upload */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl bg-[color:var(--accent-soft)] flex items-center justify-center overflow-hidden border border-[color:var(--border-light)] shrink-0">
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-[color:var(--accent)]">
                  {(name || "?").charAt(0).toUpperCase()}
                </span>
              )}
              {uploadingIcon && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIconUpload}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => iconInputRef.current?.click()}
                disabled={uploadingIcon}
              >
                <Camera className="w-4 h-4 mr-1.5" />
                {iconUrl ? t("changeIcon") : t("uploadIcon")}
              </Button>
              {iconUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeIcon}
                  disabled={uploadingIcon}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  {t("removeIcon")}
                </Button>
              )}
              <p className="text-xs text-[color:var(--text-muted)]">{t("iconHint")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("nameLabel")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da empresa"
            />
            <Select
              label={t("sectorLabel")}
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              options={[
                { value: "farmacia", label: t("sectors.farmacia") },
                { value: "clinica", label: t("sectors.clinica") },
                { value: "hospital", label: t("sectors.hospital") },
                { value: "laboratorio", label: t("sectors.laboratorio") },
                { value: "consultorio", label: t("sectors.consultorio") },
                { value: "posto_saude", label: t("sectors.posto_saude") },
                { value: "residencia_senior", label: t("sectors.residencia_senior") },
                { value: "fisioterapia", label: t("sectors.fisioterapia") },
                { value: "restaurante", label: t("sectors.restaurante") },
                { value: "hotel", label: t("sectors.hotel") },
                { value: "outro", label: t("sectors.outro") },
              ]}
            />
          </div>
          <Input
            label={t("addressLabel")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rua, número, código postal, cidade"
          />
          <Input
            label={t("municipalHolidayLabel")}
            type="date"
            value={municipalHoliday}
            onChange={(e) => setMunicipalHoliday(e.target.value)}
            hint={t("municipalHolidayHint")}
          />
        </div>
      </Card>

      {/* Operating hours */}
      <Card>
        <CardTitle>{t("workingHoursTitle")}</CardTitle>
        <div className="mt-4 space-y-3">
          {WEEKDAY_KEYS.map((dayKey) => {
            const h = hours[dayKey];
            if (!h) return null;
            return (
              <div
                key={dayKey}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="w-24 text-sm font-medium text-stone-700">
                  {ts(dayKey)}
                </div>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={(e) =>
                      updateHours(dayKey, "closed", e.target.checked)
                    }
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {t("closedLabel")}
                </label>
                {!h.closed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) =>
                        updateHours(dayKey, "open", e.target.value)
                      }
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-stone-400">—</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) =>
                        updateHours(dayKey, "close", e.target.value)
                      }
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Save button */}
      <div className="flex justify-end items-center gap-3">
        {isDirty && (
          <span className="text-xs text-[color:var(--warning)] font-medium">
            {t("unsavedChanges")}
          </span>
        )}
        <Button onClick={handleSave} loading={saving} disabled={!isDirty}>
          {t("saveButton")}
        </Button>
      </div>

        </>
      )}

      {/* Plan tab */}
      {activeTab === "plan" && (
        <div className="space-y-4">
          <Card>
            <CardTitle>{t("planTitle")}</CardTitle>
            {org ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="accent">
                    {org.subscription_tier === "trial"
                      ? "Trial"
                      : org.subscription_tier.charAt(0).toUpperCase() +
                        org.subscription_tier.slice(1)}
                  </Badge>
                  {org.trial_ends_at && (
                    <span className="text-sm text-[color:var(--text-secondary)]">
                      {t("trialEndsOn")}{" "}
                      {new Date(org.trial_ends_at).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[color:var(--text-muted)]">
                  {t("planBillingComingSoon")}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[color:var(--text-muted)]">
                {t("planLoading")}
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <Card>
            <CardTitle>{t("notificationsTitle")}</CardTitle>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-[color:var(--text-secondary)]">
                {t("notificationsIntro")}
              </p>
              <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-sunken)] px-4 py-6 text-center">
                <Bell className="w-6 h-6 text-[color:var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[color:var(--text-secondary)] font-medium">
                  {t("notificationsComingSoon")}
                </p>
                <p className="text-xs text-[color:var(--text-muted)] mt-1">
                  {t("notificationsComingSoonBody")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
