import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, AlertTriangle, Palmtree } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, role, full_name, vacation_quota")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) redirect("/onboarding");

  // Fetch stats
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [employeesRes, scheduleRes, swapsRes, timeOffRes] = await Promise.all([
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
    supabase
      .from("time_off_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "ferias")
      .eq("status", "approved")
      .gte("start_date", `${currentYear}-01-01`)
      .lte("start_date", `${currentYear}-12-31`),
  ]);

  const employeeCount = employeesRes.count || 0;
  const currentSchedule = scheduleRes.data;
  const pendingSwaps = swapsRes.count || 0;

  // Calculate vacation balance
  const vacationQuota = (profile as Record<string, unknown>).vacation_quota as number ?? 22;
  const approvedTimeOff = timeOffRes.data || [];
  const usedDays = approvedTimeOff.reduce((sum: number, r: Record<string, unknown>) => {
    const period = r.period as string;
    if (period === "morning" || period === "afternoon") return sum + 0.5;
    const s = new Date(r.start_date as string);
    const e = new Date(r.end_date as string);
    return sum + Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);
  const remainingDays = vacationQuota - usedDays;

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
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Palmtree className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ferias disponiveis</p>
              <p className={`text-2xl font-bold ${remainingDays <= 3 ? "text-orange-600" : "text-gray-900"}`}>
                {remainingDays % 1 === 0 ? remainingDays : remainingDays.toFixed(1).replace(".", ",")}
                <span className="text-sm font-normal text-gray-400 ml-1">/ {vacationQuota}</span>
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
