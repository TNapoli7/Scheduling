import { Card, CardTitle } from "@/components/ui/card";

export default function ShiftsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
      </div>
      <Card>
        <CardTitle>Templates de turnos</CardTitle>
        <p className="text-gray-500 mt-2">Em desenvolvimento - Fase 1</p>
      </Card>
    </div>
  );
}
