"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui" }}>
          <div style={{ textAlign: "center", maxWidth: 420, padding: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Algo correu mal</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>Ocorreu um erro inesperado. A equipa foi notificada.</p>
            <button onClick={reset} style={{ padding: "0.625rem 1.25rem", background: "#0F1B2D", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
