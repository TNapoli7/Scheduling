"use client";

import { useState, useEffect, useCallback, Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LpLanguageSelector } from "@/components/lp/LpLanguageSelector";
import "./landing.css";

/* ═══════════════════════ DATA ═══════════════════════ */

const SHIFT_LABELS: Record<string, string> = {
  morning: "09–17", after: "14–22", night: "22–06", off: "—", swap: "TROCA?",
};
const SHIFT_CLASSES: Record<string, string> = {
  morning: "c-morning", after: "c-after", night: "c-night", off: "c-off", swap: "c-swap",
};

const INITIAL_ROWS = [
  { name: "Ana Sousa", role: "Farmacêutica", avatar: "AS", color: "oklch(0.92 0.05 175)", shifts: ["morning","after","morning","off","after","morning","off"] },
  { name: "Miguel F.", role: "Médico", avatar: "MF", color: "oklch(0.92 0.05 35)", shifts: ["after","morning","off","after","morning","off","morning"] },
  { name: "Joana Pires", role: "Chef", avatar: "JP", color: "oklch(0.92 0.05 295)", shifts: ["morning","off","after","morning","after","night","off"] },
  { name: "Ricardo S.", role: "Recepção", avatar: "RS", color: "oklch(0.92 0.05 145)", shifts: ["off","after","night","swap","morning","after","morning"] },
  { name: "Inês Costa", role: "Farmacêutica", avatar: "IC", color: "oklch(0.92 0.05 85)", shifts: ["night","morning","morning","after","off","morning","after"] },
];

const LOGOS = [
  { name: "Farmácia Central", glyph: "pharmacy" },
  { name: "Clínica São Rafael", glyph: "clinic" },
  { name: "Taberna do Largo", glyph: "restaurant" },
  { name: "Hotel Palácio", glyph: "hotel" },
  { name: "Lab Ribamar", glyph: "lab" },
  { name: "Farmácia do Rossio", glyph: "pharmacy" },
];

const LOGO_SVGS: Record<string, ReactNode> = {
  pharmacy: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  clinic: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  restaurant: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 3v14M8 3v6a3 3 0 01-3 3M15 3v14M13 3c0 4 0 6 2 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  hotel: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="6" width="14" height="11" stroke="currentColor" strokeWidth="1.6"/><path d="M3 10h14M7 10v7M13 10v7" stroke="currentColor" strokeWidth="1.4"/></svg>,
  lab: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M8 3v5l-4 8a2 2 0 002 3h8a2 2 0 002-3l-4-8V3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M7 3h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
};

type IndustryKey = "farmacia" | "clinica" | "restauracao" | "hotelaria" | "laboratorio";

const INDUSTRIES: Record<IndustryKey, { title: string; desc: string; facts: { l: string; t: string; d: string }[] }> = {
  farmacia: {
    title: "Farmácias",
    desc: "Gestão de farmacêuticos, técnicos e auxiliares. Serviços permanentes, turnos noturnos e escalas de piquete — tudo dentro da Portaria n.º 14/2016.",
    facts: [
      { l: "Piq.", t: "Serviço Permanente", d: "Rotação automática entre farmácias da mesma área." },
      { l: "SPMS", t: "Competências obrigatórias", d: "Garanta sempre um Diretor Técnico em turno." },
      { l: "24h", t: "Descansos cumpridos", d: "Validação automática de turno noturno + 11h descanso." },
    ],
  },
  clinica: {
    title: "Clínicas & Saúde",
    desc: "Médicos, enfermeiros e técnicos auxiliares — cada um com especialidades, contratos e regimes distintos. O Shiftera trata de todos.",
    facts: [
      { l: "∞", t: "Multi-especialidade", d: "Oftalmologia à terça, Cardiologia à quinta. Sem conflitos." },
      { l: "On", t: "Prevenção on-call", d: "Escalas de urgência separadas da escala regular." },
      { l: "ACT", t: "Relatórios prontos", d: "Exportar horas para contabilidade e Autoridade do Trabalho." },
    ],
  },
  restauracao: {
    title: "Restauração",
    desc: "Turnos quebrados, rotatividade alta, picos de fim-de-semana. Escalas que se adaptam à sazonalidade e ao banquete de sábado.",
    facts: [
      { l: "2×", t: "Turnos quebrados", d: "Almoço + jantar com 3h de intervalo, auto-registados." },
      { l: "€/h", t: "Custo em tempo real", d: "Veja o custo da escala a subir enquanto preenche." },
      { l: "iOS", t: "App para a equipa", d: "Cada colaborador vê o seu turno 24h antes. Zero WhatsApp." },
    ],
  },
  hotelaria: {
    title: "Hotelaria",
    desc: "Recepção, housekeeping, F&B, manutenção — departamentos diferentes, ocupação variável. Uma escala por departamento, visão global para a direção.",
    facts: [
      { l: "Occ", t: "Baseado em ocupação", d: "Importe ocupação do PMS. O Shiftera ajusta pessoal." },
      { l: "24/7", t: "Três turnos", d: "Manhã, tarde, noite. Rotações auto-niveladas." },
      { l: "Dept", t: "Multi-departamento", d: "Gerente vê tudo. Chefe de secção só a sua equipa." },
    ],
  },
  laboratorio: {
    title: "Laboratórios",
    desc: "Colheitas, análises, atendimento. Escalas que respeitam os horários de ponta da manhã e as equipas de serviço nocturno.",
    facts: [
      { l: "7–9h", t: "Picos de colheita", d: "Mais pessoal automaticamente no pico da manhã." },
      { l: "Qual.", t: "Qualificações rastreadas", d: "Só quem tem formação em pediatria faz pediatria." },
      { l: "ISO", t: "Auditoria", d: "Histórico completo das escalas para inspeção ISO 15189." },
    ],
  },
};

