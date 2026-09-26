'use client';

export default function AutoatendimentoPage() {
  return (
    <div className="bg-slate-50 pb-24 font-sans">
      
      {/* HERO SECTION */}
      <section className="bg-[#041a1f] text-white py-24 relative overflow-hidden">
        {/* Efeitos de Iluminação */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f58220]/20 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0e4a56]/40 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-6">
          <span className="inline-block bg-[#f58220]/20 text-[#f58220] border border-[#f58220]/30 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
            Ecossistema de Autoatendimento
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Reduza filas, corte custos e <br className="hidden md:block" /> aumente seu ticket médio
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-3xl mx-auto">
            Dê autonomia ao seu cliente. Nossas soluções de Totens, Smart POS e QR Code na mesa não apenas aceleram os pedidos, mas utilizam inteligência de vendas para oferecer adicionais automaticamente em cada compra.
          </p>
        </div>
      </section>

      {/* MÉTRICAS / ROI DE DESTAQUE */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="text-center md:px-4">
            <h3 className="text-4xl font-black text-[#0e4a56] mb-2">+30%</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Aumento no Ticket Médio</p>
            <p className="text-xs text-slate-400 mt-2">Graças ao motor de Upsell que nunca esquece de oferecer a batata grande ou a sobremesa.</p>
          </div>
          <div className="text-center pt-8 md:pt-0 md:px-4">
            <h3 className="text-4xl font-black text-[#f58220] mb-2">100%</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Integração com Cozinha</p>
            <p className="text-xs text-slate-400 mt-2">Pagamento aprovado no totem cai direto na tela do KDS da produção em milissegundos.</p>
          </div>
          <div className="text-center pt-8 md:pt-0 md:px-4">
            <h3 className="text-4xl font-black text-emerald-500 mb-2">-40%</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tempo de Fila</p>
            <p className="text-xs text-slate-400 mt-2">Distribua o fluxo do caixa físico para múltiplos terminais de autoatendimento simultâneos.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24 space-y-24">
        
        {/* SOLUÇÃO 1: TOTENS */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-[#0e4a56]/10 text-[#0e4a56] font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase">
              🖥️ Totens de Pedestal ou Parede
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              O seu melhor vendedor <br /> nunca tira folga.
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Telas industriais de 21" ou 32" polegadas com alta sensibilidade ao toque. O sistema guia o cliente por um cardápio visualmente deslumbrante, induzindo o consumo de adicionais.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Motor de Upsell Automático: "Por +R$ 2,00 deseja a batata grande?"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Leitor de código de barras para leitura de comandas de consumo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Integração TEF: Pinpad (Maquininha) embutido no totem para cartão e Pix na tela.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-slate-200 rounded-[2.5rem] p-6 lg:p-10 flex items-center justify-center relative overflow-hidden h-[450px]">
             {/* Mockup do Totem */}
             <div className="absolute w-[280px] h-[500px] bg-slate-900 rounded-t-3xl border-8 border-slate-800 shadow-2xl flex flex-col overflow-hidden bottom-0 translate-y-10">
                <div className="bg-red-600 h-32 flex flex-col items-center justify-center text-white shrink-0">
                   <h3 className="font-black text-2xl tracking-tighter">ZENIX BURGER</h3>
                   <p className="text-[10px] font-bold uppercase mt-1 bg-black/20 px-2 py-0.5 rounded">Toque para pedir</p>
                </div>
                <div className="bg-slate-50 flex-1 p-3">
                   <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 text-center relative animate-pulse">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Oferta</div>
                      <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-xs font-black text-slate-800">Combo Bacon Duplo</p>
                      <p className="text-[10px] text-slate-500">Batata + Refri</p>
                      <button className="w-full mt-2 bg-red-600 text-white text-[10px] font-black py-1.5 rounded">R$ 35,90</button>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* SOLUÇÃO 2: SMART POS (MAQUININHAS) */}
        <div className="flex flex-col lg:flex-row-reverse gap-12 items-center pt-8 border-t border-slate-200">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-[#f58220]/10 text-[#f58220] font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase">
              📲 Aplicativo Smart POS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Tudo em um único equipamento na mão do garçom.
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Esqueça o celular pessoal do garçom e a maquininha Bluetooth que vive desconectando. O ZenixFood roda <strong>diretamente dentro da maquininha Android (Stone, PagBank, Rede, Cielo)</strong>.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="bg-[#f58220]/20 text-[#f58220] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Lançamento Ágil:</strong> Garçom anota o pedido e envia para a cozinha pelo visor da máquina.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-[#f58220]/20 text-[#f58220] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Cobrança Integrada:</strong> Divida a conta por assentos e passe o cartão/Pix sem digitar o valor (evita erros).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-[#f58220]/20 text-[#f58220] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold"><strong>Emissão Fiscal:</strong> Imprima o extrato da conta ou a NFC-e diretamente na impressora da própria maquininha.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-slate-100 rounded-[2.5rem] p-6 lg:p-10 flex items-center justify-center relative overflow-hidden h-[450px]">
             {/* Efeito de Parceria */}
             <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded">STONE SDK</span>
                <span className="bg-yellow-500 text-slate-900 text-[10px] font-black px-2 py-1 rounded">PAGBANK</span>
             </div>
             {/* Mockup Maquininha */}
             <div className="relative w-[200px] h-[400px] bg-slate-800 rounded-3xl border-[6px] border-slate-700 shadow-2xl flex flex-col p-1.5 transform -rotate-3 hover:rotate-0 transition-transform">
                {/* Bobina de Papel no topo */}
                <div className="w-16 h-2 bg-slate-300 mx-auto rounded-full mb-2"></div>
                {/* Tela do App */}
                <div className="bg-slate-50 flex-1 rounded-2xl overflow-hidden flex flex-col">
                   <div className="bg-[#0e4a56] text-white p-3 text-center shrink-0">
                      <p className="text-[10px] font-black uppercase">Mesa 08</p>
                      <p className="text-lg font-black mt-1">R$ 142,50</p>
                   </div>
                   <div className="flex-1 p-2 space-y-2 bg-slate-100">
                      <button className="w-full bg-[#0e4a56] text-white text-[10px] font-black py-3 rounded-lg shadow-sm">💳 Cobrar Crédito</button>
                      <button className="w-full bg-[#0e4a56] text-white text-[10px] font-black py-3 rounded-lg shadow-sm">💳 Cobrar Débito</button>
                      <button className="w-full bg-teal-500 text-white text-[10px] font-black py-3 rounded-lg shadow-sm">💠 Gerar Pix na Tela</button>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* SOLUÇÃO 3: QR CODE MESA */}
        <div className="flex flex-col lg:flex-row gap-12 items-center pt-8 border-t border-slate-200">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-sky-500/10 text-sky-600 font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase">
              📱 Cardápio Digital em Mesa
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              O garçom invisível <br /> na palma do cliente.
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Basta o cliente apontar a câmera do celular para o display da mesa. Sem necessidade de baixar aplicativos ou realizar cadastros longos, ele acede ao cardápio completo, faz pedidos e paga.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="bg-sky-100 text-sky-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Identificação automática da mesa via URL encriptada do QR Code.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-sky-100 text-sky-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Histórico ao vivo: O cliente acompanha o estado do pedido (Na Fila, Preparando, A Caminho).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-sky-100 text-sky-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-slate-700 font-bold">Pagamento digital via Apple Pay, Google Pay ou Pix Copia e Cola para fechar a conta.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-slate-900 rounded-[2.5rem] p-6 lg:p-10 flex items-center justify-center relative overflow-hidden h-[450px]">
             {/* Efeitos */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-500/20 rounded-full blur-[80px]"></div>
             
             <div className="relative w-[220px] h-[450px] bg-slate-800 rounded-[2rem] border-8 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                {/* Status Bar Simulada */}
                <div className="h-6 bg-white w-full"></div>
                <div className="bg-white flex-1 flex flex-col">
                   <div className="bg-sky-600 p-4 text-center text-white pb-6 rounded-b-3xl shadow-sm">
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Você está na</p>
                      <h3 className="font-black text-2xl">MESA 12</h3>
                   </div>
                   <div className="p-4 -mt-4 relative z-10 space-y-3">
                      <div className="bg-white p-3 rounded-xl shadow-md border border-slate-100 flex items-center gap-3">
                         <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                         <div>
                            <p className="text-xs font-black text-slate-800">Cerveja Artesanal</p>
                            <p className="text-[10px] text-sky-600 font-bold mt-1">R$ 18,00</p>
                         </div>
                      </div>
                      <button className="w-full bg-[#f58220] text-white text-xs font-black py-3 rounded-xl shadow-md">
                         Enviar Pedido
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-6 text-center border-t border-slate-200 pt-16">
        <h2 className="text-2xl font-black text-[#0e4a56] mb-4">A tecnologia certa paga-se a si mesma.</h2>
        <p className="text-slate-500 text-sm mb-8">
          Aumente a sua capacidade de atendimento no pico de movimento sem precisar de contratar mais staff. Deixe a automação fazer o trabalho pesado.
        </p>
        <a 
          href="https://wa.me/5511984840258" 
          target="_blank" 
          rel="noreferrer" 
          className="inline-block bg-[#0e4a56] hover:bg-[#0a3842] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-[#0e4a56]/20 transition-all transform hover:-translate-y-0.5"
        >
          Falar com Especialista
        </a>
      </section>

    </div>
  );
}