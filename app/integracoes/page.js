'use client';

export default function IntegracoesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b border-slate-200 bg-white py-4 px-6 flex justify-between items-center">
        <a href="/" className="font-black text-[#0e4a56] text-xl">
          ZENIX<span className="text-[#f58220]">FOOD</span>
        </a>
        <a href="/" className="text-xs font-bold text-slate-500 hover:text-[#0e4a56]">Voltar ao Início</a>
      </header>

      <section className="py-16 max-w-5xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-3">
          <span className="bg-[#0e4a56]/10 text-[#0e4a56] text-xs font-bold px-3 py-1 rounded-full uppercase">
            Hub de Integrações
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0e4a56]">Conectado aos principais sistemas do mercado</h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Sincronização nativa de vendas, estoque e emissão fiscal automática sem a necessidade de digitação manual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-[#0e4a56]">💳 Meios de Pagamento</h3>
            <p className="text-xs text-slate-500">Stone, PagBank, Mercado Pago, Rede, Cielo e TEF Direct com conciliação automática.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-[#0e4a56]">🛵 Delivery & Pedidos Online</h3>
            <p className="text-xs text-slate-500">iFood, Rappi, Anota AI e Robô de Atendimento via WhatsApp API Oficial.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-[#0e4a56]">📜 Fiscal & ERPs</h3>
            <p className="text-xs text-slate-500">NFC-e, NF-e, SAT Fiscal, Bling, Conta Azul e Omie com exportação mensal XML.</p>
          </div>
        </div>
      </section>
    </div>
  );
}