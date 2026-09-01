'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function KdsEngine({ mode }) { // mode: 'COZINHA' | 'DELIVERY' | 'BEBIDAS'
  const params = useParams();
  const storeSlug = params.storeSlug;

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [storeStatus, setStoreStatus] = useState('LOADING');
  const [kdsData, setKdsData] = useState({ appOrders: [], totemOrders: [], salaoItems: [] });
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Valida e identifica a loja pelo slug da URL
  useEffect(() => {
    if (!storeSlug) return;

    const identifyStore = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stores/slug/${storeSlug}`);
        const data = await res.json();

        if (data.success) {
          localStorage.setItem('zenix_store_id', data.store.id);
          setStoreStatus('FOUND');
        } else {
          setStoreStatus('NOT_FOUND');
        }
      } catch (error) {
        setStoreStatus('NOT_FOUND');
      }
    };

    identifyStore();
  }, [storeSlug]);

  // Helper local para garantir o envio do x-store-id e Token JWT
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = `/${storeSlug}/bloqueado`;
      }
    }

    return response;
  };

  const extractName = (order) => {
    if (order.origin === 'TOTEM' && order.address) {
      const match = order.address.match(/Cliente:\s*(.*?)(?:\s*\||$)/);
      if (match && match[1]) return match[1].trim();
    }
    return order.client?.name && order.client.name !== 'Totem Autoatendimento' 
      ? order.client.name 
      : (order.origin === 'TOTEM' ? 'Cliente Totem' : 'Cliente Avulso');
  };

  useEffect(() => {
    if (storeStatus !== 'FOUND') return;

    fetchKdsData();
    const interval = setInterval(fetchKdsData, 4000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, [storeStatus]);

  const fetchKdsData = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/kds?_=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setKdsData(data);
      }
    } catch (e) { console.error("Erro ao buscar dados do KDS"); }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setKdsData(prev => ({
      ...prev,
      appOrders: prev.appOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o),
      totemOrders: prev.totemOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    }));
    
    try {
      const res = await fetchWithStore(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Rota não encontrada no servidor.');
      fetchKdsData();
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(null); 
      }
    } catch (e) { alert('Erro ao atualizar pedido. O Backend foi atualizado?'); fetchKdsData(); }
  };

  const updateTabItemStatus = async (itemId, newStatus) => {
    setKdsData(prev => ({
      ...prev,
      salaoItems: prev.salaoItems.map(i => i.id === itemId ? { ...i, status: newStatus } : i)
    }));

    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/items/${itemId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Rota não encontrada no servidor.');
      fetchKdsData();
    } catch (e) { alert('Erro ao dar baixa no item.'); fetchKdsData(); }
  };

  const handleWhatsApp = (phone, clientName, shortId) => {
    if (!phone) return alert('Cliente sem número de telefone registado.');
    const num = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${clientName}, o seu pedido #${shortId} acabou de sair para entrega! 🛵💨`);
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank');
  };

  const triggerManualPrint = async (order) => {
    try {
      const res = await fetch('http://localhost:8080/imprimir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido: order, isPartial: false })
      });
      if (!res.ok) throw new Error('Falha na impressora');
      alert('🖨️ Pedido enviado para a impressora!');
    } catch (error) {
      alert("⚠️ Erro de Impressão: Verifique se o Servidor de Impressão Local está aberto!");
    }
  };

  const getTimerInfo = (createdAt) => {
    const orderTime = new Date(createdAt).getTime();
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    const isLate = diffMs >= 15 * 60 * 1000;
    const mm = String(Math.max(0, diffMins)).padStart(2, '0');
    const ss = String(Math.max(0, diffSecs)).padStart(2, '0');
    return { text: `${mm}:${ss}`, isLate };
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

  if (storeStatus === 'LOADING' || loading) {
    return <div className="p-10 text-center font-bold text-slate-600 bg-slate-50 min-h-screen flex items-center justify-center">Carregando KDS da Loja...</div>;
  }

  if (storeStatus === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-white">
        <span className="text-6xl mb-4">🚫</span>
        <h1 className="text-3xl font-black mb-2">Acesso Negado</h1>
        <p className="text-slate-400">Nenhuma loja encontrada para este endereço.</p>
      </div>
    );
  }

  const { appOrders, totemOrders, salaoItems } = kdsData;

  const deliveryScheduled = appOrders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').filter(o => {
    const n = JSON.stringify(o.items).toLowerCase();
    return n.includes('agendado') || n.includes('costela');
  });
  
  const deliveryPending = appOrders.filter(o => o.status === 'PENDING' && !deliveryScheduled.includes(o));
  const deliveryPreparing = appOrders.filter(o => o.status === 'PREPARING' && !deliveryScheduled.includes(o));
  const deliveryReadyRoute = appOrders.filter(o => o.status === 'READY');
  const deliveryInTransit = appOrders.filter(o => o.status === 'IN_TRANSIT');
  const deliveryCompleted = appOrders.filter(o => o.status === 'DELIVERED').reverse(); 

  const isItemDrink = (item) => item.product?.category?.isDrink === true;

  const filteredSalaoItems = salaoItems.filter(item => {
    const isDrink = isItemDrink(item);
    if (mode === 'BEBIDAS') return isDrink;
    if (mode === 'COZINHA') return !isDrink;
    return false;
  });

  const filteredTotemOrders = totemOrders.filter(order => {
    const hasDrinks = order.items.some(i => i.product?.category?.isDrink === true);
    const hasFood = order.items.some(i => i.product?.category?.isDrink !== true);
    if (mode === 'BEBIDAS') return hasDrinks;
    if (mode === 'COZINHA') return hasFood;
    return false;
  });

  const salaoPreparing = filteredSalaoItems.filter(i => i.status === 'PREPARING' || i.status === 'PENDING');
  const salaoReady = filteredSalaoItems.filter(i => i.status === 'READY');
  const salaoCompleted = filteredSalaoItems.filter(i => i.status === 'SERVED').reverse();

  const totemPreparing = filteredTotemOrders.filter(o => o.status === 'PREPARING');
  const totemReady = filteredTotemOrders.filter(o => o.status === 'READY');
  const totemCompleted = filteredTotemOrders.filter(o => o.status === 'DELIVERED').reverse();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-4 flex flex-col overflow-hidden">
      
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mode === 'COZINHA' ? '👨‍🍳' : mode === 'BEBIDAS' ? '🍹' : '🛵'}</span>
          <div>
            <h1 className="font-black text-slate-800 text-lg uppercase tracking-wider">
              KDS - {mode === 'COZINHA' ? 'Cozinha Principal' : mode === 'BEBIDAS' ? 'Bar & Bebidas' : 'Expedição Delivery'}
            </h1>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sistema Ativo em Tempo Real
            </p>
          </div>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-700">
          🕒 {new Date(now).toLocaleTimeString()}
        </div>
      </div>

      <div className="flex gap-4 flex-1 items-start overflow-x-auto hide-scrollbar w-full pb-4">
        
        {mode === 'DELIVERY' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-shrink-0 w-80 max-h-[85vh]">
            <div className="p-3 bg-red-50 border-b border-red-100 rounded-t-2xl flex justify-between items-center shrink-0">
              <h3 className="font-black text-red-700 text-xs uppercase tracking-widest">Aguardando Pagamento</h3>
              <span className="bg-red-200 text-red-800 text-xs font-black px-2 py-0.5 rounded-lg">{deliveryPending.length}</span>
            </div>
            <div className="p-3 overflow-y-auto space-y-3 flex-1 hide-scrollbar">
              {deliveryPending.map(order => (
                <div key={order.id} onClick={() => setSelectedOrderDetails(order)} className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs relative cursor-pointer hover:border-amber-400 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                     <span className="font-black text-slate-800 text-base">#{order.shortId}</span>
                     <button onClick={(e) => { e.stopPropagation(); triggerManualPrint(order); }} className="text-slate-400 hover:text-blue-500 text-lg cursor-pointer">🖨️</button>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{extractName(order)}</p>
                  <p className="text-xs font-black text-emerald-600 mt-1">R$ {Number(order.total).toFixed(2)}</p>
                  <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'CANCELED'); }} className="mt-3 w-full bg-red-100 hover:bg-red-200 text-red-700 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-colors">
                    Cancelar Pedido
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'DELIVERY' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-shrink-0 w-80 max-h-[85vh]">
            <div className="p-3 bg-purple-50 border-b border-purple-100 rounded-t-2xl flex justify-between items-center shrink-0">
              <h3 className="font-black text-purple-700 text-xs uppercase tracking-widest">Agendados</h3>
              <span className="bg-purple-200 text-purple-800 text-xs font-black px-2 py-0.5 rounded-lg">{deliveryScheduled.length}</span>
            </div>
            <div className="p-3 overflow-y-auto space-y-3 flex-1 hide-scrollbar">
              {deliveryScheduled.map(order => (
                <div key={order.id} onClick={() => setSelectedOrderDetails(order)} className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs cursor-pointer hover:border-amber-400 transition-colors relative">
                  
                  {order.status === 'PENDING' && (
                     <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest text-center py-0.5 z-10 shadow-sm rounded-t-xl">
                        Aguardando Pagamento
                     </div>
                  )}

                  <div className={`flex justify-between items-start mb-1 ${order.status === 'PENDING' ? 'mt-3' : ''}`}>
                     <span className="font-black text-slate-800 text-base">#{order.shortId}</span>
                     <button onClick={(e) => { e.stopPropagation(); triggerManualPrint(order); }} className="text-slate-400 hover:text-blue-500 text-lg cursor-pointer">🖨️</button>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{extractName(order)}</p>
                  <div className="my-2 space-y-1 bg-white p-2 rounded-lg border border-slate-100">
                    {order.items.map(i => <p key={i.id} className="text-xs font-medium">• {i.quantity}x {i.product?.name}</p>)}
                  </div>
                  
                  {order.status === 'PENDING' && (
                    <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'PREPARING'); }} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-black cursor-pointer shadow-sm">
                      💰 Confirmar Pagamento
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'READY'); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-black cursor-pointer shadow-sm mt-1">
                      ✅ Marcar Pronto
                    </button>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-shrink-0 max-h-[85vh] ${mode === 'DELIVERY' ? 'w-80' : 'w-[400px]'}`}>
          <div className="p-3 bg-amber-50 border-b border-amber-100 rounded-t-2xl flex justify-between items-center shrink-0">
            <h3 className="font-black text-amber-700 text-xs uppercase tracking-widest">🔥 Em Preparo</h3>
            <span className="bg-amber-200 text-amber-800 text-xs font-black px-2 py-0.5 rounded-lg">
              {mode === 'DELIVERY' ? deliveryPreparing.length : salaoPreparing.length + totemPreparing.length}
            </span>
          </div>
          
          <div className="p-3 overflow-y-auto space-y-3 flex-1 hide-scrollbar">
            {mode === 'DELIVERY' && deliveryPreparing.map(order => {
              const timer = getTimerInfo(order.createdAt);
              return (
                <div key={order.id} onClick={() => setSelectedOrderDetails(order)} className={`cursor-pointer hover:border-amber-400 transition-colors bg-slate-50 border-2 p-4 rounded-xl shadow-xs ${timer.isLate ? 'border-red-500 bg-red-50/20' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                       <span className="font-black text-slate-900 text-base block">#{order.shortId}</span>
                       <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`text-xs font-black px-2 py-0.5 rounded border ${timer.isLate ? 'bg-red-100 text-red-700 border-red-400 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>⏱️ {timer.text}</span>
                       <button onClick={(e) => { e.stopPropagation(); triggerManualPrint(order); }} className="text-slate-400 hover:text-blue-500 text-lg cursor-pointer">🖨️</button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-700 mb-2">Cliente: {extractName(order)}</p>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 mb-3">
                    {order.items.map(i => <p key={i.id} className="text-xs font-bold text-slate-800">• {i.quantity}x {i.product?.name}</p>)}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'READY'); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black cursor-pointer shadow-sm">
                    Pronto (Aguardando Rota) ✅
                  </button>
                </div>
              );
            })}

            {mode !== 'DELIVERY' && salaoPreparing.map(item => (
              <div key={item.id} className="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl shadow-xs hover:border-amber-400 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black text-slate-900 text-sm">🪑 Mesa/Comanda #{item.tab?.number}</span>
                  {item.seatLabel && <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded">{item.seatLabel}</span>}
                </div>
                <p className="text-sm font-black text-slate-800 my-1"><span className="text-amber-600 mr-1">{item.quantity}x</span> {item.name}</p>
                {item.observation && <p className="text-xs font-bold text-red-600 bg-red-50 p-1.5 rounded-lg mb-2">⚠️ {item.observation}</p>}
                
                <button onClick={(e) => { e.stopPropagation(); updateTabItemStatus(item.id, 'READY'); }} className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-black cursor-pointer shadow-sm">
                  Item Pronto ✅
                </button>
              </div>
            ))}

            {mode !== 'DELIVERY' && totemPreparing.map(order => (
              <div key={order.id} className="bg-slate-50 border-2 border-pink-200 p-4 rounded-xl shadow-xs hover:border-pink-400 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-slate-900 text-sm">💻 Totem #{order.shortId}</span>
                  <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-2 py-0.5 rounded">Totem</span>
                </div>
                <p className="text-xs font-bold text-slate-700 mb-2">{extractName(order)}</p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1 mb-3">
                  {order.items.filter(i => (mode === 'BEBIDAS' ? i.product?.category?.isDrink : !i.product?.category?.isDrink)).map(i => (
                    <p key={i.id} className="text-xs font-bold text-slate-800">• {i.quantity}x {i.product?.name}</p>
                  ))}
                </div>
                <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'READY'); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-black cursor-pointer shadow-sm">
                  Pedido Totem Pronto ✅
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-shrink-0 max-h-[85vh] ${mode === 'DELIVERY' ? 'w-80' : 'w-[400px]'}`}>
          <div className="p-3 bg-emerald-50 border-b border-emerald-100 rounded-t-2xl flex justify-between items-center shrink-0">
            <h3 className="font-black text-emerald-700 text-xs uppercase tracking-widest">
              {mode === 'DELIVERY' ? 'Aguardando Rota' : 'Pronto (Retirada)'}
            </h3>
            <span className="bg-emerald-200 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-lg">
              {mode === 'DELIVERY' ? deliveryReadyRoute.length : (salaoReady.length + totemReady.length)}
            </span>
          </div>
          <div className="p-3 overflow-y-auto space-y-3 flex-1 hide-scrollbar">
            
            {mode === 'DELIVERY' && deliveryReadyRoute.map(order => (
              <div key={order.id} onClick={() => setSelectedOrderDetails(order)} className="cursor-pointer bg-emerald-50/40 border border-emerald-200 p-4 rounded-xl shadow-xs hover:border-amber-400 transition-colors">
                <div className="flex justify-between items-start mb-1">
                   <span className="font-black text-slate-900 text-base">#{order.shortId}</span>
                   <button onClick={(e) => { e.stopPropagation(); triggerManualPrint(order); }} className="text-slate-400 hover:text-blue-500 text-lg cursor-pointer">🖨️</button>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">Cliente: {extractName(order)}</p>
                <p className="text-[10px] text-emerald-700 font-black uppercase mt-1">Disponível na Expedição e Rotas</p>
              </div>
            ))}

            {mode !== 'DELIVERY' && salaoReady.map(item => (
              <div key={item.id} className="bg-emerald-50/40 border border-emerald-200 p-4 rounded-xl shadow-xs flex justify-between items-center">
                 <div>
                    <span className="font-black text-slate-900 text-sm">🪑 Mesa/Comanda #{item.tab?.number}</span>
                    <p className="text-xs font-bold text-slate-700 mt-1">{item.quantity}x {item.name}</p>
                 </div>
                 <span className="text-2xl animate-bounce" title="Aguardando Retirada">🏃</span>
              </div>
            ))}

            {mode !== 'DELIVERY' && totemReady.map(order => (
              <div key={order.id} className="bg-pink-50 border border-pink-200 p-4 rounded-xl shadow-xs flex justify-between items-center">
                 <div>
                    <span className="font-black text-slate-900 text-sm">💻 Totem #{order.shortId}</span>
                    <p className="text-xs font-bold text-slate-700 mt-1">{extractName(order)}</p>
                 </div>
                 <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'DELIVERED'); }} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all shrink-0 ml-2 cursor-pointer">
                    Entregue ✅
                 </button>
              </div>
            ))}

          </div>
        </div>

        {mode === 'DELIVERY' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-shrink-0 w-80 max-h-[85vh]">
            <div className="p-3 bg-blue-50 border-b border-blue-100 rounded-t-2xl flex justify-between items-center shrink-0">
              <h3 className="font-black text-blue-700 text-xs uppercase tracking-widest">Em Rota 🛵</h3>
              <span className="bg-blue-200 text-blue-800 text-xs font-black px-2 py-0.5 rounded-lg">{deliveryInTransit.length}</span>
            </div>
            <div className="p-3 overflow-y-auto space-y-3 flex-1 hide-scrollbar">
              {deliveryInTransit.map(order => (
                <div key={order.id} onClick={() => setSelectedOrderDetails(order)} className="cursor-pointer bg-blue-50/40 border border-blue-200 p-4 rounded-xl shadow-xs flex flex-col gap-2 hover:border-amber-400 transition-colors">
                  <div className="flex justify-between items-start">
                     <span className="font-black text-slate-900 text-base">#{order.shortId}</span>
                     <button onClick={(e) => { e.stopPropagation(); triggerManualPrint(order); }} className="text-slate-400 hover:text-blue-500 text-lg cursor-pointer">🖨️</button>
                  </div>
                  <p className="text-xs font-bold text-slate-700">Cliente: {extractName(order)}</p>
                  
                  <div className="flex gap-2 mt-2">
                     <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'DELIVERED'); }} className="flex-1 bg-slate-800 hover:bg-black text-white py-2 rounded-lg text-[10px] font-black uppercase shadow-sm cursor-pointer transition-colors">
                        Finalizar
                     </button>
                     {order.client?.phone && (
                        <button onClick={(e) => { e.stopPropagation(); handleWhatsApp(order.client?.phone, extractName(order), order.shortId); }} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg text-[10px] border border-emerald-200 font-black uppercase shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1">
                            <span>💬</span> Whats
                        </button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-shrink-0 max-h-[85vh] ${mode === 'DELIVERY' ? 'w-80' : 'w-[300px]'}`}>
          <div className="p-3 bg-slate-100 border-b border-slate-200 rounded-t-2xl flex justify-between items-center shrink-0">
            <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">Concluídos (Turno)</h3>
            <span className="bg-slate-200 text-slate-800 text-xs font-black px-2 py-0.5 rounded-lg">
              {mode === 'DELIVERY' ? deliveryCompleted.length : (totemCompleted.length + salaoCompleted.length)}
            </span>
          </div>
          <div className="p-3 overflow-y-auto space-y-3 flex-1 hide-scrollbar">
            {mode === 'DELIVERY' && deliveryCompleted.map(order => (
              <div key={order.id} onClick={() => setSelectedOrderDetails(order)} className="cursor-pointer bg-slate-50 border border-slate-200 p-3 rounded-xl opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start">
                   <span className="font-bold text-slate-800 text-sm">#{order.shortId} - Entregue 🏠</span>
                   <button onClick={(e) => { e.stopPropagation(); triggerManualPrint(order); }} className="text-slate-400 hover:text-blue-500 text-sm cursor-pointer">🖨️</button>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{extractName(order)}</p>
              </div>
            ))}

            {mode !== 'DELIVERY' && salaoCompleted.map(item => (
              <div key={item.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl opacity-60">
                <span className="font-bold text-slate-800 text-sm">Mesa/Comanda #{item.tab?.number} ✅</span>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.quantity}x {item.name}</p>
              </div>
            ))}

            {mode !== 'DELIVERY' && totemCompleted.map(order => (
              <div key={order.id} className="bg-pink-50 border border-pink-200 p-3 rounded-xl opacity-60">
                <span className="font-bold text-slate-800 text-sm">Totem #{order.shortId} - Entregue ✅</span>
                <p className="text-[10px] text-slate-500 mt-0.5">{extractName(order)}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl relative animate-fade-in-up border border-slate-200 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 shrink-0 border-b border-slate-100 pb-4">
                 <div>
                    <h3 className="text-xl font-black text-slate-900">Pedido #{selectedOrderDetails.shortId}</h3>
                    <p className="text-xs font-bold text-slate-500">{new Date(selectedOrderDetails.createdAt).toLocaleString('pt-BR')}</p>
                 </div>
                 <button onClick={() => setSelectedOrderDetails(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer font-bold">✕</button>
              </div>

              <div className="overflow-y-auto pr-2 hide-scrollbar flex-1">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                    <p className="text-sm font-bold text-slate-800">{extractName(selectedOrderDetails)}</p>
                    {selectedOrderDetails.client?.phone && <p className="text-xs text-slate-500 font-bold mt-1">📞 {selectedOrderDetails.client.phone}</p>}
                 </div>

                 <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-4">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Endereço de Entrega</p>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{parseAddressData(selectedOrderDetails.address).address}</p>
                    {parseAddressData(selectedOrderDetails.address).obs && (
                       <p className="text-xs text-red-600 font-bold mt-2 bg-red-100/50 p-2 rounded-lg border border-red-200">⚠️ OBS: {parseAddressData(selectedOrderDetails.address).obs}</p>
                    )}
                 </div>

                 <div className="space-y-2 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens do Pedido</p>
                    {selectedOrderDetails.items?.map(item => (
                       <div key={item.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                          <p className="text-xs font-bold text-slate-700">
                             <span className="text-amber-500 font-black mr-1">{item.quantity}x</span> {item.name || item.product?.name}
                          </p>
                          <span className="text-xs font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="shrink-0 pt-4 border-t border-slate-100 mt-2">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total a Pagar</span>
                    <span className="text-2xl font-black text-emerald-600">R$ {Number(selectedOrderDetails.total).toFixed(2)}</span>
                 </div>
                 
                 <div className="flex gap-2">
                    <button onClick={() => triggerManualPrint(selectedOrderDetails)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 cursor-pointer">
                       <span className="text-lg">🖨️</span> Reimprimir
                    </button>
                    {selectedOrderDetails.client?.phone && (
                       <button onClick={() => handleWhatsApp(selectedOrderDetails.client?.phone, extractName(selectedOrderDetails), selectedOrderDetails.shortId)} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 cursor-pointer">
                          <span className="text-lg">💬</span> WhatsApp
                       </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}