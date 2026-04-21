"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Building2,
  Users,
  ChevronLeft,
  Settings,
  CreditCard,
  User,
  Shield,
  Calendar,
  LogIn,
  Clock,
  CalendarPlus,
} from "lucide-react";
import { SkeletonCard, SkeletonList } from "@/components/ui/skeleton";
import type { Profile, Organization } from "@/types/database";

const PLAN_OPTIONS = [
  { value: "trial", label: "Trial (gratuito)" },
  { value: "starter", label: "Starter" },
  { value: "professional", label: "Professional" },
  { value: "business", label: "Business" },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Colaborador",
};

export default function OrgDetailPage() {
  const params = useParams();
  const orgId = params.id as string;
  const supabase = createClient();

  const [org, setOrg] = useState<Organization | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [extending, setExtending] = useState(false);

  // Edit form
  const [editPlan, setEditPlan] = useState("trial");
  const [editBase, setEditBase] = useState("0");
  const [editPerUser, setEditPerUser] = useState("0");
  const [editCycle, setEditCycle] = useState("monthly");
  const [editMaxUsers, setEditMaxUsers] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editActive, setEditActive] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Verify super admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin) { window.location.href = "/dashboard"; return; }

    // Fetch org
    const { data: orgData } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (!orgData) { window.location.href = "/admin"; return; }
    setOrg(orgData as Organization);

    // Fetch users
    const { data: usersData } = await supabase
      .from("profiles")
      .select("*")
      .eq("org_id", orgId)
      .order("full_name");

    setUsers((usersData || []) as Profile[]);
    setLoading(false);
  }, [supabase, orgId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openEdit() {
    if (!org) return;
    setEditPlan(org.plan_name || "trial");
    setEditBase(String(org.base_price || 0));
    setEditPerUser(String(org.per_user_price || 0));
    setEditCycle(org.billing_cycle || "monthly");
    setEditMaxUsers(org.max_users ? String(org.max_users) : "");
    setEditNotes(org.billing_notes || "");
    setEditActive(org.is_active !== false);
    setShowEdit(true);
  }

  async function saveOrg() {
    setSaving(true);

    await supabase
      .from("organizations")
      .update({
        plan_name: editPlan,
        base_price: parseFloat(editBase) || 0,
        per_user_price: parseFloat(editPerUser) || 0,
        billing_cycle: editCycle,
        max_users: editMaxUsers ? parseInt(editMaxUsers) : null,
        billing_notes: editNotes || null,
        is_active: editActive,
        subscription_tier: editPlan === "trial" ? "trial" : editPlan as "starter" | "professional" | "business",
      })
      .eq("id", orgId);

    setShowEdit(false);
    setSaving(false);
    fetchData();
  }

  
  async function extendTrial(days: number) {
    if (!org) return;
    setExtending(true);
    const currentEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : new Date();
    const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);

    await supabase
      .from("organizations")
      .update({ trial_ends_at: newEnd.toISOString() })
      .eq("id", orgId);

    setExtending(false);
    fetchData();
  }

  async function impersonateUser(userId: string) {
    setImpersonating(userId);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erro ao fazer impersonate");
      }
    } catch {
      alert("Erro de rede");
    }
    setImpersonating(null);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="h-8 w-64 bg-[color:var(--border-light)] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonList count={4} />
      </div>
    );
  }

  if (!org) return null;

  const activeUsers = users.filter((u) => u.is_active).length;
  const revenue = (Number(org.base_price) || 0) + ((Number(org.per_user_price) || 0) * activeUsers);

  // Trial info
  const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
  const trialDaysLeft = trialEndsAt
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const createdDate = new Date(org.created_at).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Back + Header */}
      <div>
        <a
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)] mb-3 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[color:var(--surface-sunken)] rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[color:var(--text-secondary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--text-primary)] font-display tracking-tight">{org.name}</h1>
              <p className="text-sm text-[color:var(--text-muted)]">{org.sector} &middot; Registada em {createdDate}</p>
            </div>
          </div>
          <Button onClick={openEdit}>
            <Settings className="w-4 h-4 mr-2" />
            Editar plano
          </Button>
          <Button variant="secondary" onClick={() => extendTrial(14)}>
            +14d trial
          </Button>
          <Button variant="secondary" onClick={() => extendTrial(30)}>
            +30d trial
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[color:var(--accent-soft)] rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[color:var(--accent)]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--text-muted)]">Plano</p>
              <p className="text-lg font-bold text-[color:var(--text-primary)] capitalize">{org.plan_name}</p>
              {org.plan_name !== "trial" && (
                <p className="text-xs text-[color:var(--text-muted)]">{Number(org.base_price)}€ base + {Number(org.per_user_price)}€/user</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--text-muted)]">Utilizadores</p>
              <p className="text-lg font-bold text-[color:var(--text-primary)]">
                {activeUsers}
                <span className="text-sm font-normal text-[color:var(--text-muted)] ml-1">/ {users.length}</span>
                {org.max_users && (
                  <span className="text-xs font-normal text-[color:var(--text-muted)] ml-1">(max {org.max_users})</span>
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[color:var(--success-soft)] rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[color:var(--success)]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--text-muted)]">Receita mensal</p>
              <p className="text-lg font-bold text-[color:var(--success)]">{revenue.toFixed(0)}€</p>
              <p className="text-xs text-[color:var(--text-muted)]">{org.billing_cycle === "annual" ? "Anual" : "Mensal"}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trial info */}
      {org.plan_name === "trial" && trialEndsAt && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trialDaysLeft !== null && trialDaysLeft <= 3 ? "bg-red-50" : trialDaysLeft !== null && trialDaysLeft <= 7 ? "bg-amber-50" : "bg-teal-50"}`}>
                <Clock className={`w-5 h-5 ${trialDaysLeft !== null && trialDaysLeft <= 3 ? "text-red-600" : trialDaysLeft !== null && trialDaysLeft <= 7 ? "text-amber-600" : "text-teal-600"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {trialDaysLeft !== null && trialDaysLeft > 0
                    ? `Trial expira em ${trialDaysLeft} dia${trialDaysLeft !== 1 ? "s" : ""}`
                    : "Trial expirado"}
                </p>
                <p className="text-xs text-stone-500">
                  {trialEndsAt.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => extendTrial(7)} loading={extending}>
                <CalendarPlus className="w-3.5 h-3.5" /> +7 dias
              </Button>
              <Button variant="secondary" size="sm" onClick={() => extendTrial(14)} loading={extending}>
                +14 dias
              </Button>
              <Button variant="secondary" size="sm" onClick={() => extendTrial(30)} loading={extending}>
                +30 dias
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Billing notes */}
      {org.billing_notes && (
        <Card>
          <p className="text-xs font-medium text-[color:var(--text-muted)] mb-1">Notas de billing</p>
          <p className="text-sm text-[color:var(--text-secondary)]">{org.billing_notes}</p>
        </Card>
      )}

      {/* Users list */}
      <div>
        <CardTitle className="mb-3">Utilizadores ({users.length})</CardTitle>
        {users.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-[color:var(--text-muted)]">Sem utilizadores.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <Card key={user.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-[color:var(--surface-sunken)] rounded-full flex items-center justify-center flex-shrink-0">
                      {user.role === "admin" ? (
                        <Shield className="w-4 h-4 text-[color:var(--accent)]" />
                      ) : (
                        <User className="w-4 h-4 text-[color:var(--text-muted)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[color:var(--text-primary)] text-sm truncate">{user.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="truncate">{user.email}</span>
                        {user.last_login_at && (
                          <>
                            <span>&middot;</span>
                            <span className="whitespace-nowrap flex-shrink-0">
                              Último login {new Date(user.last_login_at).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={user.role === "admin" ? "accent" : user.role === "manager" ? "default" : "default"}>
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                    {!user.is_active && (
                      <Badge variant="danger">Inativo</Badge>
                    )}
                    <button
                      onClick={() => impersonateUser(user.id)}
                      disabled={impersonating === user.id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[color:var(--accent)] rounded-md hover:bg-[color:var(--accent-soft)] transition-colors disabled:opacity-50"
                      title={`Entrar como ${user.full_name}`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      {impersonating === user.id ? "..." : "Entrar"}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit plan modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar plano e billing" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Plano</label>
            <select
              value={editPlan}
              onChange={(e) => setEditPlan(e.target.value)}
              className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
            >
              {PLAN_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Preço base (€)</label>
              <input
                type="number"
                step="0.01"
                value={editBase}
                onChange={(e) => setEditBase(e.target.value)}
                className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Por utilizador (€)</label>
              <input
                type="number"
                step="0.01"
                value={editPerUser}
                onChange={(e) => setEditPerUser(e.target.value)}
                className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Ciclo</label>
              <select
                value={editCycle}
                onChange={(e) => setEditCycle(e.target.value)}
                className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
              >
                <option value="monthly">Mensal</option>
                <option value="annual">Anual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Max utilizadores</label>
              <input
                type="number"
                value={editMaxUsers}
                onChange={(e) => setEditMaxUsers(e.target.value)}
                placeholder="Ilimitado"
                className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Notas</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Promocode aplicado, desconto 20%..."
              className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-active"
              checked={editActive}
              onChange={(e) => setEditActive(e.target.checked)}
              className="rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-teal-500"
            />
            <label htmlFor="edit-active" className="text-sm text-[color:var(--text-secondary)]">
              Organização ativa
            </label>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button onClick={saveOrg} disabled={saving}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
