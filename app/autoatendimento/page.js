'use client';

export default function AutoatendimentoPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b border-slate-200 bg-white py-4 px-6 flex justify-between items-center">
        <a href="/" className="font-black text-[#0e4a56] text-xl">
          ZENIX<span className="text-[#f58220]">FOOD</span>
        </a>
        <a href="/" className="text-xs font-bold text-slate-500 hover:text-[#0e4a56]">Voltar ao Início</a>
      </header>

      <section className="py-16 max-w-5xl mx-auto px-6 space-y-10 text-center">
        <span className="bg-[#f58220]/10 text-[#f58220] text-xs font-bold px-3 py-1 rounded-full uppercase">
          Totens & Smart POS
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0e4a56]">
          Venda mais com menos filas e custos operacionais reduzidos
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          Nossos Totens Digitais e Maquininhas Smart POS oferecem uma experiência moderna de compra que induz o cliente a adicionar acompanhamentos, sobremesas e bebidas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-[#0e4a56] text-base">🖥️ Totens de Parede ou Pedestal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Telas sensíveis ao toque de 21.5&quot; e 32&quot; com leitor de código de barras e maquininha de cartão acoplada.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-[#0e4a56] text-base">📲 Maquininha Smart POS</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              O garçom lança o pedido, imprime a conta e recebe via cartão ou Pix diretamente no mesmo dispositivo Android.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-[#0e4a56] text-base">📱 QR Code na Mesa</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sem precisar baixar aplicativos, o cliente aponta a câmera do celular para a mesa, escolhe os itens e envia direto para a cozinha.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}