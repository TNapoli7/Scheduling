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
import { ShifteraLogo } from "@/components/lp/ShifteraLogo";
import { PasswordStrength } from "@/components/ui/password-strength";
import "../auth.css";

const SOCIAL_PROOF_BRANDS = [
  "Farmácia Aurora",
  "Clínica Vida+",
  "Dental Porto",
  "LusoMed",
  "Fisio Expert",
  "Farmácia Central",
];

export default function RegisterPage() {
  const router = useRouter();
  const tPwd = useTranslations("passwordPolicy");
  const t = useTranslations("auth.register");
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
              className="flex w-fit mb-10 items-center gap-2.5"
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

            {sentToEmail ? (
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    background: "oklch(0.94 0.04 160)",
                    marginBottom: "24px",
                  }}
                >
                  <svg
                    style={{
                      width: 28,
                      height: 28,
                      color: "oklch(0.40 0.10 160)",
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                </div>
                <h1
                  className="heading"
                  style={{ fontSize: "clamp(2rem, 5vw, 2.6rem)" }}
                >
                  {t("verifyEmail")}
                </h1>
                <p
                  className="mt-4"
                  style={{ color: "var(--ink-soft)", fontSize: "15px" }}
                >
                  {t("emailSent")}{" "}
                  <strong style={{ color: "var(--ink)" }}>{email}</strong>.{" "}
                  {t("openLink")}
                </p>
                <p
                  className="mt-6"
                  style={{ fontSize: "14px", color: "var(--mute)" }}
                >
                  {t("noEmail")}{" "}
                  <button
                    type="button"
                    onClick={() => setSentToEmail(false)}
                    className="text-link"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    {t("tryAnotherEmail")}
                  </button>
                  .
                </p>
              </div>
            ) : (
              <>
                <h1
                  className="heading"
                  style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}
                >
                  {t("startTrialLine1")}
                  <br />
                  <em>{t("startTrialLine2")}</em>
                </h1>
                <p
                  className="mt-4"
                  style={{ color: "var(--ink-soft)", fontSize: "15px" }}
                >
                  {t("noCard")}
                </p>

                <form onSubmit={handleRegister} className="mt-8 space-y-4">
                  {error && <div className="error-box">{error}</div>}

                  <div>
                    <label className="field-label">{t("fullName")}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder={t("fullNamePlaceholder")}
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label className="field-label">{t("companyName")}</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                      placeholder={t("companyNamePlaceholder")}
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label className="field-label">{t("workEmail")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={t("workEmailPlaceholder")}
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label className="field-label">{t("password")}</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      placeholder={tPwd("placeholder", {
                        min: MIN_PASSWORD_LENGTH,
                      })}
                      className="field-input"
                    />
                    <PasswordStrength
                      password={password}
                      labels={{
                        weak: t("strengthWeak"),
                        fair: t("strengthFair"),
                        strong: t("strengthStrong"),
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? t("creatingAccount") : t("createAccount")}
                  </button>

                  <p
                    className="text-center"
                    style={{
                      fontSize: "12px",
                      color: "var(--mute)",
                    }}
                  >
                    {t("agreeTerms")}{" "}
                    <a
                      href="/terms"
                      style={{ textDecoration: "underline" }}
                      className="text-link"
                    >
                      {t("terms")}
                    </a>{" "}
                    e{" "}
                    <a
                      href="/privacy"
                      style={{ textDecoration: "underline" }}
                      className="text-link"
                    >
                      {t("privacy")}
                    </a>
                    .
                  </p>
                </form>

                <p
                  className="mt-8 text-sm text-center"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {t("haveAccount")}{" "}
                  <Link href="/login" className="text-link">
                    {t("signIn")}
                  </Link>
                </p>
              </>
            )}
          </div>

          {/* MOBILE — social proof (visible only below lg) */}
          <div className="lg:hidden mt-10 panel-mobile mx-auto max-w-md w-full">
            <SocialProofCompact brands={SOCIAL_PROOF_BRANDS} />
          </div>
        </div>

        {/* RIGHT — social proof (desktop only) */}
        <div className="hidden lg:flex w-1/2 panel-right">
          <div className="dot-texture" />
          <div className="glow glow-teal" />
          <div className="glow glow-warm" />

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12 w-full">
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
              Prova social
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 400,
                color: "white",
                lineHeight: 1.2,
                maxWidth: "420px",
              }}
            >
              Equipas que já
              <br />
              <em style={{ fontStyle: "italic", color: "var(--auth-accent)" }}>
                fecharam o Excel.
              </em>
            </h2>

            {/* Logo pills */}
            <div
              style={{
                marginTop: "32px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                maxWidth: "420px",
              }}
            >
              {SOCIAL_PROOF_BRANDS.map((name) => (
                <span key={name} className="logo-pill">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--auth-accent)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  {name}
                </span>
              ))}
            </div>

            {/* Testimonial */}
            <div className="testimonial-card" style={{ marginTop: "40px" }}>
              <div className="flex gap-1 mb-3">
                {[0, 1, 2, 3, 4].map((s) => (
                  <svg
                    key={s}
                    style={{ width: 14, height: 14, color: "var(--auth-accent)" }}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
                  </svg>
                ))}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.5,
                }}
              >
                &ldquo;Passámos de 4 horas a montar escalas para 15 minutos.
                Não voltamos ao Excel.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://randomuser.me/api/portraits/women/28.jpg"
                  alt="Ana Rodrigues"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid rgba(255,255,255,0.15)",
                  }}
                />
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    Ana Rodrigues
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    Diretora Técnica · Farmácia Aurora
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Social proof compact (mobile) ---------- */
function SocialProofCompact({ brands }: { brands: string[] }) {
  return (
    <>
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--auth-accent)",
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        Prova social
      </p>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "20px",
          color: "white",
          textAlign: "center",
          marginBottom: "20px",
          lineHeight: 1.3,
        }}
      >
        Equipas que já{" "}
        <em style={{ fontStyle: "italic", color: "var(--auth-accent)" }}>
          fecharam o Excel.
        </em>
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {brands.map((name) => (
          <span
            key={name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: "11px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--auth-accent)",
                display: "inline-block",
              }}
            />
            {name}
          </span>
        ))}
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <div className="flex gap-1 mb-2">
          {[0, 1, 2, 3, 4].map((s) => (
            <svg
              key={s}
              style={{ width: 12, height: 12, color: "var(--auth-accent)" }}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
            </svg>
          ))}
        </div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "13px",
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.5,
          }}
        >
          &ldquo;Passámos de 4 horas a montar escalas para 15 minutos.&rdquo;
        </p>
        <div className="flex items-center gap-2 mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://randomuser.me/api/portraits/women/28.jpg"
            alt="Ana Rodrigues"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1.5px solid rgba(255,255,255,0.15)",
            }}
          />
          <div>
            <p
              style={{
                fontWeight: 600,
                fontSize: "11px",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Ana Rodrigues
            </p>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>
              Diretora Técnica · Farmácia Aurora
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
