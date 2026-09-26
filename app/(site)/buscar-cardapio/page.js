'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuscarCardapioPage() {
  const [slug, setSlug] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (slug.trim()) {
      router.push(`/${slug.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="bg-slate-50 pb-24 font-sans">
      
      {/* HERO SECTION COM A BUSCA */}
      <section className="bg-[#041a1f] text-white pt-24 pb-36 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#f58220]/20 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0e4a56]/40 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center space-y-6">
          <span className="inline-block bg-[#f58220]/20 text-[#f58220] border border-[#f58220]/30 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
            Portal do Cliente
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Encontre o seu restaurante e faça o seu pedido.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            Digite o nome do estabelecimento abaixo para acessar o cardápio digital interativo, pedir no delivery ou pagar a sua conta na mesa.
          </p>
        </div>
      </section>

      {/* CAIXA DE BUSCA (SOBREPOSTA AO HERO) */}
      <section className="max-w-2xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-2xl shadow-slate-300/50 border border-slate-200">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ex: zenix-burger-artesanal"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 font-bold focus:outline-none focus:border-[#f58220] focus:ring-2 focus:ring-[#f58220]/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-[#f58220] hover:bg-[#e07318] text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#f58220]/20 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Acessar Menu
            </button>
          </form>
          <div className="mt-4 text-center">
             <p className="text-xs text-slate-400 font-bold">O nome da loja geralmente é o mesmo do Instagram. Sem espaços.</p>
          </div>
        </div>
      </section>

      {/* DETALHAMENTO DO CARDÁPIO DIGITAL */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-24">
        
        {/* BLOCO 1: DELIVERY ONLINE */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-[#0e4a56]/10 text-[#0e4a56] font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase">
              🛵 Delivery Próprio
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              A experiência de um aplicativo, sem precisar baixar nada.
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              O nosso Cardápio Digital foi construído com tecnologia PWA (Progressive Web App). Isso significa que o seu cliente tem a fluidez e a beleza de um aplicativo nativo diretamente no navegador do celular, sem atritos de instalação.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Rastreio em Tempo Real:</strong> O cliente acompanha se o pedido está na fila, na grelha ou a caminho.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Cálculo Automático de Frete:</strong> Integração com Google Maps para cobrar a taxa de entrega exata por distância.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Fidelidade e Cashback:</strong> O sistema reconhece o cliente pelo número de celular e aplica saldos de cashback automaticamente.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-slate-100 rounded-[2.5rem] p-6 lg:p-10 flex items-center justify-center relative overflow-hidden h-[450px]">
             {/* Efeitos */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#f58220]/20 rounded-full blur-[80px]"></div>
             
             {/* Mockup do Celular - Tela de Delivery */}
             <div className="relative w-[220px] h-[420px] bg-white rounded-[2rem] border-[6px] border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                {/* Header App */}
                <div className="bg-[#0e4a56] text-white p-4 pb-6 rounded-b-2xl shadow-sm shrink-0">
                   <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Delivery Zenix</p>
                   <h3 className="font-black text-lg mt-1">Acompanhe seu Pedido</h3>
                </div>
                {/* Timeline */}
                <div className="flex-1 p-4 -mt-3 relative z-10 bg-slate-50 space-y-4">
                   <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">✓</div>
                         <p className="text-xs font-black text-slate-800">Pedido Aceito</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-black animate-pulse">⚙</div>
                         <p className="text-xs font-black text-amber-600">Preparando na Cozinha</p>
                      </div>
                      <div className="flex items-center gap-3 opacity-40">
                         <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                         <p className="text-xs font-bold text-slate-500">Saiu para Entrega</p>
                      </div>
                   </div>
                   <div className="bg-[#f58220]/10 border border-[#f58220]/20 p-3 rounded-xl text-center">
                     <p className="text-[10px] font-black text-[#f58220] uppercase">Previsão de Chegada</p>
                     <p className="text-xl font-black text-[#e07318]">20:45</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* BLOCO 2: PAGAMENTO ONLINE E QR CODE NA MESA */}
        <div className="flex flex-col lg:flex-row-reverse gap-12 items-center pt-8 border-t border-slate-200">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-emerald-500/10 text-emerald-600 font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase border border-emerald-500/20">
              💳 Pagamento Digital Integrado
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Pix, Cartão de Crédito e Apple Pay direto na mesa ou no sofá.
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Transforme as mesas do seu salão em caixas autônomos. Com o Cardápio em QR Code, o cliente escolhe o que quer comer, envia o pedido para a cozinha e paga a conta online de forma 100% segura.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Pix Copia e Cola instantâneo:</strong> Confirmação de pagamento imediata na tela do PDV do salão e liberação automática do KDS.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Fechamento de Conta Autônomo:</strong> O cliente não precisa chamar o garçom para pedir a conta. Ele encerra no próprio celular.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Motor Anti-Fraude:</strong> Pagamentos processados por gateways homologados (Mercado Pago, PagSeguro), garantindo segurança total.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-slate-900 rounded-[2.5rem] p-6 lg:p-10 flex items-center justify-center relative overflow-hidden h-[450px]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
             
             {/* Mockup do Celular - Tela de Pagamento */}
             <div className="relative w-[220px] h-[420px] bg-slate-50 rounded-[2rem] border-[6px] border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-white p-4 border-b border-slate-100 text-center shrink-0">
                   <h3 className="font-black text-slate-800">Finalizar Pedido</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 hide-scrollbar">
                   <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-1"><span>Subtotal</span><span>R$ 68,00</span></div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-2"><span>Taxa Serviço</span><span>R$ 6,80</span></div>
                      <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-2"><span>Total</span><span>R$ 74,80</span></div>
                   </div>
                   
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Forma de Pagamento</p>
                     <div className="space-y-2">
                        <div className="bg-emerald-50 border-2 border-emerald-500 p-3 rounded-xl flex items-center gap-3">
                           <span className="text-xl">💠</span>
                           <span className="text-xs font-black text-emerald-700">Pagar com Pix</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                           <span className="text-xl">💳</span>
                           <span className="text-xs font-bold text-slate-600">Cartão de Crédito</span>
                        </div>
                     </div>
                   </div>
                </div>
                <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                  <button className="w-full bg-emerald-500 text-white text-xs font-black py-3 rounded-xl shadow-md">
                     Gerar Código Pix
                  </button>
                </div>
             </div>
          </div>
        </div>

      </section>

      {/* CALL TO ACTION PARA DONOS DE RESTAURANTE */}
      <section className="max-w-4xl mx-auto px-6 text-center border-t border-slate-200 pt-16 mt-10">
        <span className="text-3xl mb-4 inline-block">🚀</span>
        <h2 className="text-2xl font-black text-[#0e4a56] mb-4">Venda dormindo. Sem pagar 27% de comissão.</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">
          Dê o link do seu cardápio ZenixFood no Instagram e WhatsApp. Os pedidos caem direto no seu painel, já pagos, e o cliente fica seu, não do aplicativo de terceiros.
        </p>
        <a 
          href="https://wa.me/5511984840258" 
          target="_blank" 
          rel="noreferrer" 
          className="inline-block bg-[#f58220] hover:bg-[#e07318] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-[#f58220]/20 transition-all transform hover:-translate-y-0.5"
        >
          Criar meu Cardápio Digital Agora
        </a>
      </section>

    </div>
  );
}