const INDUSTRY_VISUALS: Record<IndustryKey, { label: string; values: number[] }[]> = {
  farmacia: [
    { label: "Atendimento", values: [3,3,3,3,3,2,1] },
    { label: "Preparação", values: [2,2,2,2,2,2,1] },
    { label: "Noturno", values: [1,1,1,1,1,1,1] },
  ],
  clinica: [
    { label: "Médicos", values: [4,5,4,6,5,3,1] },
    { label: "Enfermagem", values: [6,7,6,7,6,4,2] },
    { label: "Recepção", values: [2,2,2,2,2,1,0] },
  ],
  restauracao: [
    { label: "Sala", values: [4,4,4,5,7,9,8] },
    { label: "Cozinha", values: [3,3,3,4,5,6,5] },
    { label: "Bar", values: [2,2,2,3,4,5,4] },
  ],
  hotelaria: [
    { label: "Recepção", values: [3,3,3,3,4,4,4] },
    { label: "Housekeeping", values: [6,5,5,6,8,9,7] },
    { label: "F&B", values: [4,4,4,5,7,8,7] },
  ],
  laboratorio: [
    { label: "Colheitas", values: [5,5,5,5,5,3,1] },
    { label: "Análises", values: [4,4,4,4,4,2,0] },
    { label: "Noturno", values: [1,1,1,1,1,1,1] },
  ],
};

const FAQS = [
  { q: "Posso experimentar sem compromisso?", a: "Sim. Tem 14 dias grátis, sem cartão de crédito, com acesso a todas as funcionalidades. No fim do período, escolhe se quer continuar — ou não." },
  { q: "Funciona para farmácias, clínicas, restaurantes e hotéis?", a: "Sim — e laboratórios, ginásios, centros de estética, postos de combustível. Qualquer equipa com turnos rotativos. Temos templates prontos para cada indústria." },
  { q: "Está conforme o Código do Trabalho português?", a: "Sim. Validação automática de descansos obrigatórios (Art. 214º), limites semanais (Art. 203º), feriados e folgas em domingos. Todos os relatórios estão prontos para a ACT." },
  { q: "Posso importar a minha escala atual de Excel?", a: "Sim. Aceite ficheiros .xlsx, .csv e templates próprios. A importação guia-se campo a campo e consegue migrar em menos de 10 minutos." },
  { q: "Quanto custa para uma equipa de 5 pessoas?", a: "€19/mês (base) + 5 × €2 = €29/mês para uma unidade. Se tiver mais que um estabelecimento, cada unidade extra custa +€9/mês. Sem limites de escalas, sem surpresas. Pode cancelar a qualquer altura." },
  { q: "Os meus colaboradores precisam de instalar alguma coisa?", a: "Não. O Shiftera funciona totalmente no browser — no computador ou no telemóvel. Basta abrir o link e entrar. Sem apps para instalar." },
];

