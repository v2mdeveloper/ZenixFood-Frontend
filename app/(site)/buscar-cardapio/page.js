'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuscarCardapioPage() {
  const [slug, setSlug] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (slug.trim()) {
      router.push(`/${slug.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white py-4 px-6 flex justify-between items-center">
        <a href="/" className="font-black text-[#0e4a56] text-xl">
          ZENIX<span className="text-[#f58220]">FOOD</span>
        </a>
        <a href="/" className="text-xs font-bold text-slate-500 hover:text-[#0e4a56]">Voltar ao Início</a>
      </header>

      <main className="max-w-md w-full mx-auto px-6 py-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-[#f58220]/10 text-[#f58220] rounded-2xl flex items-center justify-center text-3xl mx-auto">
            🔍
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#0e4a56]">Buscar Cardápio Digital</h1>
            <p className="text-slate-500 text-xs">
              Digite o nome do estabelecimento para abrir o cardápio e fazer seu pedido.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex: zenix-burger-artesanal"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:border-[#0e4a56]"
            />
            <button
              type="submit"
              className="w-full bg-[#f58220] hover:bg-[#e07318] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors"
            >
              Acessar Cardápio
            </button>
          </form>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        © 2026 ZenixFood • Plataforma de Pedidos Online
      </footer>
    </div>
  );
}