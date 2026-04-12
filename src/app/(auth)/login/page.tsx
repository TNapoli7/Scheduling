"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-stone-900">Mapa de Horário</span>
          </Link>
          <p className="text-stone-500 text-sm">Horários simples, justos e legais</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-xl font-semibold text-stone-900">Entrar</h2>
            <p className="text-sm text-stone-600">
              Insere o teu email e password para aceder.
            </p>

            <Input
              label="Email"
              type="email"
              placeholder="nome@empresa.pt"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="A tua password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              error={error}
            />

            <Button type="submit" loading={loading} className="w-full">
              Entrar
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-sm text-stone-500 text-center">
          Não tens conta?{" "}
          <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
