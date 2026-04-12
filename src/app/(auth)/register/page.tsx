"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-900">
              Mapa de Horário
            </span>
          </Link>

          {success ? (
            /* Success state */
            <Card padding="lg">
              <div className="text-center py-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "var(--accent-light, #CCFBF1)" }}
                >
                  <Check className="w-7 h-7" style={{ color: "var(--accent)" }} />
                </div>
                <h2 className="text-xl font-semibold text-stone-900 mb-2">
                  Verifica o teu email
                </h2>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Enviámos um link de confirmação para{" "}
                  <span className="font-medium text-stone-700">{email}</span>.
                  <br />
                  Clica no link para ativar a conta e começar a configurar.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium transition-colors"
                  style={{ color: "var(--primary)" }}
                >
                  Ir para o login
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ) : (
            /* Registration form */
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-stone-900">
                  Criar conta
                </h1>
                <p className="text-sm text-stone-500 mt-1">
                  14 dias grátis. Sem cartão de crédito.
                </p>
              </div>

              <Card padding="lg">
                <form onSubmit={handleRegister} className="space-y-4">
                  <Input
                    label="Email profissional"
                    type="email"
                    placeholder="nome@empresa.pt"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                  <Input
                    label="Confirmar password"
                    type="password"
                    placeholder="Repete a password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    error={error}
                  />

                  <Button type="submit" loading={loading} className="w-full">
                    Criar conta grátis
                  </Button>

                  <p className="text-xs text-stone-400 text-center">
                    Ao registares-te, aceitas os{" "}
                    <a href="#" className="underline hover:text-stone-600">
                      Termos de Serviço
                    </a>{" "}
                    e a{" "}
                    <a href="#" className="underline hover:text-stone-600">
                      Política de Privacidade
                    </a>
                    .
                  </p>
                </form>
              </Card>

              <p className="mt-6 text-sm text-stone-500 text-center">
                Já tens conta?{" "}
                <Link
                  href="/login"
                  className="font-medium hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right: Social proof / Benefits (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-center w-[480px] px-12 py-12"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Junta-te às equipas que já simplificaram os seus horários
          </h2>
          <p className="text-indigo-200 text-sm mb-10">
            Farmácias, clínicas e laboratórios usam o Mapa de Horário para
            poupar tempo e evitar conflitos.
          </p>

          <div className="space-y-5">
            {[
              "Escalas prontas em minutos, não em horas",
              "Trocas de turno sem confusão",
              "Distribuição justa de fins-de-semana",
              "Exportar PDF para afixar na loja",
              "Conforme legislação laboral portuguesa",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
