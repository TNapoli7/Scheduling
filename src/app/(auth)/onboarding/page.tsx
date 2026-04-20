"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShifteraLockup } from "@/components/lp/ShifteraLogo";
import { useTranslations } from "next-intl";

const defaultHours = {
  monday:    { open: "09:00", close: "19:00", closed: false },
  tuesday:   { open: "09:00", close: "19:00", closed: false },
  wednesday: { open: "09:00", close: "19:00", closed: false },
  thursday:  { open: "09:00", close: "19:00", closed: false },
  friday:    { open: "09:00", close: "19:00", closed: false },
  saturday:  { open: "09:00", close: "13:00", closed: false },
  sunday:    { open: "00:00", close: "00:00", closed: true },
};

const dayKeys: Record<string, string> = {
  monday: "monday", tuesday: "tuesday", wednesday: "wednesday",
  thursday: "thursday", friday: "friday", saturday: "saturday", sunday: "sunday",
};

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("auth.onboarding");

  const sectors = [
    { value: "pharmacy", label: t("pharmacy") },
    { value: "clinic", label: t("clinic") },
    { value: "dental", label: t("dentalClinic") },
    { value: "lab", label: t("lab") },
    { value: "physio", label: t("physio") },
    { value: "other", label: t("other") },
  ];

  // First-run only: authenticated user with no organisation yet. The
  // "add another organisation" flow for existing admins lives in
  // CreateOrgModal (opened from the sidebar org switcher).
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Org info
  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("pharmacy");
  const [address, setAddress] = useState("");

  // Step 2: Operating hours
  const [hours, setHours] = useState(defaultHours);

  // Display name — used for the membership row. We auto-fill from the user's
  // existing profile (this is their own account), so no dedicated step is
  // needed. The user can later edit the per-org name in Definições.
  const [fullName, setFullName] = useState("");

  // Load the current user's name once on mount to seed the membership
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      const fallback = profile?.full_name || profile?.email || "";
      setFullName(fallback);
    })();
  }, []);

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
    if (!user) { setError(t("sessionExpired")); setLoading(false); return; }

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
      setError(orgError?.message || t("errorCreatingOrg"));
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

    // First-run: write active_org_id + legacy org_id/role/full_name so the
    // profile is fully initialised for downstream queries.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        active_org_id: org.id,
        org_id: org.id,
        full_name: fullName,
        role: "admin",
      })
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
        <div className="flex flex-col items-center mb-8">
          <ShifteraLockup size={36} />
          <p className="text-stone-500 mt-3">{t('setupCompany')}</p>
        </div>

        {/* Progress — two steps, branded orange */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  s <= step
                    ? "bg-[color:var(--accent)] text-white"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    s < step ? "bg-[color:var(--accent)]" : "bg-stone-200"
                  }`}
                />
              )}
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
              <h2 className="text-xl font-semibold text-stone-900">{t('step1')}</h2>

              <Input
                label={t('companyName')}
                placeholder={t('companyNamePlaceholder')}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-stone-700">{t('sector')}</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="block w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)] focus:border-[color:var(--accent)]"
                >
                  {sectors.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <Input
                label={t('address')}
                placeholder={t('addressPlaceholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <Button onClick={() => setStep(2)} disabled={!orgName} className="w-full">
                {t('continue')}
              </Button>
            </div>
          )}

          {/* Step 2: Operating hours */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">{t('step2')}</h2>
              <p className="text-sm text-stone-600">{t('operatingHours')}</p>

              <div className="space-y-3">
                {Object.entries(dayKeys).map(([day, key]) => {
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
                          {t(key)}
                        </span>
                      </label>
                      {!d.closed && (
                        <div className="flex items-center gap-2 text-sm">
                          <input
                            type="time"
                            value={d.open}
                            onChange={(e) => updateDay(day, "open", e.target.value)}
                            className="rounded border-stone-300 px-2 py-1 text-sm focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)] focus:border-[color:var(--accent)]"
                          />
                          <span className="text-stone-400">{t("to")}</span>
                          <input
                            type="time"
                            value={d.close}
                            onChange={(e) => updateDay(day, "close", e.target.value)}
                            className="rounded border-stone-300 px-2 py-1 text-sm focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)] focus:border-[color:var(--accent)]"
                          />
                        </div>
                      )}
                      {d.closed && (
                        <span className="text-sm text-stone-400">{t('closed')}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* The creator is always the admin of the new organisation —
                  we re-use their existing profile.full_name (seeded in state
                  on mount). No separate "profile" step needed. */}
              <p className="text-sm text-stone-500">
                {t('adminNote')}
              </p>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  {t('back')}
                </Button>
                <Button onClick={handleSubmit} loading={loading} disabled={!fullName} className="flex-1">
                  {t('finish')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
