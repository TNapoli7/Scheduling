"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { ShifteraLogo } from "@/components/lp/ShifteraLogo";
import "../auth.css";

export default function LoginPage() {
  const t = useTranslations("auth");
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

    fetch("/api/log-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        entity_type: "auth",
        details: { email },
      }),
    }).catch(() => {});

    window.location.href = "/dashboard";
  }

  return (
    <div className="auth-page">
      <div className="min-h-screen flex">
        {/* LEFT — form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-20 xl:px-28 py-12">
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Link href="/" className="back-link mb-10">
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
              {t("backToSite")}
            </Link>

            <Link
              href="/"
              className="flex w-fit mb-12 items-center gap-2.5"
              aria-label="Shiftera home"
            >
              <ShifteraLogo size={36} />
              <span
                className="font-bold tracking-tight"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "26px",
                  color: "var(--ink)",
                }}
              >
                Shiftera
              </span>
            </Link>

            <h1
              className="heading"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}
            >
              {t("welcome")}
              <br />
              <em>{t("welcomeBack")}</em>
            </h1>
            <p
              className="mt-4"
              style={{ color: "var(--ink-soft)", fontSize: "15px" }}
            >
              {t("signInSubtitle")}
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              {error && <div className="error-box">{error}</div>}

              <div>
                <label className="field-label">{t("email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t("emailPlaceholder")}
                  className="field-input"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="field-label" style={{ marginBottom: 0 }}>
                    {t("password")}
                  </label>
                  <Link href="/forgot-password" className="forgot-link">
                    {t("forgotPassword")}
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t("passwordPlaceholder")}
                  className="field-input"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? t("signingIn") : t("signIn")}
              </button>
            </form>

            <p
              className="mt-8 text-sm text-center"
              style={{ color: "var(--ink-soft)" }}
            >
              {t("noAccount")}{" "}
              <Link href="/register" className="text-link">
                {t("startTrial")}
              </Link>
            </p>
          </div>

          {/* MOBILE — showcase (visible only below lg) */}
          <div className="lg:hidden mt-10 panel-mobile mx-auto max-w-md w-full">
            <ScheduleShowcaseCompact />
          </div>
        </div>

        {/* RIGHT — showcase (desktop only) */}
        <div className="hidden lg:flex w-1/2 panel-right">
          <div className="dot-texture" />
          <div className="glow glow-teal" />
          <div className="glow glow-warm" />

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
            <ScheduleShowcase />

            <div className="mt-12 max-w-md">
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--auth-accent)",
                  marginBottom: "12px",
                }}
              >
                Escalas sem stress
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  fontWeight: 400,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                Publica uma escala de
                <br />
                <em style={{ fontStyle: "italic", color: "var(--auth-accent)" }}>
                  um mês em 15 minutos.
                </em>
              </h2>
              <p
                style={{
                  marginTop: "16px",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                Respeita horários de trabalho, férias, folgas e disponibilidades
                — automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Showcase card (desktop) ---------- */
function ScheduleShowcase() {
  const days = ["S", "T", "Q", "Q", "S", "S", "D"];

  return (
    <div
      className="showcase-card"
      style={{ transform: "rotate(-1deg)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius)",
              background: "var(--auth-accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{ width: 18, height: 18, color: "var(--auth-accent-ink)" }}
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
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "14px",
                color: "var(--ink)",
              }}
            >
              Escala · Abril
            </p>
            <p style={{ fontSize: "11px", color: "var(--mute)" }}>
              Farmácia Aurora
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "999px",
            background: "oklch(0.94 0.04 160)",
            color: "oklch(0.40 0.10 160)",
          }}
        >
          PUBLICADA
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
        }}
      >
        {days.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: "9px",
              fontWeight: 600,
              color: "var(--mute)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              paddingBottom: "4px",
            }}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: 28 }).map((_, i) => {
          const isWeekend = i % 7 === 5 || i % 7 === 6;
          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 600,
                background: isWeekend
                  ? "var(--line-soft)"
                  : "var(--auth-accent-soft)",
                color: isWeekend ? "var(--mute)" : "var(--auth-accent-ink)",
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "20px",
          paddingTop: "20px",
          borderTop: "1px solid var(--line-soft)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              color: "var(--ink)",
            }}
          >
            4
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "var(--mute)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            pessoas
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              color: "var(--ink)",
            }}
          >
            0
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "var(--mute)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            conflitos
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              color: "oklch(0.40 0.10 160)",
            }}
          >
            100%
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "var(--mute)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            equidade
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Showcase card (mobile — compact) ---------- */
function ScheduleShowcaseCompact() {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        boxShadow: "0 12px 40px -8px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "var(--auth-accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{ width: 16, height: 16, color: "var(--auth-accent-ink)" }}
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
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "13px",
                color: "var(--ink)",
              }}
            >
              Escala · Abril
            </p>
            <p style={{ fontSize: "10px", color: "var(--mute)" }}>
              Farmácia Aurora
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: "9px",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: "999px",
            background: "oklch(0.94 0.04 160)",
            color: "oklch(0.40 0.10 160)",
          }}
        >
          PUBLICADA
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          textAlign: "center",
          paddingTop: "16px",
          borderTop: "1px solid var(--line-soft)",
        }}
      >
        <div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--ink)" }}>4</p>
          <p style={{ fontSize: "9px", color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>pessoas</p>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--ink)" }}>0</p>
          <p style={{ fontSize: "9px", color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>conflitos</p>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "oklch(0.40 0.10 160)" }}>100%</p>
          <p style={{ fontSize: "9px", color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>equidade</p>
        </div>
      </div>

      <p
        style={{
          marginTop: "16px",
          textAlign: "center",
          fontSize: "13px",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        Publica uma escala de um mês em 15 minutos.
      </p>
    </div>
  );
}
