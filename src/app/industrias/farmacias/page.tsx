import type { Metadata } from "next";
import { IndustryPage } from "@/components/lp/IndustryPage";

export const metadata: Metadata = {
  title: "Shiftera para Farmácias · Escalas, turnos e disponibilidades",
  description:
    "Software de gestão de escalas pensado para farmácias portuguesas. Cumpre o Código do Trabalho, gere folgas, trocas e horário de funcionamento.",
};

export default function FarmaciasPage() {
  return (
    <IndustryPage
      data={{
        key: "farmacias",
        emoji: "💊",
        featureCount: 6,
        useCaseCount: 4,
        faqCount: 5,
      }}
    />
  );
}
