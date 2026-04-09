"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Mapa de Horario</h1>
          <p className="text-gray-500 mt-2">Horarios simples, justos e legais</p>
        </div>

        <Card>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifica o teu email</h2>
              <p className="text-gray-600 mb-4">
                Enviamos um link magico para <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Clica no link no email para entrar. Verifica o spam se nao aparecer.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
              >
                Usar outro email
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Entrar</h2>
              <p className="text-sm text-gray-600">
                Insere o teu email para receberes um link de acesso.
              </p>

              <Input
                label="Email"
                type="email"
                placeholder="nome@empresa.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={error}
              />

              <Button type="submit" loading={loading} className="w-full">
                Enviar link magico
              </Button>

              <p className="text-xs text-center text-gray-500">
                Sem password. Sem complicacoes.
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
