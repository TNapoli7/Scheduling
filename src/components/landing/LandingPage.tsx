"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChatWidget } from "@/components/chat/ChatWidget";
import {
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";

const ORANGE_PRIMARY = "#E8850A";
const ORANGE_GRADIENT = "#f5a623";
const WARM_CREAM = "#F7F5F0";

/* ───────── Navbar ───────── */
function Navbar() {
  const t = useTranslations("landing");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br"
            style={{ backgroundImage: `linear-gradient(135deg, ${ORANGE_PRIMARY}, ${ORANGE_GRADIENT})` }}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-stone-900">
            Shiftera
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-stone-600">
          <a href="#features" className="hover:text-stone-900 transition-colors">
            {t("navbar.features")}
          </a>
          <a href="#pricing" className="hover:text-stone-900 transition-colors">
            {t("navbar.pricing")}
          </a>
          <a href="#faq" className="hover:text-stone-900 transition-colors">
            {t("navbar.faq")}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
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

/* ───────── Hero ───────── */
function Hero() {
  const t = useTranslations("landing");

  return (
    <section className="pt-32 pb-20 px-6" style={{ background: `linear-gradient(135deg, ${WARM_CREAM}, rgba(232, 133, 10, 0.03))` }}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ backgroundColor: "rgba(232, 133, 10, 0.08)", color: ORANGE_PRIMARY }}>
          <span className="text-sm">⚡</span>
          {t("hero.badge")}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
          {t("hero.heading")}
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
          {t("hero.description")}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: ORANGE_PRIMARY, boxShadow: `0 10px 25px rgba(232, 133, 10, 0.2)` }}
          >
            {t("hero.tryFree")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-medium text-stone-700 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            style={{ border: `1px solid rgba(232, 133, 10, 0.15)` }}
          >
            {t("hero.viewDemo")}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-stone-600">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-lg">⭐</span>
            ))}
            <span className="ml-2">{t("hero.madForPortugal")}</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-stone-300" />
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🛡️</span>
            <span>{t("hero.compliantLaw")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Screenshot / Visual ───────── */
function AppPreview() {
  const t = useTranslations("landing");

  return (
    <section className="px-6 py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Screenshot */}
          <div className="relative rounded-2xl border overflow-hidden shadow-xl" style={{ borderColor: `rgba(232, 133, 10, 0.15)` }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-stone-50" style={{ borderColor: `rgba(232, 133, 10, 0.08)` }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-stone-300" />
                <div className="w-3 h-3 rounded-full bg-stone-300" />
                <div className="w-3 h-3 rounded-full bg-stone-300" />
              </div>
            </div>
            <div className="p-8" style={{ backgroundColor: WARM_CREAM }}>
              <div className="grid grid-cols-7 gap-2">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
                  <div key={day} className="text-center">
                    <p className="text-xs font-medium text-stone-500 mb-2">{day}</p>
                    <div className="space-y-1.5">
                      {[...Array(day === "Dom" ? 1 : 3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-8 rounded-md text-xs flex items-center justify-center font-medium"
                          style={{
                            backgroundColor: i === 0 ? `rgba(232, 133, 10, 0.1)` : i === 1 ? `rgba(76, 175, 80, 0.1)` : `rgba(33, 150, 243, 0.1)`,
                            color: i === 0 ? ORANGE_PRIMARY : i === 1 ? "#4CAF50" : "#2196F3",
                          }}
                        >
                          {i === 0 ? "09-17h" : i === 1 ? "14-22h" : "08-14h"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
              {t("appPreview.heading")}
            </h2>
            <p className="text-lg text-stone-600 mb-8">
              {t("appPreview.description")}
            </p>

            <ul className="space-y-4 mb-8">
              {[t("appPreview.bullet1"), t("appPreview.bullet2"), t("appPreview.bullet3")].map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-2xl mt-1">✓</span>
                  <span className="text-stone-700">{bullet}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: ORANGE_PRIMARY, boxShadow: `0 10px 25px rgba(232, 133, 10, 0.2)` }}
            >
              {t("appPreview.startNow")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Features ───────── */
function Features() {
  const t = useTranslations("landing");

  const features = [
    { emoji: "📅", key: "automaticSchedules" },
    { emoji: "👥", key: "teamManagement" },
    { emoji: "🔄", key: "swapsTimeOff" },
    { emoji: "📊", key: "fairnessAnalytics" },
    { emoji: "⚖️", key: "compliance" },
    { emoji: "📥", key: "export" },
  ];

  return (
    <section id="features" className="py-20 px-6" style={{ backgroundColor: WARM_CREAM }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: ORANGE_PRIMARY }}>
            {t("features.sectionTitle")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {t("features.heading")}
          </h2>
          <p className="mt-4 text-stone-600 max-w-xl mx-auto">
            {t("features.description")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.key}
              className="p-6 rounded-2xl bg-white transition-all duration-200"
              style={{
                border: `1px solid rgba(232, 133, 10, 0.08)`,
              }}
            >
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                {t(`features.${f.key}`)}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t(`features.${f.key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── How it works ───────── */
function HowItWorks() {
  const t = useTranslations("landing");

  const steps = [
    { num: "1", key: "step1" },
    { num: "2", key: "step2" },
    { num: "3", key: "step3" },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: ORANGE_PRIMARY }}>
            {t("howItWorks.sectionTitle")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {t("howItWorks.heading")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-4"
                style={{ backgroundColor: ORANGE_PRIMARY }}
              >
                {s.num}
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                {t(`howItWorks.${s.key}`)}
              </h3>
              <p className="text-sm text-stone-600">{t(`howItWorks.${s.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Testimonials ───────── */
function Testimonials() {
  const t = useTranslations("landing");

  const testimonials = [
    {
      id: 1,
      img: "https://i.pravatar.cc/150?img=32",
      quote: t("testimonials.t1Quote"),
      name: t("testimonials.t1Name"),
      role: t("testimonials.t1Role"),
      company: t("testimonials.t1Company"),
    },
    {
      id: 2,
      img: "https://i.pravatar.cc/150?img=11",
      quote: t("testimonials.t2Quote"),
      name: t("testimonials.t2Name"),
      role: t("testimonials.t2Role"),
      company: t("testimonials.t2Company"),
    },
    {
      id: 3,
      img: "https://i.pravatar.cc/150?img=23",
      quote: t("testimonials.t3Quote"),
      name: t("testimonials.t3Name"),
      role: t("testimonials.t3Role"),
      company: t("testimonials.t3Company"),
    },
    {
      id: 4,
      img: "https://i.pravatar.cc/150?img=14",
      quote: t("testimonials.t4Quote"),
      name: t("testimonials.t4Name"),
      role: t("testimonials.t4Role"),
      company: t("testimonials.t4Company"),
    },
  ];

  return (
    <section className="py-20 px-6" style={{ backgroundColor: WARM_CREAM }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: ORANGE_PRIMARY }}>
            {t("testimonials.sectionTitle")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {t("testimonials.heading")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testi) => (
            <div key={testi.id} className="p-6 rounded-2xl bg-white" style={{ border: `1px solid rgba(232, 133, 10, 0.08)` }}>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: ORANGE_PRIMARY }}>★</span>
                ))}
              </div>
              <p className="text-sm text-stone-700 mb-4 leading-relaxed">"{testi.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={testi.img} alt={testi.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-semibold text-stone-900">{testi.name}</p>
                  <p className="text-xs text-stone-500">{testi.role} • {testi.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Pricing ───────── */
function Pricing() {
  const t = useTranslations("landing");

  const features = [
    "unlimitedSchedules",
    "fullTeamManagement",
    "swapsRequests",
    "fairness",
    "exportPdfExcel",
    "legalValidation",
    "emailSupport",
  ];

  return (
    <section id="pricing" className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: ORANGE_PRIMARY }}>
            {t("pricing.sectionTitle")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {t("pricing.heading")}
          </h2>
          <p className="mt-4 text-stone-600">
            {t("pricing.description")}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl bg-white shadow-xl overflow-hidden" style={{ border: `2px solid ${ORANGE_PRIMARY}` }}>
            <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white rounded-bl-lg" style={{ backgroundColor: ORANGE_PRIMARY }}>
              ⭐ {t("pricing.professional")}
            </div>

            <div className="p-8">
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-stone-900">€19</span>
                <span className="text-stone-600">{t("pricing.perMonth")}</span>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                {t("pricing.perUser")}
              </p>

              <Link
                href="/register"
                className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                style={{ backgroundColor: ORANGE_PRIMARY, boxShadow: `0 10px 25px rgba(232, 133, 10, 0.2)` }}
              >
                {t("pricing.startTrial")}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <ul className="mt-8 space-y-3">
                {features.map((key) => (
                  <li key={key} className="flex items-center gap-3 text-sm text-stone-700">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: ORANGE_PRIMARY }} />
                    {t(`pricing.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-stone-500">
            {t("pricing.pricingExample")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6 rounded-2xl bg-white" style={{ border: `1px solid rgba(232, 133, 10, 0.08)` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-semibold text-stone-900">{q}</h3>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 transition-transform"
          style={{ color: ORANGE_PRIMARY, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <p className="mt-4 text-sm text-stone-600 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

function FAQ() {
  const t = useTranslations("landing");

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  return (
    <section id="faq" className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: ORANGE_PRIMARY }}>
            {t("faq.sectionTitle")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {t("faq.heading")}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA Final ───────── */
function FinalCTA() {
  const t = useTranslations("landing");

  return (
    <section className="py-20 px-6" style={{ backgroundColor: WARM_CREAM }}>
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="rounded-2xl p-10 sm:p-14"
          style={{ background: `linear-gradient(135deg, #2c2c2c, #1a1a1a)` }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t("finalCta.heading")}
          </h2>
          <p className="mt-4 text-gray-300 text-lg max-w-lg mx-auto">
            {t("finalCta.description")}
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ color: ORANGE_PRIMARY, boxShadow: `0 10px 25px rgba(0, 0, 0, 0.2)` }}
          >
            {t("finalCta.createAccount")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────── Footer ───────── */
function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="py-10 px-6" style={{ backgroundColor: WARM_CREAM, borderTop: `1px solid rgba(232, 133, 10, 0.08)` }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br"
                style={{ backgroundImage: `linear-gradient(135deg, ${ORANGE_PRIMARY}, ${ORANGE_GRADIENT})` }}
              >
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-semibold text-stone-900">Shiftera</span>
            </div>
            <p className="text-xs text-stone-600">Horários simples, justos e legais.</p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-3 text-sm">Produto</h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><a href="#features" className="hover:text-stone-900 transition-colors">Funcionalidades</a></li>
              <li><a href="#pricing" className="hover:text-stone-900 transition-colors">Preços</a></li>
              <li><a href="#faq" className="hover:text-stone-900 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><Link href="/terms" className="hover:text-stone-900 transition-colors">{t("footer.terms")}</Link></li>
              <li><Link href="/privacy" className="hover:text-stone-900 transition-colors">{t("footer.privacy")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t" style={{ borderColor: `rgba(232, 133, 10, 0.08)` }}>
          <p className="text-xs text-stone-500 text-center">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ───────── Main ───────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: WARM_CREAM }}>
      <Navbar />
      <Hero />
      <AppPreview />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
      <ChatWidget />
    </div>
  );
}
