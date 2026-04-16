"use client";

/**
 * Reusable Navbar for marketing pages (LP + industry pages + legal).
 * Desktop: inline nav links + dropdown.
 * Mobile (< md): hamburger that opens a slide-down drawer with all links
 * including industries as an expanded group.
 */

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { LpLanguageSelector } from "./LpLanguageSelector";
import { ShifteraLockup } from "./ShifteraLogo";

/**
 * Shared class for desktop nav links: subtle colour transition on hover
 * PLUS an animated coral underline that sweeps in from the left. Uses
 * `::after` so we don't pollute the DOM with extra spans.
 */
const navLinkClass =
  "relative inline-flex items-center py-1 hover:text-stone-900 transition-colors " +
  "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full " +
  "after:origin-left after:scale-x-0 after:bg-[color:var(--accent)] " +
  "after:transition-transform after:duration-300 after:ease-out " +
  "hover:after:scale-x-100";

const INDUSTRIES = [
  { key: "farmacias", emoji: "💊", href: "/industrias/farmacias" },
  { key: "clinicas", emoji: "🩺", href: "/industrias/clinicas" },
  { key: "restauracao", emoji: "🍽️", href: "/industrias/restauracao" },
  { key: "hoteis", emoji: "🏨", href: "/industrias/hoteis" },
] as const;

export function LpNavbar() {
  const t = useTranslations("landing");
  const tInd = useTranslations("industries.nav");
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer whenever a link inside is clicked
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" onClick={closeMobile} aria-label="Shiftera home">
          <ShifteraLockup size={30} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-stone-600">
          <a href="/#features" className={navLinkClass}>
            {t("navbar.features")}
          </a>

          <div
            className="relative"
            onMouseEnter={() => setIndustriesOpen(true)}
            onMouseLeave={() => setIndustriesOpen(false)}
          >
            <button
              onClick={() => setIndustriesOpen((v) => !v)}
              className={`${navLinkClass} gap-1`}
            >
              {tInd("trigger")}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  industriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {industriesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                <div className="w-64 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden">
                  {INDUSTRIES.map((ind) => (
                    <Link
                      key={ind.key}
                      href={ind.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
                    >
                      <span className="text-xl">{ind.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {tInd(`${ind.key}.label`)}
                        </p>
                        <p className="text-xs text-stone-500">
                          {tInd(`${ind.key}.tagline`)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <a href="/#pricing" className={navLinkClass}>
            {t("navbar.pricing")}
          </a>
          <a href="/#faq" className={navLinkClass}>
            {t("navbar.faq")}
          </a>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1 sm:gap-2">
          <LpLanguageSelector />
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors px-2"
          >
            {t("navbar.signIn")}
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {t("navbar.startFree")}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t("navbar.closeMenu") : t("navbar.openMenu")}
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200/60 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
            <a
              href="/#features"
              onClick={closeMobile}
              className="block px-3 py-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              {t("navbar.features")}
            </a>

            {/* Industries inline list (no collapse, to save a tap) */}
            <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              {tInd("trigger")}
            </div>
            {INDUSTRIES.map((ind) => (
              <Link
                key={ind.key}
                href={ind.href}
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50"
              >
                <span className="text-lg">{ind.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {tInd(`${ind.key}.label`)}
                  </p>
                  <p className="text-xs text-stone-500">
                    {tInd(`${ind.key}.tagline`)}
                  </p>
                </div>
              </Link>
            ))}

            <a
              href="/#pricing"
              onClick={closeMobile}
              className="block px-3 py-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 mt-2"
            >
              {t("navbar.pricing")}
            </a>
            <a
              href="/#faq"
              onClick={closeMobile}
              className="block px-3 py-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              {t("navbar.faq")}
            </a>

            {/* Auth CTAs (also hidden on the top bar < sm) */}
            <div className="pt-3 mt-3 border-t border-stone-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={closeMobile}
                className="block w-full text-center px-4 py-3 rounded-lg text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                {t("navbar.signIn")}
              </Link>
              <Link
                href="/register"
                onClick={closeMobile}
                className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-3 text-sm font-semibold text-white rounded-lg shadow-sm"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {t("navbar.startFree")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
