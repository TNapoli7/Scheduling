"use client";

/**
 * Reusable industry/sector landing page — v2 design.
 * Uses oklch colors, Instrument Serif, teal accent — aligned with LP v2.
 * Each industry (farmácias, clínicas, restauração, hotéis) renders this
 * component with its own data props. Copy comes from i18n messages.
 */

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LpLanguageSelector } from "./LpLanguageSelector";
import "../landing/landing.css";

export interface IndustryData {
  /** i18n namespace key under "industries.<key>" */
  key: "farmacias" | "clinicas" | "restauracao" | "hoteis";
  /** Hero emoji / icon */
  emoji: string;
  /** Number of feature cards rendered (matches i18n keys feature1..N) */
  featureCount: number;
  /** Number of use-case cards rendered */
  useCaseCount: number;
  /** Number of FAQ items rendered */
  faqCount: number;
}

export function IndustryPage({ data }: { data: IndustryData }) {
  const t = useTranslations(`industries.${data.key}`);
  const tCommon = useTranslations("industries.common");
  const tFooter = useTranslations("landing.footer");
  const [mobileOpen, setMobileOpen] = useState(false);

  const features = Array.from({ length: data.featureCount }, (_, i) => i + 1);
  const useCases = Array.from({ length: data.useCaseCount }, (_, i) => i + 1);
  const faqs = Array.from({ length: data.faqCount }, (_, i) => i + 1);

  return (
    <div className="lp">
      {/* Nav */}
      <nav className="top">
        <div className="wrap row">
          <Link href="/" className="brand">
            <span className="brand-mark"><i /></span>
            Shiftera
          </Link>
          <div className="nav-links">
            <Link href="/#features">Funcionalidades</Link>
            <div className="nav-dropdown">
              <Link href="/#industries">Indústrias</Link>
              <div className="nav-dropdown-menu">
                <Link href="/industrias/farmacias">💊 Farmácias</Link>
                <Link href="/industrias/clinicas">🏥 Clínicas</Link>
                <Link href="/industrias/restauracao">🍽️ Restauração</Link>
                <Link href="/industrias/hoteis">🏨 Hotelaria</Link>
              </div>
            </div>
            <Link href="/#pricing">Preços</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <div className="nav-cta">
            <LpLanguageSelector />
            <Link href="/login" className="btn btn-ghost">Entrar</Link>
            <Link href="/register" className="btn btn-primary">
              Começar grátis <span style={{ opacity: 0.7, marginLeft: 4 }}>→</span>
            </Link>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </nav>
      {/* Mobile nav */}
      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
        <div className="mobile-nav-header">
          <Link href="/" className="brand">
            <span className="brand-mark"><i /></span>
            Shiftera
          </Link>
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="mobile-nav-body">
          <a href="#features" onClick={() => setMobileOpen(false)}>Funcionalidades</a>
          <a href="#industries" onClick={() => setMobileOpen(false)}>Indústrias</a>
          <Link href="/industrias/farmacias" className="sub-link" onClick={() => setMobileOpen(false)}>💊 Farmácias</Link>
          <Link href="/industrias/clinicas" className="sub-link" onClick={() => setMobileOpen(false)}>🏥 Clínicas</Link>
          <Link href="/industrias/restauracao" className="sub-link" onClick={() => setMobileOpen(false)}>🍽️ Restauração</Link>
          <Link href="/industrias/hoteis" className="sub-link" onClick={() => setMobileOpen(false)}>🏨 Hotelaria</Link>
          <a href="#pricing" onClick={() => setMobileOpen(false)}>Preços</a>
          <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
        </div>
        <div className="mobile-nav-footer">
          <Link href="/login" className="btn btn-ghost" style={{textAlign:'center'}}>Entrar</Link>
          <Link href="/register" className="btn btn-primary" style={{textAlign:'center'}}>Começar grátis →</Link>
        </div>
      </div>

      {/* Hero */}
      <header style={{ padding: "140px 0 80px", background: "var(--paper-2)" }}>
        <div className="wrap" style={{ textAlign: "center", maxWidth: 800 }}>
          <span className="kicker" style={{ justifyContent: "center", display: "inline-flex", gap: 8 }}>
            <span>{data.emoji}</span>
            {t("eyebrow")}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: 16,
            }}
          >
            {t("heroHeading")}
          </h1>
          <p className="lede" style={{ maxWidth: 640, margin: "20px auto 0" }}>
            {t("heroSubheading")}
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary btn-big">
              {tCommon("ctaPrimary")} <span style={{ opacity: 0.7 }}>→</span>
            </Link>
            <a href="#use-cases" className="btn btn-outline btn-big">
              {tCommon("ctaSecondary")}
            </a>
          </div>
        </div>
      </header>

      {/* Pain points */}
      <section style={{ padding: "80px 0" }}>
        <div className="wrap">
          <div className="section-head">
            <h2 className="section-title">{t("painsHeading")}</h2>
            <p className="section-lede">{t("painsSubheading")}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  padding: 28,
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--line)",
                  background: "var(--white)",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 10 }}>{t(`pain${i}Icon`)}</div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 6 }}>
                  {t(`pain${i}Title`)}
                </h3>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {t(`pain${i}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" style={{ padding: "80px 0", background: "var(--paper-2)" }}>
        <div className="wrap">
          <div className="section-head">
            <h2 className="section-title">{t("useCasesHeading")}</h2>
            <p className="section-lede">{t("useCasesSubheading")}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {useCases.map((i) => (
              <div
                key={i}
                style={{
                  padding: 28,
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--line)",
                  background: "var(--white)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "var(--ink)",
                    color: "var(--paper)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 14,
                  }}
                >
                  {i}
                </div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 8 }}>
                  {t(`useCase${i}Title`)}
                </h3>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 14 }}>
                  {t(`useCase${i}Body`)}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1, 2, 3].map((j) => {
                    const key = `useCase${i}Bullet${j}`;
                    let text: string | undefined;
                    try { text = t(key); } catch { text = undefined; }
                    if (!text || text === key) return null;
                    return (
                      <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--ink)" }}>
                        <span style={{ color: "var(--lp-accent-ink)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 0" }}>
        <div className="wrap">
          <div className="section-head">
            <h2 className="section-title">{t("featuresHeading")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28 }}>
            {features.map((i) => (
              <div key={i}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{t(`feature${i}Icon`)}</div>
                <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 18, marginBottom: 6 }}>
                  {t(`feature${i}Title`)}
                </h4>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {t(`feature${i}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="quote-section" style={{ padding: "80px 0", background: "var(--paper-2)" }}>
        <div className="wrap" style={{ maxWidth: 720, textAlign: "center" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 16px", opacity: 0.3 }}>
            <path d="M10 8H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2.5L7 19h3l1.5-4H10V8zm8 0h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2.5L15 19h3l1.5-4H18V8z" fill="currentColor" />
          </svg>
          <blockquote
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
              lineHeight: 1.4,
              fontStyle: "italic",
              color: "var(--ink)",
            }}
          >
            &ldquo;{t("testimonialQuote")}&rdquo;
          </blockquote>
          <div style={{ marginTop: 24 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
              {t("testimonialAuthor")}
            </p>
            <p style={{ fontSize: 13, color: "var(--mute)" }}>
              {t("testimonialRole")}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 0" }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div className="section-head">
            <h2 className="section-title">{tCommon("faqHeading")}</h2>
          </div>
          <div className="faq-list">
            {faqs.map((i) => (
              <details
                key={i}
                className="faq-item"
                style={{
                  borderBottom: "1px solid var(--line)",
                  padding: "20px 0",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: 15,
                    color: "var(--ink)",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {t(`faq${i}Question`)}
                  <span style={{ color: "var(--mute)", fontSize: 12, transition: "transform .2s" }}>▼</span>
                </summary>
                <p style={{ marginTop: 12, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {t(`faq${i}Answer`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="final-cta"
        style={{
          padding: "80px 32px",
          background: "var(--ink)",
          color: "var(--paper)",
          textAlign: "center",
          borderRadius: 0,
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.15,
            }}
          >
            {t("finalCtaHeading")}
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, color: "color-mix(in oklch, var(--paper) 70%, transparent)" }}>
            {t("finalCtaSubheading")}
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary btn-big" style={{ background: "var(--lp-accent)", color: "var(--ink)" }}>
              {tCommon("ctaPrimary")} <span style={{ opacity: 0.7 }}>→</span>
            </Link>
            <Link href="/" className="btn btn-outline btn-big" style={{ color: "var(--paper)", borderColor: "rgba(255,255,255,0.2)" }}>
              {tCommon("backToHome")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 0", borderTop: "1px solid var(--line)", textAlign: "center" }}>
        <div className="wrap">
          <Link href="/" className="brand" style={{ justifyContent: "center", marginBottom: 12 }}>
            <span className="brand-mark"><i /></span>
            Shiftera
          </Link>
          <p style={{ fontSize: 13, color: "var(--mute)" }}>
            © {new Date().getFullYear()} Shiftera · {tFooter("madeIn")}
          </p>
        </div>
      </footer>
    </div>
  );
}
