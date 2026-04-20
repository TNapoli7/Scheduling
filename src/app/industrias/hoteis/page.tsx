import type { Metadata } from "next";
import { IndustryPage } from "@/components/lp/IndustryPage";

export const metadata: Metadata = {
  title: "Shiftera para Hotéis · Receção 24/7, housekeeping e F&B",
  description:
    "Gestão de escalas para hotéis: turnos noturnos, rotação 24/7, equipas de housekeeping, F&B e receção. Cumpre o Código do Trabalho português.",
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
