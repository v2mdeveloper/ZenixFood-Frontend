'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#f58220] selection:text-white">
      
      {/* NAVBAR FIXA */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3">
            <span className="font-black text-2xl text-[#0e4a56]">ZENIX<span className="text-[#f58220]">FOOD</span></span>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="/solucoes" className="hover:text-[#0e4a56] transition-colors">Soluções</a>
            <a href="/autoatendimento" className="hover:text-[#0e4a56] transition-colors">Autoatendimento</a>
            <a href="/kds" className="hover:text-[#0e4a56] transition-colors">KDS Multi-Telas</a>
            <a href="/integracoes" className="hover:text-[#0e4a56] transition-colors">Integrações</a>
            <a href="/bi" className="hover:text-[#0e4a56] transition-colors">Relatórios B.I</a>
            <a href="/buscar-cardapio" className="text-[#f58220] hover:text-[#e07318] font-bold">Buscar Cardápio</a>
          </nav>

          <button 
            onClick={() => router.push('/bi')}
            className="bg-[#0e4a56] hover:bg-[#0a3842] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all"
          >
            Área do Parceiro
          </button>
        </div>
      </header>

      {/* HERO SECTION - VISÃO GERAL */}
      <section className="relative bg-gradient-to-b from-white via-slate-50 to-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-[#f58220]/10 border border-[#f58220]/20 text-[#f58220] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Sistema de Gestão Completo Food Service & Eventos
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0e4a56] leading-tight">
              A tecnologia que transforma o caos operacional em alta rentabilidade.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Desenvolvido para **Restaurantes, Bares, Pubs, Lanchonetes e Baladas**. Gerencie mesas, comandas individuais, eventos, portaria de baladas, automação de cozinha e inteligência de vendas em um só lugar.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="https://wa.me/5511984840258" target="_blank" rel="noreferrer" className="bg-[#f58220] hover:bg-[#e07318] text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#f58220]/20 transition-all">
                Falar com Consultor
              </a>
              <a href="/solucoes" className="bg-white border border-slate-200 text-[#0e4a56] px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all">
                Explorar Recursos
              </a>
            </div>
          </div>

          <div className="bg-[#041a1f] p-8 rounded-3xl text-white shadow-2xl relative border border-[#0e4a56]/40">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-4">✨ Destaques Operacionais</div>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-[#f58220]">🎉 Eventos, Aniversários e Baladas</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Gestão de listas VIP/Promoters, check-in na portaria por QR Code e abertura automática de comanda com consumo pré-pago ou pré-autorizado.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-emerald-400">🍽️ Mesas & Comandas Inteligentes</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Abertura instantânea por garçom (Smart POS) ou pelo próprio cliente via QR Code de Mesa com divisão automática da conta por pessoa.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-sky-400">⚡ Cozinha & Bar em Sincronia</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Pedidos divididos automaticamente: bebidas vão para o KDS do Bar e pratos para o KDS da Cozinha em milissegundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DETALHADA: EVENTOS, BALADAS & LISTAS DE CONVIDADOS */}
      <section className="py-24 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#f58220]">Módulo Especialista em Casas Noturnas & Eventos</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0e4a56]">
              Agendamentos, Lista de Convidados e Abertura Automática
            </h2>
            <p className="text-slate-600">
              Elimine filas na recepção, controle a capacidade da casa e proporcione uma experiência VIP sem atritos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-[#0e4a56]/10 text-[#0e4a56] font-black text-2xl rounded-2xl flex items-center justify-center">1</div>
              <h3 className="text-xl font-bold text-[#0e4a56]">Agendamentos & Ingressos</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Crie links exclusivos de eventos para reserva de mesas, camarotes ou venda de ingressos antecipados com consumo incluso.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-[#f58220]/10 text-[#f58220] font-black text-2xl rounded-2xl flex items-center justify-center">2</div>
              <h3 className="text-xl font-bold text-[#0e4a56]">Listas VIP & Aniversários</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Links personalizados para Promoters e Aniversariantes enviarem suas listas de convidados com regras automáticas de bonificação.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-[#0e4a56]/10 text-[#0e4a56] font-black text-2xl rounded-2xl flex items-center justify-center">3</div>
              <h3 className="text-xl font-bold text-[#0e4a56]">Check-in & Comanda Automática</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ao bipar o QR Code na portaria, a comanda individual ou mesa é ativada no sistema instantaneamente com os benefícios do convidado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION PARA AS PÁGINAS DEDICADAS */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl font-black">Conheça cada módulo em detalhes</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Navegue pelas páginas especialistas abaixo e descubra como o ZenixFood atende as necessidades exatas do seu segmento.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/solucoes" className="bg-[#0e4a56] hover:bg-[#0a3842] px-6 py-3 rounded-xl text-sm font-bold border border-[#0e4a56]">Módulo Soluções</a>
            <a href="/kds" className="bg-[#0e4a56] hover:bg-[#0a3842] px-6 py-3 rounded-xl text-sm font-bold border border-[#0e4a56]">KDS Cozinha & Bar</a>
            <a href="/autoatendimento" className="bg-[#0e4a56] hover:bg-[#0a3842] px-6 py-3 rounded-xl text-sm font-bold border border-[#0e4a56]">Totens & Smart POS</a>
            <a href="/bi" className="bg-[#f58220] hover:bg-[#e07318] px-6 py-3 rounded-xl text-sm font-bold">Relatórios B.I</a>
            <a href="/integracoes" className="bg-[#0e4a56] hover:bg-[#0a3842] px-6 py-3 rounded-xl text-sm font-bold border border-[#0e4a56]">Integrações</a>
          </div>
        </div>
      </section>

    </div>
  );
}