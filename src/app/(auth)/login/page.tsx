"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
          <h1 className="text-3xl font-bold text-indigo-600">Mapa de Horario</h1>
          <p className="text-stone-500 mt-2">Horarios simples, justos e legais</p>
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
      </div>
    </div>
  );
}
