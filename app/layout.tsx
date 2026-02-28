import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LegadoClaro — Planificación Patrimonial Digital",
    template: "%s | LegadoClaro",
  },
  description:
    "Crea tu testamento legalmente estructurado en minutos. Planificación patrimonial profesional con revisión de abogado y notarización disponibles.",
  keywords: [
    "testamento",
    "planificación patrimonial",
    "último testamento",
    "testamento en línea",
    "abogado de herencias",
    "beneficiario",
    "herencia",
    "albacea",
  ],
  openGraph: {
    type: "website",
    locale: "es_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "LegadoClaro",
    title: "LegadoClaro — Planificación Patrimonial Digital",
    description:
      "Crea tu testamento en línea con respaldo legal. Revisión de abogado y notarización disponibles.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans min-h-screen bg-background">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </body>
    </html>
  );
}
