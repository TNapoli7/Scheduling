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
} from "lucide-react";
import { SkeletonCard, SkeletonList } from "@/components/ui/skeleton";
import type { OrgSummary } from "@/types/database";

const PLAN_COLORS: Record<string, string> = {
  trial: "bg-stone-100 text-stone-700",
  starter: "bg-indigo-50 text-indigo-700",
  professional: "bg-teal-50 text-teal-700",
  business: "bg-amber-50 text-amber-700",
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
        <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
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
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Super Admin</h1>
          </div>
          <p className="text-stone-500 text-sm">
            Bem-vindo, {userName.split(" ")[0]}. Gestao de organizacoes e billing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-600 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voltar a app
          </a>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-600 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Organizacoes</p>
              <p className="text-2xl font-bold text-stone-900">{activeOrgs}<span className="text-sm font-normal text-stone-400 ml-1">/ {totalOrgs}</span></p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Utilizadores ativos</p>
              <p className="text-2xl font-bold text-stone-900">{totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">MRR estimado</p>
              <p className="text-2xl font-bold text-stone-900">{mrr.toFixed(0)}€</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Em trial</p>
              <p className="text-2xl font-bold text-stone-900">{trialOrgs}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Org list */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <CardTitle>Organizacoes</CardTitle>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Procurar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 bg-white"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <div className="text-center py-10">
              <Building2 className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-stone-500">
                {search ? "Nenhuma organizacao encontrada." : "Ainda nao existem organizacoes."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((org) => {
              const revenue = (Number(org.base_price) || 0) + ((Number(org.per_user_price) || 0) * (org.active_users || 0));
              return (
                <a key={org.id} href={`/admin/${org.id}`} className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-stone-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-stone-900 truncate">{org.name}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${PLAN_COLORS[org.plan_name] || PLAN_COLORS.trial}`}>
                              {PLAN_LABELS[org.plan_name] || org.plan_name}
                            </span>
                            {!org.is_active && (
                              <Badge variant="danger">Inativa</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                            <span>{org.sector}</span>
                            <span>&middot;</span>
                            <span>{org.active_users} utilizador{org.active_users !== 1 ? "es" : ""}</span>
                            {org.plan_name !== "trial" && (
                              <>
                                <span>&middot;</span>
                                <span className="text-emerald-600 font-medium">{revenue.toFixed(0)}€/mes</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-400 flex-shrink-0" />
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
