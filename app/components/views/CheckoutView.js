'use client';
import { useEffect, useState } from 'react';

export default function CheckoutView({
  isStoreOpen, cart, setView, removeFromCart,
  cep, setCep, address, setAddress, observations, setObservations,
  cpfNaNota, setCpfNaNota,
  couponCode, setCouponCode, appliedCoupon, handleApplyCoupon, 
  isValidatingCoupon, handleRemoveCoupon, couponError, couponDiscount,
  paymentMethod, setPaymentMethod,
  user, availableCashback, useCashback, setUseCashback,
  cartTotal, deliveryFee, discount, finalTotal,
  isSubmittingOrder, handleCheckoutBtnClick,
  isTotemMode, totemName, setTotemName,
  pixData, setPixData
}) {

  const [pixCopied, setPixCopied] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.cep && !cep) setCep(user.cep);
      if (user.address && !address) setAddress(user.address);

      if (!address && user.lastAddress) {
        let lastAdd = user.lastAddress;
        
        if (lastAdd.includes('| OBS:')) {
          lastAdd = lastAdd.split('| OBS:')[0].trim();
        }
        
        if (lastAdd.includes('CEP:')) {
          const parts = lastAdd.split(' - ');
          const extractedCep = parts[0].replace('CEP:', '').trim();
          const extractedAddr = parts.slice(1).join(' - ').trim();
          
          if (!cep) setCep(extractedCep);
          setAddress(extractedAddr);
        } else {
          setAddress(lastAdd);
        }
      }

      if (user.cpf && !cpfNaNota) {
        setCpfNaNota(user.cpf);
      }
    }
  }, [user]);

  const copyPixToClipboard = () => {
    if (pixData && pixData.qr_code) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pixData.qr_code);
        setPixCopied(true);
        setTimeout(() => setPixCopied(false), 3000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = pixData.qr_code;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setPixCopied(true);
          setTimeout(() => setPixCopied(false), 3000);
        } catch (err) {
          alert('Por favor, selecione e copie o texto manualmente.');
        }
        document.body.removeChild(textArea);
      }
    }
  };

  if (pixData) {
    return (
      <div className="bg-white dark:bg-[#121212] p-6 md:p-10 rounded-3xl border border-amber-500/30 shadow-2xl transition-colors duration-300 animate-fade-in-up text-center max-w-lg mx-auto mt-10">
         <span className="text-6xl mb-4 block">✅</span>
         <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Pedido Registrado!</h2>
         <p className="text-slate-500 dark:text-zinc-400 mb-6 font-medium">Agora só falta fazer o pagamento para enviarmos para a cozinha.</p>

         <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 p-4 sm:p-6 rounded-2xl mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Leia o QR Code abaixo</p>
            <div className="bg-white p-3 rounded-2xl border-4 border-amber-500 inline-block shadow-lg mx-auto w-48 h-48 mb-4">
               <img src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-full h-full object-contain" />
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ou use o código Pix Copia e Cola</p>
               
               <div className="flex flex-col gap-3">
                  <textarea 
                    readOnly 
                    value={pixData.qr_code || ''} 
                    className="w-full text-[10px] font-mono text-slate-500 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-xl p-3 resize-none focus:outline-none shadow-inner"
                    rows="4"
                    onClick={(e) => e.target.select()}
                  />
                  
                  <button 
                     onClick={copyPixToClipboard} 
                     className={`w-full py-4 rounded-xl font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${pixCopied ? 'bg-emerald-500 text-slate-900' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'}`}
                  >
                     <span>{pixCopied ? '✅' : '📋'}</span>
                     {pixCopied ? 'Código Copiado!' : 'Copiar Código PIX'}
                  </button>
               </div>
            </div>
         </div>

         <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 mb-6"><span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> Aguardando banco confirmar...</p>
         
         <div className="flex gap-3">
           <button onClick={() => { setPixData(null); setView('orders'); }} className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold py-3.5 rounded-xl transition-all text-xs border border-slate-200 dark:border-white/10 cursor-pointer">
             ⏳ Deixar Pendente
           </button>
           
           <button onClick={async () => {
               if(!confirm('Tem certeza que deseja cancelar este pedido?')) return;
               try {
                  const res = await fetch(`https://canone-backend.onrender.com/api/orders/${pixData.orderId}/cancel`, { method: 'PUT' });
                  if(res.ok) {
                     alert('Pedido cancelado com sucesso. Se usou cashback, ele foi devolvido!');
                     setPixData(null);
                     setView('menu');
                  }
               } catch(e) {}
           }} className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 font-bold py-3.5 rounded-xl transition-all text-xs border border-red-200 dark:border-red-500/30 cursor-pointer">
             ❌ Cancelar Pedido
           </button>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {!isStoreOpen && !cart.some(i => i.isScheduled) && !isTotemMode && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-center transition-colors">
          <h3 className="font-black">A Loja está Fechada</h3>
          <p className="text-sm">Sua sacola está salva, mas você só poderá finalizar pedidos convencionais quando a loja reabrir.</p>
        </div>
      )}

      <section className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 transition-colors"><span className="text-amber-500">🛒</span> Sua Sacola</h2>
          <button type="button" onClick={() => setView('menu')} className="bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-500/20 transition-all cursor-pointer">
               + Incluir novos itens
          </button>
        </div>
        <div className="space-y-4">
          {cart.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="flex justify-between items-center bg-slate-50 dark:bg-black/40 p-4 rounded-xl border border-slate-100 dark:border-white/5 transition-colors">
              <div className="flex items-center gap-3"><span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black w-8 h-8 flex items-center justify-center rounded-lg">{item.quantity}x</span> <span className="font-bold text-slate-800 dark:text-zinc-200">{item.name}</span></div>
              <div className="flex gap-4 items-center"><span className="font-black text-slate-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</span><button onClick={() => removeFromCart(item.productId)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold bg-red-100 dark:bg-red-400/10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer">🗑️</button></div>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={(e) => {
          e.preventDefault(); 
          const scheduledItem = cart.find(i => i.isScheduled || i.name.toLowerCase().includes('agendado'));
          const obsTratada = scheduledItem ? `[AGENDADO DOM: ${scheduledItem.time || 'A Definir'}] ${observations}`.trim() : observations;
          let fullAddress = `CEP: ${cep} - ${address}${obsTratada ? ` | OBS: ${obsTratada}` : ''}`;
          
          if (isTotemMode) {
             fullAddress = `[TOTEM BALCÃO] Cliente: ${totemName}${obsTratada ? ` | OBS: ${obsTratada}` : ''}`;
          }
          
          // 🚨 Envia os dados para finalizar
          handleCheckoutBtnClick(null, fullAddress);
      }} className="space-y-6">
        
        <div className="grid grid-cols-1 gap-6">
          
          {isTotemMode ? (
            <section className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-3xl border border-amber-500/30 shadow-xl dark:shadow-[0_0_20px_rgba(245,158,11,0.15)] text-center transition-colors duration-300">
               <h2 className="text-2xl font-black text-amber-600 dark:text-amber-500 mb-4 transition-colors">🛎️ Como devemos te chamar?</h2>
               <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6 transition-colors">Digite o seu nome para te chamarmos no balcão quando o lanche estiver pronto.</p>
               <input type="text" required value={totemName} onChange={(e) => setTotemName(e.target.value)} placeholder="Digite seu nome..." className="w-full max-w-sm mx-auto block bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors text-2xl font-black text-center" />
            </section>
          ) : (
            <section className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 transition-colors">📍 Endereço de Entrega</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-1"><label className="text-sm font-bold text-slate-500 dark:text-zinc-400 mb-1 block">CEP</label><input type="text" required value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" /></div>
                <div className="md:col-span-2"><label className="text-sm font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Rua, Número e Bairro</label><input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Rua das Flores, 123" className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" /></div>
              </div>
            </section>
          )}

          <section className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 transition-colors">🧾 CPF na Nota Paulista</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-4 font-medium transition-colors">Deseja incluir seu CPF no cupom fiscal? (Opcional)</p>
            <input 
               type="text" 
               value={cpfNaNota} 
               onChange={(e) => {
                 let val = e.target.value.replace(/\D/g, '');
                 if (val.length > 11) val = val.slice(0, 11);
                 val = val.replace(/(\d{3})(\d)/, '$1.$2');
                 val = val.replace(/(\d{3})(\d)/, '$1.$2');
                 val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                 setCpfNaNota(val);
              }} 
               maxLength="14"
              placeholder="000.000.000-00" 
               className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white font-black tracking-widest focus:outline-none focus:border-amber-500 transition-colors" 
             />
          </section>

          <section className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors"><span>✏️</span> Observações do Pedido</h2>
            <textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Ex: Campainha quebrada, entregar na portaria..." rows="3" className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors resize-none text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-600" />
          </section>
          
          {!isTotemMode && (
            <section className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors"><span>🏷️</span> Cupom de Desconto</h2>
              <div className="flex gap-3">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={!!appliedCoupon} placeholder="Digite seu código" className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white font-black focus:outline-none focus:border-amber-500 transition-colors uppercase disabled:opacity-50" />
                {!appliedCoupon ? (
                  <button type="button" onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode} className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-500 text-slate-950 font-black px-6 rounded-xl transition-all shadow-md cursor-pointer">{isValidatingCoupon ? '...' : 'Aplicar'}</button>
                ) : (
                  <button type="button" onClick={handleRemoveCoupon} className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 font-black px-6 rounded-xl transition-all cursor-pointer">Remover</button>
                )}
              </div>
              {couponError && <p className="text-red-500 dark:text-red-400 font-bold text-sm mt-3">{couponError}</p>}
              {appliedCoupon && <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-3 font-black flex items-center gap-1">✅ Cupom aplicado com sucesso! (- R$ {couponDiscount.toFixed(2)})</p>}
            </section>
          )}

          <section className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 transition-colors">💳 Selecione a Forma de Pagamento (Pix/Cartão...)</h2>
            
            <select 
               value={paymentMethod} 
               onChange={(e) => setPaymentMethod(e.target.value)} 
               className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none font-black cursor-pointer shadow-sm mb-4"
            >
              <option value="PIX_ONLINE">{isTotemMode ? 'Pagar com PIX na Tela (QR Code)' : 'Pagar com PIX Agora'}</option>
              {!isTotemMode && <option value="CREDIT_CARD_ONLINE">Pagar com Cartão de Crédito Online</option>}
              <option value="CREDIT_CARD_DELIVERY">{isTotemMode ? 'Pagar no Caixa (Maquininha Cartão)' : 'Cartão na Entrega (Maquininha)'}</option>
              <option value="CASH">{isTotemMode ? 'Pagar no Caixa (Dinheiro)' : 'Dinheiro na Entrega'}</option>
            </select>

            <div className="flex flex-wrap items-center gap-2 mb-5 select-none">
               <div className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm flex items-center justify-center h-8 w-12" title="Visa">
                  <span className="text-[#1434CB] font-black italic text-sm tracking-tighter">VISA</span>
               </div>
               <div className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm flex items-center justify-center h-8 w-12" title="Mastercard">
                  <div className="flex -space-x-1.5 opacity-90">
                     <div className="w-3.5 h-3.5 bg-[#EB001B] rounded-full"></div>
                     <div className="w-3.5 h-3.5 bg-[#F79E1B] rounded-full"></div>
                  </div>
               </div>
               <div className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm flex items-center justify-center h-8 w-12" title="American Express">
                  <span className="bg-[#2671B9] text-white text-[8px] font-bold px-1 rounded-sm w-full text-center py-0.5">AMEX</span>
               </div>
               <div className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm flex items-center justify-center h-8 w-12" title="Elo">
                  <div className="flex items-center">
                     <div className="w-2.5 h-2.5 border-[3px] border-[#00A4E0] rounded-full mr-[1px]"></div>
                     <span className="text-black font-black text-[11px] tracking-tighter">elo</span>
                  </div>
               </div>
               <div className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm flex items-center justify-center h-8 w-[60px]" title="Hipercard">
                  <span className="bg-[#B91C1C] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm">HIPERCARD</span>
               </div>
               <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">+ Aceitas</span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-2xl flex items-start sm:items-center gap-3 shadow-sm">
               <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0 text-xl shadow-sm">
                  🔒
               </div>
               <div>
                  <p className="text-[10px] sm:text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
                    Pagamento 100% Seguro
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500/80 leading-tight">
                     Ambiente criptografado de ponta a ponta. <strong>Não salvamos dados de pagamento.</strong> O processamento é feito com total segurança diretamente na plataforma do adquirente bancário.
                  </p>
               </div>
            </div>
          </section>

        </div>

        <section className="bg-slate-100 dark:bg-gradient-to-br dark:from-[#181818] dark:to-[#121212] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl transition-colors duration-300 mt-8">
          {(!isTotemMode && user && availableCashback > 0) && (
            <label className="flex items-center gap-4 p-5 mb-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shadow-sm">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" checked={useCashback} onChange={(e) => { if (appliedCoupon && e.target.checked) { alert("⚠️ Remova o cupom para usar o seu Saldo de Cashback."); return; } setUseCashback(e.target.checked); }} className="peer appearance-none w-6 h-6 border-2 border-amber-500/50 bg-white dark:bg-black rounded-lg checked:bg-amber-500 transition-all cursor-pointer" />
                <span className="absolute text-slate-950 opacity-0 peer-checked:opacity-100 pointer-events-none text-sm font-black">✓</span>
              </div>
              <div className="flex flex-col"><span className="text-sm font-black text-amber-700 dark:text-amber-500">Usar Saldo de Cashback</span><span className="text-lg font-black text-slate-900 dark:text-white transition-colors">R$ {availableCashback.toFixed(2)} disponíveis</span></div>
            </label>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-slate-600 dark:text-zinc-400 font-bold transition-colors"><span>Subtotal dos itens</span><span>R$ {cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-400 font-bold transition-colors">
                <span>{isTotemMode ? 'Retirada no Balcão' : 'Taxa de Entrega'}</span>
                <span className={isTotemMode ? "text-emerald-600 dark:text-emerald-400 font-black" : ""}>{isTotemMode ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}</span>
            </div>
            {appliedCoupon && <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-black bg-emerald-100 dark:bg-emerald-400/10 p-3 rounded-xl -mx-2 px-3 transition-colors"><span>Cupom ({appliedCoupon.code})</span><span>- R$ {couponDiscount.toFixed(2)}</span></div>}
            {useCashback && discount > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-black bg-emerald-100 dark:bg-emerald-400/10 p-3 rounded-xl -mx-2 px-3 transition-colors"><span>Desconto Aplicado (Cashback)</span><span>- R$ {discount.toFixed(2)}</span></div>}
          </div>
          
          <div className="flex justify-between items-end pt-6 border-t border-slate-300 dark:border-white/10 mb-8 transition-colors">
             <span className="text-slate-700 dark:text-zinc-300 font-black text-lg transition-colors">Total a Pagar</span>
             <div className="text-right">
                <span className="block text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">R$ {finalTotal.toFixed(2)}</span>
             </div>
          </div>
          
          <button type="submit" disabled={(!isStoreOpen && !cart.some(i => i.isScheduled) && !isTotemMode) || isSubmittingOrder} className={`w-full font-black text-lg py-5 rounded-2xl cursor-pointer ${((isStoreOpen || cart.some(i => i.isScheduled) || isTotemMode) && !isSubmittingOrder) ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl' : 'bg-slate-300 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 cursor-not-allowed'} transition-all active:scale-95`}>
            {isSubmittingOrder ? 'Enviando para a cozinha...' : (!isStoreOpen && !cart.some(i => i.isScheduled) && !isTotemMode) ? 'Loja Fechada' : (paymentMethod === 'CREDIT_CARD_ONLINE' ? 'Continuar para Dados do Cartão' : 'Finalizar Pedido Agora')}
          </button>
        </section>
      </form>
    </div>
  );
}