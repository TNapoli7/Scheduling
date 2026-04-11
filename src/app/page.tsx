import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Testimonials } from "@/components/lp/testimonials";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-cream-textured">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[color:var(--background)]/70 border-b border-[color:var(--border-light)]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[color:var(--primary)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[color:var(--accent)]">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-[color:var(--primary)]">Mapa de Horário</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[color:var(--text-secondary)]">
            <a href="#features" className="hover:text-[color:var(--primary)] transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-[color:var(--primary)] transition-colors">Como funciona</a>
            <a href="#precos" className="hover:text-[color:var(--primary)] transition-colors">Preços</a>
            <a href="#faq" className="hover:text-[color:var(--primary)] transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--primary)] transition-colors hidden sm:inline-block">
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold hover:bg-[color:var(--primary-hover)] transition-all shadow-sm hover:shadow-md"
            >
              Começar trial
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-20 w-[500px] h-[500px] rounded-full bg-[color:var(--accent)]/6 blur-3xl"></div>
          <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-[color:var(--primary)]/4 blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--accent-soft)] border border-[color:var(--accent)]/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[color:var(--accent)] animate-pulse"></span>
              <span className="text-xs font-semibold text-[color:var(--accent-active)] tracking-wide uppercase">
                Feito para clínicas e farmácias em Portugal
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-semibold text-[color:var(--primary)] leading-[1.05] tracking-tight">
              Horários justos.<br />
              <span className="italic text-[color:var(--accent)]">Sem dores de cabeça.</span>
            </h1>

            <p className="mt-8 text-xl md:text-2xl text-[color:var(--text-secondary)] leading-relaxed max-w-2xl">
              Gere escalas que respeitam o código do trabalho, férias, folgas e disponibilidades —
              em minutos, não horas. Todos vêem o seu horário no telemóvel.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--primary-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Começar trial de 14 dias
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white border border-[color:var(--border)] text-[color:var(--primary)] font-semibold hover:bg-[color:var(--surface-sunken)] transition-all"
              >
                Ver como funciona
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-[color:var(--text-muted)]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[color:var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[color:var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Setup em 10 minutos
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[color:var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Suporte em português
              </div>
            </div>
          </div>

          {/* Hero visual mockup */}
          <div className="mt-20 relative">
            <div className="absolute inset-x-0 -top-10 h-20 bg-gradient-to-b from-transparent to-[color:var(--background)]/50 pointer-events-none"></div>
            <div className="relative rounded-2xl border border-[color:var(--border)] bg-white shadow-2xl overflow-hidden">
              <div className="h-10 bg-[color:var(--surface-sunken)] border-b border-[color:var(--border)] flex items-center gap-2 px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                </div>
                <div className="flex-1 text-center text-xs text-[color:var(--text-muted)]">
                  app.mapadehorario.pt / schedule
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-[color:var(--surface-sunken)] via-white to-[color:var(--accent-soft)] flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-[color:var(--primary)]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="5" width="18" height="16" rx="2"/>
                    <path d="M3 9h18M8 3v4M16 3v4M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/>
                  </svg>
                  <p className="mt-4 text-sm text-[color:var(--text-muted)] font-medium">Screenshot da app em breve</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points strip */}
      <section className="border-y border-[color:var(--border)] bg-[color:var(--surface-sunken)]/40">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-6">
            Esqueça Excel, WhatsApp e telefonemas no domingo à noite
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-display font-semibold text-[color:var(--primary)]">8h → 15min</div>
              <p className="text-sm text-[color:var(--text-secondary)] mt-1">para fechar um mês de escalas</p>
            </div>
            <div>
              <div className="text-3xl font-display font-semibold text-[color:var(--primary)]">0 conflitos</div>
              <p className="text-sm text-[color:var(--text-secondary)] mt-1">com regras automáticas de descanso e férias</p>
            </div>
            <div>
              <div className="text-3xl font-display font-semibold text-[color:var(--primary)]">100% visível</div>
              <p className="text-sm text-[color:var(--text-secondary)] mt-1">a equipa consulta no telemóvel</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--accent)] mb-3">Funcionalidades</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[color:var(--primary)] leading-tight">
              Tudo o que precisa para escalar uma equipa.
            </h2>
            <p className="mt-5 text-lg text-[color:var(--text-secondary)]">
              Construído com gestores de farmácias e clínicas que já passaram pelo problema.
              Nada a mais, nada a menos.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Gerador automático de escalas",
                body: "Dá o período, as regras e os colaboradores — a app devolve um horário equilibrado que cumpre descansos legais, máximo de horas semanais e preferências.",
                icon: (
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                ),
              },
              {
                title: "Gestão de férias e ausências",
                body: "Pedidos submetidos pela equipa, aprovação com um clique, cálculo automático de dias disponíveis e integração direta no gerador de escalas.",
                icon: (
                  <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></>
                ),
              },
              {
                title: "Indicadores de equidade",
                body: "Veja quem está a fazer mais fins de semana, mais noites ou menos folgas. Decida com dados, não com sensações.",
                icon: (
                  <path d="M3 3v18h18M7 14l4-4 4 4 5-6" strokeLinecap="round" strokeLinejoin="round"/>
                ),
              },
              {
                title: "Swap de turnos entre colegas",
                body: "A equipa pede trocas diretamente pela app, o gestor aprova. Sem mensagens perdidas no grupo do WhatsApp.",
                icon: (
                  <path d="M7 16V4m0 0-3 3m3-3 3 3M17 8v12m0 0-3-3m3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                ),
              },
              {
                title: "Publicar e partilhar com um clique",
                body: "Exporte para PDF, Excel ou partilhe um link. Cada colaborador vê apenas o que é seu. Mobile-first.",
                icon: (
                  <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round"/>
                ),
              },
              {
                title: "Cumpre o código do trabalho PT",
                body: "Descanso diário, semanal, feriados nacionais, limites de horas extras. As regras que importam em Portugal estão incluídas.",
                icon: (
                  <><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></>
                ),
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-white border border-[color:var(--border)] hover:border-[color:var(--accent)]/40 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[color:var(--accent-soft)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold text-[color:var(--primary)] mb-2">{f.title}</h3>
                <p className="text-[color:var(--text-secondary)] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 md:py-32 bg-[color:var(--primary)] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[color:var(--accent)]/10 blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--accent)] mb-3">Como funciona</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
              Do caos à escala publicada<br />em 3 passos.
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Adiciona a equipa",
                body: "Importa por CSV ou cria manualmente. Define contratos, horas semanais, preferências e turnos disponíveis.",
              },
              {
                n: "02",
                title: "Define as regras",
                body: "Máximo/mínimo de horas, descansos obrigatórios, cobertura mínima por turno, quem pode substituir quem.",
              },
              {
                n: "03",
                title: "Gera e publica",
                body: "Um clique gera o horário. Revês, ajustas se quiseres, publicas. A equipa recebe automaticamente.",
              },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="font-display text-6xl font-semibold text-[color:var(--accent)]/60 mb-4">{s.n}</div>
                <h3 className="font-display text-2xl font-semibold mb-3">{s.title}</h3>
                <p className="text-white/70 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--accent)] mb-3">Preços</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[color:var(--primary)] leading-tight">
              Simples. Previsível.<br />Paga pelo que usa.
            </h2>
            <p className="mt-5 text-lg text-[color:var(--text-secondary)]">
              Um único plano. Sem escalões confusos. Cancela quando quiseres.
            </p>
          </div>

          <div className="mt-16 max-w-xl mx-auto">
            <div className="relative rounded-3xl bg-white border-2 border-[color:var(--primary)] shadow-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-hover)]"></div>
              <div className="p-10 md:p-12">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--accent)]">Plano único</p>
                    <h3 className="font-display text-3xl font-semibold text-[color:var(--primary)] mt-2">Mapa de Horário</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-active)] text-xs font-semibold uppercase tracking-wide">
                    14 dias grátis
                  </span>
                </div>

                <div className="mt-8 pb-8 border-b border-[color:var(--border)]">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-6xl font-semibold text-[color:var(--primary)]">€19</span>
                    <span className="text-[color:var(--text-secondary)]">base / mês</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 text-[color:var(--text-secondary)]">
                    <span className="font-display text-2xl font-semibold text-[color:var(--primary)]">+€2</span>
                    <span>por utilizador ativo / mês</span>
                  </div>
                  <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                    Exemplo: equipa de 10 pessoas = €19 + €20 = <span className="font-semibold text-[color:var(--primary)]">€39 / mês</span>
                  </p>
                </div>

                <ul className="mt-8 space-y-3">
                  {[
                    "Gerador automático ilimitado",
                    "Gestão de férias e ausências",
                    "Swaps e pedidos de troca",
                    "Acesso mobile para toda a equipa",
                    "Exportação PDF / Excel",
                    "Indicadores de equidade",
                    "Suporte em português",
                    "Atualizações contínuas",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[color:var(--text-primary)]">
                      <svg className="w-5 h-5 text-[color:var(--success)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-10 w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--primary-hover)] transition-all shadow-lg hover:shadow-xl"
                >
                  Começar trial de 14 dias
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M13 5l7 7-7 7"/>
                  </svg>
                </Link>

                <p className="mt-4 text-center text-sm text-[color:var(--text-muted)]">
                  Sem cartão de crédito. Cancela quando quiseres.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32 bg-[color:var(--surface-sunken)]/40 border-y border-[color:var(--border)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--accent)] mb-3">FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[color:var(--primary)] leading-tight">
              Perguntas que toda a gente faz.
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Preciso de formação para usar?",
                a: "Não. O onboarding é guiado: adicionas a equipa, defines as regras, e geras. A maioria dos gestores está a gerar a primeira escala em menos de 30 minutos.",
              },
              {
                q: "E se eu tiver turnos muito específicos?",
                a: "A app suporta turnos personalizados, cobertura mínima por turno, regras de quem pode substituir quem, e preferências individuais. Se tiveres um caso raro, fala connosco — provavelmente já o vimos.",
              },
              {
                q: "Cumpre o código do trabalho português?",
                a: "Sim. Descanso diário (11h), semanal (24h+11h), feriados nacionais, máximo de 40h/semana. As regras legais essenciais estão incluídas por defeito.",
              },
              {
                q: "Os meus dados estão seguros?",
                a: "Dados alojados na UE, encriptados em trânsito e em repouso. Cada organização vê apenas os seus dados (row-level security). RGPD compliant.",
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim. Sem contratos, sem multas. Cancelas na área de definições, acesso termina no fim do ciclo pago.",
              },
              {
                q: "Funciona em farmácias e clínicas com múltiplas unidades?",
                a: "Sim. Podes ter várias unidades na mesma organização, cada uma com a sua equipa e escalas independentes.",
              },
            ].map((f, i) => (
              <details
                key={i}
                className="group p-6 rounded-2xl bg-white border border-[color:var(--border)] hover:border-[color:var(--border-strong)] transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="font-display text-lg font-semibold text-[color:var(--primary)] pr-4">{f.q}</h3>
                  <svg className="w-5 h-5 text-[color:var(--text-muted)] group-open:rotate-180 transition-transform shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </summary>
                <p className="mt-4 text-[color:var(--text-secondary)] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl bg-[color:var(--primary)] p-12 md:p-20 text-center text-white overflow-hidden">
            <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[color:var(--accent)]/15 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[color:var(--accent)]/10 blur-3xl"></div>
            <div className="relative">
              <h2 className="font-display text-4xl md:text-6xl font-semibold leading-tight">
                Domingo à noite<br />
                <span className="italic text-[color:var(--accent)]">já não é dia de escalas.</span>
              </h2>
              <p className="mt-6 text-xl text-white/70 max-w-xl mx-auto">
                14 dias grátis. Sem cartão. Configura a tua primeira escala hoje.
              </p>
              <Link
                href="/register"
                className="mt-10 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[color:var(--accent)] text-white font-semibold hover:bg-[color:var(--accent-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Começar trial
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[color:var(--border)] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[color:var(--primary)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[color:var(--accent)]">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-[color:var(--primary)]">Mapa de Horário</span>
          </div>
          <p className="text-sm text-[color:var(--text-muted)]">
            © 2026 Mapa de Horário. Feito em Portugal.
          </p>
          <div className="flex items-center gap-6 text-sm text-[color:var(--text-muted)]">
            <a href="#" className="hover:text-[color:var(--primary)] transition-colors">Termos</a>
            <a href="#" className="hover:text-[color:var(--primary)] transition-colors">Privacidade</a>
            <Link href="/login" className="hover:text-[color:var(--primary)] transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
