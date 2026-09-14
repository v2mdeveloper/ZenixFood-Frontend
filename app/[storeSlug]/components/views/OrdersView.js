'use client';
import { useState, useEffect } from 'react';

// ============================================================================
//RENDERIZADORES INTELIGENTES (Com suporte ao Dark Mode do App do Cliente)
// ============================================================================
const FormattedItemName = ({ item, baseClassName }) => {
  const quantity = item.quantity || 1;
  const baseProductName = item.product?.name || item.name || 'Item Sem Nome';
  const cartName = item.name || ''; 

  let displayTitle = baseProductName;
  const isPizza = item.isPizza || item.product?.isPizza || displayTitle.toUpperCase().includes('PIZZA') || displayTitle.toUpperCase().includes('SABORES');
  
  if (isPizza && !displayTitle.includes('🍕')) {
    displayTitle = `🍕 ${displayTitle}`;
  }

  let flavors = [];
  const possibleFields = [item.flavors, item.sabores, item.subItems, item.options, item.extras, item.adicionais];
  
  for (let field of possibleFields) {
    if (field) {
      try { 
        const parsed = typeof field === 'string' ? JSON.parse(field) : field; 
        if (Array.isArray(parsed) && parsed.length > 0) { flavors = parsed; break; }
      } catch (e) {}
    }
  }

  const listClass = "pl-6 mt-1 text-[11px] font-bold text-slate-500 dark:text-zinc-400 list-disc space-y-0.5";

  if (flavors.length > 0) {
    return (
      <div className={`flex flex-col w-full ${baseClassName}`}>
        <p className="flex items-start gap-1">
          <span className="text-amber-500 font-black mr-1">{quantity}x</span> 
          <span>{displayTitle}</span>
        </p>
        <ul className={listClass}>
          {flavors.map((flavor, i) => {
             const fName = typeof flavor === 'string' ? flavor : (flavor.name || flavor.productName || flavor.descricao || 'Sabor');
             return <li key={i}>{fName}</li>
          })}
        </ul>
      </div>
    );
  }

  if (cartName.includes(':') && (cartName.includes('/') || cartName.includes(','))) {
    const parts = cartName.split(':');
    if (parts.length > 1) {
      const stringFlavors = parts[1].split(/[\/,]+/).map(f => f.trim()).filter(f => f);
      if (stringFlavors.length > 0) {
          return (
            <div className={`flex flex-col w-full ${baseClassName}`}>
              <p className="flex items-start gap-1">
                <span className="text-amber-500 font-black mr-1">{quantity}x</span> 
                <span>{displayTitle}</span>
              </p>
              <ul className={listClass}>
                {stringFlavors.map((flavor, i) => <li key={i}>{flavor}</li>)}
              </ul>
            </div>
          );
      }
    }
  }

  return (
    <p className={`flex items-start gap-1 ${baseClassName}`}>
      <span className="text-amber-500 font-black mr-1">{quantity}x</span> {displayTitle}
    </p>
  );
};

