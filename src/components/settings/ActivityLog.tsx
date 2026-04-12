"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog } from "@/types/database";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Calendar,
  FileText,
  Shield,
  ArrowRightLeft,
  Briefcase,
  Settings,
  LogIn,
} from "lucide-react";

const PAGE_SIZE = 25;

const ACTION_LABELS: Record<string, string> = {
  // Auth
  login: "Iniciou sessão",
  logout: "Terminou sessão",
  // Schedule
  schedule_created: "Criou horário",
  schedule_published: "Publicou horário",
  schedule_archived: "Arquivou horário",
  entry_added: "Adicionou turno",
  entry_removed: "Removeu turno",
  entry_updated: "Atualizou turno",
  // Time off
  timeoff_requested: "Pediu ausência",
  timeoff_approved: "Aprovou ausência",
  timeoff_rejected: "Rejeitou ausência",
  // Swaps
  swap_requested: "Pediu troca",
  swap_approved: "Aprovou troca",
  swap_rejected: "Rejeitou troca",
  // Employees
  employee_invited: "Convidou colaborador",
  employee_removed: "Removeu colaborador",
  employee_updated: "Atualizou colaborador",
  // Org
  org_updated: "Atualizou organização",
  settings_changed: "Alterou definições",
};

const ENTITY_ICONS: Record<string, typeof Clock> = {
  schedule: Calendar,
  schedule_entry: Clock,
  time_off: FileText,
  swap: ArrowRightLeft,
  employee: User,
  organization: Briefcase,
  settings: Settings,
  auth: LogIn,
};

const ENTITY_LABELS: Record<string, string> = {
  schedule: "Horário",
  schedule_entry: "Turno",
  time_off: "Ausência",
  swap: "Troca",
  employee: "Colaborador",
  organization: "Organização",
  settings: "Definições",
  auth: "Autenticação",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityLogPanel() {
  const [logs, setLogs] = useState<(ActivityLog & { profile?: { full_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Check user role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, org_id")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "manager"].includes(profile.role)) {
      setUserRole(profile?.role || null);
      setLoading(false);
      return;
    }

    setUserRole(profile.role);

    // Build query
    let query = supabase
      .from("activity_logs")
      .select("*, profile:profiles!activity_logs_user_id_fkey(full_name)", {
        count: "exact",
      })
      .eq("org_id", profile.org_id!)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (entityFilter !== "all") {
      query = query.eq("entity_type", entityFilter);
    }

    if (search.trim()) {
      query = query.or(
        `action.ilike.%${search}%,entity_type.ilike.%${search}%`
      );
    }

    const { data, count } = await query;
    setLogs((data || []) as (ActivityLog & { profile?: { full_name: string } })[]);
    setTotal(count || 0);
    setLoading(false);
  }, [page, entityFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Access denied for non-managers
  if (userRole && !["admin", "manager"].includes(userRole)) {
    return (
      <div className="text-center py-12">
        <Shield className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <p className="text-sm text-stone-500">
          Apenas gestores e administradores podem ver o histórico de atividade.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquisar atividade..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
          />
        </div>

        {/* Entity type filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(0);
            }}
            className="pl-9 pr-8 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white appearance-none cursor-pointer"
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log entries table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_140px_120px_100px] gap-4 px-4 py-2.5 bg-stone-50 border-b border-stone-100 text-xs font-medium text-stone-500 uppercase tracking-wider">
          <span>Ação</span>
          <span>Utilizador</span>
          <span>Categoria</span>
          <span className="text-right">Quando</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="text-center py-12 text-sm text-stone-400">
            A carregar...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 text-stone-200 mx-auto mb-2" />
            <p className="text-sm text-stone-400">
              {search || entityFilter !== "all"
                ? "Nenhum resultado encontrado."
                : "Ainda não há atividade registada."}
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const Icon =
              ENTITY_ICONS[log.entity_type] || Clock;
            return (
              <div
                key={log.id}
                className="grid grid-cols-[1fr_140px_120px_100px] gap-4 px-4 py-3 border-b border-stone-50 hover:bg-stone-50/50 transition-colors items-center"
              >
                {/* Action */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-stone-800 truncate">
                      {ACTION_LABELS[log.action] || log.action}
                    </p>
                    {log.details &&
                      Object.keys(log.details).length > 0 && (
                        <p className="text-xs text-stone-400 truncate mt-0.5">
                          {Object.entries(log.details)
                            .slice(0, 2)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                  </div>
                </div>

                {/* User */}
                <span className="text-sm text-stone-600 truncate">
                  {log.profile?.full_name || "—"}
                </span>

                {/* Entity type */}
                <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-md truncate text-center">
                  {ENTITY_LABELS[log.entity_type] || log.entity_type}
                </span>

                {/* Timestamp */}
                <span
                  className="text-xs text-stone-400 text-right"
                  title={formatDate(log.created_at)}
                >
                  {timeAgo(log.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-stone-400">
            {total} {total === 1 ? "registo" : "registos"} — Página{" "}
            {page + 1} de {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
