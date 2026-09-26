'use client';

import { useState } from 'react';

export default function BIAnalyticsPage() {
  const [periodo, setPeriodo] = useState('30dias');

  return (
    <div className="bg-slate-50 pb-24 font-sans">
      
      {/* HERO SECTION */}
      <section className="bg-[#041a1f] text-white py-24 relative overflow-hidden">
        {/* Efeitos de Iluminação */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f58220]/20 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-6">
          <span className="inline-block bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
            Inteligência de Negócio
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Dados precisos que <br className="hidden md:block" /> multiplicam o seu lucro.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-3xl mx-auto">
            O Zenix Analytics B.I transforma milhares de transações diárias em relatórios visuais claros. Controle o seu CMV em tempo real, descubra a Curva ABC do seu cardápio e audite a sua operação de qualquer lugar do mundo.
          </p>
        </div>
      </section>

      {/* DASHBOARD MOCKUP (SHOWCASE) */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden">
          
          {/* Falso Cabeçalho do Sistema */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0e4a56]">Visão Executiva</h2>
              <p className="text-xs text-slate-500 font-bold">Painel de Demonstração Interativo</p>
            </div>
            <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
              {[
                { id: 'hoje', label: 'Hoje' },
                { id: '7dias', label: '7 Dias' },
                { id: '30dias', label: 'Últimos 30 Dias' },
                { id: 'ano', label: 'Ano Atual' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodo(p.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    periodo === p.id
                      ? 'bg-[#0e4a56] text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-slate-50 space-y-8">
            {/* METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#0e4a56]/30 transition-colors">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Faturamento Bruto</span>
                <p className="text-3xl font-black text-[#0e4a56] mt-1 mb-2">R$ 184.920</p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">↑ 18.4%</span>
                  <span className="text-slate-400">vs. mês anterior</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#f58220]/30 transition-colors">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ticket Médio</span>
                <p className="text-3xl font-black text-[#f58220] mt-1 mb-2">R$ 142,50</p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">↑ 12.1%</span>
                  <span className="text-slate-400">impulsionado por Totens</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-sky-500/30 transition-colors">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">CMV Global</span>
                <p className="text-3xl font-black text-sky-600 mt-1 mb-2">27.8%</p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">✓ Ideal</span>
                  <span className="text-slate-400">meta era &lt;30%</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-purple-500/30 transition-colors">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Giro de Mesas</span>
                <p className="text-3xl font-black text-purple-600 mt-1 mb-2">38 min</p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">⚡ -14%</span>
                  <span className="text-slate-400">mais rápido com KDS</span>
                </div>
              </div>
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* GRÁFICO 1: VOLUME POR HORA */}
              <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-sm text-[#0e4a56] uppercase tracking-wide">Distribuição de Vendas (Horário de Pico)</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Identifique padrões para otimizar escalas de funcionários.</p>
                  </div>
                </div>

                <div className="h-48 flex items-end justify-between gap-2 px-2 border-b border-slate-100 pb-2">
                  {[
                    { hora: '12h', alt: 'h-20', val: 'R$ 12k' },
                    { hora: '14h', alt: 'h-16', val: 'R$ 9k' },
                    { hora: '16h', alt: 'h-10', val: 'R$ 5k' },
                    { hora: '18h', alt: 'h-28', val: 'R$ 18k' },
                    { hora: '20h', alt: 'h-44', val: 'R$ 38k', highlight: true },
                    { hora: '21h', alt: 'h-48', val: 'R$ 42k', highlight: true },
                    { hora: '22h', alt: 'h-36', val: 'R$ 29k' },
                    { hora: '23h', alt: 'h-24', val: 'R$ 15k' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg pointer-events-none z-10">
                        {bar.val}
                      </span>
                      <div className="w-full bg-slate-50 rounded-t-lg relative overflow-hidden flex items-end">
                        <div className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80 ${bar.highlight ? 'bg-gradient-to-t from-[#f58220] to-amber-400' : 'bg-gradient-to-t from-[#0e4a56] to-sky-700'} ${bar.alt}`}></div>
                      </div>
                      <span className={`text-[10px] font-black ${bar.highlight ? 'text-[#f58220]' : 'text-slate-400'}`}>{bar.hora}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><span className="w-3 h-3 rounded-full bg-[#0e4a56]"></span> Fluxo Normal</div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><span className="w-3 h-3 rounded-full bg-[#f58220]"></span> Horário de Pico</div>
                </div>
              </div>

              {/* GRÁFICO 2: CANAIS DE VENDA */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
                <h3 className="font-black text-sm text-[#0e4a56] uppercase tracking-wide mb-1">Vendas por Canal</h3>
                <p className="text-[10px] text-slate-400 font-bold mb-6">Receita gerada por ponto de contato.</p>

                <div className="space-y-5 flex-1 justify-center flex flex-col">
                  {[
                    { canal: 'Totem de Autoatendimento', pct: 42, valor: '77k', cor: 'bg-[#f58220]' },
                    { canal: 'Smart POS (Garçom)', pct: 30, valor: '55k', cor: 'bg-[#0e4a56]' },
                    { canal: 'QR Code na Mesa', pct: 18, valor: '33k', cor: 'bg-emerald-500' },
                    { canal: 'Delivery & iFood', pct: 10, valor: '18k', cor: 'bg-sky-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-slate-700">{item.canal}</span>
                        <span className="text-slate-900">{item.pct}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.cor} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* TABELAS INFERIORES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CURVA ABC */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="font-black text-sm text-[#0e4a56] uppercase tracking-wide mb-1">Curva ABC - Pratos Mais Lucrativos</h3>
                <p className="text-[10px] text-slate-400 font-bold mb-4">Engenharia de cardápio: itens que trazem mais margem.</p>
                
                <div className="divide-y divide-slate-100">
                  {[
                    { nome: 'Combo Zenix Bacon Double', qtd: 842, faturado: 'R$ 35.364', margem: '78%', type: 'A' },
                    { nome: 'Chopp Pilsen 500ml', qtd: 1420, faturado: 'R$ 21.300', margem: '86%', type: 'A' },
                    { nome: 'Gin Tônica Red Bull', qtd: 610, faturado: 'R$ 18.300', margem: '82%', type: 'B' },
                    { nome: 'Batata Rústica Trufada', qtd: 512, faturado: 'R$ 14.336', margem: '75%', type: 'B' },
                  ].map((prod, i) => (
                    <div key={i} className="py-3 flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${prod.type === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{prod.type}</span>
                        <div>
                          <p className="font-black text-slate-800 text-xs">{prod.nome}</p>
                          <p className="text-[10px] font-bold text-slate-400">{prod.qtd} unidades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#0e4a56] text-sm">{prod.faturado}</p>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Margem {prod.margem}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESEMPENHO DA EQUIPE */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="font-black text-sm text-[#0e4a56] uppercase tracking-wide mb-1">Métricas de Atendimento (Garçons)</h3>
                <p className="text-[10px] text-slate-400 font-bold mb-4">Ranking de faturamento e comissões.</p>

                <div className="space-y-3">
                  {[
                    { pos: '1º', nome: 'Carlos Silva', vendas: 'R$ 28.400', gorjeta: 'R$ 2.840', tempo: '2.1m' },
                    { pos: '2º', nome: 'Amanda Lima', vendas: 'R$ 24.150', gorjeta: 'R$ 2.415', tempo: '2.4m' },
                    { pos: '3º', nome: 'Roberto Alves', vendas: 'R$ 19.800', gorjeta: 'R$ 1.980', tempo: '2.8m' },
                  ].map((garcom, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-300">{garcom.pos}</span>
                        <div>
                          <p className="font-black text-[#0e4a56] text-xs">{garcom.nome}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">Tempo Médio: {garcom.tempo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-sm">{garcom.vendas}</p>
                        <p className="text-[9px] text-[#f58220] font-black uppercase tracking-widest mt-0.5">Tx 10%: {garcom.gorjeta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* EXPLICAÇÃO DE FUNCIONALIDADES (TEXTOS) */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0e4a56] leading-tight">
            Não administre no escuro.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed font-medium">
            O Zenix Analytics cruza dados do seu estoque, PDV e contas a pagar para entregar a verdadeira saúde financeira do seu negócio em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-2xl">📉</div>
            <h3 className="text-lg font-black text-slate-900">Controle Real do CMV</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Descubra o Custo da Mercadoria Vendida instantaneamente. Cada pedido fechado abate os insumos da ficha técnica no estoque, calculando a margem de lucro exata por prato.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
            <h3 className="text-lg font-black text-slate-900">Engenharia de Cardápio</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Através da Curva ABC automática, saiba quais pratos são as "Estrelas" (vendem muito e dão lucro) e quais são os "Cães" (vendem pouco e custam caro) para otimizar suas compras.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl">🛡️</div>
            <h3 className="text-lg font-black text-slate-900">Auditoria Antifraude</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Mapeie gargalos financeiros rastreando tudo: itens estornados da cozinha, descontos manuais aplicados pelo caixa e histórico de sangrias do Smart POS.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-6 text-center border-t border-slate-200 pt-16">
        <h2 className="text-2xl font-black text-[#0e4a56] mb-4">Pronto para escalar com segurança?</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">
          Esqueça planilhas manuais e fechamentos que demoram horas. Tenha os números do seu restaurante na palma da mão, 24 horas por dia.
        </p>
        <a 
          href="https://wa.me/5511984840258" 
          target="_blank" 
          rel="noreferrer" 
          className="inline-block bg-[#0e4a56] hover:bg-[#0a3842] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-[#0e4a56]/20 transition-all transform hover:-translate-y-0.5"
        >
          Solicitar Apresentação do B.I
        </a>
      </section>

    </div>
  );
}