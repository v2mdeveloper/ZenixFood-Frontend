'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function MasterLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Evita erros de hidratação no Next.js
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = (path) => pathname === path;

  // Função para fazer logout seguro e recarregar a tela
  const handleLogout = () => {
    localStorage.removeItem('zenix_master_token');
    localStorage.removeItem('zenix_super_token');
    localStorage.removeItem('zenix_user');
    window.location.href = '/master'; 
  };

  if (!isClient) return null; 

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-[#f58220] selection:text-white">
      
      {/* SIDEBAR RETRÁTIL - TEMA CLARO */}
      <aside 
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex-col hidden md:flex shrink-0 transition-all duration-300 relative z-20`}
      >
        {/* Botão de Colapsar */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-white border border-slate-200 text-slate-500 rounded-full w-6 h-6 flex items-center justify-center hover:bg-slate-100 hover:text-[#0e4a56] shadow-sm z-10 font-black text-xs cursor-pointer"
        >
          {isCollapsed ? '▶' : '◀'}
        </button>

        <div className={`p-6 border-b border-slate-200 flex flex-col justify-center ${isCollapsed ? 'items-center px-2' : ''} h-[88px] overflow-hidden shrink-0`}>
          {isCollapsed ? (
            <span className="text-3xl font-black text-[#0e4a56]">Z</span>
          ) : (
            <>
              <h1 className="text-2xl font-black text-[#0e4a56] tracking-tight whitespace-nowrap">
                ZENIX<span className="text-[#f58220]">MASTER</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 whitespace-nowrap">
                Governança Global
              </p>
            </>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar overflow-x-hidden">
          {/* O Dashboard e as Lojas Clientes agora são o mesmo botão para evitar o erro 404 */}
          <SidebarItem 
            icon="📊" label="Dashboard & Lojas" 
            isActive={isActive('/master')} onClick={() => router.push('/master')} isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon="⭐" label="Planos SaaS" 
            isActive={isActive('/master/planos')} onClick={() => router.push('/master/planos')} isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon="🏢" label="Franquias" 
            isActive={isActive('/master/franquias')} onClick={() => router.push('/master/franquias')} isCollapsed={isCollapsed} 
          />
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2 shrink-0">
          <SidebarItem 
            icon="🌐" label="Voltar ao Site" 
            onClick={() => router.push('/')} isCollapsed={isCollapsed} 
          />
          <SidebarItem 
            icon="🚪" label="Sair do Sistema" 
            onClick={handleLogout} isCollapsed={isCollapsed} 
            isDanger
          />
        </div>
      </aside>

      {/* CONTEÚDO DINÂMICO DAS PÁGINAS DO MASTER */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        
        {/* Header Mobile (Telas pequenas) */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
          <h1 className="text-lg font-black text-[#0e4a56]">
            ZENIX<span className="text-[#f58220]">MASTER</span>
          </h1>
          <div className="flex gap-4">
            <button onClick={() => router.push('/')} className="text-xs font-bold text-slate-500">Site</button>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500">Sair</button>
          </div>
        </header>

        {/* Renderização da Página */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}

// Componente auxiliar para os botões do menu
function SidebarItem({ icon, label, isActive, onClick, isCollapsed, isDanger }) {
  const baseClass = isDanger 
    ? "text-red-500 hover:bg-red-50" 
    : isActive 
      ? "bg-[#0e4a56] text-white shadow-md" 
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
      
  return (
    <button 
      onClick={onClick}
      title={isCollapsed ? label : ''}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${baseClass}`}
    >
      <span className="text-xl shrink-0">{icon}</span>
      {!isCollapsed && <span className="ml-3 truncate">{label}</span>}
    </button>
  );
}