'use client';
import { useState, useEffect } from 'react';

export default function CarrosselAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  // Helper local para garantir o envio do x-store-id e Token JWT
 const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    //SE O BACKEND BARRAR POR FALTA DE PAGAMENTO:
    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; // Redireciona para a tela de aviso
      }
    }

    return response;
  };

  useEffect(() => {
    fetchWithStore(`${API_URL}/api/avaliacoes`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setAvaliacoes(data);
      })
      .catch(err => console.error("Erro ao buscar avaliações:", err));
  }, []);

  if (avaliacoes.length === 0) return null;

  return (
    <section className="w-full max-w-4xl mx-auto px-4 mt-8 animate-fade-in-up">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-px bg-gradient-to-r from-transparent to-amber-500/50 flex-1"></div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest text-center flex items-center gap-3 transition-colors duration-300">
          <span className="text-amber-500 text-2xl">⭐</span> 
           O que nossos clientes dizem
           <span className="text-amber-500 text-2xl">⭐</span>
        </h3>
        <div className="h-px bg-gradient-to-l from-transparent to-amber-500/50 flex-1"></div>
      </div>
      
      <div className="flex gap-5 overflow-x-auto pb-8 hide-scrollbar snap-x px-2">
        {avaliacoes.map((av) => (
          <div key={av.id} className="snap-start shrink-0 w-72 md:w-80 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative group hover:border-amber-500 dark:hover:border-amber-500/30 transition-all duration-500 cursor-default flex flex-col">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-amber-500 rounded-b-md opacity-30 group-hover:opacity-100 group-hover:w-24 transition-all duration-300"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-10 bg-amber-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex items-center gap-1 mb-5 relative z-10">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < av.nota ? 'text-amber-500' : 'text-slate-200 dark:text-zinc-700'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            
            <p className="text-slate-600 dark:text-zinc-400 text-sm italic mb-6 line-clamp-4 leading-relaxed font-medium flex-1 transition-colors duration-300">
              "{av.comentario || 'Melhor lanche da região, recomendo demais!'}"
            </p>
            
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-white/5 relative z-10 transition-colors duration-300">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-amber-500 font-black uppercase text-sm border border-slate-200 dark:border-amber-500/20 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 transition-colors">
                {av.clienteNome.charAt(0)}
              </div>
              <span className="font-bold text-slate-900 dark:text-zinc-300 text-sm truncate transition-colors duration-300">{av.clienteNome}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}