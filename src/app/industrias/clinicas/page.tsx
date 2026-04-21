import type { Metadata } from "next";
import { IndustryPage } from "@/components/lp/IndustryPage";

export const metadata: Metadata = {
  title: "Shiftera para Clínicas — Gestão de Turnos Clínicos",
  description:
    "Escalas para clínicas e centros médicos em Portugal. Turnos rotativos, descanso entre serviços, controlo de carga semanal — conforme legislação laboral.",
  openGraph: {
    title: "Shiftera para Clínicas",
    description: "Software de escalas para clínicas portuguesas. Turnos rotativos, enfermagem e conformidade laboral.",
    url: "https://shiftera.app/industrias/clinicas",
  },
};

export default function ClinicasPage() {
  return (
    <IndustryPage
      data={{
        key: "clinicas",
        emoji: "🩺",
        featureCount: 6,
        useCaseCount: 4,
        faqCount: 5,
      }}
    />
  );
}
