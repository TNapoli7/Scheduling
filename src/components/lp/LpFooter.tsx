"use client";

/**
 * Reusable footer for marketing pages.
 * Includes industry links + legal links + brand.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";

const ORANGE_PRIMARY = "#E8850A";
const ORANGE_GRADIENT = "#f5a623";

export function LpFooter() {
  const tInd = useTranslations("industries.nav");
  const tFooter = useTranslations("landing.footer");

  return (
    <footer className="border-t border-stone-200 bg-stone-50 px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(135deg, ${ORANGE_PRIMARY}, ${ORANGE_GRADIENT})`,
              }}
            >
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-stone-900">Shiftera</span>
          </Link>
          <p className="text-xs text-stone-500 leading-relaxed">
            {tFooter("tagline")}
          </p>
        </div>

        <div>
          <p className="font-semibold text-stone-900 mb-3">
            {tFooter("productHeading")}
          </p>
          <ul className="space-y-2 text-stone-600">
            <li>
              <Link href="/#features" className="hover:text-stone-900">
                {tFooter("featuresLink")}
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-stone-900">
                {tFooter("pricingLink")}
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-stone-900">
                {tFooter("faqLink")}
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-stone-900">
                {tFooter("freeTrialLink")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-stone-900 mb-3">
            {tFooter("industriesHeading")}
          </p>
          <ul className="space-y-2 text-stone-600">
            <li>
              <Link href="/industrias/farmacias" className="hover:text-stone-900">
                {tInd("farmacias.label")}
              </Link>
            </li>
            <li>
              <Link href="/industrias/clinicas" className="hover:text-stone-900">
                {tInd("clinicas.label")}
              </Link>
            </li>
            <li>
              <Link href="/industrias/restauracao" className="hover:text-stone-900">
                {tInd("restauracao.label")}
              </Link>
            </li>
            <li>
              <Link href="/industrias/hoteis" className="hover:text-stone-900">
                {tInd("hoteis.label")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-stone-900 mb-3">
            {tFooter("legalHeading")}
          </p>
          <ul className="space-y-2 text-stone-600">
            <li>
              <Link href="/terms" className="hover:text-stone-900">
                {tFooter("termsLink")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-stone-900">
                {tFooter("privacyLink")}
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-stone-900">
                {tFooter("cookiesLink")}
              </Link>
            </li>
            <li>
              <Link href="/dpa" className="hover:text-stone-900">
                {tFooter("dpaLink")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-stone-200 text-xs text-stone-500 flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} Shiftera. {tFooter("copyright")}</p>
        <p>{tFooter("madeIn")}</p>
      </div>
    </footer>
  );
}
