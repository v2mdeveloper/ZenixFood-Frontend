'use client';

import { useState } from 'react';

export default function KDSPage() {
  const [activeTab, setActiveTab] = useState('cozinha');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* HEADER NAVEGAÇÃO TEMA CLARO */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-black text-[#0e4a56] flex items-center gap-2">
            ZENIX <span className="text-[#f58220]">KDS MULTI-TELAS</span>
          </a>
          <a href="/" className="text-xs font-bold text-slate-500 hover:text-[#0e4a56]">
            ← Voltar ao Início
          </a>
        </div>
      </header>

      {/* HERO KDS */}
      <section className="py-12 text-center max-w-4xl mx-auto px-6 space-y-3">
        <span className="bg-[#f58220]/10 text-[#f58220] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Kitchen Display System Sincronizado
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0e4a56]">
          Automação Total da Cozinha, Bar e Expedição
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Elimine o papel, reduza o tempo de espera dos clientes e receba alertas sonoros e visuais quando um pedido exceder o tempo limite estipulado.
        </p>
      </section>

      {/* SELETOR DE PRAÇAS */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { id: 'cozinha', label: '👨‍🍳 KDS Cozinha (Grelha & Fritura)' },
            { id: 'bar', label: '🍹 KDS Bar & Drinks' },
            { id: 'delivery', label: '🛵 KDS Expedição & Delivery' },
            { id: 'cliente', label: '📺 Painel TV / Chamada de Senhas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0e4a56] text-white shadow-lg shadow-[#0e4a56]/20 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTAINER PRINCIPAL DAS TELAS */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-md">
          
          {/* 1. COZINHA */}
          {activeTab === 'cozinha' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0e4a56]">Visor do Chef / Cozinha Quente</h2>
                  <p className="text-xs text-slate-500">Ordenado por tempo de espera decrescente</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded">No Prazo (&lt;10m)</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded">Atenção (10-15m)</span>
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded">Atrasado (&gt;15m)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* PEDIDO 1 */}
                <div className="bg-slate-50 border-2 border-emerald-400 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold border-b border-slate-200 pb-2">
                    <span className="text-[#0e4a56]">MESA 08 • SALÃO</span>
                    <span className="text-emerald-600 font-black">03:45 min</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-900 text-sm">2x Smash Burger Gorgonzola</p>
                    <p className="text-slate-500 pl-2">└ Ponto: Ao Ponto / Sem cebola</p>
                    <p className="font-bold text-slate-900 text-sm">1x Batata Rústica GG</p>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase">
                    Concluir Preparo
                  </button>
                </div>

                {/* PEDIDO 2 */}
                <div className="bg-slate-50 border-2 border-amber-400 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold border-b border-slate-200 pb-2">
                    <span className="text-[#0e4a56]">COMANDA #102 • BALCÃO</span>
                    <span className="text-amber-600 font-black">11:20 min</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-900 text-sm">1x Parmegiana Mignon Família</p>
                    <p className="text-slate-500 pl-2">└ Acompanha Arroz e Batata Palito</p>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase">
                    Concluir Preparo
                  </button>
                </div>

                {/* PEDIDO 3 */}
                <div className="bg-slate-50 border-2 border-red-500 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold border-b border-slate-200 pb-2">
                    <span className="text-[#0e4a56]">DELIVERY #9921 • iFood</span>
                    <span className="text-red-600 font-black">17:10 min (ALERTA)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-900 text-sm">1x Pizza Calabresa com Catupiry</p>
                    <p className="text-slate-500 pl-2">└ Borda recheada de pão de alho</p>
                  </div>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase">
                    Acelerar na Grelha
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* 2. BAR */}
          {activeTab === 'bar' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0e4a56]">Praça de Bebidas e Coquetelaria</h2>
              <p className="text-xs text-slate-500">Pedidos de chopp, drinks e sucos saem diretamente nesta tela sem sobrecarregar a cozinha.</p>
            </div>
          )}

          {/* 3. DELIVERY */}
          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0e4a56]">Expedição & Conferência de Embalagens</h2>
              <p className="text-xs text-slate-500">Conferência final de itens com impressão de etiquetas de lacre de segurança antes da entrega ao motoboy.</p>
            </div>
          )}

          {/* 4. TELA CLIENTE */}
          {activeTab === 'cliente' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0e4a56]">Painel de Chamada em TV para Clientes</h2>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                  <h3 className="font-bold text-amber-800 text-sm mb-4">EM PREPARO</h3>
                  <div className="text-3xl font-black text-amber-900 space-y-2">
                    <p>#104</p>
                    <p>#105</p>
                  </div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                  <h3 className="font-bold text-emerald-800 text-sm mb-4">PRONTO PARA RETIRAR</h3>
                  <div className="text-3xl font-black text-emerald-900 space-y-2">
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