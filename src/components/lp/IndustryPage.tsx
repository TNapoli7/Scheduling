"use client";

/**
 * Reusable industry/sector landing page.
 * Each industry (farmácias, clínicas, restauração, hotéis) renders this
 * component with its own data props. Copy comes from i18n messages.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Quote } from "lucide-react";

const ORANGE_PRIMARY = "#E8850A";
const ORANGE_GRADIENT = "#f5a623";
const WARM_CREAM = "#F7F5F0";

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

  const features = Array.from({ length: data.featureCount }, (_, i) => i + 1);
  const useCases = Array.from({ length: data.useCaseCount }, (_, i) => i + 1);
  const faqs = Array.from({ length: data.faqCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="pt-32 pb-20 px-6"
        style={{
          background: `linear-gradient(135deg, ${WARM_CREAM}, rgba(232, 133, 10, 0.03))`,
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{
              backgroundColor: "rgba(232, 133, 10, 0.08)",
              color: ORANGE_PRIMARY,
            }}
          >
            <span className="text-sm">{data.emoji}</span>
            {t("eyebrow")}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
            {t("heroHeading")}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            {t("heroSubheading")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{
                backgroundColor: ORANGE_PRIMARY,
                boxShadow: `0 10px 25px rgba(232, 133, 10, 0.2)`,
              }}
            >
              {tCommon("ctaPrimary")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#use-cases"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-medium text-stone-700 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              style={{ border: `1px solid rgba(232, 133, 10, 0.15)` }}
            >
              {tCommon("ctaSecondary")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {t("painsHeading")}
            </h2>
            <p className="mt-3 text-stone-600 max-w-2xl mx-auto">
              {t("painsSubheading")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-stone-50 border border-stone-100"
              >
                <div className="text-2xl mb-2">{t(`pain${i}Icon`)}</div>
                <h3 className="font-semibold text-stone-900 mb-1.5">
                  {t(`pain${i}Title`)}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {t(`pain${i}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section
        id="use-cases"
        className="py-20 px-6"
        style={{ backgroundColor: WARM_CREAM }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {t("useCasesHeading")}
            </h2>
            <p className="mt-3 text-stone-600 max-w-2xl mx-auto">
              {t("useCasesSubheading")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {useCases.map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-white border border-stone-100 shadow-sm"
              >
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 text-white font-bold text-sm"
                  style={{ backgroundColor: ORANGE_PRIMARY }}
                >
                  {i}
                </div>
                <h3 className="font-semibold text-stone-900 text-lg mb-2">
                  {t(`useCase${i}Title`)}
                </h3>
                <p className="text-stone-600 leading-relaxed mb-4">
                  {t(`useCase${i}Body`)}
                </p>
                <ul className="space-y-2">
                  {[1, 2, 3].map((j) => {
                    const key = `useCase${i}Bullet${j}`;
                    const text = t.raw(key) as string | undefined;
                    if (!text) return null;
                    return (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-stone-700"
                      >
                        <Check
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          style={{ color: ORANGE_PRIMARY }}
                        />
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

      {/* Features specific to industry */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {t("featuresHeading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((i) => (
              <div key={i} className="text-left">
                <div className="text-2xl mb-2">{t(`feature${i}Icon`)}</div>
                <h3 className="font-semibold text-stone-900 mb-1.5">
                  {t(`feature${i}Title`)}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {t(`feature${i}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: WARM_CREAM }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <Quote
            className="w-10 h-10 mx-auto mb-4"
            style={{ color: ORANGE_PRIMARY, opacity: 0.4 }}
          />
          <blockquote className="text-xl sm:text-2xl text-stone-800 leading-relaxed font-medium">
            &ldquo;{t("testimonialQuote")}&rdquo;
          </blockquote>
          <div className="mt-6 text-sm text-stone-600">
            <p className="font-semibold text-stone-900">
              {t("testimonialAuthor")}
            </p>
            <p>{t("testimonialRole")}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {tCommon("faqHeading")}
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((i) => (
              <details
                key={i}
                className="group rounded-xl border border-stone-200 p-5 open:bg-stone-50 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer font-medium text-stone-900">
                  {t(`faq${i}Question`)}
                  <span
                    className="text-stone-400 group-open:rotate-180 transition-transform"
                    style={{ display: "inline-block" }}
                  >
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                  {t(`faq${i}Answer`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-20 px-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${ORANGE_PRIMARY}, ${ORANGE_GRADIENT})`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("finalCtaHeading")}
          </h2>
          <p className="mt-4 text-lg opacity-90">
            {t("finalCtaSubheading")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 bg-white"
              style={{ color: ORANGE_PRIMARY }}
            >
              {tCommon("ctaPrimary")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-medium text-white rounded-xl border border-white/30 hover:bg-white/10 transition-all"
            >
              {tCommon("backToHome")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
