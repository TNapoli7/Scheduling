"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/callback?next=/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Mapa de Horário</h1>
          <p className="text-stone-500 mt-2">Recuperar acesso</p>
        </div>
        <Card>
          {sent ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">Verifica o teu email</h2>
              <p className="text-sm text-stone-600">
                Se existe uma conta associada a <strong>{email}</strong>, enviamos um link
                para definires uma nova password. O link expira em 1 hora.
              </p>
              <Link href="/login" className="block text-center text-sm text-indigo-600 hover:text-indigo-700">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-900">Esqueci a password</h2>
              <p className="text-sm text-stone-600">
                Indica o email da tua conta. Vamos enviar-te um link para
                definires uma nova password.
              </p>
              <Input
                label="Email"
                type="email"
                placeholder="nome@empresa.pt"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                error={error}
              />
              <Button type="submit" loading={loading} className="w-full">
                Enviar link de recuperação
              </Button>
              <Link href="/login" className="block text-center text-sm text-indigo-600 hover:text-indigo-700">
                Voltar ao login
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
