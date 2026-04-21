"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShifteraLockup } from "@/components/lp/ShifteraLogo";
import "../auth.css";

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
    <div className="auth-page">
      <div className="min-h-screen flex items-center justify-center px-4" style={{background:'var(--paper)'}}>
        <div className="w-full max-w-md">
          <Link href="/login" className="flex justify-center mb-10" aria-label="Shiftera home">
            <ShifteraLockup size={36} />
          </Link>

          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            {sent ? (
              <div className="space-y-4">
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 48, height: 48, borderRadius: 14,
                  background: 'var(--auth-accent-soft)', marginBottom: 8,
                }}>
                  <svg style={{ width: 24, height: 24, color: 'var(--auth-accent-ink)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                </div>
                <h2 className="heading" style={{fontSize: '22px'}}>Verifica o teu email</h2>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  Se existe uma conta associada a <strong style={{ color: 'var(--ink)' }}>{email}</strong>, enviamos um link para definires uma nova password. O link expira em 1 hora.
                </p>
                <Link href="/login" className="text-link" style={{display: 'block', textAlign: 'center', marginTop: '16px', fontSize: '14px'}}>
                  Voltar ao login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="heading" style={{fontSize: '22px'}}>Esqueci a password</h2>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  Indica o email da tua conta. Vamos enviar-te um link para definires uma nova password.
                </p>

                {error && <div className="error-box">{error}</div>}

                <div>
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    placeholder="nome@empresa.pt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "A enviar..." : "Enviar link de recuperação"}
                </button>

                <Link href="/login" className="text-link" style={{display: 'block', textAlign: 'center', fontSize: '14px'}}>
                  Voltar ao login
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
