"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Search,
  Clock,
} from "lucide-react";
import { SkeletonCard, SkeletonList } from "@/components/ui/skeleton";
import type { OrgSummary } from "@/types/database";

const PLAN_COLORS: Record<string, string> = {
  trial: "bg-[color:var(--surface-sunken)] text-[color:var(--text-secondary)]",
  starter: "bg-[color:var(--accent-soft)] text-[color:var(--accent)]",
  professional: "bg-teal-50 text-teal-700",
  business: "bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial",
  starter: "Starter",
  professional: "Professional",
  business: "Business",
};

export default function AdminDashboard() {
  const supabase = createClient();
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    // Check super admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin) { window.location.href = "/dashboard"; return; }
    setUserName(profile.full_name);

    // Fetch org summary view
    const { data: orgData } = await supabase
      .from("org_summary")
      .select("*")
      .order("created_at", { ascending: false });

    setOrgs((orgData || []) as OrgSummary[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = search
    ? orgs.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.sector?.toLowerCase().includes(search.toLowerCase())
      )
    : orgs;

  function trialDaysLeft(trialEndsAt: string | null): number | null {
    if (!trialEndsAt) return null;
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const totalOrgs = orgs.length;
  const activeOrgs = orgs.filter((o) => o.is_active).length;
  const totalUsers = orgs.reduce((sum, o) => sum + (o.active_users || 0), 0);
  const trialOrgs = orgs.filter((o) => o.plan_name === "trial").length;

  // Estimated MRR
  const mrr = orgs
    .filter((o) => o.is_active && o.plan_name !== "trial")
    .reduce((sum, o) => {
      const base = Number(o.base_price) || 0;
      const perUser = (Number(o.per_user_price) || 0) * (o.active_users || 0);
      return sum + base + perUser;
    }, 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-8 w-48 bg-[color:var(--border-light)] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[color:var(--text-primary)] font-display tracking-tight">Super Admin</h1>
          </div>
          <p className="text-[color:var(--text-muted)] text-sm">
            Bem-vindo, {userName.split(" ")[0]}. Gestão de organizações e billing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--text-secondary)] rounded-lg border border-[color:var(--border-light)] hover:bg-[color:var(--surface-sunken)] transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voltar a app
          </a>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--text-secondary)] rounded-lg border border-[color:var(--border-light)] hover:bg-[color:var(--surface-sunken)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[color:var(--accent-soft)] rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[color:var(--accent)]" />
            </div>
            <div>
              <p className="text-sm text-[color:var(--text-muted)]">Organizações</p>
              <p className="text-2xl font-bold text-[color:var(--text-primary)]">{activeOrgs}<span className="text-sm font-normal text-[color:var(--text-muted)] ml-1">/ {totalOrgs}</span></p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-[color:var(--text-muted)]">Utilizadores ativos</p>
              <p className="text-2xl font-bold text-[color:var(--text-primary)]">{totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[color:var(--success-soft)] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[color:var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[color:var(--text-muted)]">MRR estimado</p>
              <p className="text-2xl font-bold text-[color:var(--text-primary)]">{mrr.toFixed(0)}€</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[color:var(--warning-soft)] rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[color:var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[color:var(--text-muted)]">Em trial</p>
              <p className="text-2xl font-bold text-[color:var(--text-primary)]">{trialOrgs}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Org list */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <CardTitle>Organizações</CardTitle>
          <div className="relative">
            <Search className="w-4 h-4 text-[color:var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Procurar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-[color:var(--border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 bg-[color:var(--surface)]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <div className="text-center py-10">
              <Building2 className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-[color:var(--text-muted)]">
                {search ? "Nenhuma organização encontrada." : "Ainda não existem organizações."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((org) => {
              const revenue = (Number(org.base_price) || 0) + ((Number(org.per_user_price) || 0) * (org.active_users || 0));
              const daysLeft = trialDaysLeft(org.trial_ends_at);
              return (
                <a key={org.id} href={`/admin/${org.id}`} className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-[color:var(--surface-sunken)] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-[color:var(--text-secondary)]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-[color:var(--text-primary)] truncate">{org.name}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${PLAN_COLORS[org.plan_name] || PLAN_COLORS.trial}`}>
                              {PLAN_LABELS[org.plan_name] || org.plan_name}
                            </span>
                            {!org.is_active && (
                              <Badge variant="danger">Inativa</Badge>
                            )}
                            {org.plan_name === "trial" && daysLeft !== null && (
                              <>
                                <span>&middot;</span>
                                <span className={`font-medium flex items-center gap-1 ${daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-stone-500"}`}>
                                  <Clock className="w-3 h-3" />
                                  {daysLeft > 0 ? `${daysLeft}d restantes` : "Trial expirado"}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[color:var(--text-muted)] mt-0.5">
                            <span>{org.sector}</span>
                            <span>&middot;</span>
                            <span>{org.active_users} utilizador{org.active_users !== 1 ? "es" : ""}</span>
                            {org.last_org_login && (
                              <>
                                <span>&middot;</span>
                                <span>Último login {new Date(org.last_org_login).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}</span>
                              </>
                            )}
                            <span>&middot;</span>
                            <span>{org.total_users} total</span>
                            {org.trial_ends_at && (
                              <>
                                <span>&middot;</span>
                                <span>Trial: {new Date(org.trial_ends_at).toLocaleDateString("pt-PT")}</span>
                              </>
                            )}
                            {org.last_org_login && (
                              <>
                                <span>&middot;</span>
                                <span>Último login: {new Date(org.last_org_login).toLocaleDateString("pt-PT")}</span>
                              </>
                            )}
                            {org.plan_name !== "trial" && (
                              <>
                                <span>&middot;</span>
                                <span className="text-[color:var(--success)] font-medium">{revenue.toFixed(0)}€/mes</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[color:var(--text-muted)] flex-shrink-0" />
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
