"use client";

import Link from "next/link";
import {
  Calendar,
  Users,
  BarChart3,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Star,
  Zap,
  RefreshCw,
  ChevronRight,
  Building2,
} from "lucide-react";

/* ───────── Navbar ───────── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-stone-900">
            Mapa de Horário
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-stone-600">
          <a href="#features" className="hover:text-stone-900 transition-colors">
            Funcionalidades
          </a>
          <a href="#pricing" className="hover:text-stone-900 transition-colors">
            Preços
          </a>
          <a href="#faq" className="hover:text-stone-900 transition-colors">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all hover:shadow-md"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Começar grátis
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-6">
          <Zap className="w-3 h-3" />
          14 dias grátis — sem cartão de crédito
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
          Horários simples, justos
          <br />
          <span style={{ color: "var(--primary)" }}>e legais</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
          A plataforma que simplifica a gestão de escalas para farmácias,
          clínicas e laboratórios. Cria horários em minutos, não em horas.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-xl shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Experimentar grátis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-medium text-stone-600 bg-white border border-stone-200 rounded-xl shadow-sm hover:border-stone-300 hover:shadow-md transition-all"
          >
            Ver funcionalidades
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-stone-500">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1.5">Feito para o mercado português</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-stone-300" />
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Conforme legislação laboral PT</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Screenshot / Visual ───────── */
function AppPreview() {
  return (
    <section className="px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-200/50 overflow-hidden">
          {/* Mock browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100 bg-stone-50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-stone-300" />
              <div className="w-3 h-3 rounded-full bg-stone-300" />
              <div className="w-3 h-3 rounded-full bg-stone-300" />
            </div>
            <div className="flex-1 mx-8">
              <div className="h-6 bg-stone-100 rounded-md max-w-md mx-auto" />
            </div>
          </div>
          {/* App mockup content */}
          <div className="p-8 bg-gradient-to-br from-stone-50 to-white">
            <div className="grid grid-cols-7 gap-2">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                (day) => (
                  <div key={day} className="text-center">
                    <p className="text-xs font-medium text-stone-500 mb-2">
                      {day}
                    </p>
                    <div className="space-y-1.5">
                      {[...Array(day === "Dom" ? 1 : 3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-8 rounded-md text-xs flex items-center justify-center font-medium"
                          style={{
                            backgroundColor:
                              i === 0
                                ? "#EEF2FF"
                                : i === 1
                                ? "#CCFBF1"
                                : "#FEF3C7",
                            color:
                              i === 0
                                ? "#4F46E5"
                                : i === 1
                                ? "#0D9488"
                                : "#D97706",
                          }}
                        >
                          {i === 0
                            ? "09-17h"
                            : i === 1
                            ? "14-22h"
                            : "08-14h"}
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Features ───────── */
const features = [
  {
    icon: Calendar,
    title: "Escalas automáticas",
    desc: "Cria horários semanais com templates reutilizáveis. Ajusta turnos com drag-and-drop.",
    color: "#4F46E5",
    bg: "#EEF2FF",
  },
  {
    icon: Users,
    title: "Gestão de equipa",
    desc: "Perfis de colaboradores, funções, disponibilidades e pedidos de troca — tudo num sítio.",
    color: "#0D9488",
    bg: "#CCFBF1",
  },
  {
    icon: RefreshCw,
    title: "Trocas e folgas",
    desc: "Os colaboradores pedem trocas e folgas diretamente na app. Tu aprovas com um clique.",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    icon: BarChart3,
    title: "Fairness analytics",
    desc: "Distribuição justa de turnos, fins-de-semana e feriados. Dashboards visuais para acompanhar.",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  {
    icon: Shield,
    title: "Conforme a lei",
    desc: "Validações automáticas para o Código do Trabalho português: descansos, limites, feriados.",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    icon: Clock,
    title: "Exportar tudo",
    desc: "Exporta escalas em PDF e Excel para afixar ou enviar. Relatórios prontos para a ACT.",
    color: "#0891B2",
    bg: "#ECFEFF",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--primary)" }}>
            Funcionalidades
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            Tudo o que precisas para gerir horários
          </h2>
          <p className="mt-4 text-stone-500 max-w-xl mx-auto">
            Desenhado para farmácias, clínicas e laboratórios em Portugal.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl border border-stone-100 hover:border-stone-200 bg-white hover:shadow-lg hover:shadow-stone-100 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: f.bg }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                {f.desc}
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
  const steps = [
    {
      num: "1",
      title: "Regista-te",
      desc: "Cria a tua conta em 30 segundos. Sem cartão de crédito.",
    },
    {
      num: "2",
      title: "Configura a equipa",
      desc: "Adiciona os teus colaboradores e define os turnos habituais.",
    },
    {
      num: "3",
      title: "Publica a escala",
      desc: "Gera o horário, ajusta e publica. A equipa é notificada.",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent)" }}>
            Como funciona
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            Pronto em 3 passos
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-4"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {s.num}
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-stone-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Pricing ───────── */
function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--primary)" }}>
            Preços
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            Simples e transparente
          </h2>
          <p className="mt-4 text-stone-500">
            Um plano. Sem surpresas. Paga apenas pelo que usas.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl border-2 border-indigo-600 bg-white shadow-xl shadow-indigo-100 overflow-hidden">
            {/* Badge */}
            <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white rounded-bl-lg" style={{ backgroundColor: "var(--primary)" }}>
              Mais popular
            </div>

            <div className="p-8">
              <h3 className="text-lg font-semibold text-stone-900">Profissional</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-stone-900">€19</span>
                <span className="text-stone-500">/mês</span>
              </div>
              <p className="mt-2 text-sm text-stone-500">
                + €2 por utilizador/mês
              </p>

              <Link
                href="/register"
                className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Começar trial de 14 dias
                <ArrowRight className="w-4 h-4" />
              </Link>

              <ul className="mt-8 space-y-3">
                {[
                  "Escalas ilimitadas",
                  "Gestão de equipa completa",
                  "Trocas e pedidos de folga",
                  "Fairness analytics",
                  "Exportação PDF e Excel",
                  "Validação legal automática",
                  "Suporte por email e chat",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-stone-700">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-stone-400">
            Exemplo: equipa de 10 pessoas = €19 + (10 × €2) = €39/mês
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
function FAQ() {
  const faqs = [
    {
      q: "Posso experimentar sem compromisso?",
      a: "Sim! O trial dura 14 dias e não precisa de cartão de crédito. Cancelas quando quiseres.",
    },
    {
      q: "Funciona para farmácias e clínicas?",
      a: "Sim, o Mapa de Horário foi desenhado especificamente para farmácias, clínicas, laboratórios e consultórios em Portugal.",
    },
    {
      q: "Está conforme o Código do Trabalho?",
      a: "Sim. Validamos automaticamente os períodos de descanso, limites de horas semanais e feriados obrigatórios.",
    },
    {
      q: "Posso exportar as escalas?",
      a: "Sim, podes exportar em PDF para afixar na loja ou em Excel para arquivo e relatórios.",
    },
    {
      q: "Quanto custa para uma equipa de 5 pessoas?",
      a: "€19 base + (5 × €2) = €29/mês. O trial de 14 dias é completamente gratuito.",
    },
  ];

  return (
    <section id="faq" className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--primary)" }}>
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            Perguntas frequentes
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="p-5 rounded-xl border border-stone-200 bg-white"
            >
              <h3 className="font-semibold text-stone-900">{faq.q}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA Final ───────── */
function FinalCTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="rounded-2xl p-10 sm:p-14"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Começa a gerir horários hoje
          </h2>
          <p className="mt-4 text-indigo-200 text-lg max-w-lg mx-auto">
            14 dias grátis. Sem cartão. Sem compromisso. Configura em 2 minutos.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-white shadow-lg shadow-indigo-900/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ color: "var(--primary)" }}
          >
            Criar conta grátis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────── Footer ───────── */
function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-stone-200">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Calendar className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-stone-700">
            Mapa de Horário
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-stone-400">
          <span>© {new Date().getFullYear()} Mapa de Horário</span>
          <a href="#" className="hover:text-stone-600 transition-colors">
            Termos
          </a>
          <a href="#" className="hover:text-stone-600 transition-colors">
            Privacidade
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ───────── Main ───────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Hero />
      <AppPreview />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
