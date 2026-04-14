import type { Metadata } from "next";
import { IndustryPage } from "@/components/lp/IndustryPage";
import { LpNavbar } from "@/components/lp/LpNavbar";
import { LpFooter } from "@/components/lp/LpFooter";

export const metadata: Metadata = {
  title: "Shiftera para Clínicas · Gestão de turnos clínicos e enfermagem",
  description:
    "Escalas para clínicas e centros médicos: turnos rotativos, descanso entre serviços, controlo de carga semanal e conformidade com a legislação laboral portuguesa.",
};

export default function ClinicasPage() {
  return (
    <>
      <LpNavbar />
      <IndustryPage
        data={{
          key: "clinicas",
          emoji: "🩺",
          featureCount: 6,
          useCaseCount: 4,
          faqCount: 5,
        }}
      />
      <LpFooter />
    </>
  );
}
