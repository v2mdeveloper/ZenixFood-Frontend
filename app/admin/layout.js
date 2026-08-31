export const metadata = {
  title: 'Cânone Admin Pro',
  description: 'Painel Administrativo da Cânone Burger',
  manifest: '/manifest-admin.json',
};

export const viewport = {
  themeColor: '#f8fafc',
};

export default function AdminLayout({ children }) {
  return <>{children}</>;
}