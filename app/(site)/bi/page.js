'use client';

import { useState } from 'react';

export default function BIAnalyticsPage() {
  const [periodo, setPeriodo] = useState('30dias');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* NAVBAR B.I TEMA CLARO */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-black text-[#0e4a56] flex items-center gap-2">
            ZENIX <span className="text-[#f58220]">ANALYTICS B.I</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ● Sincronizado ao Vivo
            </span>
            <a href="/" className="text-xs font-bold text-slate-500 hover:text-[#0e4a56]">
              ← Voltar ao Início
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* CABEÇALHO DO DASHBOARD E FILTROS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <span className="text-xs font-black text-[#f58220] uppercase tracking-wider">Módulo de Inteligência de Negócio</span>
            <h1 className="text-3xl font-black text-[#0e4a56] mt-1">Dashboard Executivo & Relatórios B.I</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Análise profunda de faturamento, margem de lucro por prato, eficiência do garçom e comportamento dos clientes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: '7dias', label: '7 Dias' },
              { id: '30dias', label: 'Últimos 30 Dias' },
              { id: 'ano', label: 'Ano Atual' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodo(p.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  periodo === p.id
                    ? 'bg-[#0e4a56] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* METRIC CARDS SUPERIORES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Faturamento Bruto</span>
            <p className="text-3xl font-black text-[#0e4a56]">R$ 184.920,00</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <span>↑ +18.4%</span>
              <span className="text-slate-400 font-normal">vs. período anterior</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ticket Médio / Comanda</span>
            <p className="text-3xl font-black text-[#f58220]">R$ 142,50</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <span>↑ +12.1%</span>
              <span className="text-slate-400 font-normal">impulsionado por Totens</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">CMV Global (Custo Mercadoria)</span>
            <p className="text-3xl font-black text-sky-700">27.8%</p>
            <div className="flex items-center gap-1 text-xs text-sky-600 font-bold">
              <span>✓ Dentro da Meta</span>
              <span className="text-slate-400 font-normal">(limite 30%)</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Giro de Mesas / Atendimento</span>
            <p className="text-3xl font-black text-emerald-700">38 min</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <span>⚡ 14% mais rápido</span>
              <span className="text-slate-400 font-normal">com KDS</span>
            </div>
          </div>

        </div>

        {/* SEÇÃO DE GRÁFICOS VISUAIS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GRÁFICO 1: FATORAMENTO POR HORA / DIA (SVG BAR CHART) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-[#0e4a56]">Distribuição de Vendas por Horário de Pico</h3>
                <p className="text-xs text-slate-500">Volume financeiro acumulado ao longo do dia</p>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                Pico: 20h00 - 22h00
              </span>
            </div>

            {/* BARS CHART REPRESENTATION */}
            <div className="pt-6 pb-2">
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {[
                  { hora: '12h', alt: 'h-20', val: 'R$ 12k' },
                  { hora: '14h', alt: 'h-16', val: 'R$ 9k' },
                  { hora: '16h', alt: 'h-10', val: 'R$ 5k' },
                  { hora: '18h', alt: 'h-28', val: 'R$ 18k' },
                  { hora: '20h', alt: 'h-44', val: 'R$ 38k' },
                  { hora: '21h', alt: 'h-48', val: 'R$ 42k' },
                  { hora: '22h', alt: 'h-36', val: 'R$ 29k' },
                  { hora: '23h', alt: 'h-24', val: 'R$ 15k' },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow">
                      {bar.val}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden flex items-end">
                      <div className={`w-full bg-gradient-to-t from-[#0e4a56] to-[#f58220] ${bar.alt} rounded-t-lg transition-all group-hover:brightness-110`}></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{bar.hora}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 block">Almoço (12h-15h)</span>
                <span className="font-bold text-[#0e4a56]">R$ 38.400 (21%)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 block">Happy Hour (18h-20h)</span>
                <span className="font-bold text-[#0e4a56]">R$ 44.100 (24%)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 block">Jantar/Noite (20h-00h)</span>
                <span className="font-bold text-[#f58220]">R$ 102.420 (55%)</span>
              </div>
            </div>
          </div>

          {/* GRÁFICO 2: VENDAS POR CANAL */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-[#0e4a56]">Vendas por Canal</h3>
              <p className="text-xs text-slate-500">Participação na receita total</p>
            </div>

            <div className="space-y-4 pt-2">
              {[
                { canal: 'Totem de Autoatendimento', pct: 42, valor: 'R$ 77.666,00', cor: 'bg-[#f58220]' },
                { canal: 'Comanda Garçom (Smart POS)', pct: 30, valor: 'R$ 55.476,00', cor: 'bg-[#0e4a56]' },
                { canal: 'QR Code na Mesa', pct: 18, valor: 'R$ 33.285,00', cor: 'bg-emerald-500' },
                { canal: 'Delivery & iFood', pct: 10, valor: 'R$ 18.492,00', cor: 'bg-sky-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{item.canal}</span>
                    <span className="text-slate-900">{item.pct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.cor} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-medium">{item.valor}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* TABELA DE CURVA ABC DE PRODUTOS & EQUIPE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CURVA ABC */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-[#0e4a56]">Curva ABC - Pratos Mais Lucrativos</h3>
                <p className="text-xs text-slate-500">Produtos ordenados por contribuição de margem</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                { nome: 'Combo Zenix Bacon Double', qtd: 842, faturado: 'R$ 35.364', cmv: '22%', margem: '78%' },
                { nome: 'Chopp Pilsen 500ml', qtd: 1420, faturado: 'R$ 21.300', cmv: '14%', margem: '86%' },
                { nome: 'Gin Tônica Red Bull Melancia', qtd: 610, faturado: 'R$ 18.300', cmv: '18%', margem: '82%' },
                { nome: 'Batata Rústica Trufada', qtd: 512, faturado: 'R$ 14.336', cmv: '25%', margem: '75%' },
              ].map((prod, i) => (
                <div key={i} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{prod.nome}</p>
                    <p className="text-slate-400">{prod.qtd} unidades sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#0e4a56]">{prod.faturado}</p>
                    <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-200">
                      Margem {prod.margem}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DESEMPENHO DA EQUIPE */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-[#0e4a56]">Métricas dos Atendentes / Garçons</h3>
                <p className="text-xs text-slate-500">Ranking por faturamento e taxa de serviço</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { nome: 'Carlos Silva', vendas: 'R$ 28.400,00', gorjeta: 'R$ 2.840,00', pedidos: 184, tempo: '2.1 min' },
                { nome: 'Amanda Lima', vendas: 'R$ 24.150,00', gorjeta: 'R$ 2.415,00', pedidos: 162, tempo: '2.4 min' },
                { nome: 'Roberto Alves', vendas: 'R$ 19.800,00', gorjeta: 'R$ 1.980,00', pedidos: 128, tempo: '2.8 min' },
              ].map((garcom, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#0e4a56] text-sm">{garcom.nome}</p>
                    <p className="text-xs text-slate-500">{garcom.pedidos} pedidos • Tempo médio de atendmento: {garcom.tempo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-sm">{garcom.vendas}</p>
                    <p className="text-[11px] text-[#f58220] font-bold">10%: {garcom.gorjeta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}