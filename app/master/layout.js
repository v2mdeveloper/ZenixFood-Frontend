'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function MasterLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // Função simples para saber se o link está ativo
  const isActive = (path) => pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* SIDEBAR EXCLUSIVA DO MASTER (Não aparece no site) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black text-white tracking-tight">
            ZENIX<span className="text-amber-500">MASTER</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Governança Global
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => router.push('/master')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              isActive('/master') 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">📊</span> Dashboard
          </button>

          <button 
            onClick={() => router.push('/master/stores')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              isActive('/master/stores') 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">🏪</span> Lojas Clientes
          </button>

          <button 
            onClick={() => router.push('/master/planos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              isActive('/master/planos') 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">⭐</span> Planos SaaS
          </button>

          <button 
            onClick={() => router.push('/master/franquias')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              isActive('/master/franquias') 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">🏢</span> Franquias
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <span className="text-lg">🌐</span> Voltar ao Site
          </button>
        </div>
      </aside>

      {/* CONTEÚDO DINÂMICO DAS PÁGINAS DO MASTER */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
        
        {/* Header Mobile do Master (Só aparece em telas pequenas) */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shrink-0">
          <h1 className="text-lg font-black text-white">
            ZENIX<span className="text-amber-500">MASTER</span>
          </h1>
          <button onClick={() => router.push('/')} className="text-xs font-bold text-slate-400">Sair</button>
        </header>

        {/* Aqui é onde a page.js do master é renderizada */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}