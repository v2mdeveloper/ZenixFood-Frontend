'use client';

export default function SolucoesPage() {
  return (
    <div className="bg-slate-50 pb-24">
      
      {/* HEADER DA PÁGINA (HERO) */}
      <section className="bg-[#041a1f] text-white py-24 relative overflow-hidden">
        {/* Elementos Decorativos */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0e4a56]/30 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#f58220]/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-6">
          <span className="inline-block bg-[#f58220]/20 text-[#f58220] border border-[#f58220]/30 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
            Ecossistema Completo
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Soluções sob medida para <br className="hidden md:block"/> cada tipo de operação
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Seja um restaurante a la carte, uma hamburgueria de alto volume ou uma casa noturna, a arquitetura modular do ZenixFood adapta-se perfeitamente ao seu modelo de negócio.
          </p>
        </div>
      </section>

      {/* GRID DE SOLUÇÕES DETALHADAS */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-8">
        
        {/* CARD 1: CASAS NOTURNAS E BARES */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row gap-12 items-center hover:border-amber-400/50 transition-colors">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center text-3xl shadow-sm">🍸</div>
            <h2 className="text-3xl font-black text-[#0e4a56] tracking-tight">Bares, Pubs & Casas Noturnas</h2>
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              Diga adeus às filas na entrada e na hora de pagar. O nosso módulo focado em entretenimento acelera o fluxo de clientes e blinda a sua operação contra fraudes e perdas de comandas.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-amber-100 text-amber-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Gestão de Promoters e Listas VIP com bonificação automática.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-amber-100 text-amber-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Check-in via leitura de QR Code na portaria, vinculando a comanda ao CPF do cliente.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-amber-100 text-amber-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Comandas pré-pagas ou pré-autorizadas no cartão de crédito.</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden h-[300px]">
             <div className="absolute -right-10 top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
             <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 max-w-sm mx-auto w-full relative z-10 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                   <span className="text-xs font-black text-slate-400">PORTARIA</span>
                   <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Câmera Ativa</span>
                </div>
                <div className="bg-slate-900 rounded-xl h-24 flex items-center justify-center text-white text-xs font-bold">
                   [ Escaneando QR Code... ]
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                   <p className="text-xs font-black text-amber-800">Convidado: Rafael Silva</p>
                   <p className="text-[10px] text-amber-600 font-bold mt-1">Lista VIP Promoter (Isento de Entrada)</p>
                </div>
             </div>
          </div>
        </div>

        {/* CARD 2: RESTAURANTES A LA CARTE */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row-reverse gap-12 items-center hover:border-blue-400/50 transition-colors">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-3xl shadow-sm">🍽️</div>
            <h2 className="text-3xl font-black text-[#0e4a56] tracking-tight">Restaurantes Á La Carte</h2>
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              Um salão cheio exige precisão. O ZenixFood permite que o garçom anote o pedido, envie para a cozinha e realize o split (divisão) da conta na própria mesa de forma rápida e elegante.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Mapa visual interativo de mesas (livre, ocupada, aguardando conta).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Separação do pedido por "Assentos" (Lugar 1, Lugar 2) para facilitar a divisão no final.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">App do Garçom nativo na maquininha Smart POS (Cobrança na mesa).</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden h-[300px]">
             <div className="absolute -left-10 top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
             <div className="grid grid-cols-3 gap-3 relative z-10 w-full max-w-sm mx-auto">
                {[1,2,3,4,5,6].map((mesa) => (
                  <div key={mesa} className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm border ${mesa === 3 ? 'bg-red-50 border-red-200' : mesa === 5 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                     <span className="text-2xl mb-1">🪑</span>
                     <span className={`text-[10px] font-black ${mesa === 3 ? 'text-red-700' : mesa === 5 ? 'text-amber-700' : 'text-slate-600'}`}>Mesa 0{mesa}</span>
                     {mesa === 3 && <span className="text-[8px] font-bold text-red-500 mt-1">Ocupada</span>}
                     {mesa === 5 && <span className="text-[8px] font-bold text-amber-500 mt-1">Fechando</span>}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* CARD 3: FAST FOOD E HAMBURGUERIAS */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row gap-12 items-center hover:border-emerald-400/50 transition-colors">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-sm">🍔</div>
            <h2 className="text-3xl font-black text-[#0e4a56] tracking-tight">Fast Food & Hamburguerias</h2>
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              Volume, velocidade e ticket médio. Utilize nossos totens e KDS para absorver picos intensos de pedidos sem erros na montagem dos lanches.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Venda em Totens com motor de recomendação (Batata frita extra? Bebida maior?).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">KDS com alerta visual amarelo/vermelho por tempo de atraso na grelha.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Monitor de Chamada de Senhas (TV) integrado.</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden h-[300px]">
             <div className="absolute right-0 bottom-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>
             <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-800 max-w-sm mx-auto w-full relative z-10 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                   <span className="text-xs font-black text-white">CHAMADA DE SENHAS</span>
                   <span className="text-[10px] font-bold text-slate-400">TV Salão</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
                      <p className="text-[9px] font-black text-emerald-500 mb-2 uppercase">Pronto p/ Retirar</p>
                      <p className="text-2xl font-black text-emerald-400">#401</p>
                      <p className="text-2xl font-black text-emerald-400 mt-1">#402</p>
                   </div>
                   <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-center">
                      <p className="text-[9px] font-black text-amber-500 mb-2 uppercase">Em Preparo</p>
                      <p className="text-lg font-black text-amber-400">#405</p>
                      <p className="text-lg font-black text-amber-400 mt-1">#406</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </section>
    </div>
  );
}