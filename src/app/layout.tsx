import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shiftera",
  description: "A plataforma que simplifica a gestão de escalas para farmácias, clínicas e laboratórios em Portugal. Cria horários em minutos, não em horas.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Shiftera",
    description: "Gestão de escalas para farmácias, clínicas e laboratórios. Cria horários em minutos.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
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
