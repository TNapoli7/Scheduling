"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
          {sent ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[color:var(--success-soft)] mb-2">
                <svg className="w-6 h-6 text-[color:var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 12l5 5L20 6" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-[color:var(--primary)]">Verifica o teu email</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Se existe uma conta associada a <strong className="text-[color:var(--primary)]">{email}</strong>, enviamos um link para definires uma nova password. O link expira em 1 hora.
              </p>
              <Link
                href="/login"
                className="block text-center text-sm font-medium text-[color:var(--accent)] hover:underline mt-4"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-[color:var(--primary)]">Esqueci a password</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Indica o email da tua conta. Vamos enviar-te um link para definires uma nova password.
              </p>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nome@empresa.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-[color:var(--border)] bg-white text-[color:var(--primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-soft)] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[color:var(--accent)] text-white font-semibold hover:bg-[color:var(--accent-hover)] active:scale-[0.99] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "A enviar..." : "Enviar link de recuperação"}
              </button>

              <Link
                href="/login"
                className="block text-center text-sm font-medium text-[color:var(--accent)] hover:underline"
              >
                Voltar ao login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
