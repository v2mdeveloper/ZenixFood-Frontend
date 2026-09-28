import './globals.css';

export const metadata = {
  title: 'ZenixFood - Sistema de Gestão para Food Service & Eventos',
  description: 'Gestão completa para Restaurantes, Bares, Baladas e Eventos.',
  manifest: "/manifest.json", // 🔥 Linha Mágica do PWA
  themeColor: "#f58220",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZenixFood",
    },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}