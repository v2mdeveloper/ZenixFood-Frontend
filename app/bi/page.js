'use client';

export default function BIAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#041a1f] text-white font-sans">
      
      {/* NAVBAR B.I */}
      <header className="border-b border-white/10 bg-[#041a1f]/90 backdrop-blur sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-[#f58220]">ZENIX</span> ANALYTICS B.I
          </a>
          <a href="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Sair do B.I
          </a>
        </div>
      </header>

      {/* PAINEL B.I COMPLETO */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        
        {/* FILTROS E METRICS TOP */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
          <div>
            <h1 className="text-2xl font-black">Visão Consolidada de Vendas</h1>
            <p className="text-xs text-slate-400">Atualizado há 2 minutos • Todas as Unidades</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold">Hoje</button>
            <button className="bg-[#f58220] px-4 py-2 rounded-xl text-xs font-bold">Últimos 30 Dias</button>
            <button className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold">Personalizado</button>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <span className="text-xs text-slate-400 font-bold block mb-1">Faturamento Bruto</span>
            <span className="text-3xl font-black text-emerald-400">R$ 184.920,00</span>
            <span className="text-[10px] text-emerald-300 block mt-2">↑ +18.4% comparado ao mês anterior</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <span className="text-xs text-slate-400 font-bold block mb-1">Total de Pedidos</span>
            <span className="text-3xl font-black text-white">4.120</span>
            <span className="text-[10px] text-slate-400 block mt-2">Média de 137 pedidos/dia</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <span className="text-xs text-slate-400 font-bold block mb-1">Ticket Médio por Mesa</span>
            <span className="text-3xl font-black text-[#f58220]">R$ 142,50</span>
            <span className="text-[10px] text-[#f58220] block mt-2">↑ +8% devido ao módulo de Upsell no Totem</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <span className="text-xs text-slate-400 font-bold block mb-1">CMV Médio (Custo de Mercadoria)</span>
            <span className="text-3xl font-black text-sky-400">28.4%</span>
            <span className="text-[10px] text-sky-300 block mt-2">✓ Dentro da meta ideal (&lt; 30%)</span>
          </div>
        </div>

        {/* GRÁFICOS E RANKINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CURVA ABC E MAIS VENDIDOS */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
            <h3 className="font-bold text-lg text-white">Ranking Curva ABC (Produtos Mais Lucrativos)</h3>
            <div className="space-y-4">
              {[
                { name: 'Combo Zenix Bacon Double', qtd: '842 un', total: 'R$ 35.364,00', margem: '68% Margem' },
                { name: 'Chopp Pilsen 500ml', qtd: '1.420 un', total: 'R$ 21.300,00', margem: '82% Margem' },
                { name: 'Gin Tônica Especial', qtd: '610 un', total: 'R$ 18.300,00', margem: '78% Margem' },
                { name: 'Batata Rústica da Casa', qtd: '512 un', total: 'R$ 14.336,00', margem: '74% Margem' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.qtd} vendidos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-400 text-sm">{item.total}</p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">{item.margem}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DESEMPENHO DE ATENDIMENTO & GARÇONS */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
            <h3 className="font-bold text-lg text-white">Desempenho da Equipe</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl space-y-1">
                <p className="font-bold text-sm">Garçom: Carlos Silva</p>
                <p className="text-xs text-slate-400">Total Vendido: R$ 24.150,00</p>
                <p className="text-xs text-[#f58220] font-bold">10% Gorjeta: R$ 2.415,00</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl space-y-1">
                <p className="font-bold text-sm">Garçom: Amanda Lima</p>
                <p className="text-xs text-slate-400">Total Vendido: R$ 21.800,00</p>
                <p className="text-xs text-[#f58220] font-bold">10% Gorjeta: R$ 2.180,00</p>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}