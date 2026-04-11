"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A password precisa de ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As passwords não coincidem.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Mapa de Horário</h1>
          <p className="text-stone-500 mt-2">Definir nova password</p>
        </div>
        <Card>
          {checkingSession ? (
            <p className="text-sm text-stone-600">A verificar sessão…</p>
          ) : !hasSession ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">Link inválido ou expirado</h2>
              <p className="text-sm text-stone-600">
                O link que usaste já não é válido. Pede um novo link de recuperação.
              </p>
              <Link href="/forgot-password" className="block text-center text-sm text-indigo-600 hover:text-indigo-700">
                Pedir novo link
              </Link>
            </div>
          ) : done ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">Password atualizada</h2>
              <p className="text-sm text-stone-600">A redirecionar para o dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">Nova password</h2>
              <p className="text-sm text-stone-600">
                Escolhe uma password com pelo menos 8 caracteres.
              </p>
              <Input
                label="Nova password"
                type="password"
                placeholder="Nova password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirmar password"
                type="password"
                placeholder="Repete a password"
                value={confirm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                required
                error={error}
              />
              <Button type="submit" loading={loading} className="w-full">
                Guardar nova password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
