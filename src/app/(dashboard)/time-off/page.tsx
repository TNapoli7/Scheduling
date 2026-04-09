"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Profile, TimeOffRequest } from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  ferias: "Ferias",
  baixa: "Baixa medica",
  pessoal: "Pessoal",
  outro: "Outro",
};

const STATUS_VARIANT: Record<string, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export default function TimeOffPage() {
  const [myRole, setMyRole] = useState<string>("employee");
  const [myId, setMyId] = useState<string>("");
  const [orgId, setOrgId] = useState<string>("");
  const [requests, setRequests] = useState<(TimeOffRequest & { profile?: Profile })[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  // New request form
  const [newType, setNewType] = useState("ferias");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newReason, setNewReason] = useState("");

  const supabase = createClient();
  const isManager = myRole === "admin" || myRole === "manager";

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) return;
    setMyRole(profile.role);
    setMyId(user.id);
    setOrgId(profile.org_id || "");

    // Fetch employees for manager view
    if (profile.role === "admin" || profile.role === "manager") {
      const { data: emps } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true)
        .order("full_name");
      setEmployees(emps || []);
    }

    // Fetch requests
    let query = supabase
      .from("time_off_requests")
      .select("*, profile:profiles(*)")
      .order("created_at", { ascending: false });

    if (profile.role === "employee") {
      query = query.eq("user_id", user.id);
    }

    const { data: reqs } = await query;
    setRequests((reqs || []) as (TimeOffRequest & { profile?: Profile })[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Create new request
  async function createRequest() {
    if (!newStart || !newEnd) return;
    setSaving(true);

    await supabase.from("time_off_requests").insert({
      user_id: myId,
      org_id: orgId,
      start_date: newStart,
      end_date: newEnd,
      type: newType,
      reason: newReason || null,
      status: "pending",
    });

    // Notify managers
    const managers = employees.filter((e) => e.role === "admin" || e.role === "manager");
    if (managers.length > 0 && isManager === false) {
      const me = employees.find((e) => e.id === myId);
      for (const mgr of managers) {
        await supabase.from("notifications").insert({
          user_id: mgr.id,
          type: "time_off_request",
          title: "Novo pedido de ferias",
          body: `${me?.full_name || "Funcionario"} pediu ${TYPE_LABELS[newType]?.toLowerCase()} de ${newStart} a ${newEnd}.`,
          metadata: { requester_id: myId, type: newType, start_date: newStart, end_date: newEnd },
        });
      }
    }

    setShowNew(false);
    setNewType("ferias");
    setNewStart("");
    setNewEnd("");
    setNewReason("");
    setSaving(false);
    fetchData();
  }

  // Review request (manager)
  async function reviewRequest(requestId: string, status: "approved" | "rejected") {
    setSaving(true);

    await supabase
      .from("time_off_requests")
      .update({
        status,
        reviewed_by: myId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    // Notify the employee
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      await supabase.from("notifications").insert({
        user_id: req.user_id,
        type: status === "approved" ? "time_off_approved" : "time_off_rejected",
        title: status === "approved" ? "Pedido de ferias aprovado" : "Pedido de ferias rejeitado",
        body: `O seu pedido de ${TYPE_LABELS[req.type]?.toLowerCase()} para ${req.start_date} a ${req.end_date} foi ${status === "approved" ? "aprovado" : "rejeitado"}.`,
        metadata: { request_id: requestId },
      });
    }

    setSaving(false);
    fetchData();
  }

  // Count days in a request
  function countDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  // Filter
  const filtered = tab === "all"
    ? requests
    : requests.filter((r) => r.status === tab);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Ferias e Ausencias</h1>
        <div className="text-center py-12 text-gray-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ferias e Ausencias</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isManager
              ? "Gerir pedidos de ferias e ausencias da equipa."
              : "Pedir ferias e ver o estado dos seus pedidos."}
          </p>
        </div>
        <Button onClick={() => setShowNew(true)}>Novo pedido</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {([
          { key: "pending", label: "Pendentes", count: pendingCount },
          { key: "approved", label: "Aprovados" },
          { key: "rejected", label: "Rejeitados" },
          { key: "all", label: "Todos" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
            {"count" in t && t.count ? (
              <span className="ml-1.5 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">Nenhum pedido encontrado.</div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => {
            const emp = req.profile || employees.find((e) => e.id === req.user_id);
            const days = countDays(req.start_date, req.end_date);
            return (
              <Card key={req.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isManager && (
                        <span className="font-medium text-gray-900 text-sm">
                          {emp?.full_name || "—"}
                        </span>
                      )}
                      <Badge variant={STATUS_VARIANT[req.status] || "default"}>
                        {STATUS_LABELS[req.status]}
                      </Badge>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {TYPE_LABELS[req.type] || req.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {req.start_date} a {req.end_date}
                      <span className="text-gray-400 ml-2">({days} dia{days !== 1 ? "s" : ""})</span>
                    </p>
                    {req.reason && (
                      <p className="text-xs text-gray-500 mt-1">{req.reason}</p>
                    )}
                  </div>
                  {isManager && req.status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reviewRequest(req.id, "rejected")}
                        loading={saving}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => reviewRequest(req.id, "approved")}
                        loading={saving}
                      >
                        Aprovar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New request modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Novo pedido de ausencia" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ferias">Ferias</option>
              <option value="baixa">Baixa medica</option>
              <option value="pessoal">Pessoal</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data inicio</label>
              <Input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data fim</label>
              <Input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
            <textarea
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Ferias de verao..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={createRequest} loading={saving} disabled={!newStart || !newEnd}>
              Submeter pedido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
