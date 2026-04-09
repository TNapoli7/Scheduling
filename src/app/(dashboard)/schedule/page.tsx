import { Card, CardTitle } from "@/components/ui/card";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Horario</h1>
      </div>
      <Card>
        <CardTitle>Calendario de horarios</CardTitle>
        <p className="text-gray-500 mt-2">Em desenvolvimento - Fase 2</p>
      </Card>
    </div>
  );
}
