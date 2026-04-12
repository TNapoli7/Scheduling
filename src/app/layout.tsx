import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mapa de Horário",
  description: "A plataforma que simplifica a gestão de escalas para farmácias, clínicas e laboratórios em Portugal. Cria horários em minutos, não em horas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