/* ═══════════════════════ SUB-COMPONENTS ═══════════════════════ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`top ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap row">
        <Link href="/" className="brand">
          <span className="brand-mark"><i /></span>
          Shiftera
        </Link>
        <div className="nav-links">
          <a href="#features">Funcionalidades</a>
          <a href="#industries">Indústrias</a>
          <a href="#pricing">Preços</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-cta">
          <LpLanguageSelector />
          <Link href="/login" className="btn btn-ghost">Entrar</Link>
          <Link href="/register" className="btn btn-primary">
            Começar grátis <span style={{ opacity: 0.7, marginLeft: 4 }}>→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function ScheduleGrid() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [key, setKey] = useState(0);

  const regenerate = useCallback(() => {
    const pool = ["morning", "morning", "after", "after", "night", "off", "off", "swap"];
    setRows(prev =>
      prev.map(r => ({
        ...r,
        shifts: Array.from({ length: 7 }, () => pool[Math.floor(Math.random() * pool.length)]),
      }))
    );
    setKey(k => k + 1);
  }, []);

  return (
    <div className="product">
      <div className="product-bar">
        <div className="product-bar-left">
          <span className="dots"><span /><span /><span /></span>
          &nbsp;&nbsp;Semana 17 · 20–26 Abr
        </div>
        <div className="product-bar-right">
          <span className="live"><span className="pulse" />&nbsp;A gerar</span>
        </div>
      </div>
      <div className="product-head">
        <div>Pessoa</div>
        {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d => <div key={d}>{d}</div>)}
      </div>
      <div key={key}>
        {rows.map((p, pi) => (
          <div className="product-row" key={p.avatar}>
            <div className="who">
              <div className="avatar" style={{ background: p.color }}>{p.avatar}</div>
              <div>
                <div>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--mute)", fontWeight: 400 }}>{p.role}</div>
              </div>
            </div>
            {p.shifts.map((s, si) => (
              <div className="cell" key={si}>
                <div
                  className={`chip ${SHIFT_CLASSES[s]}`}
                  style={{ animationDelay: `${(pi * 7 + si) * 0.03}s` }}
                >
                  {SHIFT_LABELS[s]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="product-foot">
        <span>Cobertura <b style={{ color: "var(--ink)" }}>98%</b> · Horas <b style={{ color: "var(--ink)" }}>176/180</b></span>
        <button className="gen-btn" onClick={regenerate}>
          <span className="bolt">⚡</span> Gerar escala
        </button>
      </div>
    </div>
  );
}

function IndustryVisual({ industryKey }: { industryKey: IndustryKey }) {
  const data = INDUSTRY_VISUALS[industryKey];
  const days = ["S","T","Q","Q","S","S","D"];
  const max = Math.max(...data.flatMap(r => r.values));
  const title = INDUSTRIES[industryKey].title;

  return (
    <div className="ind-visual">
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mute)", letterSpacing: "0.08em", marginBottom: 14, textTransform: "uppercase" }}>
        Cobertura semanal · {title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "90px repeat(7, 1fr)", gap: 6, alignItems: "center" }}>
        <div />
        {days.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mute)" }}>{d}</div>
        ))}
        {data.map((r, ri) => (
          <Fragment key={ri}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{r.label}</div>
            {r.values.map((v, vi) => (
              <div key={vi} style={{ height: 52, background: "var(--paper-2)", borderRadius: 6, border: "1px solid var(--line-soft)", position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: `${(v / max) * 100}%`,
                  background: v === 0 ? "transparent" : "var(--lp-accent)",
                  opacity: v === 0 ? 0 : 0.18 + (v / max) * 0.6,
                  borderRadius: 5,
                }} />
                <div style={{
                  position: "absolute", inset: 0, display: "grid", placeItems: "center",
                  fontSize: 11, fontWeight: 600,
                  color: v === 0 ? "var(--mute)" : "var(--lp-accent-ink)",
                  fontFamily: "var(--font-mono)",
                }}>
                  {v}
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px dashed var(--line)", fontSize: 12, color: "var(--ink-soft)", display: "flex", justifyContent: "space-between" }}>
        <span>Total horas/semana: <b>{data.flatMap(r => r.values).reduce((a, b) => a + b, 0) * 8}h</b></span>
        <span style={{ color: "var(--lp-accent-ink)" }}>● Balanceado</span>
      </div>
    </div>
  );
}

function IndustryTabs() {
  const [active, setActive] = useState<IndustryKey>("farmacia");
  const ind = INDUSTRIES[active];

  const tabs: { key: IndustryKey; label: string; glyph: string }[] = [
    { key: "farmacia", label: "Farmácias", glyph: "⚕" },
    { key: "clinica", label: "Clínicas", glyph: "✚" },
    { key: "restauracao", label: "Restauração", glyph: "◈" },
    { key: "hotelaria", label: "Hotelaria", glyph: "◆" },
    { key: "laboratorio", label: "Laboratórios", glyph: "◉" },
  ];

  return (
    <>
      <div className="industries-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`ind-tab ${active === t.key ? "active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            <span className="glyph">{t.glyph}</span> {t.label}
          </button>
        ))}
      </div>
      <div className="ind-content">
        <div className="ind-copy">
          <h3>{ind.title}</h3>
          <p>{ind.desc}</p>
          <div className="ind-facts">
            {ind.facts.map((f, i) => (
              <div className="fact" key={i}>
                <div className="fi">{f.l}</div>
                <div>
                  <b>{f.t}</b>
                  <p>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <IndustryVisual industryKey={active} />
      </div>
    </>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list">
      {FAQS.map((f, i) => (
        <div className={`faq-item ${openIndex === i ? "open" : ""}`} key={i}>
          <div className="faq-q" onClick={() => setOpenIndex(openIndex === i ? -1 : i)}>
            {f.q}
            <div className="plus" />
          </div>
          <div className="faq-a">
            <div className="inner">{f.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PricingCalc() {
  const [teamSize, setTeamSize] = useState(10);
  const [units, setUnits] = useState(1);
  const extraUnits = Math.max(0, units - 1);
  const total = 19 + teamSize * 2 + extraUnits * 9;

  return (
    <div className="price-card">
      <span className="tag">Profissional</span>
      <div className="big">
        <span className="eur">€</span>19<span className="per">/mês</span>
      </div>
      <div className="per-user">+ €2 por colaborador/mês · + €9 por unidade extra</div>
      <hr />
      <div className="price-calc">
        <label>Equipa</label>
        <input
          type="range"
          min={3}
          max={50}
          value={teamSize}
          onChange={e => setTeamSize(Number(e.target.value))}
        />
        <span className="total">{teamSize}</span>
      </div>
      <div className="price-calc" style={{ marginTop: 10 }}>
        <label>Unidades</label>
        <input
          type="range"
          min={1}
          max={10}
          value={units}
          onChange={e => setUnits(Number(e.target.value))}
        />
        <span className="total">{units}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "color-mix(in oklch, var(--paper) 55%, transparent)", marginTop: 12, fontFamily: "var(--font-mono)" }}>
        <span>{teamSize} pessoa{teamSize > 1 ? "s" : ""} · {units} unidade{units > 1 ? "s" : ""}</span>
        <span className="price-total">€{total}/mês</span>
      </div>
      <div style={{ marginTop: 6, fontSize: "10.5px", color: "color-mix(in oklch, var(--paper) 45%, transparent)", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
        €19 base + {teamSize} × €2{extraUnits > 0 ? ` + ${extraUnits} × €9` : ""}
      </div>
      <Link href="/register" className="btn btn-primary">
        Começar trial de 14 dias &nbsp;→
      </Link>
      <div className="note">Sem cartão de crédito · Cancele quando quiser</div>
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function LandingPage() {
  return (
    <div className="lp">
      <Nav />

      {/* ═══ HERO ═══ */}
      <header className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">
                <span className="dot" />
                <b>Novidade</b> · Turnos assinados digitalmente
              </span>
              <h1 className="hero-title">
                Escalas impecáveis, feitas em <em>vinte segundos</em>.
              </h1>
              <p className="lede">
                O Shiftera faz a escala da sua equipa por si — respeitando preferências, competências e o Código do Trabalho português. Para farmácias, clínicas, restaurantes e hotéis.
              </p>
              <div className="hero-ctas">
                <Link href="/register" className="btn btn-primary btn-big">Experimentar 14 dias grátis</Link>
                <a href="https://calendly.com/shiftera/demo" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-big">Agendar demo</a>
              </div>
              <div className="hero-meta">
                <span><span className="check">✓</span>&nbsp;&nbsp;Sem cartão de crédito</span>
                <span><span className="check">✓</span>&nbsp;&nbsp;Setup em 10 minutos</span>
                <span><span className="check">✓</span>&nbsp;&nbsp;Dados alojados na UE</span>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <ScheduleGrid />
              <div className="float f1">
                <div className="ico" style={{ background: "var(--lp-accent-soft)", color: "var(--lp-accent-ink)", fontWeight: 700 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <b>Escala válida</b>
                  <div className="sub">0 conflitos legais</div>
                </div>
              </div>
              <div className="float f2">
                <div className="ico" style={{ background: "var(--coral-soft)", color: "oklch(0.4 0.12 35)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>PT</div>
                <div>
                  <b>4h poupadas</b>
                  <div className="sub">por semana, por gestor</div>
                </div>
              </div>
            </div>
          </div>

          {/* Logos band */}
          <div className="logos">
            <div className="logos-head">— De confiança em +500 equipas em Portugal —</div>
            <div className="logos-row">
              {LOGOS.map((l, i) => (
                <div className="logo" key={i}>
                  {LOGO_SVGS[l.glyph]}
                  <span>{l.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ═══ PROBLEM / STATS ═══ */}
      <section className="problem" id="why">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">Do caos para o controlo</span>
            <h2 className="section-title">Gerir escalas à mão é <em>um trabalho a tempo inteiro</em>. Não devia ser.</h2>
            <p className="section-lede">A média de um gestor português gasta 4 horas por semana em Excel, WhatsApp e post-its. O Shiftera devolve-lhe esse tempo — e evita conflitos.</p>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="num">4h <em>→</em> 20<em>s</em></div>
              <div className="label">Tempo para criar uma escala semanal completa</div>
            </div>
            <div className="stat">
              <div className="num"><em>97</em>%</div>
              <div className="label">Redução de conflitos e trocas de última hora</div>
            </div>
            <div className="stat">
              <div className="num"><em>500</em>+</div>
              <div className="label">Equipas ativas em farmácias, clínicas, restaurantes e hotéis</div>
            </div>
            <div className="stat">
              <div className="num"><em>100</em>%</div>
              <div className="label">Conforme o Código do Trabalho português</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INDUSTRIES ═══ */}
      <section id="industries">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">Indústrias</span>
            <h2 className="section-title">Pensado para o seu <em>tipo de equipa</em>.</h2>
            <p className="section-lede">Turnos rotativos, competências específicas, picos sazonais. Seja qual for o contexto, o Shiftera fala a sua linguagem.</p>
          </div>
          <IndustryTabs />
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" style={{ background: "var(--paper-2)" }}>
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">Funcionalidades</span>
            <h2 className="section-title">Tudo o que precisa para gerir <em>horários sem stress</em>.</h2>
          </div>

          <div className="features-grid">
            {/* Big feature: auto-scheduling */}
            <div className="feature span-8 tall">
              <div className="f-ico">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <h4>Escalas automáticas com <em style={{ fontStyle: "italic", color: "var(--lp-accent-ink)" }}>drag &amp; drop</em></h4>
              <p>Gere a escala semanal com um clique. Ajuste turnos individuais arrastando — as regras legais recalculam em tempo real.</p>
              <div className="drag-demo">
                <div className="dhead">Maria</div>
                <div className="dhead">Seg</div><div className="dhead">Ter</div><div className="dhead">Qua</div><div className="dhead">Qui</div><div className="dhead">Sex</div>
                <div className="dcell" style={{ color: "var(--mute)" }}>Manhã</div>
                <div className="dcell">09–17</div><div className="dcell dragging">14–22</div><div className="dcell">09–17</div><div className="dcell" style={{ color: "var(--mute)" }}>—</div><div className="dcell">09–17</div>
                <div className="dcell" style={{ color: "var(--mute)" }}>Tarde</div>
                <div className="dcell">14–22</div><div className="dcell" style={{ color: "var(--mute)" }}>—</div><div className="dcell">14–22</div><div className="dcell">14–22</div><div className="dcell" style={{ color: "var(--mute)" }}>—</div>
              </div>
            </div>

            {/* Fairness */}
            <div className="feature span-4 tall">
              <div className="f-ico">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M4 7l6-4 6 4M6 7l-2 6h4zM14 7l-2 6h4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h4>Distribuição <em style={{ fontStyle: "italic", color: "var(--lp-accent-ink)" }}>justa</em></h4>
              <p>Fins-de-semana, feriados e noites distribuídos com equidade.</p>
              <div className="fairness">
                {[{ name: "Ana", pct: 82 }, { name: "Miguel", pct: 78 }, { name: "Joana", pct: 80 }, { name: "Ricardo", pct: 85 }].map(f => (
                  <div className="fbar" key={f.name}>
                    <span className="name">{f.name}</span>
                    <div className="track"><div className="fill" style={{ width: `${f.pct}%` }} /></div>
                    <span className="val">{f.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="feature span-6">
              <div className="f-ico">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
              </div>
              <h4>Conforme o <em style={{ fontStyle: "italic", color: "var(--lp-accent-ink)" }}>Código do Trabalho</em></h4>
              <p>Descansos, limites semanais, feriados: validado automaticamente antes de publicar.</p>
              <div className="legal-demo">
                <div className="row ok"><span className="tick">✓</span> Descanso mín. 11h entre turnos <code>Art. 214º</code></div>
                <div className="row ok"><span className="tick">✓</span> Máx. 40h semanais + 2h extraord. <code>Art. 203º</code></div>
                <div className="row warn"><span className="tick">!</span> 2 domingos seguidos · sugerir troca <code>Art. 232º</code></div>
              </div>
            </div>

            {/* Mobile */}
            <div className="feature span-6">
              <div className="f-ico">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="10" cy="15" r="0.8" fill="currentColor"/></svg>
              </div>
              <h4>No bolso da sua <em style={{ fontStyle: "italic", color: "var(--lp-accent-ink)" }}>equipa</em></h4>
              <p>Colaboradores recebem turnos, pedem trocas e folgas no telemóvel. Chega de WhatsApp.</p>
              <div className="mobile-phone">
                <div className="screen">
                  <div style={{ fontSize: 11, color: "color-mix(in oklch, var(--paper) 50%, transparent)", marginBottom: 8, fontFamily: "var(--font-mono)", letterSpacing: ".08em" }}>QUI · 23 ABR</div>
                  <div className="notif">
                    <b>Troca aprovada</b>
                    <span>Ricardo trocou o turno de sábado consigo.</span>
                  </div>
                  <div className="notif" style={{ borderColor: "var(--amber)" }}>
                    <b>Próximo turno</b>
                    <span>Amanhã · 09:00 – 17:00 · Loja Chiado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Swaps */}
            <div className="feature span-4">
              <div className="f-ico">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 7h10l-3-3M16 13H6l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h4>Trocas e folgas</h4>
              <p>Pedidos aprovados com um clique. A escala recalcula sozinha.</p>
            </div>

            {/* Export */}
            <div className="feature span-4">
              <div className="f-ico">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h4>Exportar tudo</h4>
              <p>PDF para afixar. Excel para a contabilidade. Relatórios ACT prontos.</p>
            </div>

            {/* Analytics */}
            <div className="feature span-4">
              <div className="f-ico">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17l5-6 4 3 5-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h4>Custo &amp; horas</h4>
              <p>Veja custo de mão-de-obra em tempo real, por pessoa ou equipa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">Como funciona</span>
            <h2 className="section-title">Três passos. <em>Dez minutos.</em></h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h4>Adicione a equipa</h4>
              <p>Importe colaboradores (ou cole de um Excel). Defina funções, competências e preferências.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h4>Configure cobertura</h4>
              <p>Quantas pessoas por turno, restrições legais, feriados. Configurado uma vez, serve sempre.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h4>Gere &amp; aprove</h4>
              <p>Clique. Reveja. Publique. A equipa recebe tudo no telemóvel, com lembrete automático.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="quote-section">
        <div className="wrap">
          <div className="quote">
            <div>
              <span className="kicker">Testemunhos</span>
              <q>Passei de quatro horas de Excel ao domingo à noite para vinte minutos na segunda de manhã. A equipa agradece tanto como eu.</q>
              <div className="quote-meta">
                <div className="ava">AS</div>
                <div>
                  <b>Ana Sousa</b>
                  <span>Diretora Técnica · Farmácia Central do Chiado</span>
                </div>
              </div>
            </div>
            <div className="mini-quotes">
              <div className="mini-q">
                &ldquo;As trocas de turno deixaram de ser um pesadelo. Vejo tudo num sítio.&rdquo;
                <div className="mq-meta">
                  <div className="a">MF</div>
                  <div><b>Dr. Miguel Ferreira</b><br /><span>Diretor Clínico · Clínica São Rafael</span></div>
                </div>
              </div>
              <div className="mini-q">
                &ldquo;Com a rotatividade da restauração, é essencial. Tudo no telemóvel da equipa.&rdquo;
                <div className="mq-meta">
                  <div className="a">JP</div>
                  <div><b>Joana Pires</b><br /><span>Gerente · Taberna do Largo</span></div>
                </div>
              </div>
              <div className="mini-q">
                &ldquo;Recepção, housekeeping, F&amp;B — uma vista única para o hotel inteiro.&rdquo;
                <div className="mq-meta">
                  <div className="a">RS</div>
                  <div><b>Ricardo Santos</b><br /><span>Diretor de Operações · Hotel Palácio do Mar</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing">
        <div className="wrap">
          <div className="pricing-wrap">
            <div className="pricing-copy">
              <span className="kicker">Preços</span>
              <h2 className="section-title">Um plano. <em>Zero surpresas.</em></h2>
              <p className="section-lede">Paga apenas pelo que usa. Cancela quando quiser. Experimente 14 dias sem cartão.</p>
              <ul className="price-list">
                <li><span className="pi">✓</span> Escalas e colaboradores ilimitados</li>
                <li><span className="pi">✓</span> Trocas, folgas e pedidos de turno</li>
                <li><span className="pi">✓</span> Fairness analytics e relatórios ACT</li>
                <li><span className="pi">✓</span> Exportação PDF · Excel · Google Calendar</li>
                <li><span className="pi">✓</span> Validação legal (Código do Trabalho PT)</li>
                <li><span className="pi">✓</span> Suporte em português por email</li>
              </ul>
            </div>
            <PricingCalc />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" style={{ background: "var(--paper-2)" }}>
        <div className="wrap" style={{ maxWidth: 960 }}>
          <div className="section-head">
            <span className="kicker">FAQ</span>
            <h2 className="section-title">Perguntas <em>frequentes</em>.</h2>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <div className="wrap">
        <div className="final-cta">
          <h2>Devolva-se <em>quatro horas</em> por semana.</h2>
          <p>Junte-se a 500+ equipas portuguesas que fazem escalas melhores em menos tempo.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/register" className="btn btn-primary btn-big">Criar conta grátis</Link>
            <a href="mailto:ola@shiftera.app" className="btn btn-outline btn-big">Falar com vendas</a>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <Link href="/" className="brand">
                <span className="brand-mark"><i /></span> Shiftera
              </Link>
              <p>Software de escalas para equipas portuguesas. Feito com ☕ em Lisboa.</p>
            </div>
            <div>
              <h5>Produto</h5>
              <ul>
                <li><a href="#features">Funcionalidades</a></li>
                <li><a href="#pricing">Preços</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5>Indústrias</h5>
              <ul>
                <li><Link href="/industrias/farmacias">Farmácias</Link></li>
                <li><Link href="/industrias/clinicas">Clínicas</Link></li>
                <li><Link href="/industrias/restauracao">Restauração</Link></li>
                <li><Link href="/industrias/hoteis">Hotelaria</Link></li>
              </ul>
            </div>
            <div>
              <h5>Empresa</h5>
              <ul>
                <li><a href="#">Sobre</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h5>Legal</h5>
              <ul>
                <li><Link href="/terms">Termos</Link></li>
                <li><Link href="/privacy">Privacidade</Link></li>
                <li><Link href="/dpa">DPA</Link></li>
                <li><Link href="/cookies">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} Shiftera · Todos os direitos reservados</span>
            <div className="pills">
              <span className="pill">GDPR</span>
              <span className="pill">ISO 27001</span>
              <span className="pill">Dados na UE</span>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
