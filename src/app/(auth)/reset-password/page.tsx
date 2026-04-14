"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import {
  validatePasswordStrength,
  MIN_PASSWORD_LENGTH,
} from "@/lib/password-policy";

export default function ResetPasswordPage() {
  const router = useRouter();
  const tPwd = useTranslations("passwordPolicy");
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
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.ok) {
      setError(tPwd(pwdCheck.issue!, { min: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (password !== confirm) {
      setError(tPwd("mismatch"));
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
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)] px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2.5 justify-center mb-10">
          <svg viewBox="0 0 96 106" className="w-9 h-10">
            <rect x="4" y="22" width="88" height="76" rx="10" ry="10" fill="#E8850A" />
            <rect x="4" y="22" width="88" height="26" rx="10" ry="10" fill="#D47608" />
            <rect x="4" y="38" width="88" height="10" fill="#D47608" />
            <rect x="26" y="10" width="8" height="22" rx="4" fill="#E8850A" />
            <rect x="62" y="10" width="8" height="22" rx="4" fill="#E8850A" />
            <circle cx="28" cy="57" r="3" fill="#FFF" opacity="0.9" />
            <circle cx="48" cy="57" r="3" fill="#FFF" opacity="0.9" />
            <circle cx="68" cy="57" r="3" fill="#FFF" opacity="0.9" />
            <circle cx="28" cy="72" r="3" fill="#FFF" opacity="0.9" />
            <circle cx="48" cy="72" r="3" fill="#FFF" opacity="0.9" />
            <circle cx="68" cy="72" r="3" fill="#FFF" opacity="0.9" />
            <circle cx="28" cy="87" r="3" fill="#FFF" opacity="0.9" />
            <circle cx="48" cy="87" r="3" fill="#FFF" opacity="0.9" />
            <circle cx="68" cy="87" r="3" fill="#FFF" opacity="0.9" />
          </svg>
          <span className="font-display text-xl font-semibold" style={{ color: '#E8850A' }}>
            Shiftera
          </span>
        </Link>

        <div className="bg-[color:var(--surface)] rounded-2xl border border-[color:var(--border)] p-8 shadow-sm">
          {checkingSession ? (
            <p className="text-sm text-[color:var(--text-secondary)]">A verificar sessão...</p>
          ) : !hasSession ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-[color:var(--primary)]">Link inválido ou expirado</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                O link que usaste já não é válido. Pede um novo link de recuperação.
              </p>
              <Link href="/forgot-password" className="block text-center text-sm font-medium text-[color:var(--accent)] hover:underline">
                Pedir novo link
              </Link>
            </div>
          ) : done ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[color:var(--success-soft)] mb-2">
                <svg className="w-6 h-6 text-[color:var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 12l5 5L20 6" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-[color:var(--primary)]">Password atualizada</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">A redirecionar para o dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-[color:var(--primary)]">Nova password</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Escolhe uma password com pelo menos 8 caracteres.
              </p>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5">
                  Nova password
                </label>
                <input
                  type="password"
                  placeholder="Nova password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5">
                  Confirmar password
                </label>
                <input
                  type="password"
                  placeholder="Repete a password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--primary-hover)] active:scale-[0.99] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "A guardar..." : "Guardar nova password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