const ItemExtras = ({ item }) => {
  let comboItems = [];
  if (item.comboItems) {
    try { comboItems = typeof item.comboItems === 'string' ? JSON.parse(item.comboItems) : item.comboItems; } catch (e) {}
  }
  const hasCombo = comboItems && comboItems.length > 0;
  const hasObs = item.observation;

  if (!hasCombo && !hasObs) return null;

  return (
    <div className="mt-1.5 flex flex-col gap-1.5 pl-6">
      {hasCombo && (
        <div className="text-[10.5px] text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <span className="font-black uppercase tracking-wider">🍔 Itens do Combo:</span>
          <ul className="list-disc list-inside mt-1 font-bold">
            {comboItems.map((c, idx) => (
              <li key={idx}>{c.quantity}x {c.name || c.product?.name || 'Item'}</li>
            ))}
          </ul>
        </div>
      )}
      {hasObs && (
        <div className="text-[10.5px] font-black text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
          ⚠️ OBS: {item.observation}
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 📱 COMPONENTE PRINCIPAL
// ============================================================================
export default function OrdersView({
  clientOrders, setWatchingOrder, setView, translateStatus, 
  setReviewOrder, availableCashback, storeSettings, user, fetchClientOrders
}) {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [retryPixData, setRetryPixData] = useState(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); // Modal de Detalhes

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-loja-slug': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 402) {
      if (typeof window !== 'undefined') window.location.href = '/bloqueado';
    }
    return response;
  };

  const getDeliveryCode = (phone) => {
    if (!phone) return '0000';
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 4 ? numbers.slice(-4) : '0000';
  };

  // Formatador de Pagamentos
  const formatPaymentMethod = (method) => {
    const methods = {
      PIX_ONLINE: 'Pix',
      CREDIT_CARD_ONLINE: 'Cartão de Crédito (Online)',
      PIX: 'Pix na Entrega',
      CASH: 'Dinheiro na Entrega',
      CREDIT_CARD: 'Cartão de Crédito na Entrega',
      DEBIT_CARD: 'Cartão de Débito na Entrega',
      CUSTOMER_ACCOUNT: 'Fiado / Conta Assinada'
    };
    return methods[method] || method || 'Não informado';
  };

  const parseAddressData = (fullAddress) => {
    let address = fullAddress || 'Retirada no Balcão';
    let obs = '';
    if (address.includes('| OBS:')) {
      const parts = address.split('| OBS:');
      address = parts[0].trim();
      let remaining = parts[1];
      if (remaining.includes('| CUPOM')) remaining = remaining.split('| CUPOM')[0];
      obs = remaining.trim();
    } else if (address.includes('OBS:')) {
      const parts = address.split('OBS:');
      address = parts[0].trim();
      let remaining = parts[1];
      if (remaining.includes('| CUPOM')) remaining = remaining.split('| CUPOM')[0];
      obs = remaining.trim();
    }
    if (address.includes('| CUPOM')) address = address.split('| CUPOM')[0].trim();
    return { address, obs };
  };

  const handleCancelMyOrder = async (orderId) => {
    if (!confirm("Deseja realmente cancelar este pedido pendente?")) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/orders/${orderId}/cancel`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        alert("Pedido cancelado com sucesso.");
        if (typeof fetchClientOrders === 'function') fetchClientOrders(); 
        else window.location.reload(); 
      } else {
        alert(data.error || "Não foi possível cancelar.");
      }
    } catch (e) {
      alert("Erro de conexão ao cancelar pedido.");
    }
  };

  const handleRetryPayment = async (orderId) => {
    setIsRetrying(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/orders/${orderId}/retry-pix`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.pix) setRetryPixData(data.pix);
      else alert(data.error || "Não foi possível gerar uma nova cobrança.");
    } catch (e) {
      alert("Erro de conexão ao tentar gerar o PIX.");
    } finally {
      setIsRetrying(false);
    }
  };

  const copyPixToClipboard = () => {
    if (retryPixData && retryPixData.qr_code) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(retryPixData.qr_code);
        setPixCopied(true);
        setTimeout(() => setPixCopied(false), 3000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = retryPixData.qr_code;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setPixCopied(true);
          setTimeout(() => setPixCopied(false), 3000);
        } catch (err) {}
        document.body.removeChild(textArea);
      }
    }
  };

  useEffect(() => {
    if (retryPixData && clientOrders.length > 0) {
      const order = clientOrders.find(o => o.id === retryPixData.orderId);
      if (order && (order.status === 'PREPARING' || order.status === 'PAID')) {
        alert('✅ Pagamento PIX Aprovado! O seu pedido já está na grelha da nossa cozinha.');
        setRetryPixData(null);
      }
    }
  }, [clientOrders, retryPixData]);

  if (retryPixData) {
    return (
      <div className="bg-white dark:bg-[#121212] p-6 md:p-10 rounded-3xl border border-amber-500/30 shadow-2xl transition-colors duration-300 animate-fade-in-up text-center max-w-lg mx-auto mt-10">
         <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Finalize seu Pagamento</h2>
         <p className="text-slate-500 dark:text-zinc-400 mb-6 font-medium">Aponte a câmera do celular ou copie o código abaixo.</p>

         <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 p-4 sm:p-6 rounded-2xl mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Leia o QR Code abaixo</p>
            <div className="bg-white p-3 rounded-2xl border-4 border-amber-500 inline-block shadow-lg mx-auto w-48 h-48 mb-4">
               <img src={`data:image/jpeg;base64,${retryPixData.qr_code_base64}`} alt="QR Code PIX" className="w-full h-full object-contain" />
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ou use o código Pix Copia e Cola</p>
               <div className="flex flex-col gap-3">
                  <textarea 
                    readOnly 
                    value={retryPixData.qr_code || ''} 
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

         <button onClick={() => setRetryPixData(null)} className="text-sm font-bold text-slate-400 hover:text-amber-500 transition-colors underline cursor-pointer">
            Voltar aos Meus Pedidos
         </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in-up">
        {/* ================================================================= */}
        {/* PEDIDO MAIS RECENTE EM DESTAQUE */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-[#121212] border border-amber-200 dark:border-amber-500/30 p-6 rounded-3xl shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 text-xs font-bold text-amber-500/50 dark:text-amber-500/20 tracking-widest uppercase">Acompanhamento Real</div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 transition-colors">🔥 Seu Pedido Mais Recente</h2>
          
          {clientOrders.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4 bg-slate-50 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 transition-colors">
                <div><p className="text-xs text-slate-500 dark:text-zinc-500">Código do Pedido</p><p className="font-black text-lg text-slate-900 dark:text-white">#{clientOrders[0].shortId}</p></div>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                  {clientOrders[0].status === 'PREPARING' && storeSettings?.youtubeLiveId && (
                    <button onClick={() => { setWatchingOrder(clientOrders[0]); setView('live_cam'); }} className="bg-red-500 hover:bg-red-400 text-white dark:text-black px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md dark:shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-2 animate-pulse cursor-pointer">
                      <span className="w-2.5 h-2.5 bg-white rounded-full"></span> Assistir Preparo Ao Vivo
                    </button>
                  )}
                  
                  <div className={`px-4 py-2 rounded-xl text-sm font-black border ${translateStatus(clientOrders[0].status).color}`}>
                    {translateStatus(clientOrders[0].status).label}
                  </div>

                  {clientOrders[0].status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRetryPayment(clientOrders[0].id)} disabled={isRetrying} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer">
                        🔄 {isRetrying ? '...' : 'Tentar Pagar'}
                      </button>
                      <button onClick={() => handleCancelMyOrder(clientOrders[0].id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer">
                        ❌ Cancelar
                      </button>
                    </div>
                  )}

                  {clientOrders[0].status === 'DELIVERED' && (
                    <button onClick={() => setReviewOrder(clientOrders[0])} className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md dark:shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer">
                        ⭐ Avaliar
                    </button>
                  )}
                </div>
              </div>

              {(clientOrders[0].status === 'IN_TRANSIT' || clientOrders[0].status === 'READY') && (
                <div className="mb-6 bg-gradient-to-r from-amber-50 dark:from-amber-500/10 to-transparent dark:to-amber-500/5 border border-amber-200 dark:border-amber-500/30 p-5 rounded-2xl text-center shadow-sm dark:shadow-lg transition-colors">
                  <p className="text-xs text-amber-600 dark:text-amber-500 uppercase tracking-widest font-bold mb-1">Senha de Entrega</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-[0.2em] my-2 transition-colors">
                    {getDeliveryCode(user?.phone)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Passe este código para o entregador para receber seu pedido.</p>
                </div>
              )}

              {/* LISTA DE ITENS INTELIGENTE NO PEDIDO PRINCIPAL */}
              <div className="space-y-3 mb-6 bg-slate-50/50 dark:bg-black/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="font-bold text-slate-800 dark:text-zinc-300 text-xs uppercase tracking-widest">Resumo da Compra</p>
                {clientOrders[0].items?.map((item) => (
                  <div key={item.id} className="border-b border-slate-200 dark:border-white/5 last:border-0 pb-2 last:pb-0">
                    <div className="flex justify-between items-start">
                       <FormattedItemName item={item} baseClassName="text-sm font-bold text-slate-800 dark:text-zinc-200 flex-1 pr-4" />
                       <span className="text-sm font-black text-slate-900 dark:text-white shrink-0 mt-0.5">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <ItemExtras item={item} />
                  </div>
                ))}
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center transition-colors">
                 <div className="text-center sm:text-left">
                    <span className="block text-xs text-slate-600 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1">Valor Final Pago:</span>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-500">R$ {Number(clientOrders[0].total).toFixed(2)}</span>
                 </div>
                 <button onClick={() => setSelectedOrderDetails(clientOrders[0])} className="w-full sm:w-auto bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all cursor-pointer shadow-md">
                    🧾 Ver Recibo Completo
                 </button>
              </div>
            </div>
          ) : <p className="text-slate-500 dark:text-zinc-500 italic text-sm">Nenhum pedido realizado recentemente.</p>}
        </section>

        {/* ================================================================= */}
        {/* HISTÓRICO DE PEDIDOS */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 transition-colors">📜 Histórico de Pedidos Realizados</h2>
          <div className="space-y-4">
            {clientOrders.slice(1).map((order) => (
              <div key={order.id} className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center text-sm gap-4 transition-colors">
                <div>
                  <p className="font-black text-slate-900 dark:text-white transition-colors text-lg">#{order.shortId}</p>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
                    <span className="text-slate-900 dark:text-white font-black transition-colors text-base">R$ {Number(order.total).toFixed(2)}</span>
                  </div>
                  
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${translateStatus(order.status).color}`}>
                    {translateStatus(order.status).label.split(' ')[1] || translateStatus(order.status).label}
                  </span>

                  {order.status === 'PENDING' && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => handleRetryPayment(order.id)} disabled={isRetrying} className="flex-1 md:flex-none bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer text-center">
                          🔄 Pagar
                      </button>
                      <button onClick={() => handleCancelMyOrder(order.id)} className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer text-center">
                          Cancelar
                      </button>
                    </div>
                  )}

                  <button onClick={() => setSelectedOrderDetails(order)} className="bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer w-full md:w-auto text-center shadow-sm">
                     Ver Detalhes
                  </button>

                  {order.status === 'PREPARING' && storeSettings?.youtubeLiveId && (
                    <button onClick={() => { setWatchingOrder(order); setView('live_cam'); }} className="bg-red-500 hover:bg-red-400 text-white dark:text-black px-3 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm dark:shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse flex items-center justify-center gap-1 cursor-pointer w-full md:w-auto">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Ao Vivo
                    </button>
                  )}

                  {order.status === 'DELIVERED' && (
                    <button onClick={() => setReviewOrder(order)} className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all shadow-sm cursor-pointer w-full md:w-auto text-center">
                        ⭐ Avaliar
                    </button>
                  )}
                </div>
              </div>
            ))}
            {clientOrders.length <= 1 && <p className="text-slate-500 dark:text-zinc-600 text-sm italic">Não há outros pedidos no seu histórico.</p>}
          </div>
        </section>

        {/* ================================================================= */}
        {/* EXTRATO DE CASHBACK */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 transition-colors">💸 Extrato de Transações de Cashback</h2>
          <div className="space-y-3">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-2xl mb-4 flex justify-between items-center transition-colors">
               <span className="text-slate-600 dark:text-zinc-300 text-sm font-medium">Saldo Atual Disponível na Carteira:</span>
               <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">R$ {availableCashback.toFixed(2)}</span>
            </div>
            {clientOrders.map((order) => {
              const logs = [];
              if (Number(order.cashbackUsed) > 0) { 
                 logs.push(
                    <div key={`${order.id}-used`} className="flex justify-between items-center bg-slate-50 dark:bg-black/20 p-3 rounded-xl border-l-4 border-slate-200 dark:border-transparent border-l-red-500 text-xs transition-colors">
                       <div><p className="font-bold text-slate-800 dark:text-white">Resgate no Pedido #{order.shortId}</p><p className="text-slate-500 dark:text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                       <span className="text-red-500 dark:text-red-400 font-black">- R$ {Number(order.cashbackUsed).toFixed(2)}</span>
                    </div>
                 ); 
              }
              if (Number(order.cashbackGenerated) > 0) { 
                 logs.push(
                    <div key={`${order.id}-gen`} className="flex justify-between items-center bg-slate-50 dark:bg-black/20 p-3 rounded-xl border-l-4 border-slate-200 dark:border-transparent border-l-emerald-500 text-xs transition-colors">
                       <div><p className="font-bold text-slate-800 dark:text-white">Crédito Gerado pelo Pedido #{order.shortId}</p><p className="text-slate-500 dark:text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                       <span className="text-emerald-600 dark:text-emerald-400 font-black">+ R$ {Number(order.cashbackGenerated).toFixed(2)}</span>
                    </div>
                 ); 
              }
              return logs;
            })}
          </div>
        </section>
      </div>

      {/* ================================================================= */}
      {/* 🚀 MODAL DE DETALHES COMPLETOS DO PEDIDO (ESTILO IFOOD) */}
      {/* ================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex justify-center items-start p-4 md:p-8 overflow-y-auto">
           <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl mt-8 mb-8 shrink-0 relative animate-fade-in-up transition-colors">
              
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Pedido #{selectedOrderDetails.shortId}</h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-1">{new Date(selectedOrderDetails.createdAt).toLocaleString('pt-BR')}</p>
                 </div>
                 <button onClick={() => setSelectedOrderDetails(null)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer font-black text-xl shadow-sm">✕</button>
              </div>

              {/* STATUS */}
              <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-center gap-2 ${translateStatus(selectedOrderDetails.status).color}`}>
                 <span className="font-black tracking-widest uppercase text-sm">Status: {translateStatus(selectedOrderDetails.status).label}</span>
              </div>

              {/* LISTA DE ITENS DETALHADA */}
              <div className="mb-6">
                 <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-white/5 pb-2">Itens do Pedido</h4>
                 <div className="space-y-4">
                    {selectedOrderDetails.items?.map(item => (
                       <div key={item.id} className="flex flex-col">
                          <div className="flex justify-between items-start">
                             <FormattedItemName item={item} baseClassName="text-sm font-bold text-slate-800 dark:text-zinc-200 flex-1 pr-2" />
                             <span className="text-sm font-black text-slate-900 dark:text-white shrink-0">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <ItemExtras item={item} />
                       </div>
                    ))}
                 </div>
              </div>

              {/* DADOS DA ENTREGA */}
              <div className="mb-6 bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                 <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Endereço de Entrega</h4>
                 <p className="text-xs font-bold text-slate-800 dark:text-zinc-300 leading-relaxed">{parseAddressData(selectedOrderDetails.address).address}</p>
                 {parseAddressData(selectedOrderDetails.address).obs && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-2 bg-red-100/50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-900/30">⚠️ {parseAddressData(selectedOrderDetails.address).obs}</p>
                 )}
              </div>

              {/* RESUMO FINANCEIRO (DADOS DE PAGAMENTO E TOTAIS) */}
              <div className="bg-slate-100 dark:bg-zinc-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/10">
                 <h4 className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-4 border-b border-slate-200 dark:border-white/10 pb-2">Resumo de Valores</h4>
                 
                 <div className="space-y-2 text-xs font-bold text-slate-600 dark:text-zinc-400 mb-4">
                    <div className="flex justify-between">
                       <span>Forma de Pagamento:</span>
                       <span className="text-slate-900 dark:text-white uppercase tracking-wider">{formatPaymentMethod(selectedOrderDetails.paymentMethod)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                       <span>Subtotal dos Itens:</span>
                       <span>R$ {((Number(selectedOrderDetails.total) + Number(selectedOrderDetails.cashbackUsed || 0)) - Number(selectedOrderDetails.deliveryFee || 0)).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                       <span>Taxa de Entrega:</span>
                       <span className={Number(selectedOrderDetails.deliveryFee) === 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>
                         {Number(selectedOrderDetails.deliveryFee) === 0 ? "Grátis" : `R$ ${Number(selectedOrderDetails.deliveryFee).toFixed(2)}`}
                       </span>
                    </div>

                    {Number(selectedOrderDetails.cashbackUsed) > 0 && (
                       <div className="flex justify-between text-red-500 dark:text-red-400">
                          <span>Desconto / Saldo Usado:</span>
                          <span>- R$ {Number(selectedOrderDetails.cashbackUsed).toFixed(2)}</span>
                       </div>
                    )}
                 </div>

                 <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-white/10">
                    <span className="text-sm font-black text-slate-800 dark:text-white uppercase">Total</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {Number(selectedOrderDetails.total).toFixed(2)}</span>
                 </div>
              </div>

           </div>
        </div>
      )}

    </>
  );
}