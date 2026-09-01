import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Zenix | Plataforma de Pedidos e Gestão',
  description: 'Sistema completo de multi-atendimento, cardápio digital, delivery e gestão para o seu estabelecimento.',
  openGraph: {
    title: 'Zenix | Sistema de Delivery e Gestão',
    description: 'Plataforma multi-tenant completa para gestão de pedidos, cardápio e atendimento.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Zenix',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-zinc-100 transition-colors duration-500 selection:bg-amber-500 selection:text-black">
        {children}
      </body>
      {/* <GoogleTagManager gtmId="ID-REAL" /> */}
    </html>
  );
}