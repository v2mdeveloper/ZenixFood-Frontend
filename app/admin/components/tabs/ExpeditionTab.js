'use client';
import { useState, useEffect } from 'react';

export default function ExpeditionTab({ orders, updateOrderStatus, deliveryPersons, assignDelivery }) {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedEntregador, setSelectedEntregador] = useState('');

  const readyOrders = orders.filter(o => o.status === 'READY');
  const inTransitOrders = orders.filter(o => o.status === 'IN_TRANSIT');

  const toggleSelection = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const generateRoute = () => {
    if (selectedOrders.length === 0) return alert("Selecione pelo menos 1 pedido para gerar a rota.");
    const ordersToRoute = readyOrders.filter(o => selectedOrders.includes(o.id));
    ordersToRoute.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    const origin = encodeURIComponent("Rua Hugo,49 - Vila Prel, cep 05780-310, São Paulo - SP"); 
    const destinations = ordersToRoute.map(o => encodeURIComponent(o.address.split('| OBS:')[0].split('| CUPOM')[0].trim())).join('/');
    const mapsUrl = `https://www.google.com/maps/dir/${origin}/${destinations}`;
    window.open(mapsUrl, '_blank');
  };

  const handleDispatch = () => {
    if (selectedOrders.length === 0) return alert('Selecione ao menos um pedido clicando nele.');
    if (!selectedEntregador) return alert('Selecione um entregador na lista para despachar.');
    assignDelivery(selectedOrders, selectedEntregador);
    setSelectedOrders([]);
    setSelectedEntregador('');
  };

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">🛵 Central de Expedição e Rotas</h2>
          <p className="text-slate-500 text-sm mt-1">Selecione os pedidos prontos, gere a rota e atribua a um entregador.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <button onClick={generateRoute} className="bg-blue-500 hover:bg-blue-600 text-white font-black px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer">
              📍 Abrir no GPS
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA 1: PRONTOS PARA ENTREGA */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">📦 Prontos para Entrega</h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{readyOrders.length} aguardando</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6 flex flex-col gap-3">
               <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Atribuir rota selecionada para:</label>
               <div className="flex gap-2">
                 <select 
                    value={selectedEntregador} 
                    onChange={e => setSelectedEntregador(e.target.value)} 
                    disabled={readyOrders.length === 0}
                    className="flex-1 bg-white border border-slate-300 p-3 rounded-xl font-bold focus:outline-amber-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                 >
                    <option value="">Selecione o Entregador...</option>
                    {deliveryPersons?.map(dp => <option key={dp.id} value={dp.id}>{dp.name} ({dp.role})</option>)}
                 </select>
                 <button 
                    onClick={handleDispatch} 
                    disabled={readyOrders.length === 0}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:bg-slate-300 disabled:text-slate-500 font-black px-6 rounded-xl shadow-sm transition-all disabled:cursor-not-allowed cursor-pointer"
                 >
                    Despachar
                 </button>
               </div>
          </div>

          <div className="space-y-4">
             {readyOrders.map(order => {
               const timeWaiting = Math.floor((now - new Date(order.updatedAt).getTime()) / 60000);
               const isSelected = selectedOrders.includes(order.id);

               return (
                 <div 
                    key={order.id} 
                    onClick={() => toggleSelection(order.id)} 
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${isSelected ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 bg-white hover:border-amber-300'}`}
                 >
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-black text-lg text-slate-900">#{order.shortId}</span>
                     <input type="checkbox" checked={isSelected} readOnly className="w-5 h-5 text-amber-500 border-slate-300 focus:ring-amber-500 rounded cursor-pointer pointer-events-none" />
                   </div>
                   <p className="font-bold text-slate-800">{order.client?.name || 'Cliente Avulso'}</p>
                   <p className="text-xs text-slate-500 mt-2 line-clamp-2">{order.address.split('| OBS:')[0].split('| CUPOM')[0]}</p>
                   
                   {/* BOTÃO WHATSAPP - SE AINDA NÃO DESPACHOU */}
                   {order.client?.phone && (
                      <div className="mt-3">
                         <a href={`https://wa.me/55${order.client.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs p-2 rounded-lg flex items-center justify-center gap-2 border border-emerald-200 transition-colors w-full cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            💬 Contatar Cliente no WhatsApp
                         </a>
                      </div>
                   )}

                   <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center">
                     <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm ${timeWaiting > 10 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
                       ⏱️ Pronto há: {timeWaiting} min
                     </span>
                     <span className="text-sm font-black text-emerald-600">R$ {Number(order.total).toFixed(2)}</span>
                   </div>
                 </div>
               )
             })}
             
             {readyOrders.length === 0 && (
                <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-4xl mb-2 block opacity-50">📋</span>
                  <p className="text-slate-500 font-bold text-sm">A prateleira está vazia! Nenhum pedido aguardando expedição.</p>
                </div>
             )}
          </div>
        </section>

        {/* COLUNA 2: EM ROTA */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">🛵 Em Rota</h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{inTransitOrders.length} na rua</span>
           </div>

           <div className="space-y-4">
            {inTransitOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-2xl border-l-4 border-l-amber-500 border-y border-r border-slate-200 shadow-sm relative hover:-translate-y-1 transition-transform flex flex-col">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="font-black text-slate-900 text-lg">#{order.shortId}</p>
                     <p className="text-sm font-bold text-slate-700 mt-1">{order.client?.name}</p>
                     <p className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded mt-2 inline-block font-bold">
                       Com: <span className="text-amber-600">{order.deliveryPerson?.name || 'Entregador Desconhecido'}</span>
                     </p>
                   </div>
                   <div className="text-right">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Aguardando</p>
                      <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-md shadow-sm">
                        ENTREGA
                      </span>
                   </div>
                </div>

                {/* 🚨 BOTÕES DE FORÇAR BAIXA E WHATSAPP 🚨 */}
                <div className="flex gap-2 w-full mt-auto pt-4 border-t border-slate-100">
                   <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="flex-1 bg-slate-800 hover:bg-black text-white py-2 rounded-lg text-[10px] font-black uppercase shadow-sm cursor-pointer transition-colors">
                     Forçar Baixa ✅
                   </button>
                   {order.client?.phone && (
                     <a href={`https://wa.me/55${order.client.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1 border border-emerald-200">
                       <span>💬</span> WhatsApp
                     </a>
                   )}
                </div>
              </div>
            ))}
            
            {inTransitOrders.length === 0 && (
               <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-100">
                 <span className="text-4xl mb-2 block opacity-50">🚦</span>
                 <p className="text-slate-500 font-bold text-sm">Nenhuma rota ativa no momento.</p>
               </div>
            )}
           </div>
        </section>

      </div>
    </main>
  );
}