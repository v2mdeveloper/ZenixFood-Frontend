'use client';

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/80 py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          
          {/* Efeitos de Fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#f58220]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#0e4a56]/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

          <div className="lg:col-span-7 space-y-8 z-10">
            <div className="inline-flex items-center gap-2 bg-[#f58220]/10 border border-[#f58220]/20 text-[#f58220] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f58220] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f58220]"></span>
              </span>
              Tecnologia Especializada para Food Service
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-black text-[#0e4a56] leading-[1.1]">
              A plataforma unificada que acelera o atendimento e otimiza sua margem.
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              O <strong>ZenixFood</strong> centraliza o controle total da sua operação. Da portaria com check-in de ingressos e comanda individual, ao atendimento no salão via Smart POS, autoatendimento em totens e roteamento automático para os visores de cozinha (KDS).
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="https://wa.me/5511984840258" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-[#f58220] hover:bg-[#e07318] text-white px-8 py-4 rounded-2xl font-black text-center text-sm shadow-xl shadow-[#f58220]/25 transition-all transform hover:-translate-y-0.5"
              >
                Agendar Demonstração
              </a>
              <a 
                href="/solucoes" 
                className="bg-white hover:bg-slate-50 border border-slate-300 text-[#0e4a56] hover:border-[#0e4a56] px-8 py-4 rounded-2xl font-black text-center text-sm transition-all shadow-sm"
              >
                Conhecer Recursos
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/80">
              <div>
                <p className="text-3xl font-black text-[#0e4a56] tracking-tight">+35%</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Aumento no Ticket Médio com Totem</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#0e4a56] tracking-tight">4.2 min</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Redução no Tempo de Preparo (KDS)</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#0e4a56] tracking-tight">100%</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Controle de Estoque e CMV ao Vivo</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200/80 p-8 rounded-3xl shadow-2xl shadow-slate-300/50 space-y-6 relative z-10 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-black text-[#0e4a56] text-lg">Visão Operacional Unificada</h3>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Sistema Ativo
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2 hover:border-[#0e4a56]/30 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#0e4a56] uppercase tracking-wider flex items-center gap-2"><span className="text-base">🎉</span> Portaria & Baladas</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Leitura QR Code</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Validação de ingressos, lista VIP e abertura instantânea de comanda individual pré ou pós-paga.</p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2 hover:border-[#f58220]/30 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#0e4a56] uppercase tracking-wider flex items-center gap-2"><span className="text-base">🍽️</span> Mesas & Comandas</span>
                  <span className="text-[10px] font-bold text-[#f58220] bg-[#f58220]/10 px-2 py-0.5 rounded">Atendimento Ágil</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Garçons lançam pedidos diretamente na maquininha Smart POS ou o próprio cliente pede pelo QR Code de Mesa.</p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2 hover:border-sky-500/30 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#0e4a56] uppercase tracking-wider flex items-center gap-2"><span className="text-base">👨‍🍳</span> KDS & Expedição</span>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">Sem Papel</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Pedidos divididos automaticamente: bebidas vão para o monitor do Bar e pratos para o monitor da Cozinha.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#f58220] bg-[#f58220]/10 px-3 py-1.5 rounded-full">
              Construído para alta performance
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0e4a56] leading-tight">
              Tudo o que seu estabelecimento precisa em uma só plataforma
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Elimine gargalos operacionais, erros de lançamento e retrabalho na cozinha com nossos módulos totalmente integrados em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2rem] space-y-5 hover:border-[#0e4a56]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#0e4a56]/10 text-[#0e4a56] rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                01
              </div>
              <h3 className="text-xl font-black text-[#0e4a56]">Gestão de Baladas & Eventos</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Controle total de ingressos, bilheteria, listas VIP de promoters, agendamento de camarotes e fechamento de conta rápido com divisão de itens.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2rem] space-y-5 hover:border-[#f58220]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#f58220]/10 text-[#f58220] rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                02
              </div>
              <h3 className="text-xl font-black text-[#0e4a56]">Totens & Autoatendimento</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Interfaces intuitivas de 21" e 32" polegadas com motor de upsell automático, oferecendo adicionais e bebidas antes de finalizar o pedido.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2rem] space-y-5 hover:border-[#0e4a56]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#0e4a56]/10 text-[#0e4a56] rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                03
              </div>
              <h3 className="text-xl font-black text-[#0e4a56]">KDS Multi-Telas sem Fio</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Monitores na cozinha e no bar que organizam os pedidos por ordem de chegada, com alertas visuais de tempo de espera e status em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}