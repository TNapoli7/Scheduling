"use client";

/**
 * GDPR/RGPD cookie consent banner.
 *
 * - Shows only if no decision yet (cookie absent or version mismatch).
 * - Accept all / Reject all are equally prominent (GDPR requirement).
 * - "Customise" opens a modal with per-category toggles.
 * - Essential cookies are always on (disabled toggle, visually locked).
 * - Emits `shiftera:consent-changed` — integrations (Sentry, analytics)
 *   should subscribe and init only after consent.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  readConsent,
  writeConsent,
  ACCEPT_ALL_CONSENT,
  DEFAULT_CONSENT,
  type ConsentState,
} from "@/lib/cookie-consent";
import { X } from "lucide-react";

export function CookieBanner() {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [choices, setChoices] = useState<ConsentState>(DEFAULT_CONSENT);

  // On mount, check existing consent. Also listen for imperative opens
  // (e.g. from the footer "Manage cookies" link).
  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setChoices(existing);
    }
    const onOpen = () => {
      setChoices(readConsent() || DEFAULT_CONSENT);
      setVisible(true);
      setCustomising(true);
    };
    window.addEventListener("shiftera:consent-open", onOpen);
    return () => window.removeEventListener("shiftera:consent-open", onOpen);
  }, []);

  if (!visible) return null;

  function acceptAll() {
    writeConsent(ACCEPT_ALL_CONSENT);
    setVisible(false);
  }
  function rejectAll() {
    writeConsent(DEFAULT_CONSENT);
    setVisible(false);
  }
  function saveCustom() {
    writeConsent(choices);
    setVisible(false);
  }

  return (
    <>
      {/* Backdrop only when customising */}
      {customising && (
        <div
          className="fixed inset-0 bg-black/30 z-[60]"
          onClick={() => setCustomising(false)}
        />
      )}

      <div
        role="dialog"
        aria-label={t("title")}
        className={`fixed z-[70] left-1/2 -translate-x-1/2 bottom-4 w-[min(calc(100%-2rem),640px)] rounded-2xl bg-white shadow-[0_12px_40px_-4px_rgba(15,27,45,0.2)] border border-stone-200 ${
          customising ? "top-8 md:top-16 md:bottom-auto overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]" : ""
        }`}
      >
        {!customising ? (
          <div className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-1.5">
              {t("title")}
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              {t("body")}{" "}
              <Link
                href="/cookies"
                className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
              >
                {t("learnMore")}
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={rejectAll}
                className="order-2 sm:order-1 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition"
              >
                {t("rejectAll")}
              </button>
              <button
                onClick={() => setCustomising(true)}
                className="order-3 sm:order-2 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition"
              >
                {t("customise")}
              </button>
              <button
                onClick={acceptAll}
                className="order-1 sm:order-3 sm:ml-auto px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition shadow-sm hover:shadow"
                style={{ backgroundColor: "#E8850A" }}
              >
                {t("acceptAll")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-stone-100">
              <h2 className="text-base font-semibold text-stone-900">
                {t("customiseTitle")}
              </h2>
              <button
                onClick={() => setCustomising(false)}
                aria-label={t("close")}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <CategoryRow
                title={t("catEssentialTitle")}
                body={t("catEssentialBody")}
                checked
                disabled
                onChange={() => {}}
              />
              <CategoryRow
                title={t("catFunctionalTitle")}
                body={t("catFunctionalBody")}
                checked={choices.functional}
                onChange={(v) => setChoices({ ...choices, functional: v })}
              />
              <CategoryRow
                title={t("catAnalyticsTitle")}
                body={t("catAnalyticsBody")}
                checked={choices.analytics}
                onChange={(v) => setChoices({ ...choices, analytics: v })}
              />
              <CategoryRow
                title={t("catPerformanceTitle")}
                body={t("catPerformanceBody")}
                checked={choices.performance}
                onChange={(v) => setChoices({ ...choices, performance: v })}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 px-5 sm:px-6 py-4 border-t border-stone-100 bg-stone-50">
              <button
                onClick={rejectAll}
                className="order-3 sm:order-1 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition"
              >
                {t("rejectAll")}
              </button>
              <button
                onClick={saveCustom}
                className="order-2 sm:order-2 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition"
              >
                {t("saveChoices")}
              </button>
              <button
                onClick={acceptAll}
                className="order-1 sm:order-3 sm:ml-auto px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition shadow-sm hover:shadow"
                style={{ backgroundColor: "#E8850A" }}
              >
                {t("acceptAll")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function CategoryRow({
  title,
  body,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900">{title}</p>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{body}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? "bg-orange-500" : "bg-stone-300"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
