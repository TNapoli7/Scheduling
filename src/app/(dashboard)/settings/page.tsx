"use client";

import { useState, useEffect, useCallback } from "react";
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

const TABS: { key: string; label: string; icon?: typeof History }[] = [
  { key: "general", label: "Geral" },
  { key: "activity", label: "Histórico de atividade", icon: History },
];

type TabKey = "general" | "activity";

const sectorOptions = [
  { value: "farmacia", label: "Farmácia" },
  { value: "clinica", label: "Clínica" },
  { value: "hospital", label: "Hospital" },
  { value: "laboratorio", label: "Laboratório" },
  { value: "consultorio", label: "Consultório" },
  { value: "outro", label: "Outro" },
];

const WEEKDAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terca" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sabado" },
  { key: "sunday", label: "Domingo" },
];

type OperatingHours = Record<
  string,
  { open: string; close: string; closed: boolean }
>;

export default function SettingsPage() {
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
      for (const day of WEEKDAYS) {
        const existing = orgData.operating_hours?.[day.key];
        defaultHours[day.key] = existing || {
          open: "09:00",
          close: "18:00",
          closed: day.key === "sunday",
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
        <h1 className="text-2xl font-bold text-stone-900">Definições</h1>
        <div className="text-center py-12 text-stone-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Definições</h1>
        {success && (
          <Badge variant="success">Guardado com sucesso</Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
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
        <CardTitle>Informação da empresa</CardTitle>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da empresa"
            />
            <Select
              label="Setor"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              options={sectorOptions}
            />
          </div>
          <Input
            label="Morada"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rua, número, código postal, cidade"
          />
          <Input
            label="Feriado municipal"
            type="date"
            value={municipalHoliday}
            onChange={(e) => setMunicipalHoliday(e.target.value)}
            hint="Data do feriado municipal da tua localidade (ex: Santo Antonio em Lisboa a 13 de Junho)"
          />
        </div>
      </Card>

      {/* Operating hours */}
      <Card>
        <CardTitle>Horário de funcionamento</CardTitle>
        <div className="mt-4 space-y-3">
          {WEEKDAYS.map((day) => {
            const h = hours[day.key];
            if (!h) return null;
            return (
              <div
                key={day.key}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="w-24 text-sm font-medium text-stone-700">
                  {day.label}
                </div>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={(e) =>
                      updateHours(day.key, "closed", e.target.checked)
                    }
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Encerrado
                </label>
                {!h.closed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) =>
                        updateHours(day.key, "open", e.target.value)
                      }
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-stone-400">—</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) =>
                        updateHours(day.key, "close", e.target.value)
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
          <CardTitle>Plano</CardTitle>
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
          Guardar alterações
        </Button>
      </div>

        </>
      )}
    </div>
  );
}
