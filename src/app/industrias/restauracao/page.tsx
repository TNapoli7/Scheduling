import type { Metadata } from "next";
import { IndustryPage } from "@/components/lp/IndustryPage";
import { LpNavbar } from "@/components/lp/LpNavbar";
import { LpFooter } from "@/components/lp/LpFooter";

export const metadata: Metadata = {
  title: "Shiftera para Restauração · Turnos partidos, fins-de-semana, picos",
  description:
    "Software de escalas pensado para restaurantes e cafés: turnos partidos, picos de almoço e jantar, gestão de extras e conformidade com o IRC laboral.",
};

export default function RestauracaoPage() {
  return (
    <>
      <LpNavbar />
      <IndustryPage
        data={{
          key: "restauracao",
          emoji: "🍽️",
          featureCount: 6,
          useCaseCount: 4,
          faqCount: 5,
        }}
      />
      <LpFooter />
    </>
  );
}
