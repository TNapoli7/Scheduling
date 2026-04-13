"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Organization } from "@/types/database";
import { ActivityLogPanel } from "@/components/settings/ActivityLog";
import { History } from "lucide-react";

type TabKey = "general" | "activity";

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
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

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

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
        <div className="text-center py-12 text-stone-500">A carregar...</div>
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
      <div className="flex gap-1 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "general"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
          }`}
        >
          {t("tabGeneral")}
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "activity"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
          }`}
        >
          <History className="w-4 h-4" />
          {t("tabHistory")}
        </button>
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

      {/* Subscription info */}
      {org && (
        <Card>
          <CardTitle>{t("planTitle")}</CardTitle>
          <div className="mt-4 flex items-center gap-3">
            <Badge variant="info">
              {org.subscription_tier === "trial"
                ? "Trial"
                : org.subscription_tier.charAt(0).toUpperCase() +
                  org.subscription_tier.slice(1)}
            </Badge>
            {org.trial_ends_at && (
              <span className="text-sm text-stone-500">
                Trial termina a{" "}
                {new Date(org.trial_ends_at).toLocaleDateString("pt-PT")}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          {t("saveButton")}
        </Button>
      </div>

        </>
      )}
    </div>
  );
}
