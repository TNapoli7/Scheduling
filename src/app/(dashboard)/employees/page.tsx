"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { Profile } from "@/types/database";

type EmployeeForm = {
  email: string;
  full_name: string;
  role: string;
  credential: string;
  contract_type: string;
  weekly_hours: number;
};

const emptyForm: EmployeeForm = {
  email: "",
  full_name: "",
  role: "employee",
  credential: "",
  contract_type: "full_time",
  weekly_hours: 40,
};

const roleBadge: Record<string, "info" | "success" | "default"> = {
  admin: "info",
  manager: "success",
  employee: "default",
};

export default function EmployeesPage() {
  const t = useTranslations("employees");
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeactivate, setConfirmDeactivate] = useState<Profile | null>(null);

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

  const fetchEmployees = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");
    if (data) setEmployees(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(emp: Profile) {
    setEditingId(emp.id);
    setForm({
      email: emp.email,
      full_name: emp.full_name,
      role: emp.role,
      credential: emp.credential || "",
      contract_type: emp.contract_type,
      weekly_hours: emp.weekly_hours,
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
      // Update existing
      const { error: err } = await supabase
        .from("profiles")
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
      // Create employee via server API (no email sent)
      if (!form.email.trim()) {
        setError(t("errorEmailRequired"));
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
    fetchEmployees();
  }

  async function toggleActive(emp: Profile) {
    await supabase
      .from("profiles")
      .update({ is_active: !emp.is_active })
      .eq("id", emp.id);
    logActivity(emp.is_active ? "employee_deactivated" : "employee_activated", "employee", emp.id);
    fetchEmployees();
  }

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.credential || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = employees.filter((e) => e.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)] font-display tracking-tight">{t("title")}</h1>
          <p className="text-sm text-[color:var(--text-muted)] mt-1">
            {activeCount} {activeCount === 1 ? t("active") : t("active")} {t("total")} {employees.length}
          </p>
        </div>
        <Button onClick={openAdd}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("addButton")}
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <Card padding="sm">
        {loading ? (
          <div className="text-center py-12 text-[color:var(--text-muted)]">{t("loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[color:var(--text-muted)]">
              {search ? t("noResults") : t("noTeamMembers")}
            </p>
            {!search && (
              <Button onClick={openAdd} variant="ghost" className="mt-2">
                {t("addFirstMember")}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--border-light)]">
                  <th className="text-left py-3 px-4 font-medium text-[color:var(--text-muted)]">{t("tableNameHeader")}</th>
                  <th className="text-left py-3 px-4 font-medium text-[color:var(--text-muted)] hidden sm:table-cell">{t("tableCredentialHeader")}</th>
                  <th className="text-left py-3 px-4 font-medium text-[color:var(--text-muted)] hidden md:table-cell">{t("tableContractHeader")}</th>
                  <th className="text-left py-3 px-4 font-medium text-[color:var(--text-muted)]">{t("tableRoleHeader")}</th>
                  <th className="text-left py-3 px-4 font-medium text-[color:var(--text-muted)]">{t("tableStatusHeader")}</th>
                  <th className="text-right py-3 px-4 font-medium text-[color:var(--text-muted)]">{t("tableActionsHeader")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-[color:var(--border-light)] last:border-0 hover:bg-[color:var(--surface-sunken)]">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-[color:var(--text-primary)]">{emp.full_name}</p>
                        <p className="text-[color:var(--text-muted)] text-xs">{emp.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[color:var(--text-secondary)] hidden sm:table-cell capitalize">
                      {emp.credential || "—"}
                    </td>
                    <td className="py-3 px-4 text-[color:var(--text-secondary)] hidden md:table-cell">
                      {emp.contract_type === "full_time" ? `${t("contracts.full_time")} (${emp.weekly_hours}h)` : `${t("contracts.part_time")} (${emp.weekly_hours}h)`}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={roleBadge[emp.role] || "default"}>
                        {roleLabel[emp.role] || emp.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={emp.is_active ? "success" : "danger"}>
                        {emp.is_active ? t("activeStatus") : t("inactiveStatus")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
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

      {/* Confirm deactivate modal */}
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
              <Button
                variant="secondary"
                onClick={() => setConfirmDeactivate(null)}
              >
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
    </div>
  );
}
