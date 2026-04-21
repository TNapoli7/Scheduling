import type { Metadata } from "next";
import { IndustryPage } from "@/components/lp/IndustryPage";

export const metadata: Metadata = {
  title: "Shiftera para Farmácias — Software de Escalas",
  description:
    "Gestão de escalas para farmácias em Portugal. Serviços permanentes, turnos noturnos, rotação de piquete — tudo conforme a legislação.",
  openGraph: {
    title: "Shiftera para Farmácias",
    description: "Software de escalas para farmácias portuguesas. Conforme Portaria n.º 14/2016.",
    url: "https://shiftera.app/industrias/farmacias",
  },
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
