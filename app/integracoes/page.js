'use client';

export default function IntegracoesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b bg-white py-4 px-6 flex justify-between items-center">
        <a href="/" className="font-black text-[#0e4a56] text-xl">ZENIX FOOD</a>
        <a href="/" className="text-xs font-bold text-slate-500">Voltar</a>
      </header>

      <section className="py-20 max-w-5xl mx-auto px-6 text-center space-y-6">
        <span className="bg-[#0e4a56]/10 text-[#0e4a56] text-xs font-bold px-3 py-1 rounded-full uppercase">
          Ecossistema Aberto
        </span>
        <h1 className="text-4xl font-black text-[#0e4a56]">Sincronizado com os gigantes do mercado</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-[#0e4a56] mb-2">💳 Adquirentes</h3>
            <p className="text-xs text-slate-500">PagBank, Stone, Mercado Pago, Rede e Cielo.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-[#0e4a56] mb-2">🛵 Delivery</h3>
            <p className="text-xs text-slate-500">iFood, Anota AI e WhatsApp Business API.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-[#0e4a56] mb-2">📜 Fiscal & ERP</h3>
            <p className="text-xs text-slate-500">NFC-e, NF-e, Bling, Conta Azul e SAT.</p>
          </div>
        </div>
      </section>
    </div>
  );
}