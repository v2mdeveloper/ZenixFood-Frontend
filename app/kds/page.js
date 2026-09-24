'use client';

import { useState } from 'react';

export default function KDSPage() {
  const [activeTab, setActiveTab] = useState('cozinha');

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      
      {/* HEADER NAVEGAÇÃO */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-[#f58220]">ZENIX</span> KDS
          </a>
          <a href="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Voltar ao Início
          </a>
        </div>
      </header>

      {/* HERO KDS */}
      <section className="py-16 text-center max-w-4xl mx-auto px-6 space-y-4">
        <span className="bg-[#f58220]/20 text-[#f58220] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Kitchen Display System (KDS)
        </span>
        <h1 className="text-4xl sm:text-5xl font-black">
          Comunicação em tempo real para cada praça de produção
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Elimine o uso de impressoras de papel, acompanhe o tempo de preparo (SLA) por item e evite atrasos na entrega dos pedidos.
        </p>
      </section>

      {/* SELETOR DAS 4 TELAS DE KDS */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'cozinha', label: '👨‍🍳 KDS Principal Cozinha' },
            { id: 'bar', label: '🍹 KDS Bar & Bebidas' },
            { id: 'delivery', label: '🛵 KDS Delivery & Expedição' },
            { id: 'cliente', label: '📺 Tela de Senhas / Cliente' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#f58220] text-white shadow-lg shadow-[#f58220]/30 scale-105'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DETALHAMENTO DE CADA KDS */}
        <div className="bg-slate-800/60 border border-slate-700/60 p-8 sm:p-12 rounded-3xl">
          
          {/* 1. KDS COZINHA */}
          {activeTab === 'cozinha' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-700 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">KDS Principal Cozinha</h2>
                  <p className="text-slate-400 text-sm">Focado em praças quentes, grelha, fritura e montagem de pratos.</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-500/30">
                  Timer Visual com Alerta Amarelo/Vermelho por Atraso
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border-2 border-emerald-500/50 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
                    <span>MESA 04 - SALÃO</span>
                    <span className="text-emerald-400 font-black">04:15 min</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-bold text-white">2x Smash Burger Salada</p>
                    <p className="text-xs text-amber-400">└ Sem cebola / Ponto: Ao Ponto</p>
                    <p className="font-bold text-white">1x Batata Rústica GG</p>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs uppercase">
                    Marcar como Pronto
                  </button>
                </div>

                <div className="bg-slate-900 border-2 border-amber-500/50 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
                    <span>COMANDA #108 - BALCÃO</span>
                    <span className="text-amber-400 font-black">12:30 min</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-bold text-white">1x Parmegiana de Filé Mignon</p>
                    <p className="text-xs text-slate-400">└ Molho extra à parte</p>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs uppercase">
                    Marcar como Pronto
                  </button>
                </div>

                <div className="bg-slate-900 border-2 border-red-500/50 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
                    <span>DELIVERY #8821</span>
                    <span className="text-red-400 font-black">18:40 min (ALERTA)</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-bold text-white">1x Pizza Grande Calabresa</p>
                    <p className="text-xs text-slate-400">└ Borda Recheada de Catupiry</p>
                  </div>
                  <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-xs uppercase">
                    Acelerar Preparo
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 text-sm space-y-2">
                <h4 className="font-bold text-[#f58220]">Recursos Especiais da Cozinha:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                  <li>• Agrupamento inteligente de itens iguais de comandas diferentes.</li>
                  <li>• Integração com Touchscreen ou teclado numérico industrial.</li>
                  <li>• Histórico de chamadas concluídas com botão de "Desfazer".</li>
                  <li>• Métrica exata de tempo de preparo de cada cozinheiro.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. KDS BAR */}
          {activeTab === 'bar' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-700 pb-6">
                <h2 className="text-2xl font-black text-white">KDS Bar & Drinks</h2>
                <p className="text-slate-400 text-sm">Especial para preparar chopp, coquetéis elaborados e garrafas sem poluir a tela da cozinha.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-sky-500/40 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>MESA 12</span>
                    <span className="text-sky-400 font-bold">01:10 min</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-white">2x Gin Tônica Red Bull Melancia</p>
                    <p className="font-bold text-white">1x Chopp 500ml Pilsen</p>
                  </div>
                  <button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-xl text-xs uppercase">
                    Liberar Bebidas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. KDS DELIVERY */}
          {activeTab === 'delivery' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-700 pb-6">
                <h2 className="text-2xl font-black text-white">KDS Expedição & Delivery</h2>
                <p className="text-slate-400 text-sm">Conferência de embalagens, lacres, bebidas e atribuição direta para entregadores/motoboys.</p>
              </div>
              <p className="text-slate-300 text-sm">
                Sincronização automática de status com iFood e WhatsApp (&quot;Seu pedido está a caminho!&quot;).
              </p>
            </div>
          )}

          {/* 4. TELA CLIENTE */}
          {activeTab === 'cliente' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-700 pb-6">
                <h2 className="text-2xl font-black text-white">Tela do Cliente (Pass / Chamada de Senhas)</h2>
                <p className="text-slate-400 text-sm">Exibição em TVs de alta definição na área de espera ou balcão de retiradas.</p>
              </div>
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="bg-amber-500/10 border border-amber-500/30 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold text-amber-400 mb-4">EM PREPARO</h3>
                  <div className="text-4xl font-black space-y-2 text-amber-200">
                    <p>#104</p>
                    <p>#105</p>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold text-emerald-400 mb-4">PRONTO PARA RETIRAR</h3>
                  <div className="text-4xl font-black space-y-2 text-emerald-300">
                    <p>#101</p>
                    <p>#102</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}