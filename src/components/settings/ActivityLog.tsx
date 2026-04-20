"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useCurrentMembership } from "@/hooks/use-membership";
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

// Canonical entity types shown in the filter dropdown.
// Legacy aliases (schedule_entry, time_off) are still resolved for rendering
// via the translations map, but aren't duplicated in the filter.
const ENTITY_ICONS: Record<string, typeof Clock> = {
  schedule: Calendar,
  shift: Clock,
  timeoff: FileText,
  swap: ArrowRightLeft,
  employee: User,
  availability: Calendar,
  organization: Briefcase,
  settings: Settings,
  auth: LogIn,
};

// Legacy aliases mapped back to a canonical key when we find them in old logs.
const LEGACY_ENTITY_ALIASES: Record<string, string> = {
  schedule_entry: "shift",
  time_off: "timeoff",
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
  const t = useTranslations("activityLog");
  const { membership, loading: memLoading, isManager } = useCurrentMembership();
  const [logs, setLogs] = useState<(ActivityLog & { profile?: { full_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const getActionLabel = (action: string) => {
    try {
      return t(`actions.${action}`);
    } catch {
      return action;
    }
  };

  const getEntityLabel = (entity: string) => {
    try {
      return t(`entities.${entity}`);
    } catch {
      return entity;
    }
  };

  const fetchLogs = useCallback(async () => {
    if (!membership) return;

    if (!isManager) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Build query
    let query = supabase
      .from("activity_logs")
      .select("*, profile:profiles!activity_logs_user_id_profile_fkey(full_name)", {
        count: "exact",
      })
      .eq("org_id", membership.orgId)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (entityFilter !== "all") {
      // Include any legacy aliases that map to the selected canonical key.
      const aliases = Object.entries(LEGACY_ENTITY_ALIASES)
        .filter(([, canonical]) => canonical === entityFilter)
        .map(([legacy]) => legacy);
      const match = [entityFilter, ...aliases];
      query =
        match.length > 1
          ? query.in("entity_type", match)
          : query.eq("entity_type", entityFilter);
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
  }, [page, entityFilter, search, membership, isManager]);

  useEffect(() => {
    if (!memLoading && membership) fetchLogs();
  }, [fetchLogs, memLoading, membership]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Access denied for non-managers
  if (membership && !isManager) {
    return (
      <div className="text-center py-12">
        <Shield className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <p className="text-sm text-stone-500">
          {t("noActivity")}
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
            placeholder={t("searchPlaceholder")}
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
            <option value="all">{t("allCategories")}</option>
            {Object.entries(ENTITY_ICONS).map(([key]) => (
              <option key={key} value={key}>
                {getEntityLabel(key)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log entries table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_140px_120px_100px] gap-4 px-4 py-2.5 bg-stone-50 border-b border-stone-100 text-xs font-medium text-stone-500 uppercase tracking-wider">
          <span>{t("colAction")}</span>
          <span>{t("colUser")}</span>
          <span>{t("colCategory")}</span>
          <span className="text-right">{t("colWhen")}</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="text-center py-12 text-sm text-stone-400">
            {t("loadMore")}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 text-stone-200 mx-auto mb-2" />
            <p className="text-sm text-stone-400">
              {search || entityFilter !== "all"
                ? t("noActivity")
                : t("noActivity")}
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const canonical =
              LEGACY_ENTITY_ALIASES[log.entity_type] || log.entity_type;
            const Icon = ENTITY_ICONS[canonical] || Clock;
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
                      {getActionLabel(log.action)}
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
                  {getEntityLabel(canonical)}
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
