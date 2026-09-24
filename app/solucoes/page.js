'use client';

export default function SolucoesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b bg-white py-4 px-6 flex justify-between items-center">
        <a href="/" className="font-black text-[#0e4a56] text-xl">ZENIX FOOD</a>
        <a href="/" className="text-xs font-bold text-slate-500">Voltar ao Início</a>
      </header>

      <section className="py-20 max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <span className="bg-[#0e4a56]/10 text-[#0e4a56] text-xs font-bold px-3 py-1 rounded-full uppercase">
            Ecossistema Completo
          </span>
          <h1 className="text-4xl font-black text-[#0e4a56]">Soluções para todos os tipos de estabelecimento</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm">
            Seja um restaurante a la carte, uma hamburgueria rápida ou uma balada de grande porte, o ZenixFood tem o módulo exato.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-3xl">🍔</span>
            <h3 className="text-xl font-bold text-[#0e4a56]">Fast Food & Hamburguerias</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Atendimento em segundos via Totem de Autoatendimento ou PDV com impressão direta na cozinha ou telas KDS.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-3xl">🍹</span>
            <h3 className="text-xl font-bold text-[#0e4a56]">Bares & Casas Noturnas</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Controle de entrada com comanda individual, agendamento de eventos, listas de promoters e pré-pago.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-3xl">🍕</span>
            <h3 className="text-xl font-bold text-[#0e4a56]">Pizzarias & Delivery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Montador de pizzas meio-a-meio, integração nativa com iFood e roteirização rápida para entregadores.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-3xl">🍽️</span>
            <h3 className="text-xl font-bold text-[#0e4a56]">Restaurantes Á La Carte</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mapa visual de mesas, controle de garçons via Smart POS e fechamento fracionado por assento.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}