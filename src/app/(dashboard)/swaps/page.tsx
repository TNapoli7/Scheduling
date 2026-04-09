import { Card, CardTitle } from "@/components/ui/card";

export default function SwapsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trocas</h1>
      </div>
      <Card>
        <CardTitle>Pedidos de troca</CardTitle>
        <p className="text-gray-500 mt-2">Em desenvolvimento - Fase 3</p>
      </Card>
    </div>
  );
}
