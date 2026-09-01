export const metadata = {
  title: 'Instalador do Totem',
  description: 'Instalação do Autoatendimento',
  manifest: '/manifest-totem.json',
};

export const viewport = {
  themeColor: '#0a0a0a',
};

export default function TotemLayout({ children }) {
  return <>{children}</>;
}