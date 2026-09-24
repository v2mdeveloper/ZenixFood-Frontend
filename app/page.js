'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* NAVBAR FIXA CLARA */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <span className="font-black text-2xl text-[#0e4a56] tracking-tight">
              ZENIX<span className="text-[#f58220]">FOOD</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-600">
            <a href="/solucoes" className="hover:text-[#0e4a56] transition-colors">Soluções</a>
            <a href="/autoatendimento" className="hover:text-[#0e4a56] transition-colors">Autoatendimento</a>
            <a href="/kds" className="hover:text-[#0e4a56] transition-colors">KDS Cozinha & Bar</a>
            <a href="/integracoes" className="hover:text-[#0e4a56] transition-colors">Integrações</a>
            <a href="/bi" className="hover:text-[#0e4a56] transition-colors">Painel B.I</a>
            <a href="/buscar-cardapio" className="text-[#f58220] hover:text-[#e07318] font-black">Buscar Cardápio</a>
          </nav>

          <button 
            onClick={() => router.push('/bi')}
            className="bg-[#0e4a56] hover:bg-[#0a3842] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#0e4a56]/10"
          >
            Acessar Sistema
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#f58220]/10 border border-[#f58220]/20 text-[#f58220] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
              <span>🚀 Tecnologia Especializada para Food Service & Eventos</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0e4a56] leading-tight">
              A plataforma unificada que acelera o atendimento e otimiza sua margem.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              O <strong>ZenixFood</strong> centraliza o controle total da sua operação. Da portaria com check-in de ingressos e comanda individual, ao atendimento no salão via Smart POS, autoatendimento em totens e roteamento automático para os visores de cozinha (KDS).
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="https://wa.me/5511984840258" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-[#f58220] hover:bg-[#e07318] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#f58220]/20 transition-all transform hover:-translate-y-0.5"
              >
                Agendar Demonstração
              </a>
              <a 
                href="/solucoes" 
                className="bg-white border border-slate-300 text-[#0e4a56] hover:border-[#0e4a56] px-8 py-4 rounded-2xl font-black text-sm transition-all"
              >
                Conhecer Recursos
              </a>
            </div>

            {/* INDICADORES EM DESTAQUE */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div>
                <p className="text-2xl font-black text-[#0e4a56]">+35%</p>
                <p className="text-xs text-slate-500 font-medium">Aumento no Ticket Médio com Totem</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0e4a56]">4.2 min</p>
                <p className="text-xs text-slate-500 font-medium">Redução no Tempo de Preparo (KDS)</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0e4a56]">100%</p>
                <p className="text-xs text-slate-500 font-medium">Controle de Estoque e CMV em Tempo Real</p>
              </div>
            </div>
          </div>

          {/* CARD TEMA CLARO - PREVIEW DE RECURSOS */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-slate-200/50 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-black text-[#0e4a56] text-lg">Visão Operacional Unificada</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                Sistema Ativo
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#0e4a56]">🎉 Portaria & Casas Noturnas</span>
                  <span className="text-emerald-600">Leitura QR Code</span>
                </div>
                <p className="text-xs text-slate-600">Validação de ingressos, lista de VIP/Aniversariantes e abertura instantânea de comanda individual pré ou pós-paga.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#0e4a56]">🍽️ Mesas & Comandas Eletrônicas</span>
                  <span className="text-[#f58220]">Atendimento Ágil</span>
                </div>
                <p className="text-xs text-slate-600">Garçons lançam pedidos diretamente na maquininha Smart POS ou o próprio cliente pede pelo QR Code de Mesa.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#0e4a56]">👨‍🍳 KDS e Expedição Inteligente</span>
                  <span className="text-sky-600">Sem Papel</span>
                </div>
                <p className="text-xs text-slate-600">Pedidos são divididos automaticamente: bebidas vão para o KDS do Bar e pratos para o KDS da Cozinha.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO DETALHADA DE PILARES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#f58220]">
              Construído para alta performance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0e4a56]">
              Tudo o que seu estabelecimento precisa em uma só plataforma
            </h2>
            <p className="text-slate-600 text-sm">
              Elimine gargalos operacionais, erros de lançamento e retrabalho na cozinha com nossos módulos integrados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-[#0e4a56] transition-all">
              <div className="w-12 h-12 bg-[#0e4a56]/10 text-[#0e4a56] rounded-2xl flex items-center justify-center font-black text-xl">
                01
              </div>
              <h3 className="text-xl font-bold text-[#0e4a56]">Gestão de Baladas & Eventos</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Controle total de ingressos, bilheteria, listas VIP de promoters, agendamento de camarotes e fechamento de conta rápido com divisão de itens.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-[#f58220] transition-all">
              <div className="w-12 h-12 bg-[#f58220]/10 text-[#f58220] rounded-2xl flex items-center justify-center font-black text-xl">
                02
              </div>
              <h3 className="text-xl font-bold text-[#0e4a56]">Totens & Autoatendimento</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Interfaces intuitivas de 21" e 32" polegadas com motor de upsell automático, oferecendo adicionais e bebidas antes de finalizar o pedido.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-[#0e4a56] transition-all">
              <div className="w-12 h-12 bg-[#0e4a56]/10 text-[#0e4a56] rounded-2xl flex items-center justify-center font-black text-xl">
                03
              </div>
              <h3 className="text-xl font-bold text-[#0e4a56]">KDS Multi-Telas sem Fio</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Monitores na cozinha e no bar que organizam os pedidos por ordem de chegada, com alertas visuais de tempo de espera e status em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CLARO */}
      <footer className="border-t border-slate-200 bg-slate-100 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-bold text-[#0e4a56]">© 2026 ZenixFood. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="/solucoes" className="hover:text-[#0e4a56]">Soluções</a>
            <a href="/kds" className="hover:text-[#0e4a56]">KDS</a>
            <a href="/bi" className="hover:text-[#0e4a56]">B.I Analytics</a>
            <a href="/buscar-cardapio" className="hover:text-[#0e4a56]">Buscar Cardápio</a>
          </div>
        </div>
      </footer>

    </div>
  );
}