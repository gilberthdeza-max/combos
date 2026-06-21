import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Punto E — Combos Familiares y de Aseo",
  description:
    "Catálogo de combos de alimentación y aseo personal. Selecciona tu combo, revisa el contenido y ordena en segundos por WhatsApp.",
  keywords: ["combos", "familia", "aseo", "alimentación", "delivery"],
  openGraph: {
    title: "Punto E — Combos Familiares y de Aseo",
    description: "Selecciona tu combo y ordena por WhatsApp en segundos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF9] dark:bg-[#0C0C0C]">
        {children}
      </body>
    </html>
  );
}
