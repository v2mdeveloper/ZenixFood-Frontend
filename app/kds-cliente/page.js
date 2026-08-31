'use client';
import { useState, useEffect, useRef } from 'react';

export default function KdsClientePage() {
  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://canone-backend.onrender.com';

  const [totemOrders, setTotemOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const announcedOrders = useRef(new Set());

  // =========================================================
  // EXTRATOR INTELIGENTE DE NOME (Lê o nome real do Totem)
  // =========================================================
  const extractFirstName = (order) => {
    if (order.origin === 'TOTEM' && order.address) {
      // Procura o nome que foi salvo no formato: "[TOTEM BALCÃO] Cliente: Nome | OBS: ..."
      const match = order.address.match(/Cliente:\s*(.*?)(?:\s*\||$)/);
      if (match && match[1]) {
         return match[1].trim().split(' ')[0]; // Retorna apenas o Primeiro Nome
      }
    }
    // Fallback padrão
    return order.client?.name ? order.client.name.split(' ')[0] : 'Cliente';
  };

  // =========================================================
  // 1. BUSCA DE DADOS (ATUALIZA A CADA 4 SEGUNDOS)
  // =========================================================
  useEffect(() => {
    fetchKdsData();
    const interval = setInterval(fetchKdsData, 4000);
    const clock = setInterval(() => setNow(Date.now()), 10000); // Atualiza o relógio a cada 10s
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  const fetchKdsData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/kds`);
      if (res.ok) {
        const data = await res.json();
        setTotemOrders(data.totemOrders || []);
      }
    } catch (e) {
      console.error("Erro ao buscar dados do KDS Cliente");
    }
    setLoading(false);
  };

  // =========================================================
  // 2. FILTRAGEM E LIMPEZA AUTOMÁTICA (60 MINUTOS)
  // =========================================================
  const TEMPO_LIMPEZA_MS = 60 * 60 * 1000; // 60 minutos em milissegundos

  const preparingOrders = totemOrders.filter(o => o.status === 'PREPARING');
  
  const readyOrders = totemOrders.filter(o => {
    if (o.status !== 'READY') return false;
    const orderTime = new Date(o.updatedAt || o.createdAt).getTime();
    if (now - orderTime > TEMPO_LIMPEZA_MS) return false;
    return true;
  });

  // =========================================================
  // 3. SISTEMA DE CHAMADA POR VOZ (TEXT-TO-SPEECH)
  // =========================================================
  useEffect(() => {
    readyOrders.forEach(order => {
      if (!announcedOrders.current.has(order.id)) {
        announcedOrders.current.add(order.id);
        
        if ('speechSynthesis' in window) {
          const nomeCliente = extractFirstName(order);
          const text = `Pedido ${order.shortId}, ${nomeCliente}. Pronto para retirada.`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'pt-BR';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    });
  }, [readyOrders]);

  const handleFullscreen = () => {
    if (typeof document !== 'undefined') {
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) docEl.requestFullscreen().catch(()=>{});
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-amber-500 font-black text-2xl">
         <span className="text-6xl mb-4 animate-bounce">📺</span>
         Carregando Painel de Chamadas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col overflow-hidden cursor-pointer selection:bg-transparent" onClick={handleFullscreen}>
      
      {/* CABEÇALHO DA TV */}
      <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🍔</span>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Cânone Burger</h1>
            <p className="text-amber-600 font-bold tracking-widest uppercase text-sm mt-1">Acompanhe o seu Pedido</p>
          </div>
        </div>
        <div className="text-right">
           <p className="text-4xl font-black text-slate-700">{new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </header>

      {/* GRID DE DUAS COLUNAS */}
      <main className="flex-1 flex w-full">
        
        {/* COLUNA 1: EM PREPARO */}
        <section className="w-1/2 border-r border-slate-200 flex flex-col bg-slate-50">
           <div className="bg-amber-100 border-b border-amber-200 p-6 text-center shadow-sm shrink-0">
              <h2 className="text-4xl font-black text-amber-800 uppercase tracking-widest flex items-center justify-center gap-4">
                 <span>🔥</span> Preparando
              </h2>
           </div>
           
           <div className="flex-1 p-8 overflow-y-hidden flex flex-wrap content-start gap-6">
              {preparingOrders.map(order => (
                 <div key={order.id} className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
                    <span className="text-6xl font-black text-amber-500 tracking-tighter">#{order.shortId}</span>
                    <span className="text-3xl font-bold text-slate-700 truncate max-w-[50%] text-right uppercase">
                       {extractFirstName(order)}
                    </span>
                 </div>
              ))}
              {preparingOrders.length === 0 && (
                 <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                    <span className="text-6xl mb-4">👨‍🍳</span>
                    <p className="text-2xl font-bold text-slate-400">Nenhum pedido na grelha</p>
                 </div>
              )}
           </div>
        </section>

        {/* COLUNA 2: PRONTOS PARA RETIRAR */}
        <section className="w-1/2 flex flex-col bg-slate-100">
           <div className="bg-emerald-100 border-b border-emerald-200 p-6 text-center shadow-sm shrink-0">
              <h2 className="text-4xl font-black text-emerald-800 uppercase tracking-widest flex items-center justify-center gap-4">
                 <span>🛎️</span> Prontos para Retirar
              </h2>
           </div>
           
           <div className="flex-1 p-8 overflow-y-hidden flex flex-wrap content-start gap-6">
              {readyOrders.map((order, index) => (
                 <div key={order.id} className={`w-full bg-emerald-50 border-4 border-emerald-500 rounded-[2rem] p-6 flex items-center justify-between shadow-md ${index === 0 ? 'animate-pulse scale-105 my-2' : ''}`}>
                    <span className="text-7xl font-black text-emerald-600 tracking-tighter drop-shadow-sm">#{order.shortId}</span>
                    <span className="text-4xl font-black text-emerald-900 truncate max-w-[50%] text-right uppercase">
                       {extractFirstName(order)}
                    </span>
                 </div>
              ))}
              {readyOrders.length === 0 && (
                 <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                    <span className="text-6xl mb-4">🛍️</span>
                    <p className="text-2xl font-bold text-slate-400">Nenhum pedido aguardando</p>
                 </div>
              )}
           </div>
        </section>

      </main>

      {/* RODAPÉ INFORMATIVO */}
      <footer className="bg-white border-t border-slate-200 p-4 text-center shrink-0">
         <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">
            Fique atento ao seu número na tela. Os pedidos não retirados em 60 minutos saem do painel.
         </p>
      </footer>

    </div>
  );
}