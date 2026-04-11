type Testimonial = {
  quote: string;
  name: string;
  role: string;
  org: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Gastava sábados inteiros a fechar escalas no Excel. Hoje faço tudo num café de domingo de manhã. A equipa também adora ver o horário no telemóvel.",
    name: "Ana Rodrigues",
    role: "Farmacêutica Adjunta",
    org: "Farmácia Aurora, Porto",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    quote:
      "Antes havia sempre alguém a reclamar que tinha sempre os piores turnos. Os indicadores de equidade calaram essa discussão — agora está preto no branco.",
    name: "Miguel Santos",
    role: "Diretor Clínico",
    org: "Clínica Vida+, Lisboa",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "O gerador automático poupa-me umas 8 horas por mês. Mas o que mudou mesmo a vida foi a equipa parar de me ligar ao domingo à noite a perguntar o horário.",
    name: "Sofia Lopes",
    role: "Administradora",
    org: "Dental Porto",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[color:var(--accent)] mb-4">
            Quem já usa
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[color:var(--primary)] leading-tight">
            Feito para quem passa<br />
            <span className="italic text-[color:var(--accent)]">domingos a fechar escalas.</span>
          </h2>
          <p className="mt-4 text-lg text-[color:var(--text-secondary)] max-w-2xl mx-auto">
            Farmacêuticos, diretores clínicos e administradores que deixaram o Excel para trás.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5 mb-5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <svg
                    key={s}
                    className="w-4 h-4 text-[color:var(--accent)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
                  </svg>
                ))}
              </div>

              <p className="font-display text-lg text-[color:var(--primary)] leading-snug flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 pt-6 border-t border-[color:var(--border-light)] flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm text-[color:var(--primary)]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {t.role} · {t.org}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
