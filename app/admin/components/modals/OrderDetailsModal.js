'use client';
import { useState } from 'react';

export default function OrderDetailsModal({ order, onClose, triggerManualPrint, getMetodoPagamentoLabel, getProductSizeLabel }) {
  if (!order) return null;

  const [loadingFiscal, setLoadingFiscal] = useState(false);
  
  // 🛡️ Helper local para garantir o envio do x-store-id nas ações do modal
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    //SE O BACKEND BARRAR POR FALTA DE PAGAMENTO:
    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; // Redireciona para a tela de aviso
      }
    }

    return response;
  };
  const handleEmitirNfce = async () => {
    setLoadingFiscal(true);
    try {
      const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
        ? 'http://localhost:3333' 
        : 'https://zenixfood-backend.onrender.com';

      const res = await fetchWithStore(`${API_URL}/api/admin/orders/${order.id}/fiscal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      if (data.success) {
        alert("NFC-e processada com sucesso!");
      } else {
        alert(data.error || "Erro ao emitir NFC-e.");
      }
    } catch (e) {
      alert("Erro de comunicação ao emitir nota fiscal.");
    } finally {
      setLoadingFiscal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
          <div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
              Pedido #{order.shortId}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-2">Detalhes do Pedido</h3>
            <p className="text-xs text-slate-500">Criado em: {new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors">
            ✕
          </button>
        </div>

        {/* Informações do Cliente & Entrega */}
        <div className="space-y-4 mb-6 text-sm">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Cliente</p>
            <p className="font-bold text-slate-800">{order.client?.name || order.customerName || 'Cliente Balcão/Totem'}</p>
            <p className="text-xs text-slate-600">📞 {order.client?.phone || 'Não informado'}</p>
            <p className="text-xs text-slate-600">📍 {order.address || 'Retirada no Local'}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Pagamento</p>
              <p className="font-bold text-slate-800">{getMetodoPagamentoLabel(order.paymentMethod)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase">Origem</p>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                {order.origin || 'APP'}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Itens do Pedido</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-2xs">
                <div>
                  <p className="font-bold text-sm text-slate-800">
                    {item.quantity}x {item.product?.name || item.name} <span className="text-amber-600 text-xs">{getProductSizeLabel(item)}</span>
                  </p>
                  {item.observation && <p className="text-xs text-red-500 italic">Obs: {item.observation}</p>}
                </div>
                <p className="font-bold text-sm text-slate-700">R$ {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totais */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl mb-6 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Taxa de Entrega:</span>
            <span>R$ {Number(order.deliveryFee || 0).toFixed(2)}</span>
          </div>
          {order.cashbackUsed > 0 && (
            <div className="flex justify-between text-xs text-emerald-400">
              <span>Cashback Utilizado:</span>
              <span>- R$ {Number(order.cashbackUsed).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black pt-2 border-t border-slate-800">
            <span>Total Geral:</span>
            <span className="text-amber-400">R$ {Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Ações (Imprimir e Fiscal) */}
        <div className="flex flex-col md:flex-row gap-3">
          <button 
            onClick={() => triggerManualPrint(order)} 
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            🖨️ Reimprimir Ticket
          </button>

          <button 
            onClick={handleEmitirNfce} 
            disabled={loadingFiscal}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {loadingFiscal ? 'Processando NF-e...' : '🧾 Emitir / Consultar NFC-e'}
          </button>
        </div>

      </div>
    </div>
  );
}