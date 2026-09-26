'use client';

export default function SolucoesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b border-slate-200 bg-white py-4 px-6 flex justify-between items-center">
        <a href="/" className="font-black text-[#0e4a56] text-xl">
          ZENIX<span className="text-[#f58220]">FOOD</span>
        </a>
        <a href="/" className="text-xs font-bold text-slate-500 hover:text-[#0e4a56]">Voltar ao Início</a>
      </header>

      <section className="py-16 max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="bg-[#0e4a56]/10 text-[#0e4a56] text-xs font-bold px-3 py-1 rounded-full uppercase">
            Ecossistema Especializado
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0e4a56]">
            Soluções sob medida para cada tipo de operação
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm">
            Seja um restaurante a la carte, uma hamburgueria de alto volume ou uma casa noturna, o ZenixFood tem a arquitetura certa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center font-black text-2xl">
              🍸
            </div>
            <h3 className="text-xl font-bold text-[#0e4a56]">Bares, Pubs & Casas Noturnas</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Gestão de listas VIP/Promoters, venda de ingressos antecipados, validação por QR Code na portaria e comanda individual vinculada ao CPF com consumo pré-pago ou pré-autorizado no cartão.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-black text-2xl">
              🍔
            </div>
            <h3 className="text-xl font-bold text-[#0e4a56]">Hamburguerias & Fast Food</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Atendimento em segundos via Totem de Autoatendimento. O cliente escolhe adicionais, ponto da carne, molhos e faz o pagamento direto na tela sem pegar fila.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-800 rounded-2xl flex items-center justify-center font-black text-2xl">
              🍽️
            </div>
            <h3 className="text-xl font-bold text-[#0e4a56]">Restaurantes Á La Carte</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mapa visual de mesas interativo, lançamento rápido de pedidos via Smart POS na mão do garçom e fechamento fracionado da conta por número de pessoas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-800 rounded-2xl flex items-center justify-center font-black text-2xl">
              🍕
            </div>
            <h3 className="text-xl font-bold text-[#0e4a56]">Pizzarias & Delivery</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Montador de pizzas com até 4 sabores, cobrança pelo valor médio ou pelo sabor mais caro, gestão de bordas recheadas e roteirização otimizada para entregadores.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}