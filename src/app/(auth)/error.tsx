"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Auth Error]", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        background: "var(--background)",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-md)",
            background: "var(--danger-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            fontSize: 22,
          }}
        >
          !
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "0 0 0.5rem",
          }}
        >
          Erro de autenticação
        </h2>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            margin: "0 0 1.5rem",
          }}
        >
          Não foi possível completar a operação. Tente novamente ou volte à
          página de login.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--primary-foreground)",
              background: "var(--primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--primary)")
            }
          >
            Tentar novamente
          </button>

          <a
            href="/login"
            style={{
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              transition: "border-color 0.15s ease",
            }}
          >
            Voltar ao login
          </a>
        </div>
      </div>
    </div>
  );
}
