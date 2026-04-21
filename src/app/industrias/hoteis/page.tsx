import type { Metadata } from "next";
import { IndustryPage } from "@/components/lp/IndustryPage";

export const metadata: Metadata = {
  title: "Shiftera para Hotéis — Receção 24/7, Housekeeping e F&B",
  description:
    "Gestão de escalas para hotéis em Portugal. Turnos noturnos, rotação 24/7, equipas de housekeeping, F&B e receção — conforme legislação laboral.",
  openGraph: {
    title: "Shiftera para Hotéis",
    description: "Software de escalas para hotelaria portuguesa. Receção 24/7, housekeeping e F&B com conformidade laboral.",
    url: "https://shiftera.app/industrias/hoteis",
  },
};

export default function HoteisPage() {
  return (
    <IndustryPage
      data={{
        key: "hoteis",
        emoji: "🏨",
        featureCount: 6,
        useCaseCount: 4,
        faqCount: 5,
      }}
    />
  );
}
