"use client";

/**
 * CreateOrgModal — single-form modal for authenticated admins creating an
 * additional organisation.
 *
 * Design rationale (vs. reusing /onboarding): an already-onboarded admin does
 * not need a wizard. All fields live in one form; the operating-hours table
 * starts collapsed with sensible defaults so the common case is "fill three
 * fields and submit". Patterns: Linear (new workspace), Notion (new team),
 * Vercel (new project).
 */

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";

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

interface CreateOrgModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOrgModal({ open, onClose }: CreateOrgModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("pharmacy");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState(defaultHours);
  const [hoursExpanded, setHoursExpanded] = useState(false);

  function updateDay(day: string, field: string, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value },
    }));
  }

  function resetState() {
    setOrgName("");
    setSector("pharmacy");
    setAddress("");
    setHours(defaultHours);
    setHoursExpanded(false);
    setError("");
  }

  function handleClose() {
    if (loading) return;
    resetState();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sessão expirada"); setLoading(false); return; }

    // Fetch the current profile full_name to seed the membership row. The
    // user can later edit their per-org display name in Definições.
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();
    const fullName = profile?.full_name || profile?.email || "";

    // 1. Create organisation
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: orgName.trim(),
        sector,
        address: address.trim() || null,
        operating_hours: hours,
      })
      .select()
      .single();

    if (orgError || !org) {
      setError(orgError?.message || "Erro ao criar organização");
      setLoading(false);
      return;
    }

    // 2. Membership: current user becomes admin of the new org
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

    // 3. Switch active org on the profile. We do NOT touch legacy org_id /
    //    role here — those still point to the user's original org so legacy
    //    queries don't silently shift context.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ active_org_id: org.id })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    logActivity("organization_created", "organization", org.id, { name: orgName, sector });

    // Full reload so RLS picks up the new org context everywhere.
    window.location.href = "/dashboard";
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nova organização" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Nome da empresa"
          placeholder="Farmácia Central"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
          autoFocus
        />

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider">
            Setor
          </label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="block w-full rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-3.5 h-10 text-sm text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--border-strong)] focus:outline-none focus-visible:outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary-soft)]"
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

        {/* Collapsible hours — default "standard" (Seg-Sex 9-19, Sáb 9-13) */}
        <div className="border border-[color:var(--border)] rounded-[var(--radius-md)]">
          <button
            type="button"
            onClick={() => setHoursExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left hover:bg-stone-50 transition-colors rounded-[var(--radius-md)]"
          >
            <div className="flex items-center gap-2">
              {hoursExpanded
                ? <ChevronDown className="w-4 h-4 text-stone-500" />
                : <ChevronRight className="w-4 h-4 text-stone-500" />}
              <span className="font-medium text-stone-800">Horário de funcionamento</span>
            </div>
            {!hoursExpanded && (
              <span className="text-xs text-stone-500">Seg–Sex 9–19 · Sáb 9–13 · Dom fechado</span>
            )}
          </button>

          {hoursExpanded && (
            <div className="px-3.5 pb-3.5 pt-1 space-y-2">
              {Object.entries(dayLabels).map(([day, label]) => {
                const d = hours[day as keyof typeof hours];
                return (
                  <div key={day} className="flex items-center gap-3">
                    <label className="flex items-center gap-2 w-28">
                      <input
                        type="checkbox"
                        checked={!d.closed}
                        onChange={(e) => updateDay(day, "closed", !e.target.checked)}
                        className="rounded border-stone-300 text-[color:var(--accent)] focus:ring-[color:var(--accent-soft)]"
                      />
                      <span className={`text-sm ${d.closed ? "text-stone-400" : "text-stone-700"}`}>
                        {label}
                      </span>
                    </label>
                    {!d.closed ? (
                      <div className="flex items-center gap-2 text-sm">
                        <input
                          type="time"
                          value={d.open}
                          onChange={(e) => updateDay(day, "open", e.target.value)}
                          className="rounded border-stone-300 px-2 py-1 text-sm focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)] focus:border-[color:var(--accent)]"
                        />
                        <span className="text-stone-400">às</span>
                        <input
                          type="time"
                          value={d.close}
                          onChange={(e) => updateDay(day, "close", e.target.value)}
                          className="rounded border-stone-300 px-2 py-1 text-sm focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)] focus:border-[color:var(--accent)]"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-stone-400">Fechado</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} disabled={!orgName.trim()} className="flex-1">
            Criar organização
          </Button>
        </div>
      </form>
    </Modal>
  );
}
