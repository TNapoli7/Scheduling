"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const sectors = [
  { value: "pharmacy", label: "Farmácia" },
  { value: "clinic", label: "Clínica" },
  { value: "dental", label: "Clínica Dentária" },
  { value: "lab", label: "Laboratório" },
  { value: "physio", label: "Fisioterapia" },
  { value: "other", label: "Outro" },
];

const defaultHours = {
  monday:    { open: "09:00", close: "19:00", closed: false },
  tuesday:   { open: "09:00", close: "19:00", closed: false },
  wednesday: { open: "09:00", close: "19:00", closed: false },
  thursday:  { open: "09:00", close: "19:00", closed: false },
  friday:    { open: "09:00", close: "19:00", closed: false },
  saturday:  { open: "09:00", close: "13:00", closed: false },
  sunday:    { open: "00:00", close: "00:00", closed: true },
};

const dayLabels: Record<string, string> = {
  monday: "Segunda", tuesday: "Terça", wednesday: "Quarta",
  thursday: "Quinta", friday: "Sexta", saturday: "Sábado", sunday: "Domingo",
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // When launched from the org switcher ("Criar nova organização") we're
  // creating an ADDITIONAL org for an authenticated user — no profile.id
  // rewrite needed, just a new org + membership. Same form works in both
  // flows; only the submit logic branches on this flag.
  const isNewOrgFlow = searchParams.get("mode") === "new-org";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Org info
  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("pharmacy");
  const [address, setAddress] = useState("");

  // Step 2: Operating hours
  const [hours, setHours] = useState(defaultHours);

  // Step 3: Profile name
  const [fullName, setFullName] = useState("");

  function updateDay(day: string, field: string, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value },
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sessão expirada"); setLoading(false); return; }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        sector,
        address: address || null,
        operating_hours: hours,
      })
      .select()
      .single();

    if (orgError || !org) {
      setError(orgError?.message || "Erro ao criar organização");
      setLoading(false);
      return;
    }

    // Create the membership making the current user the admin of this org.
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({
        user_id: user.id,
        org_id: org.id,
        role: "admin",
        full_name: fullName,
        is_active: true,
      });

    if (membershipError) {
      setError(membershipError.message);
      setLoading(false);
      return;
    }

    // Update profile: set active_org_id always. Only write legacy org_id/role
    // on the FIRST org (isNewOrgFlow === false). For additional orgs we keep
    // profile.org_id pointing to the user's original org so legacy queries
    // don't silently switch context.
    const profileUpdate: Record<string, unknown> = {
      active_org_id: org.id,
    };
    if (!isNewOrgFlow) {
      profileUpdate.org_id = org.id;
      profileUpdate.full_name = fullName;
      profileUpdate.role = "admin";
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    logActivity("organization_created", "organization", org.id, { name: orgName, sector });

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "var(--primary)" }}>Shiftera</h1>
          <p className="text-stone-500 mt-2">Configura a tua empresa em 3 passos</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step ? "bg-indigo-600 text-white" : "bg-stone-200 text-stone-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? "bg-indigo-600" : "bg-stone-200"}`} />}
            </div>
          ))}
        </div>

        <Card padding="lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Org info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">A tua empresa</h2>

              <Input
                label="Nome da empresa"
                placeholder="Farmácia Central"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-stone-700">Setor</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {sectors.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Morada (opcional)"
                placeholder="Rua da Farmácia, 123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <Button onClick={() => setStep(2)} disabled={!orgName} className="w-full">
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Operating hours */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">Horário de funcionamento</h2>
              <p className="text-sm text-stone-600">Quando e que a empresa esta aberta?</p>

              <div className="space-y-3">
                {Object.entries(dayLabels).map(([day, label]) => {
                  const d = hours[day as keyof typeof hours];
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 w-28">
                        <input
                          type="checkbox"
                          checked={!d.closed}
                          onChange={(e) => updateDay(day, "closed", !e.target.checked)}
                          className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm ${d.closed ? "text-stone-400" : "text-stone-700"}`}>
                          {label}
                        </span>
                      </label>
                      {!d.closed && (
                        <div className="flex items-center gap-2 text-sm">
                          <input
                            type="time"
                            value={d.open}
                            onChange={(e) => updateDay(day, "open", e.target.value)}
                            className="rounded border-stone-300 px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <span className="text-stone-400">é</span>
                          <input
                            type="time"
                            value={d.close}
                            onChange={(e) => updateDay(day, "close", e.target.value)}
                            className="rounded border-stone-300 px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      )}
                      {d.closed && (
                        <span className="text-sm text-stone-400">Fechado</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Your name */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">O teu perfil</h2>

              <Input
                label="Nome completo"
                placeholder="Tomas Napoles"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <p className="text-sm text-stone-500">
                Vais ser o administrador desta conta. Podes adicionar a equipa depois.
              </p>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleSubmit} loading={loading} disabled={!fullName} className="flex-1">
                  Comecar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
