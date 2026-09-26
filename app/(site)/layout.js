'use client';

import { useRouter } from 'next/navigation';

export default function SiteLayout({ children }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-[#f58220] selection:text-white">
      
      {/* HEADER GLOBAL DO SITE */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="ZenixFood Logo" 
              className="h-12 md:h-16 w-auto object-contain transition-transform hover:scale-105" 
            />
          </a>
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-600">
            <a href="/solucoes" className="hover:text-[#0e4a56] transition-colors">Soluções</a>
            <a href="/autoatendimento" className="hover:text-[#0e4a56] transition-colors">Autoatendimento</a>
            <a href="/kds" className="hover:text-[#0e4a56] transition-colors">KDS Cozinha & Bar</a>
            <a href="/integracoes" className="hover:text-[#0e4a56] transition-colors">Integrações</a>
            <a href="/bi" className="hover:text-[#0e4a56] transition-colors">B.I Analytics</a>
            <a href="/buscar-cardapio" className="text-[#f58220] hover:text-[#e07318] font-black">Buscar Cardápio</a>
          </nav>

          <button 
            onClick={() => router.push('/master')} 
            className="bg-[#0e4a56] hover:bg-[#0a3842] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#0e4a56]/10 active:scale-95"
          >
            Acessar Sistema
          </button>
        </div>
      </header>

      {/* CONTEÚDO DINÂMICO DAS PÁGINAS */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER GLOBAL DO SITE */}
      <footer className="border-t border-slate-200 bg-slate-100 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2">
             <img src="/logo.png" alt="ZenixFood Logo" className="h-8 w-auto opacity-80 grayscale hover:grayscale-0 transition-all" />
             <p className="font-bold text-[#0e4a56] mt-2">© {new Date().getFullYear()} ZenixFood. Todos os direitos reservados.</p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-6 font-semibold">
            <a href="/solucoes" className="hover:text-[#0e4a56] transition-colors">Soluções</a>
            <a href="/autoatendimento" className="hover:text-[#0e4a56] transition-colors">Autoatendimento</a>
            <a href="/kds" className="hover:text-[#0e4a56] transition-colors">KDS Cozinha & Bar</a>
            <a href="/integracoes" className="hover:text-[#0e4a56] transition-colors">Integrações</a>
            <a href="/bi" className="hover:text-[#0e4a56] transition-colors">B.I Analytics</a>
            <a href="/buscar-cardapio" className="hover:text-[#f58220] transition-colors">Buscar Cardápio</a>
          </div>
        </div>
      </footer>

    </div>
  );
}