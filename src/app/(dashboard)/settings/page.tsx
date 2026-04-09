"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Organization } from "@/types/database";

const sectorOptions = [
  { value: "farmacia", label: "Farmacia" },
  { value: "clinica", label: "Clinica" },
  { value: "hospital", label: "Hospital" },
  { value: "laboratorio", label: "Laboratorio" },
  { value: "consultorio", label: "Consultorio" },
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
        <h1 className="text-2xl font-bold text-gray-900">Definicoes</h1>
        <div className="text-center py-12 text-gray-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Definicoes</h1>
        {success && (
          <Badge variant="success">Guardado com sucesso</Badge>
        )}
      </div>

      {/* Company info */}
      <Card>
        <CardTitle>Informacao da empresa</CardTitle>
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
            placeholder="Rua, numero, codigo postal, cidade"
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
        <CardTitle>Horario de funcionamento</CardTitle>
        <div className="mt-4 space-y-3">
          {WEEKDAYS.map((day) => {
            const h = hours[day.key];
            if (!h) return null;
            return (
              <div
                key={day.key}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="w-24 text-sm font-medium text-gray-700">
                  {day.label}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={(e) =>
                      updateHours(day.key, "closed", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) =>
                        updateHours(day.key, "close", e.target.value)
                      }
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <span className="text-sm text-gray-500">
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
          Guardar alteracoes
        </Button>
      </div>
    </div>
  );
}
