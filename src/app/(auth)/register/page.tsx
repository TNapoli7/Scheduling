"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type FakeLogo = { name: string; tagline: string };

const fakeLogos: FakeLogo[] = [
  { name: "FarmÃ¡cia Aurora", tagline: "Desde 1978" },
  { name: "ClÃ­nica Vida+", tagline: "Medicina integrada" },
  { name: "Dental Porto", tagline: "Ortodontia" },
  { name: "LusoMed", tagline: "LaboratÃ³rio" },
  { name: "Fisio Expert", tagline: "ReabilitaÃ§Ã£o" },
  { name: "FarmÃ¡cia Central", tagline: "Bairro Alto" },
];

export default function RegisterPage() {
  const router = useRouter();
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

    if (password.length < 8) {
      setError("A password tem de ter pelo menos 8 caracteres.");
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

    setSentToEmail(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-[color:var(--background)]">
      {/* LEFT â form */}
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

          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--primary)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[color:var(--accent)]">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-[color:var(--primary)]">
              Mapa de HorÃ¡rio
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
                EnviÃ¡mos um link de confirmaÃ§Ã£o para <strong className="text-[color:var(--primary)]">{email}</strong>. Abre-o para comeÃ§ar a configurar a tua empresa.
              </p>
              <p className="mt-6 text-sm text-[color:var(--text-muted)]">
                NÃ£o recebeste nada? Verifica a pasta de spam ou{" "}
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
                ComeÃ§a o teu<br />
                <span className="italic text-[color:var(--accent)]">trial de 14 dias.</span>
              </h1>
              <p className="mt-4 text-[color:var(--text-secondary)]">
                Sem cartÃ£o de crÃ©dito. Cancela quando quiseres.
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
                    placeholder="FarmÃ¡cia Central"
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
                    minLength={8}
                    placeholder="MÃ­nimo 8 caracteres"
                    className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--primary-hover)] active:scale-[0.99] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
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
                JÃ¡ tens conta?{" "}
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

        {/* MOBILE â social proof (visible only below lg) */}
        <div className="lg:hidden mt-10 rounded-2xl bg-[color:var(--surface-sunken)] border border-[color:var(--border)] px-6 py-8 mx-auto max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--accent)] mb-2 text-center">
            +200 equipas em Portugal
          </p>
          <h3 className="font-display text-xl font-semibold text-[color:var(--primary)] leading-tight text-center mb-6">
            ClÃ­nicas e farmÃ¡cias que{" "}
            <span className="italic text-[color:var(--accent)]">fecharam o Excel.</span>
          </h3>

          {/* Logos compact row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {fakeLogos.map((l) => (
              <div key={l.name} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center mb-1 shadow-sm">
                  <span className="font-display text-sm font-bold text-[color:var(--primary)]">
                    {l.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
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
              &ldquo;Fiz o setup em 12 minutos. Na mesma semana tinha a escala do mÃªs seguinte publicada.&rdquo;
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
                  Diretora Geral Â· LusoMed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT â social proof (desktop only) */}
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
            ClÃ­nicas e farmÃ¡cias que<br />
            <span className="italic text-[color:var(--accent)]">fecharam o Excel.</span>
          </h2>

          <div className="mt-10 grid grid-cols-3 gap-x-4 gap-y-8 max-w-lg">
            {fakeLogos.map((l) => (
              <div key={l.name} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center mb-2 shadow-sm">
                  <span className="font-display text-lg font-bold text-[color:var(--primary)]">
                    {l.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <p className="font-display text-xs font-semibold text-[color:var(--primary)] leading-tight">
                  {l.name}
                </p>
                <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">
                  {l.tagline}
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
              &ldquo;Fiz o setup em 12 minutos. Na mesma semana tinha a escala do mÃªs seguinte publicada e a equipa a consultar no telemÃ³vel. NÃ£o volto atrÃ¡s.&rdquo;
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
                  Diretora Geral Â· LusoMed, Coimbra
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
