import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) redirect("/onboarding");

  // Fetch stats
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [employeesRes, scheduleRes, swapsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("org_id", profile.org_id)
      .eq("is_active", true),
    supabase
      .from("schedules")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .single(),
    supabase
      .from("swap_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const employeeCount = employeesRes.count || 0;
  const currentSchedule = scheduleRes.data;
  const pendingSwaps = swapsRes.count || 0;

  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ola, {profile.full_name.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          {monthNames[currentMonth - 1]} {currentYear}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Equipa</p>
              <p className="text-2xl font-bold text-gray-900">{employeeCount}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Horario {monthNames[currentMonth - 1]}</p>
              {currentSchedule ? (
                <Badge variant={currentSchedule.status === "published" ? "success" : "warning"}>
                  {currentSchedule.status === "published" ? "Publicado" : "Rascunho"}
                </Badge>
              ) : (
                <Badge variant="default">Nao criado</Badge>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Trocas pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{pendingSwaps}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fairness Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentSchedule?.fairness_score ? `${currentSchedule.fairness_score}%` : "--"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      {profile.role !== "employee" && (
        <Card>
          <CardTitle>Acoes rapidas</CardTitle>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/schedule"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {currentSchedule ? "Ver horario" : "Criar horario"}
            </a>
            <a
              href="/employees"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Gerir equipa
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
