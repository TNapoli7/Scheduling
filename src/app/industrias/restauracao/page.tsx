import type { Metadata } from "next";
import { IndustryPage } from "@/components/lp/IndustryPage";

export const metadata: Metadata = {
  title: "Shiftera para Restauração — Turnos Partidos e Picos",
  description:
    "Software de escalas para restaurantes e cafés em Portugal. Turnos partidos, picos de almoço e jantar, gestão de extras — conforme Código do Trabalho.",
  openGraph: {
    title: "Shiftera para Restauração",
    description: "Software de escalas para restauração portuguesa. Turnos partidos, fins-de-semana e gestão de extras.",
    url: "https://shiftera.app/industrias/restauracao",
  },
};

export default function RestauracaoPage() {
  return (
    <IndustryPage
      data={{
        key: "restauracao",
        emoji: "🍽️",
        featureCount: 6,
        useCaseCount: 4,
        faqCount: 5,
      }}
    />
  );
}
