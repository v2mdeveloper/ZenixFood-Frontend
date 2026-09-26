'use client';

export default function IntegracoesPage() {
  return (
    <div className="bg-slate-50 pb-24 font-sans">
      
      {/* HERO SECTION */}
      <section className="bg-[#041a1f] text-white py-24 relative overflow-hidden">
        {/* Efeitos de Iluminação e Conexão */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#f58220]/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-6">
          <span className="inline-block bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
            Hub de Conectividade
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            O fim do retrabalho e dos <br className="hidden md:block" /> múltiplos tablets no balcão
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-3xl mx-auto">
            O ZenixFood centraliza toda a sua operação. Conectamos nativamente o seu delivery, os pagamentos físicos e as obrigações fiscais em um único ecossistema em nuvem, fazendo os sistemas conversarem entre si em tempo real.
          </p>
        </div>
      </section>

      {/* GRID DE INTEGRAÇÕES DETALHADAS */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">
        
        {/* 1. PAGAMENTOS E SMART POS */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-emerald-500/10 text-emerald-600 font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase border border-emerald-500/20">
              💳 Meios de Pagamento & Smart POS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              O valor vai direto para a maquininha. Sem digitação manual.
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Esqueça as divergências de caixa no fim da noite. Com a nossa integração nativa SDK, o ZenixFood roda dentro da própria maquininha Android (Stone e PagBank).
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Stone & PagBank (Nativo):</strong> O app do garçom envia a ordem de cobrança internamente para o leitor de cartão da própria máquina.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>TEF e Conciliação:</strong> Registre pagamentos em terminais físicos de balcão com baixa automática no sistema.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Pix Dinâmico (Mercado Pago):</strong> Gere QR Codes na tela do Totem ou no Cardápio Digital da mesa com confirmação instantânea.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden shadow-2xl">
             <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
             
             <div className="relative z-10 grid grid-cols-2 gap-4">
                {/* Stone */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-green-500/50 transition-colors">
                   <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-3">
                     <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                   </div>
                   <h3 className="font-black text-white text-lg">Stone</h3>
                   <p className="text-[10px] text-slate-400 font-bold mt-1">Smart POS Android SDK</p>
                </div>
                {/* PagBank */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-yellow-400/50 transition-colors">
                   <div className="w-16 h-16 bg-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center mb-3">
                     <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                   </div>
                   <h3 className="font-black text-white text-lg">PagBank</h3>
                   <p className="text-[10px] text-slate-400 font-bold mt-1">PlugPag App-to-App</p>
                </div>
                {/* Mercado Pago */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-blue-400/50 transition-colors">
                   <div className="w-16 h-16 bg-blue-400/20 text-blue-400 rounded-full flex items-center justify-center mb-3 text-2xl font-black">🤝</div>
                   <h3 className="font-black text-white text-lg">Mercado Pago</h3>
                   <p className="text-[10px] text-slate-400 font-bold mt-1">Gateway Pix & Cartão</p>
                </div>
                {/* TEF */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-slate-400/50 transition-colors">
                   <div className="w-16 h-16 bg-slate-600/20 text-slate-300 rounded-full flex items-center justify-center mb-3 text-2xl font-black">📠</div>
                   <h3 className="font-black text-white text-lg">TEF</h3>
                   <p className="text-[10px] text-slate-400 font-bold mt-1">Pinpads Balcão</p>
                </div>
             </div>
          </div>
        </div>

        {/* 2. DELIVERY & MARKETPLACES */}
        <div className="flex flex-col lg:flex-row-reverse gap-12 items-center pt-8 border-t border-slate-200">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-red-500/10 text-red-600 font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase border border-red-500/20">
              🛵 Delivery & Marketplaces
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Os pedidos do iFood caem direto na tela da sua cozinha.
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Elimine o "Gestor de Pedidos" aberto no computador. Nossa integração consome a API oficial dos aplicativos de entrega e unifica tudo em um só lugar.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Aceite Automático:</strong> O ZenixFood aceita o pedido no iFood e dispara o ticket para o monitor KDS da Cozinha Quente.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Cardápio Sincronizado:</strong> Pausou um item no Zenix? Ele pausa automaticamente no iFood e no 99Food.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Robô WhatsApp:</strong> Integração com plataformas como Anota AI ou bot próprio para pedidos diretos e sem taxas.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-slate-100 rounded-[2.5rem] p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute -left-20 top-20 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]"></div>
             
             {/* Mockup Fluxo de Pedido */}
             <div className="relative z-10 flex flex-col gap-4 max-w-sm mx-auto w-full">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-4 animate-fade-in-up">
                   <div className="bg-red-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl">iF</div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Novo Pedido</p>
                     <p className="font-bold text-slate-800">Pizza Calabresa Gigante</p>
                   </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-1 h-8 bg-slate-300 rounded-full relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-full bg-red-500 animate-[ping_1.5s_ease-in-out_infinite]"></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4">
                   <div className="bg-[#0e4a56] text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl">👨‍🍳</div>
                   <div>
                     <p className="text-[10px] font-black text-sky-400 uppercase">KDS Cozinha</p>
                     <p className="font-bold text-white">Recebido e em preparo!</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* 3. FISCAL E HARDWARE */}
        <div className="flex flex-col lg:flex-row gap-12 items-center pt-8 border-t border-slate-200">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-purple-500/10 text-purple-600 font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase border border-purple-500/20">
              🧾 Motor Fiscal & Hardware
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Emissão invisível e impressão inteligente.
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Transforme a burocracia num processo invisível. Nosso motor em nuvem assina digitalmente as suas notas enquanto a impressora local imprime o cupom do cliente.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>NFC-e Silenciosa:</strong> Faça o upload do seu Certificado A1 no Zenix. Ao fechar a conta, emitimos a nota na SEFAZ em background.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Exportação Contador:</strong> Acesso direto para o seu contador baixar o pacote XML mensal e os relatórios do Sped.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Zebra & Argox:</strong> Impressão nativa de etiquetas térmicas de segurança para delivery (ZPL).</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-slate-50 rounded-[2.5rem] p-8 lg:p-10 flex items-center justify-center border border-slate-200 shadow-inner h-[400px]">
             <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 text-center space-y-3 hover:-translate-y-1 transition-transform">
                   <div className="text-4xl">📜</div>
                   <h3 className="font-black text-slate-800 text-sm">NFC-e / NF-e</h3>
                   <p className="text-[10px] font-bold text-slate-500">Homologado Nacional</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 text-center space-y-3 hover:-translate-y-1 transition-transform">
                   <div className="text-4xl">🔐</div>
                   <h3 className="font-black text-slate-800 text-sm">Certificado A1</h3>
                   <p className="text-[10px] font-bold text-slate-500">Assinatura Cloud</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 text-center space-y-3 hover:-translate-y-1 transition-transform">
                   <div className="text-4xl">🖨️</div>
                   <h3 className="font-black text-slate-800 text-sm">Zebra / Epson</h3>
                   <p className="text-[10px] font-bold text-slate-500">Impressão Térmica</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 text-center space-y-3 hover:-translate-y-1 transition-transform">
                   <div className="text-4xl">⌨️</div>
                   <h3 className="font-black text-slate-800 text-sm">Bump Bars</h3>
                   <p className="text-[10px] font-bold text-slate-500">Teclados de Cozinha</p>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-6 text-center border-t border-slate-200 pt-16 mt-10">
        <h2 className="text-2xl font-black text-[#0e4a56] mb-4">Pronto para unificar a sua operação?</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">
          Pare de pagar por dezenas de integrações de terceiros. Com o ZenixFood, tudo o que você precisa já vem nativo no sistema.
        </p>
        <a 
          href="https://wa.me/5511984840258" 
          target="_blank" 
          rel="noreferrer" 
          className="inline-block bg-[#0e4a56] hover:bg-[#0a3842] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-[#0e4a56]/20 transition-all transform hover:-translate-y-0.5"
        >
          Solicitar Demonstração Gratuita
        </a>
      </section>

    </div>
  );
}