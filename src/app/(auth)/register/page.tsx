"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import {
  validatePasswordStrength,
  MIN_PASSWORD_LENGTH,
} from "@/lib/password-policy";
import { useTranslations } from "next-intl";
import { FakeBrandLogo, type BrandKey } from "@/components/lp/FakeBrandLogo";

type FakeLogo = { name: string; brand: BrandKey };

// Placeholder social-proof brands. Each uses a unique abstract SVG mark
// (see FakeBrandLogo) — no real company is claimed. No taglines — kept minimal.
const fakeLogos: FakeLogo[] = [
  { name: "Farmácia Aurora", brand: "aurora" },
  { name: "Clínica Vida+", brand: "vida-plus" },
  { name: "Dental Porto", brand: "dental-porto" },
  { name: "LusoMed", brand: "luso-med" },
  { name: "Fisio Expert", brand: "fisio-expert" },
  { name: "Farmácia Central", brand: "central" },
];

export default function RegisterPage() {
  const router = useRouter();
  const tPwd = useTranslations("passwordPolicy");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentToEmail, setSentToEmail] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.ok) {
      setError(tPwd(pwdCheck.issue!, { min: MIN_PASSWORD_LENGTH }));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          org_name: orgName,
        },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/onboarding`
            : undefined,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      return;
    }

    logActivity("signup", "auth", null, { email });

    setSentToEmail(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-[color:var(--background)]">
      {/* LEFT — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-20 xl:px-28 py-12">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--primary)] transition-colors mb-10"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Voltar ao site
          </Link>

          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <svg viewBox="0 0 96 106" className="w-9 h-10">
              <rect x="4" y="22" width="88" height="76" rx="10" ry="10" fill="#E8850A" />
              <rect x="4" y="22" width="88" height="26" rx="10" ry="10" fill="#D47608" />
              <rect x="4" y="38" width="88" height="10" fill="#D47608" />
              <rect x="26" y="10" width="8" height="22" rx="4" fill="#E8850A" />
              <rect x="62" y="10" width="8" height="22" rx="4" fill="#E8850A" />
              <circle cx="28" cy="57" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="48" cy="57" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="68" cy="57" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="28" cy="72" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="48" cy="72" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="68" cy="72" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="28" cy="87" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="48" cy="87" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="68" cy="87" r="3" fill="#FFF" opacity="0.9" />
            </svg>
            <span className="font-display text-xl font-semibold" style={{ color: '#E8850A' }}>
              Shiftera
            </span>
          </Link>

          {sentToEmail ? (
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[color:var(--success-soft)] mb-6">
                <svg className="w-7 h-7 text-[color:var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 12l5 5L20 6" />
                </svg>
              </div>
              <h1 className="font-display text-4xl font-semibold text-[color:var(--primary)] leading-tight">
                Verifica o teu email.
              </h1>
              <p className="mt-4 text-[color:var(--text-secondary)]">
                Enviámos um link de confirmação para <strong className="text-[color:var(--primary)]">{email}</strong>. Abre-o para começar a configurar a tua empresa.
              </p>
              <p className="mt-6 text-sm text-[color:var(--text-muted)]">
                Não recebeste nada? Verifica a pasta de spam ou{" "}
                <button
                  type="button"
                  onClick={() => setSentToEmail(false)}
                  className="text-[color:var(--accent)] hover:underline"
                >
                  tenta outro email
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-[color:var(--primary)] leading-[1.1]">
                Começa o teu<br />
                <span className="italic text-[color:var(--accent)]">trial de 14 dias.</span>
              </h1>
              <p className="mt-4 text-[color:var(--text-secondary)]">
                Sem cartão de crédito. Cancela quando quiseres.
              </p>

              <form onSubmit={handleRegister} className="mt-8 space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5">
                    O teu nome
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Ana Rodrigues"
                    className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5">
                    Nome da empresa
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder="Farmácia Central"
                    className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5">
                    Email de trabalho
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ana@farmacia.pt"
                    className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    placeholder={tPwd("placeholder", { min: MIN_PASSWORD_LENGTH })}
                    className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-[color:var(--accent)] text-white font-semibold hover:bg-[color:var(--accent-hover)] active:scale-[0.99] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "A criar conta..." : "Iniciar trial de 14 dias"}
                </button>

                <p className="text-center text-xs text-[color:var(--text-muted)]">
                  Ao criar a conta aceitas os nossos{" "}
                  <a href="#" className="underline hover:text-[color:var(--primary)]">
                    Termos
                  </a>{" "}
                  e{" "}
                  <a href="#" className="underline hover:text-[color:var(--primary)]">
                    Privacidade
                  </a>
                  .
                </p>
              </form>

              <p className="mt-8 text-sm text-center text-[color:var(--text-secondary)]">
                Já tens conta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[color:var(--primary)] hover:text-[color:var(--accent)] transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>

        {/* MOBILE — social proof (visible only below lg) */}
        <div className="lg:hidden mt-10 rounded-2xl bg-[color:var(--surface-sunken)] border border-[color:var(--border)] px-6 py-8 mx-auto max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--accent)] mb-2 text-center">
            +200 equipas em Portugal
          </p>
          <h3 className="font-display text-xl font-semibold text-[color:var(--primary)] leading-tight text-center mb-6">
            Clínicas e farmácias que{" "}
            <span className="italic text-[color:var(--accent)]">fecharam o Excel.</span>
          </h3>

          {/* Logos compact row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {fakeLogos.map((l) => (
              <div key={l.name} className="flex flex-col items-center text-center">
                <div className="mb-1">
                  <FakeBrandLogo brand={l.brand} size={40} />
                </div>
                <p className="font-display text-[10px] font-semibold text-[color:var(--primary)] leading-tight">
                  {l.name}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="bg-[color:var(--surface)] rounded-xl p-4 shadow-sm border border-[color:var(--border-light)]">
            <div className="flex gap-0.5 mb-2">
              {[0, 1, 2, 3, 4].map((s) => (
                <svg
                  key={s}
                  className="w-3.5 h-3.5 text-[color:var(--accent)]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-[color:var(--primary)] leading-snug">
              &ldquo;Fiz o setup em 12 minutos. Na mesma semana tinha a escala do mês seguinte publicada.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://randomuser.me/api/portraits/women/28.jpg"
                alt="Joana Ferreira"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-xs text-[color:var(--primary)]">
                  Joana Ferreira
                </p>
                <p className="text-[10px] text-[color:var(--text-muted)]">
                  Diretora Geral · LusoMed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — social proof (desktop only) */}
      <div className="hidden lg:flex w-1/2 bg-[color:var(--surface-sunken)] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12 w-full">
          <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--accent)] mb-3">
            +200 equipas em Portugal
          </p>
          <h2 className="font-display text-3xl xl:text-4xl font-semibold text-[color:var(--primary)] leading-tight max-w-md">
            Clínicas e farmácias que<br />
            <span className="italic text-[color:var(--accent)]">fecharam o Excel.</span>
          </h2>

          <div className="mt-10 grid grid-cols-3 gap-x-4 gap-y-6 max-w-lg">
            {fakeLogos.map((l) => (
              <div key={l.name} className="flex flex-col items-center text-center">
                <div className="mb-2">
                  <FakeBrandLogo brand={l.brand} size={48} />
                </div>
                <p className="font-display text-xs font-semibold text-[color:var(--primary)] leading-tight">
                  {l.name}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[color:var(--surface)] rounded-2xl p-6 shadow-md border border-[color:var(--border-light)] max-w-lg">
            <div className="flex gap-0.5 mb-3">
              {[0, 1, 2, 3, 4].map((s) => (
                <svg
                  key={s}
                  className="w-4 h-4 text-[color:var(--accent)]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
                </svg>
              ))}
            </div>
            <p className="font-display text-[color:var(--primary)] text-base leading-snug">
              &ldquo;Fiz o setup em 12 minutos. Na mesma semana tinha a escala do mês seguinte publicada e a equipa a consultar no telemóvel. Não volto atrás.&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://randomuser.me/api/portraits/women/28.jpg"
                alt="Joana Ferreira"
                className="w-11 h-11 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-sm text-[color:var(--primary)]">
                  Joana Ferreira
                </p>
                <p className="text-xs text-[color:var(--text-muted)]">
                  Diretora Geral · LusoMed, Coimbra
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
