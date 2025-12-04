import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme"; // importa o provider

// fontes
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyFarm",
  description: "Sistema de Gerenciamento de Granjas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* 
        IMPORTANTÍSSIMO:
        - suppressHydrationWarning evita erros ao alternar dark/light
      */}

      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          overflow-x-hidden
          min-h-screen
          bg-(--color-bg)
          text-(--color-text-main)
        `}
      >
        {/* Provider que controla tema + dark/light */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
