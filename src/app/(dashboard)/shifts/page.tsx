"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { ShiftTemplate } from "@/types/database";

const defaultColors = [
  { value: "#3B82F6", label: "Azul" },
  { value: "#10B981", label: "Verde" },
  { value: "#F59E0B", label: "Amarelo" },
  { value: "#EF4444", label: "Vermelho" },
  { value: "#8B5CF6", label: "Roxo" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#06B6D4", label: "Ciano" },
  { value: "#F97316", label: "Laranja" },
];

type ShiftForm = {
  name: string;
  start_time: string;
  end_time: string;
  min_staff: number;
  color: string;
};

const emptyForm: ShiftForm = {
  name: "",
  start_time: "09:00",
  end_time: "17:00",
  min_staff: 1,
  color: "#3B82F6",
};

function computeDuration(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60; // overnight shift
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ShiftForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const fetchShifts = useCallback(async () => {
    const { data } = await supabase
      .from("shift_templates")
      .select("*")
      .order("start_time");
    if (data) setShifts(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(shift: ShiftTemplate) {
    setEditingId(shift.id);
    setForm({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      min_staff: shift.min_staff,
      color: shift.color,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    if (!form.name.trim()) {
      setError("Nome do turno e obrigatorio");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      start_time: form.start_time,
      end_time: form.end_time,
      min_staff: form.min_staff,
      color: form.color,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from("shift_templates")
        .update(payload)
        .eq("id", editingId);

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      // Need to get the user's org_id for new templates
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Sessão expirada"); setSaving(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) {
        setError("Organização nao encontrada");
        setSaving(false);
        return;
      }

      const { error: err } = await supabase
        .from("shift_templates")
        .insert({ ...payload, org_id: profile.org_id });

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }

    setShowModal(false);
    setSaving(false);
    fetchShifts();
  }

  async function toggleActive(shift: ShiftTemplate) {
    await supabase
      .from("shift_templates")
      .update({ is_active: !shift.is_active })
      .eq("id", shift.id);
    fetchShifts();
  }

  async function loadPresets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) return;

    const presets = [
      { name: "Manha", start_time: "08:00", end_time: "16:00", min_staff: 2, color: "#F59E0B", org_id: profile.org_id },
      { name: "Tarde", start_time: "14:00", end_time: "22:00", min_staff: 2, color: "#3B82F6", org_id: profile.org_id },
      { name: "Noite", start_time: "22:00", end_time: "08:00", min_staff: 1, color: "#8B5CF6", org_id: profile.org_id },
      { name: "Partido", start_time: "09:00", end_time: "13:00", min_staff: 1, color: "#10B981", org_id: profile.org_id },
    ];

    await supabase.from("shift_templates").insert(presets);
    fetchShifts();
  }

  const activeShifts = shifts.filter((s) => s.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Turnos</h1>
          <p className="text-sm text-stone-500 mt-1">
            {activeShifts.length} turno{activeShifts.length !== 1 ? "s" : ""} ativo{activeShifts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {shifts.length === 0 && (
            <Button variant="secondary" onClick={loadPresets}>
              Carregar exemplos
            </Button>
          )}
          <Button onClick={openAdd}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo turno
          </Button>
        </div>
      </div>

      {/* Shift cards */}
      {loading ? (
        <div className="text-center py-12 text-stone-500">A carregar...</div>
      ) : shifts.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-stone-500 mb-4">Ainda nao tens turnos definidos.</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={loadPresets}>
                Carregar exemplos
              </Button>
              <Button onClick={openAdd}>
                Criar turno
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shifts.map((shift) => (
            <Card key={shift.id} padding="sm" className={!shift.is_active ? "opacity-60" : ""}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: shift.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-stone-900">{shift.name}</h3>
                    <p className="text-sm text-stone-500">
                      {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                      <span className="ml-2 text-stone-400">
                        ({computeDuration(shift.start_time, shift.end_time)})
                      </span>
                    </p>
                  </div>
                </div>
                {!shift.is_active && <Badge variant="danger">Inativo</Badge>}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  Min. {shift.min_staff} pessoa{shift.min_staff !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(shift)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(shift)}>
                    {shift.is_active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Editar turno" : "Novo turno"}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Nome do turno"
            placeholder="Ex: Manha, Tarde, Noite"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hora inicio"
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
            <Input
              label="Hora fim"
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </div>

          {form.start_time && form.end_time && (
            <p className="text-sm text-stone-500">
              Duração: {computeDuration(form.start_time, form.end_time)}
            </p>
          )}

          <Input
            label="Staff mínimo"
            type="number"
            min={1}
            max={20}
            value={form.min_staff}
            onChange={(e) => setForm({ ...form, min_staff: parseInt(e.target.value) || 1 })}
            hint="Número mínimo de pessoas por turno"
          />

          {/* Color picker */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {defaultColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.color === c.value ? "border-stone-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingId ? "Guardar" : "Criar turno"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
