"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
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

          <Link href="/" className="flex items-center gap-2 mb-12">
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

          <h1 className="font-display text-4xl md:text-5xl font-semibold text-[color:var(--primary)] leading-[1.1]">
            Bem-vindo<br />
            <span className="italic text-[color:var(--accent)]">de volta.</span>
          </h1>
          <p className="mt-4 text-[color:var(--text-secondary)]">
            Entra para gerir as escalas da tua equipa.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nome@farmacia.pt"
                className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[color:var(--accent)] hover:underline font-medium"
                >
                  Esqueci-me
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="A tua password"
                className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--primary-hover)] active:scale-[0.99] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-sm text-center text-[color:var(--text-secondary)]">
            Ainda nÃ£o tens conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-[color:var(--primary)] hover:text-[color:var(--accent)] transition-colors"
            >
              ComeÃ§ar trial grÃ¡tis
            </Link>
          </p>
        </div>

        {/* MOBILE â schedule preview (visible only below lg) */}
        <div className="lg:hidden mt-10 rounded-2xl bg-[color:var(--primary)] px-6 py-8 mx-auto max-w-md">
          <div className="bg-[color:var(--surface)] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[color:var(--accent-soft)] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-[color:var(--accent)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 3v4M16 3v4" />
                  </svg>
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-[color:var(--primary)]">
                    Escala Â· Abril
                  </p>
                  <p className="text-[11px] text-[color:var(--text-muted)]">
                    FarmÃ¡cia Aurora
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[color:var(--success-soft)] text-[color:var(--success)]">
                PUBLICADA
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-[color:var(--border-light)]">
              <div>
                <p className="text-lg font-display font-semibold text-[color:var(--primary)]">4</p>
                <p className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">pessoas</p>
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-[color:var(--primary)]">0</p>
                <p className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">conflitos</p>
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-[color:var(--success)]">100%</p>
                <p className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">equidade</p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-white/60">
            Publica uma escala de um mÃªs em 15 minutos.
          </p>
        </div>
      </div>

      {/* RIGHT â schedule preview showcase (desktop only) */}
      <div className="hidden lg:flex w-1/2 bg-[color:var(--primary)] relative overflow-hidden">
        {/* Texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[color:var(--accent)] opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-white opacity-[0.03] blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          {/* Mock schedule card */}
          <div className="bg-[color:var(--surface)] rounded-2xl p-6 shadow-2xl max-w-sm transform -rotate-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[color:var(--accent-soft)] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-[color:var(--accent)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 3v4M16 3v4" />
                  </svg>
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-[color:var(--primary)]">
                    Escala Â· Abril
                  </p>
                  <p className="text-[11px] text-[color:var(--text-muted)]">
                    FarmÃ¡cia Aurora
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[color:var(--success-soft)] text-[color:var(--success)]">
                PUBLICADA
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[9px] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider pb-1"
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: 28 }).map((_, i) => {
                const isWeekend = i % 7 === 5 || i % 7 === 6;
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold"
                    style={{
                      background: isWeekend
                        ? "var(--surface-sunken)"
                        : "var(--accent-soft)",
                      color: isWeekend
                        ? "var(--text-muted)"
                        : "var(--accent)",
                    }}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-[color:var(--border-light)] grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-display font-semibold text-[color:var(--primary)]">
                  4
                </p>
                <p className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">
                  pessoas
                </p>
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-[color:var(--primary)]">
                  0
                </p>
                <p className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">
                  conflitos
                </p>
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-[color:var(--success)]">
                  100%
                </p>
                <p className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">
                  equidade
                </p>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="mt-12 max-w-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--accent)] mb-3">
              Junta-te a +200 equipas
            </p>
            <h2 className="font-display text-3xl xl:text-4xl font-semibold text-white leading-tight">
              Publica uma escala de<br />
              <span className="italic text-[color:var(--accent)]">um mÃªs em 15 minutos.</span>
            </h2>
            <p className="mt-4 text-white/60">
              Respeita horÃ¡rios de trabalho, fÃ©rias, folgas e disponibilidades â automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
