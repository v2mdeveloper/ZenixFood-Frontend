'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ZenixLandingPage() {
  const router = useRouter();
  const [storeSlug, setStoreSlug] = useState('');

  const handleSearchStore = (e) => {
    e.preventDefault();
    if (storeSlug.trim()) {
      router.push(`/${storeSlug.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-purple-500 selection:text-white flex flex-col">
      
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <span className="text-xl font-black tracking-tight text-white">Zenix</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-400">
            <a href="#solucoes" className="hover:text-white transition-colors">Soluções</a>
            <a href="#totem" className="hover:text-white transition-colors">Autoatendimento</a>
            <a href="#kds" className="hover:text-white transition-colors">KDS</a>
          </nav>
          <button 
            onClick={() => router.push('/master')}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Área do Parceiro
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-block bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-purple-400 text-xs font-black uppercase tracking-widest mb-2">
              Gestão Inteligente para Food Service
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
              O sistema definitivo para escalar o seu restaurante.
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-lg">
              Cardápio digital, Totem de autoatendimento, KDS para cozinha e emissão fiscal. Tudo em uma única plataforma na nuvem.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="https://wa.me/5511984840258" target="_blank" rel="noopener noreferrer" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-black text-center transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                Falar com Consultor
              </a>
              <a href="#buscar-loja" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-center transition-all">
                Sou Consumidor
              </a>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/30 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="space-y-4">
                <div className="h-8 w-1/3 bg-white/5 rounded-lg animate-pulse"></div>
                <div className="h-32 w-full bg-white/5 rounded-xl"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-white/5 rounded-xl"></div>
                  <div className="h-24 bg-purple-500/20 border border-purple-500/30 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUSCA DE LOJAS PARA O CLIENTE FINAL */}
        <section id="buscar-loja" className="border-y border-white/5 bg-[#121212] py-20">
          <div className="max-w-xl mx-auto px-6 text-center space-y-8">
            <span className="text-5xl">🍔</span>
            <h2 className="text-3xl font-black text-white">Quer fazer um pedido?</h2>
            <p className="text-zinc-400">Digite o nome do restaurante parceiro Zenix para acessar o cardápio digital.</p>
            
            <form onSubmit={handleSearchStore} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                placeholder="Ex: canone-burger" 
                className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-purple-500 font-bold"
              />
              <button type="submit" className="bg-white text-black px-8 py-4 rounded-2xl font-black hover:bg-zinc-200 transition-colors">
                Buscar Cardápio
              </button>
            </form>
          </div>
        </section>

      </main>

      <footer className="bg-black py-12 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-black text-white">Zenix SaaS</span>
        </div>
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} Tecnologia em Food Service. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  );
}