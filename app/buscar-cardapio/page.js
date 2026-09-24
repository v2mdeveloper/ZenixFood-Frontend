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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center px-6">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 space-y-6 text-center">
        <div className="w-16 h-16 bg-[#f58220]/20 text-[#f58220] rounded-2xl flex items-center justify-center text-3xl mx-auto">
          🍽️ 🥂
        </div>
        <h1 className="text-2xl font-black">Acessar Cardápio Digital</h1>
        <p className="text-slate-400 text-xs">
          Digite o código ou nome do estabelecimento para abrir o cardápio e realizar seu pedido.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Ex: zenixfood-burger"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#f58220]"
          />
          <button
            type="submit"
            className="w-full bg-[#f58220] hover:bg-[#e07318] py-3.5 rounded-xl font-bold text-sm transition-colors"
          >
            Acessar Cardápio
          </button>
        </form>
      </div>
    </div>
  );
}