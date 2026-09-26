'use client';

import { useState } from 'react';

export default function KDSPage() {
  const [activeTab, setActiveTab] = useState('cozinha');

  return (
    <div className="bg-slate-50 pb-24 font-sans">
      
      {/* HERO SECTION */}
      <section className="bg-[#041a1f] text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#f58220]/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
          <span className="inline-block bg-[#f58220]/20 text-[#f58220] border border-[#f58220]/30 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
            Kitchen Display System
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            A orquestra digital da sua <br className="hidden md:block" /> linha de produção
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            Elimine as impressoras de papel, acabe com pedidos perdidos e controle o tempo exato de preparo (SLA) de cada prato. O Zenix KDS roteia os itens do caixa diretamente para a tela certa em milissegundos.
          </p>
        </div>
      </section>

      {/* SELETOR DE PRAÇAS */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-wrap justify-center gap-2 border border-slate-200">
          {[
            { id: 'cozinha', label: '👨‍🍳 KDS Cozinha', desc: 'Grelha & Quentes' },
            { id: 'bar', label: '🍹 KDS Bar', desc: 'Bebidas & Drinks' },
            { id: 'delivery', label: '🛵 KDS Expedição', desc: 'Montagem & Delivery' },
            { id: 'cliente', label: '📺 Tela Cliente', desc: 'Senhas por Voz' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[200px] px-6 py-4 rounded-2xl transition-all flex flex-col items-center text-center ${
                activeTab === tab.id
                  ? 'bg-[#0e4a56] text-white shadow-md transform scale-[1.02]'
                  : 'bg-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={`font-black text-sm uppercase tracking-wider ${activeTab === tab.id ? 'text-white' : 'text-[#0e4a56]'}`}>
                {tab.label}
              </span>
              <span className={`text-[10px] font-bold mt-1 ${activeTab === tab.id ? 'text-sky-200' : 'text-slate-400'}`}>
                {tab.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ÁREA DE DETALHES DAS TELAS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        
        {/* 1. KDS COZINHA */}
        {activeTab === 'cozinha' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-[#0e4a56] mb-4">Monitor Principal da Cozinha</h2>
                <p className="text-slate-600 leading-relaxed">
                  Focado nas praças quentes (grelha, fritadeira, montagem). Os pedidos chegam instantaneamente com cores dinâmicas que mudam de acordo com o tempo de espera (SLA).
                </p>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-black text-slate-800">Cores de SLA e Alertas Sonoros</h4>
                    <p className="text-sm text-slate-500 mt-1">Verde (No Prazo), Amarelo (Atenção) e Vermelho (Atrasado). Alertas sonoros disparam quando um pedido ultrapassa 15 minutos.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-black text-slate-800">Agrupamento Inteligente</h4>
                    <p className="text-sm text-slate-500 mt-1">O KDS soma itens iguais de comandas diferentes. Ex: Se 3 mesas pediram "Batata Frita", ele mostra um totalizador "3x Batatas" para a fritadeira otimizar o óleo.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-black text-slate-800">Touchscreen ou Teclado Bump</h4>
                    <p className="text-sm text-slate-500 mt-1">Avance, estorne ou conclua pedidos tocando na tela ou utilizando teclados industriais (Bump Bars) de alta durabilidade.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-4 border-slate-800">
              <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                <div className="flex gap-2">
                  <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded">Todas as Praças</span>
                  <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded">Normal</span>
                </div>
                <span className="text-emerald-400 text-xs font-black animate-pulse">Sincronizado ao vivo</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Ticket Verde */}
                <div className="bg-slate-800 border-t-4 border-emerald-500 p-4 rounded-xl flex flex-col">
                  <div className="flex justify-between text-xs font-black text-slate-300 mb-3">
                    <span>MESA 04</span>
                    <span className="text-emerald-400">03:45</span>
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-bold text-white"><span className="text-amber-500 mr-1">2x</span> Smash Salada</p>
                    <p className="text-[10px] text-slate-400 pl-4 border-l-2 border-slate-600">Ponto da Carne: Mal Passado</p>
                    <p className="text-[10px] text-red-400 font-bold pl-4 border-l-2 border-red-500/50">SEM CEBOLA</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700">
                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2 rounded">PRONTO</button>
                  </div>
                </div>
                {/* Ticket Vermelho */}
                <div className="bg-slate-800 border-t-4 border-red-500 p-4 rounded-xl flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="flex justify-between text-xs font-black text-slate-300 mb-3">
                    <span>DELIVERY #992</span>
                    <span className="text-red-400 animate-pulse">18:20</span>
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-bold text-white"><span className="text-amber-500 mr-1">1x</span> Pizza Calabresa GG</p>
                    <p className="text-[10px] text-slate-400 pl-4 border-l-2 border-slate-600">Borda Recheada de Catupiry</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700">
                    <button className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-black py-2 rounded">PRONTO</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. KDS BAR */}
        {activeTab === 'bar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up">
            <div className="order-2 lg:order-1 bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border-4 border-slate-800">
              <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-black px-3 py-1 rounded uppercase">Praça: Barman</span>
              </div>
              <div className="bg-slate-800 border-t-4 border-sky-500 p-4 rounded-xl">
                <div className="flex justify-between text-xs font-black text-slate-300 mb-3">
                  <span>MESA 12</span>
                  <span className="text-sky-400">01:15</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-bold text-white"><span className="text-amber-500 mr-1">2x</span> Gin Tônica Especiarias</p>
                    <p className="text-[10px] text-slate-400 pl-4 border-l-2 border-slate-600">Gin Tanqueray, Tônica Zero, Alecrim</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white"><span className="text-amber-500 mr-1">1x</span> Chopp Pilsen 500ml</p>
                    <p className="text-[10px] text-red-400 font-bold pl-4 border-l-2 border-red-500/50">Com colarinho extra</p>
                  </div>
                </div>
                <button className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black py-2.5 rounded">LIBERAR BEBIDAS</button>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="text-3xl font-black text-[#0e4a56] mb-4">KDS Exclusivo para Bar & Drinks</h2>
                <p className="text-slate-600 leading-relaxed">
                  Evite que pedidos de sucos, chopps e drinks complexos poluam a tela da cozinha quente. O ZenixFood roteia automaticamente apenas as bebidas para o monitor do barman.
                </p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-sky-100 text-sky-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                  <span className="text-sm text-slate-700 font-bold">Separação exata por categoria (Refrigerantes, Cervejas, Coquetelaria).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-sky-100 text-sky-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                  <span className="text-sm text-slate-700 font-bold">Entrega imediata na mesa sem precisar esperar a comida ficar pronta.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 3. KDS EXPEDIÇÃO / DELIVERY */}
        {activeTab === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-[#0e4a56] mb-4">Painel de Expedição e iFood</h2>
                <p className="text-slate-600 leading-relaxed">
                  O maestro do seu Delivery. Esta tela recebe os itens que já foram marcados como "Prontos" pela Cozinha e pelo Bar, organizando a montagem das sacolas.
                </p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-[#f58220]/10 text-[#f58220] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-black text-slate-800">Conferência de Sacola (Checklist)</h4>
                    <p className="text-sm text-slate-500 mt-1">O expedidor marca item por item antes de fechar a sacola, eliminando o erro clássico de "esquecer o refrigerante".</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#f58220]/10 text-[#f58220] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-black text-slate-800">Impressão de Etiquetas (Zebra/Argox)</h4>
                    <p className="text-sm text-slate-500 mt-1">Emite etiquetas de lacre de segurança com os dados do cliente e QR Code de rastreio.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#f58220]/10 text-[#f58220] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-black text-slate-800">Atribuição de Motoboy</h4>
                    <p className="text-sm text-slate-500 mt-1">Dispara o pedido para o app do entregador e notifica o cliente via WhatsApp ("Seu pedido saiu para entrega!").</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-100 p-6 rounded-[2.5rem] shadow-xl border border-slate-200">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase">iFood #8841</span>
                    <p className="text-sm font-black text-slate-800 mt-1">João da Silva</p>
                  </div>
                  <span className="text-emerald-500 text-xs font-black bg-emerald-50 px-3 py-1 rounded-full">Pronto p/ Montar</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <label className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                    <input type="checkbox" className="w-5 h-5 accent-[#f58220]" />
                    <span className="text-sm font-bold text-slate-700">1x Combo Zenix Bacon</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                    <input type="checkbox" className="w-5 h-5 accent-[#f58220]" />
                    <span className="text-sm font-bold text-slate-700">1x Coca-Cola 2L (GELADA)</span>
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-slate-800 text-white text-xs font-black py-3 rounded-xl">🖨️ Etiqueta</button>
                  <button className="flex-1 bg-[#f58220] text-white text-xs font-black py-3 rounded-xl">Despachar 🛵</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TELA CLIENTE (PASS) */}
        {activeTab === 'cliente' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up">
            <div className="order-2 lg:order-1 bg-[#041a1f] p-4 rounded-[2.5rem] shadow-2xl border-[8px] border-slate-800 relative">
              {/* Simulando a TV */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-2 bg-slate-800 rounded-b-lg"></div>
              <div className="grid grid-cols-2 h-64 rounded-2xl overflow-hidden">
                <div className="bg-amber-50 p-4 flex flex-col">
                  <h3 className="text-center font-black text-amber-800 text-sm mb-4 tracking-widest uppercase">Em Preparo</h3>
                  <div className="space-y-3 text-center">
                    <p className="text-3xl font-black text-amber-500">105</p>
                    <p className="text-3xl font-black text-amber-500">106</p>
                  </div>
                </div>
                <div className="bg-emerald-500 p-4 flex flex-col shadow-inner">
                  <h3 className="text-center font-black text-emerald-900 text-sm mb-4 tracking-widest uppercase">Retirar</h3>
                  <div className="space-y-3 text-center">
                    <p className="text-5xl font-black text-white animate-pulse">102</p>
                    <p className="text-2xl font-black text-emerald-200">101</p>
                  </div>
                </div>
              </div>
              {/* Notificação de Voz Virtual */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-xl border border-slate-200 flex items-center gap-2">
                <span className="text-xl">🔊</span>
                <span className="text-xs font-black text-slate-700">"Senha 102, favor comparecer ao balcão."</span>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="text-3xl font-black text-[#0e4a56] mb-4">Painel de Senhas em TV (Com Voz)</h2>
                <p className="text-slate-600 leading-relaxed">
                  Transforme qualquer Smart TV ou monitor em um painel profissional de chamadas. Acabe com os gritos no balcão e organize a área de espera da sua lanchonete ou fast food.
                </p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-[#0e4a56]/10 text-[#0e4a56] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                  <div>
                    <h4 className="font-black text-slate-800">Síntese de Voz Nativa (TTS)</h4>
                    <p className="text-sm text-slate-500 mt-1">O sistema fala a senha em voz alta automaticamente usando Inteligência Artificial humanizada quando o pedido é finalizado no KDS.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#0e4a56]/10 text-[#0e4a56] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                  <div>
                    <h4 className="font-black text-slate-800">Mídia e Publicidade Integrada</h4>
                    <p className="text-sm text-slate-500 mt-1">Você pode exibir banners de promoções, vídeos da sua marca e o seu próprio logotipo dividindo a tela com as senhas.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-6 text-center border-t border-slate-200 pt-16">
        <h2 className="text-2xl font-black text-[#0e4a56] mb-4">Pare de perder dinheiro com papel impresso</h2>
        <p className="text-slate-500 text-sm mb-8">
          Bobinas térmicas custam caro e pedidos no papel se perdem. O KDS do ZenixFood moderniza sua cozinha e se paga logo nos primeiros meses de economia.
        </p>
        <a 
          href="https://wa.me/5511984840258" 
          target="_blank" 
          rel="noreferrer" 
          className="inline-block bg-[#f58220] hover:bg-[#e07318] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-[#f58220]/20 transition-all transform hover:-translate-y-0.5"
        >
          Falar com um Consultor
        </a>
      </section>

    </div>
  );
}