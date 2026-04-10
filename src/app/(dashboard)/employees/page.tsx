"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { Profile } from "@/types/database";

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gestor" },
  { value: "employee", label: "Funcionario" },
];

const credentialOptions = [
  { value: "", label: "Sem credencial" },
  { value: "farmaceutico", label: "Farmaceutico" },
  { value: "tecnico", label: "Tecnico de Farmacia" },
  { value: "auxiliar", label: "Auxiliar" },
  { value: "enfermeiro", label: "Enfermeiro/a" },
  { value: "medico", label: "Medico/a" },
  { value: "dentista", label: "Dentista" },
  { value: "fisioterapeuta", label: "Fisioterapeuta" },
  { value: "rececionista", label: "Rececionista" },
  { value: "outro", label: "Outro" },
];

const contractOptions = [
  { value: "full_time", label: "Tempo inteiro" },
  { value: "part_time", label: "Part-time" },
];

const roleBadge: Record<string, "info" | "success" | "default"> = {
  admin: "info",
  manager: "success",
  employee: "default",
};

const roleLabel: Record<string, string> = {
  admin: "Admin",
  manager: "Gestor",
  employee: "Funcionario",
};

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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const supabase = createClient();

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
      setError("Nome e obrigatorio");
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
    } else {
      // Create employee via server API (no email sent)
      if (!form.email.trim()) {
        setError("Email e obrigatorio");
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
        setError(data.error || "Erro ao criar funcionario");
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
          <h1 className="text-2xl font-bold text-stone-900">Equipa</h1>
          <p className="text-sm text-stone-500 mt-1">
            {activeCount} ativo{activeCount !== 1 ? "s" : ""} de {employees.length} total
          </p>
        </div>
        <Button onClick={openAdd}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Pesquisar por nome, email ou credencial..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <Card padding="sm">
        {loading ? (
          <div className="text-center py-12 text-stone-500">A carregar...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500">
              {search ? "Nenhum resultado encontrado." : "Ainda nao tens membros na equipa."}
            </p>
            {!search && (
              <Button onClick={openAdd} variant="ghost" className="mt-2">
                Adicionar o primeiro membro
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-4 font-medium text-stone-500">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500 hidden sm:table-cell">Credencial</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500 hidden md:table-cell">Contrato</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-stone-500">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-stone-900">{emp.full_name}</p>
                        <p className="text-stone-500 text-xs">{emp.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 hidden sm:table-cell capitalize">
                      {emp.credential || "—"}
                    </td>
                    <td className="py-3 px-4 text-stone-600 hidden md:table-cell">
                      {emp.contract_type === "full_time" ? `Tempo inteiro (${emp.weekly_hours}h)` : `Part-time (${emp.weekly_hours}h)`}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={roleBadge[emp.role] || "default"}>
                        {roleLabel[emp.role] || emp.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={emp.is_active ? "success" : "danger"}>
                        {emp.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(emp)}
                        >
                          {emp.is_active ? "Desativar" : "Ativar"}
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
        title={editingId ? "Editar membro" : "Adicionar membro"}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {!editingId && (
            <Input
              label="Email"
              type="email"
              placeholder="nome@empresa.pt"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          )}

          <Input
            label="Nome completo"
            placeholder="Maria Silva"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Funcao"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={roleOptions}
            />
            <Select
              label="Credencial"
              value={form.credential}
              onChange={(e) => setForm({ ...form, credential: e.target.value })}
              options={credentialOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Contrato"
              value={form.contract_type}
              onChange={(e) => setForm({
                ...form,
                contract_type: e.target.value,
                weekly_hours: e.target.value === "full_time" ? 40 : 20,
              })}
              options={contractOptions}
            />
            <Input
              label="Horas semanais"
              type="number"
              min={1}
              max={60}
              value={form.weekly_hours}
              onChange={(e) => setForm({ ...form, weekly_hours: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingId ? "Guardar" : "Criar funcionario"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
