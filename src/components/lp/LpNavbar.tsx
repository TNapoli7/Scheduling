"use client";

/**
 * Reusable Navbar for marketing pages (LP + industry pages + legal).
 * Includes "Indústrias" dropdown linking to /industrias/<sector>.
 */

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { LpLanguageSelector } from "./LpLanguageSelector";

const ORANGE_PRIMARY = "#E8850A";
const ORANGE_GRADIENT = "#f5a623";

const INDUSTRIES = [
  { key: "farmacias", emoji: "💊", href: "/industrias/farmacias" },
  { key: "clinicas", emoji: "🩺", href: "/industrias/clinicas" },
  { key: "restauracao", emoji: "🍽️", href: "/industrias/restauracao" },
  { key: "hoteis", emoji: "🏨", href: "/industrias/hoteis" },
] as const;

export function LpNavbar() {
  const t = useTranslations("landing");
  const tInd = useTranslations("industries.nav");
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br"
            style={{
              backgroundImage: `linear-gradient(135deg, ${ORANGE_PRIMARY}, ${ORANGE_GRADIENT})`,
            }}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-stone-900">Shiftera</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-stone-600">
          <a href="/#features" className="hover:text-stone-900 transition-colors">
            {t("navbar.features")}
          </a>

          {/* Industries dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 hover:text-stone-900 transition-colors"
            >
              {tInd("trigger")}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {open && (
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

          <a href="/#pricing" className="hover:text-stone-900 transition-colors">
            {t("navbar.pricing")}
          </a>
          <a href="/#faq" className="hover:text-stone-900 transition-colors">
            {t("navbar.faq")}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <LpLanguageSelector />
          <Link
            href="/login"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors px-2"
          >
            {t("navbar.signIn")}
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: ORANGE_PRIMARY }}
          >
            {t("navbar.startFree")}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
