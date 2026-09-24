'use client';

export default function AutoatendimentoPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b bg-white py-4 px-6 flex justify-between items-center">
        <a href="/" className="font-black text-[#0e4a56] text-xl">ZENIX FOOD</a>
        <a href="/" className="text-xs font-bold text-slate-500">Voltar</a>
      </header>

      <section className="py-20 max-w-5xl mx-auto px-6 text-center space-y-6">
        <span className="bg-[#f58220]/10 text-[#f58220] text-xs font-bold px-3 py-1 rounded-full uppercase">
          Totens & Smart POS
        </span>
        <h1 className="text-4xl font-black text-[#0e4a56]">Reduza custos com mão de obra e aumente suas vendas</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm leading-relaxed">
          Ofereça aos seus clientes a liberdade de fazerem o pedido sozinhos em Totens modernos de 21 ou 32 polegadas, ou diretamente na mesa via Maquininha Smart POS Android.
        </p>
      </section>
    </div>
  );
}