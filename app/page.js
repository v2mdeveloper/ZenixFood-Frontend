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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#f58220] selection:text-white flex flex-col scroll-smooth">
      
      {/* HEADER / NAVBAR */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          
          {/* Logo ZenixFood */}
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="ZenixFood Logo" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Navegação Principal */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#solucoes" className="hover:text-[#0e4a56] transition-colors">Soluções</a>
            <a href="#autoatendimento" className="hover:text-[#0e4a56] transition-colors">Autoatendimento</a>
            <a href="#kds" className="hover:text-[#0e4a56] transition-colors">KDS</a>
            <a href="#integracoes" className="hover:text-[#0e4a56] transition-colors">Integrações</a>
            <a href="#bi" className="hover:text-[#0e4a56] transition-colors">Relatórios B.I</a>
            <a href="#buscar-loja" className="hover:text-[#f58220] transition-colors font-bold">Buscar Cardápio</a>
          </nav>

          {/* Botão Área do Parceiro */}
          <button 
            onClick={() => router.push('/master')}
            className="bg-[#0e4a56] hover:bg-[#0a3842] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            Área do Parceiro
          </button>
        </div>
      </header>

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#f58220]/10 border border-[#f58220]/20 px-4 py-1.5 rounded-full text-[#f58220] text-xs font-bold uppercase tracking-wider">
                <span>🔥</span> SaaS Multi-Tenant para Restaurantes
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0e4a56] leading-[1.12] tracking-tight">
                O ecossistema definitivo para escalar o seu restaurante.
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Agilize seus atendimentos com **Totens**, otimize a cozinha com **KDS**, gerencie múltiplos estabelecimentos e analise métricas em tempo real com **B.I avançado**.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a 
                  href="https://wa.me/5511984840258" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-[#f58220] hover:bg-[#e07318] text-white px-8 py-4 rounded-2xl font-black text-center shadow-lg shadow-[#f58220]/25 transition-all transform hover:-translate-y-0.5"
                >
                  Falar com Consultor
                </a>
                <a 
                  href="#solucoes" 
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-[#0e4a56] px-8 py-4 rounded-2xl font-black text-center shadow-sm transition-all"
                >
                  Conhecer Soluções
                </a>
              </div>
            </div>

            {/* Dashboard / Preview Card */}
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#f58220]/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#0e4a56]/15 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl shadow-slate-300/50 relative z-10">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Painel ZenixFood - Visão Geral</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold block">Vendas Hoje</span>
                      <span className="text-lg font-black text-[#0e4a56]">R$ 4.850</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold block">Pedidos</span>
                      <span className="text-lg font-black text-[#0e4a56]">142</span>
                    </div>
                    <div className="bg-[#f58220]/10 p-4 rounded-2xl border border-[#f58220]/20">
                      <span className="text-xs text-[#f58220] font-semibold block">Ticket Médio</span>
                      <span className="text-lg font-black text-[#f58220]">R$ 34,15</span>
                    </div>
                  </div>

                  <div className="bg-[#0e4a56] text-white p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-300 font-medium">Tempo Médio de Preparo (KDS)</p>
                      <p className="text-2xl font-black">08 min 12s</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      -18% no tempo
                    </span>
                  </div>

                  <div className="h-28 bg-slate-50 border border-slate-100 rounded-2xl flex items-end p-4 gap-2">
                    <div className="flex-1 bg-slate-200 h-[40%] rounded-t-md"></div>
                    <div className="flex-1 bg-[#0e4a56]/40 h-[65%] rounded-t-md"></div>
                    <div className="flex-1 bg-[#0e4a56]/70 h-[85%] rounded-t-md"></div>
                    <div className="flex-1 bg-[#f58220] h-[100%] rounded-t-md"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 1. SEÇÃO SOLUÇÕES */}
        <section id="solucoes" className="py-24 bg-white border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#f58220]">
                Módulos do Sistema
              </h2>
              <p className="text-3xl sm:text-4xl font-black text-[#0e4a56]">
                Soluções completas para cada etapa do atendimento
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#0e4a56]/10 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  💻
                </div>
                <h3 className="text-xl font-bold text-[#0e4a56] mb-3">PDV Cloud & Gestão</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Faturamento rápido, controle de caixa, gestão de mesas e comandas integradas em uma plataforma estável na nuvem.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#f58220]/10 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  📱
                </div>
                <h3 className="text-xl font-bold text-[#0e4a56] mb-3">Cardápio Digital QR Code</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Seus clientes acessam o cardápio no próprio celular sem precisar baixar apps, acelerando os pedidos no salão e delivery.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#0e4a56]/10 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  🏢
                </div>
                <h3 className="text-xl font-bold text-[#0e4a56] mb-3">Multi-Tenant / Franquias</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Gerencie múltiplos estabelecimentos ou unidades de uma mesma marca com um único acesso master unificado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SEÇÃO AUTOATENDIMENTO (TOTEM) */}
        <section id="autoatendimento" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#f58220]">
                Totens e Smart POS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0e4a56] leading-tight">
                Autoatendimento que reduz filas e aumenta seu ticket médio
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Permita que seu cliente faça o pedido e pague sozinho diretamente no Totem ou nas Maquininhas Smart POS Android (PlugPag, PagBank, Stone).
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  'Aumento médio de +20% no valor dos pedidos',
                  'Redução drástica nas filas em horários de pico',
                  'Integração de pagamento App-to-App sem digitação manual',
                  'Fotos em alta resolução para estimular a venda cruzada'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#f58220]/20 text-[#f58220] flex items-center justify-center text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center">
              <div className="w-full max-w-sm bg-slate-900 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-400">TOTEM AUTOATENDIMENTO</span>
                  <span className="text-xs text-slate-500">Zenix OS</span>
                </div>
                <div className="space-y-3 text-left">
                  <div className="p-3 bg-slate-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">Combo Zenix Burger</p>
                      <p className="text-xs text-slate-400">+ Batata Média + Refrigerante</p>
                    </div>
                    <span className="text-sm font-black text-[#f58220]">R$ 42,90</span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">Sobremesa Adicional</p>
                      <p className="text-xs text-slate-400">Milkshake de Ovomaltine</p>
                    </div>
                    <span className="text-sm font-black text-[#f58220]">R$ 16,00</span>
                  </div>
                </div>
                <button className="w-full mt-6 bg-[#f58220] text-white py-3 rounded-xl font-bold text-sm">
                  Aproxime seu Cartão
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SEÇÃO KDS (KITCHEN DISPLAY SYSTEM) */}
        <section id="kds" className="py-24 bg-white border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl">
                <span className="text-xs font-bold text-emerald-700 uppercase">Status: Em Preparo</span>
                <p className="text-2xl font-black text-emerald-900 mt-2">Mesa 04</p>
                <p className="text-xs text-emerald-700 mt-1">2x Smash Burger, 1x Suco Laranja</p>
                <span className="mt-4 inline-block text-xs bg-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                  ⏱️ 04:12 min
                </span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl">
                <span className="text-xs font-bold text-amber-700 uppercase">Status: Aguardando</span>
                <p className="text-2xl font-black text-amber-900 mt-2">Pedido #108</p>
                <p className="text-xs text-amber-700 mt-1">1x Pizza Calabresa GG</p>
                <span className="mt-4 inline-block text-xs bg-amber-200 text-amber-800 font-bold px-2.5 py-1 rounded-lg">
                  ⏱️ 11:45 min
                </span>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#f58220]">
                Gestão de Cozinha
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0e4a56] leading-tight">
                KDS: Diga adeus aos papéis e atrasos na cozinha
              </h2>
              <p className="text-slate-600 leading-relaxed">
                O Kitchen Display System (KDS) organiza os pedidos por ordem de chegada, prioridade e tempo de preparo em telas digitais interativas.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <span className="w-5 h-5 rounded-full bg-[#0e4a56]/10 text-[#0e4a56] flex items-center justify-center text-xs font-bold">✓</span>
                  Comunicação em tempo real entre salão, totem e cozinha.
                </li>
                <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <span className="w-5 h-5 rounded-full bg-[#0e4a56]/10 text-[#0e4a56] flex items-center justify-center text-xs font-bold">✓</span>
                  Notificação automática quando o prato estiver pronto para servir.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. SEÇÃO INTEGRAÇÕES */}
        <section id="integracoes" className="py-24 bg-slate-50 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#f58220]">
                Conectividade Total
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0e4a56]">
                Integrado às principais adquirentes e meios de pagamento
              </h2>
              <p className="text-slate-600 text-sm">
                Conecte a conta do seu próprio meio de pagamento em poucos cliques.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'PagBank / PagSeguro', desc: 'PlugPag & Checkout Sandbox/Prod' },
                { name: 'Stone / Pagar.me', desc: 'Smart POS e API de Crédito' },
                { name: 'Mercado Pago', desc: 'PIX QR Code Dinâmico e Cartões' },
                { name: 'Emissão Fiscal', desc: 'NFC-e e NF-e Automáticas' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <h4 className="font-bold text-[#0e4a56] text-base mb-1">{item.name}</h4>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. SEÇÃO RELATÓRIOS ANALÍTICOS B.I */}
        <section id="bi" className="py-24 bg-white border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#f58220]">
                Business Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0e4a56] leading-tight">
                Relatórios analíticos para decisões baseadas em dados
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Acompanhe o desempenho do seu negócio em tempo real com relatórios visuais inteligentes e fáceis de interpretar.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="border border-slate-100 bg-slate-50 p-4 rounded-2xl">
                  <span className="text-xs text-slate-500 font-bold">Mais Vendidos</span>
                  <p className="text-sm font-bold text-[#0e4a56] mt-1">Ranking de Produtos</p>
                </div>
                <div className="border border-slate-100 bg-slate-50 p-4 rounded-2xl">
                  <span className="text-xs text-slate-500 font-bold">Horários de Pico</span>
                  <p className="text-sm font-bold text-[#0e4a56] mt-1">Mapa de Calor de Vendas</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0e4a56] text-white p-8 rounded-3xl shadow-2xl space-y-6">
              <h3 className="text-lg font-bold">Métricas do Mês</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Faturamento Geral</span>
                    <span className="font-bold text-[#f58220]">112% da Meta</span>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div className="bg-[#f58220] h-full w-[85%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Vendas por Autoatendimento (Totem)</span>
                    <span className="font-bold text-emerald-400">64% do Total</span>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[64%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUSCA DE LOJAS PARA O CLIENTE FINAL */}
        <section id="buscar-loja" className="bg-slate-900 text-white py-20 border-t border-slate-800">
          <div className="max-w-xl mx-auto px-6 text-center space-y-8">
            <div className="w-16 h-16 bg-[#f58220]/20 text-[#f58220] rounded-3xl flex items-center justify-center text-3xl mx-auto">
              🍽️ 🥂
            </div>
            <h2 className="text-3xl font-black">Quer fazer um pedido?</h2>
            <p className="text-slate-400 text-sm">
              Digite o nome do restaurante parceiro Zenix para acessar o cardápio digital imediatamente.
            </p>
            
            <form onSubmit={handleSearchStore} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                placeholder="Ex: zenixfood-burger" 
                className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f58220] font-bold text-sm"
              />
              <button 
                type="submit" 
                className="bg-[#f58220] hover:bg-[#e07318] text-white px-8 py-4 rounded-2xl font-black transition-colors text-sm shadow-lg shadow-[#f58220]/20"
              >
                Buscar Cardápio
              </button>
            </form>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white py-12 border-t border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-4">
          <img 
            src="/logo.png" 
            alt="ZenixFood Logo" 
            className="h-8 w-auto object-contain opacity-90"
          />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
            © {new Date().getFullYear()} ZenixFood Tecnologia em Food Service. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}