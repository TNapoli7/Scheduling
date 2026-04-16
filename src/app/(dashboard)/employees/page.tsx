"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Building2, UserCog, CircleDot, Search, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import type { Membership } from "@/types/database";

/**
 * Inline FilterChip — styled native <select> that reads as a compact
 * prefix-icon chip. Centralised here so the three filters keep identical
 * height, padding and hover states without dragging a new shared component
 * into the design system before we validate the pattern across pages.
 */
function FilterChip({
  icon,
  value,
  onChange,
  options,
  active,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  active: boolean;
}) {
  return (
    <div
      className={`relative inline-flex items-center h-10 rounded-[var(--radius-md)] border transition-colors shrink-0 ${
        active
          ? "border-[color:var(--primary)] bg-[color:var(--primary-soft)]"
          : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--border-strong)]"
      }`}
    >
      <span
        className={`pl-3 pr-1.5 pointer-events-none ${
          active ? "text-[color:var(--primary)]" : "text-[color:var(--text-muted)]"
        }`}
      >
        {icon}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 pl-0 pr-9 bg-transparent text-sm appearance-none cursor-pointer focus:outline-none focus-visible:outline-none ${
          active ? "text-[color:var(--primary)] font-medium" : "text-[color:var(--text-primary)]"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className={`absolute right-2.5 pointer-events-none ${active ? "text-[color:var(--primary)]" : "text-[color:var(--text-muted)]"}`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}

/**
 * Cross-org team row. Admin/manager sees members across every org they
 * manage; employees see only the active-org roster with limited fields.
 * The `org` relation is joined server-side so we can render the
 * "Organização" column without a second round trip.
 */
type TeamMemberRow = Membership & {
  profile?: { email: string } | null;
  org?: { id: string; name: string } | null;
};

type ViewMode = "full" | "limited";

type OrgLite = { id: string; name: string };

type EmployeeForm = {
  email: string;
  full_name: string;
  role: string;
  credential: string;
  contract_type: string;
  weekly_hours: number;
  /** Required when caller manages multiple orgs — which org to add them to. */
  org_id: string;
};

const emptyForm: EmployeeForm = {
  email: "",
  full_name: "",
  role: "employee",
  credential: "",
  contract_type: "full_time",
  weekly_hours: 40,
  org_id: "",
};

const roleBadge: Record<string, "accent" | "navy" | "default"> = {
  admin: "accent",
  manager: "navy",
  employee: "default",
};

export default function EmployeesPage() {
  const t = useTranslations("employees");
  const [employees, setEmployees] = useState<TeamMemberRow[]>([]);
  const [orgs, setOrgs] = useState<OrgLite[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("full");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "manager" | "employee">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [confirmDeactivate, setConfirmDeactivate] = useState<TeamMemberRow | null>(null);

  const supabase = createClient();

  const roleOptions = [
    { value: "admin", label: t("roles.admin") },
    { value: "manager", label: t("roles.manager") },
    { value: "employee", label: t("roles.employee") },
  ];

  const credentialOptions = [
    { value: "", label: t("credentials.none") },
    { value: "farmaceutico", label: t("credentials.farmaceutico") },
    { value: "tecnico", label: t("credentials.tecnico") },
    { value: "auxiliar", label: t("credentials.auxiliar") },
    { value: "enfermeiro", label: t("credentials.enfermeiro") },
    { value: "medico", label: t("credentials.medico") },
    { value: "dentista", label: t("credentials.dentista") },
    { value: "fisioterapeuta", label: t("credentials.fisioterapeuta") },
    { value: "rececionista", label: t("credentials.rececionista") },
    { value: "outro", label: t("credentials.outro") },
  ];

  const contractOptions = [
    { value: "full_time", label: t("contracts.full_time") },
    { value: "part_time", label: t("contracts.part_time") },
  ];

  const roleLabel: Record<string, string> = {
    admin: t("roles.admin"),
    manager: t("roles.manager"),
    employee: t("roles.employee"),
  };

  const fetchTeam = useCallback(async () => {
    // Hits the cross-org API. Admin/manager gets every org they manage;
    // employee gets a limited same-org roster (no email/contract/hours).
    const res = await fetch("/api/team", { cache: "no-store" });
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setEmployees((data.memberships || []) as TeamMemberRow[]);
    setOrgs((data.orgs || []) as OrgLite[]);
    setViewMode((data.viewMode || "full") as ViewMode);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Default the "add" form org_id to the user's active org when we have
  // multiple orgs available. If only one org, auto-pick it.
  const defaultOrgId = orgs.length === 1 ? orgs[0].id : "";

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, org_id: defaultOrgId });
    setError("");
    setShowModal(true);
  }

  function openEdit(emp: TeamMemberRow) {
    setEditingId(emp.id);
    setForm({
      email: emp.profile?.email || "",
      full_name: emp.full_name,
      role: emp.role,
      credential: emp.credential || "",
      contract_type: emp.contract_type,
      weekly_hours: emp.weekly_hours,
      org_id: emp.org_id,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    if (!form.full_name.trim()) {
      setError(t("errorRequired"));
      setSaving(false);
      return;
    }

    if (editingId) {
      // Update the membership row directly. RLS (or the service-role path on
      // the admin API if we later migrate) permits admin/manager of that org.
      const { error: err } = await supabase
        .from("memberships")
        .update({
          full_name: form.full_name,
          role: form.role,
          credential: form.credential || null,
          contract_type: form.contract_type,
          weekly_hours: form.weekly_hours,
        })
        .eq("id", editingId);

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }

      logActivity("employee_updated", "employee", editingId);
    } else {
      if (!form.email.trim()) {
        setError(t("errorEmailRequired"));
        setSaving(false);
        return;
      }

      if (orgs.length > 1 && !form.org_id) {
        setError("Escolhe uma organização");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          full_name: form.full_name,
          role: form.role,
          credential: form.credential || null,
          contract_type: form.contract_type,
          weekly_hours: form.weekly_hours,
          // Explicit target org — falls back to active org on the server if
          // absent (caller with a single org doesn't need to pick).
          org_id: form.org_id || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("errorCreate"));
        setSaving(false);
        return;
      }
    }

    setShowModal(false);
    setSaving(false);
    fetchTeam();
  }

  async function toggleActive(emp: TeamMemberRow) {
    await supabase
      .from("memberships")
      .update({ is_active: !emp.is_active })
      .eq("id", emp.id);
    logActivity(emp.is_active ? "employee_deactivated" : "employee_activated", "employee", emp.id);
    fetchTeam();
  }

  const showOrgColumn = viewMode === "full" && orgs.length >= 2;
  const canManage = viewMode === "full";

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.full_name.toLowerCase().includes(q) ||
      (e.profile?.email || "").toLowerCase().includes(q) ||
      (e.credential || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || e.role === roleFilter;
    const matchesStatus =
      !canManage ||
      statusFilter === "all" ||
      (statusFilter === "active" ? e.is_active : !e.is_active);
    const matchesOrg =
      !showOrgColumn || orgFilter === "all" || e.org_id === orgFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesOrg;
  });

  const activeCount = employees.filter((e) => !canManage || e.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)] font-display tracking-tight">{t("title")}</h1>
          <p className="text-sm text-[color:var(--text-muted)] mt-1">
            {activeCount} {activeCount === 1 ? t("active") : t("active")} {t("total")} {employees.length}
            {showOrgColumn && <> · {orgs.length} organizações</>}
          </p>
        </div>
        {canManage && (
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
            {t("addButton")}
          </Button>
        )}
      </div>

      {/* Unified toolbar: search (flex-1) + filter chips (inline, scrolls
          horizontally on narrow viewports instead of wrapping vertically).
          A chip turns navy-on-soft-navy when its filter is non-default, so
          the user sees active filters at a glance. */}
      {(() => {
        const orgActive = showOrgColumn && orgFilter !== "all";
        const roleActive = roleFilter !== "all";
        const statusActive = canManage && statusFilter !== "active";
        const anyActive = orgActive || roleActive || statusActive;

        return (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search with leading icon */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-9 rounded-[var(--radius-md)] bg-[color:var(--surface)] border border-[color:var(--border)] text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] transition-colors hover:border-[color:var(--border-strong)] focus:outline-none focus-visible:outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary-soft)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Limpar pesquisa"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter chips — horizontal scroll on small viewports so the
                toolbar stays on one row no matter how many filters we add. */}
            <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-thin">
              {showOrgColumn && (
                <FilterChip
                  icon={<Building2 className="w-4 h-4" />}
                  value={orgFilter}
                  onChange={setOrgFilter}
                  active={orgActive}
                  options={[
                    { value: "all", label: "Todas as organizações" },
                    ...orgs.map((o) => ({ value: o.id, label: o.name })),
                  ]}
                />
              )}
              <FilterChip
                icon={<UserCog className="w-4 h-4" />}
                value={roleFilter}
                onChange={(v) => setRoleFilter(v as typeof roleFilter)}
                active={roleActive}
                options={[
                  { value: "all", label: t("filterRoleAll") },
                  { value: "admin", label: t("roles.admin") },
                  { value: "manager", label: t("roles.manager") },
                  { value: "employee", label: t("roles.employee") },
                ]}
              />
              {canManage && (
                <FilterChip
                  icon={<CircleDot className="w-4 h-4" />}
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v as typeof statusFilter)}
                  active={statusActive}
                  options={[
                    { value: "active", label: t("activeStatus") },
                    { value: "inactive", label: t("inactiveStatus") },
                    { value: "all", label: t("filterStatusAll") },
                  ]}
                />
              )}
              {anyActive && (
                <button
                  type="button"
                  onClick={() => {
                    setOrgFilter("all");
                    setRoleFilter("all");
                    setStatusFilter("active");
                  }}
                  className="h-10 px-3 text-xs font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] inline-flex items-center gap-1 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Table */}
      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={6} cols={canManage ? 6 : 3} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[color:var(--text-muted)]">
              {search ? t("noResults") : t("noTeamMembers")}
            </p>
            {!search && canManage && (
              <Button onClick={openAdd} variant="ghost" className="mt-2">
                {t("addFirstMember")}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--border-light)] bg-[color:var(--surface-sunken)]/40">
                  <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">{t("tableNameHeader")}</th>
                  {showOrgColumn && (
                    <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Organização</th>
                  )}
                  <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] hidden sm:table-cell">{t("tableCredentialHeader")}</th>
                  {canManage && (
                    <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] hidden md:table-cell">{t("tableContractHeader")}</th>
                  )}
                  <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">{t("tableRoleHeader")}</th>
                  {canManage && (
                    <>
                      <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">{t("tableStatusHeader")}</th>
                      <th className="text-right py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">{t("tableActionsHeader")}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-[color:var(--border-light)] last:border-0 hover:bg-[color:var(--surface-sunken)]/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <div>
                        <p className="font-medium text-[color:var(--text-primary)]">{emp.full_name}</p>
                        {canManage && (
                          <p className="text-[color:var(--text-muted)] text-xs">{emp.profile?.email || "—"}</p>
                        )}
                      </div>
                    </td>
                    {showOrgColumn && (
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md bg-[color:var(--primary-soft)] text-[color:var(--primary)] capitalize">
                          <Building2 className="w-3 h-3" strokeWidth={2.5} />
                          {emp.org?.name || "—"}
                        </span>
                      </td>
                    )}
                    <td className="py-2.5 px-4 text-[color:var(--text-secondary)] hidden sm:table-cell capitalize">
                      {emp.credential || "—"}
                    </td>
                    {canManage && (
                      <td className="py-2.5 px-4 text-[color:var(--text-secondary)] hidden md:table-cell">
                        {emp.contract_type === "full_time" ? `${t("contracts.full_time")} (${emp.weekly_hours}h)` : `${t("contracts.part_time")} (${emp.weekly_hours}h)`}
                      </td>
                    )}
                    <td className="py-2.5 px-4">
                      <Badge variant={roleBadge[emp.role] || "default"}>
                        {roleLabel[emp.role] || emp.role}
                      </Badge>
                    </td>
                    {canManage && (
                      <>
                        <td className="py-2.5 px-4">
                          <Badge variant={emp.is_active ? "success" : "danger"}>
                            {emp.is_active ? t("activeStatus") : t("inactiveStatus")}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>
                              {t("editButton")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                emp.is_active
                                  ? setConfirmDeactivate(emp)
                                  : toggleActive(emp)
                              }
                            >
                              {emp.is_active ? t("deactivateButton") : t("activateButton")}
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal — admin/manager only */}
      {canManage && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? t("modalEditTitle") : t("modalAddTitle")}
        >
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-[color:var(--danger-soft)] border border-[color:var(--danger-soft)] rounded-lg text-sm text-[color:var(--danger)]">
                {error}
              </div>
            )}

            {!editingId && (
              <Input
                label={t("emailLabel")}
                type="email"
                placeholder={t("emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            )}

            <Input
              label={t("fullNameLabel")}
              placeholder={t("fullNamePlaceholder")}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />

            {/* Org picker — only when the admin manages 2+ orgs AND we're
                creating (you cannot move an existing membership between orgs
                from here — it would silently break schedules). */}
            {!editingId && orgs.length >= 2 && (
              <Select
                label="Organização"
                value={form.org_id}
                onChange={(e) => setForm({ ...form, org_id: e.target.value })}
                options={[
                  { value: "", label: "Escolher organização…" },
                  ...orgs.map((o) => ({ value: o.id, label: o.name })),
                ]}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label={t("functionLabel")}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={roleOptions}
              />
              <Select
                label={t("credentialLabel")}
                value={form.credential}
                onChange={(e) => setForm({ ...form, credential: e.target.value })}
                options={credentialOptions}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label={t("contractLabel")}
                value={form.contract_type}
                onChange={(e) => setForm({
                  ...form,
                  contract_type: e.target.value,
                  weekly_hours: e.target.value === "full_time" ? 40 : 20,
                })}
                options={contractOptions}
              />
              <Input
                label={t("hoursLabel")}
                type="number"
                min={1}
                max={60}
                value={form.weekly_hours}
                onChange={(e) => setForm({ ...form, weekly_hours: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--border-light)]">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t("cancelButton")}
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {editingId ? t("saveButton") : t("createButton")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm deactivate */}
      {canManage && (
        <Modal
          open={!!confirmDeactivate}
          onClose={() => setConfirmDeactivate(null)}
          title={t("confirmDeactivateTitle")}
          size="sm"
        >
          {confirmDeactivate && (
            <div className="space-y-4">
              <p className="text-sm text-[color:var(--text-secondary)]">
                {t("confirmDeactivateBody", { name: confirmDeactivate.full_name })}
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setConfirmDeactivate(null)}>
                  {t("cancel")}
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const emp = confirmDeactivate;
                    setConfirmDeactivate(null);
                    await toggleActive(emp);
                  }}
                >
                  {t("deactivateButton")}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
