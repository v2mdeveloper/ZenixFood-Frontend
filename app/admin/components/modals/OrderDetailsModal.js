import React from 'react';

export default function OrderDetailsModal({ order, onClose, triggerManualPrint, getMetodoPagamentoLabel, getProductSizeLabel }) {
  if (!order) return null;

  const subtotal = (Number(order.total) - Number(order.deliveryFee || 0) + Number(order.cashbackUsed || 0)).toFixed(2);

  // A mesma inteligência de separar a observação do endereço
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

  const { address, obs } = parseAddressData(order.address);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up overflow-hidden relative">
        
        {/* LUZ DE DESTAQUE NO TOPO */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-emerald-500"></div>

        {/* HEADER */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Pedido #{order.shortId}</h3>
            <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-black text-lg shadow-sm"
          >
            X
          </button>
        </div>

        {/* CORPO / INFORMAÇÕES */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 bg-white">
          
          {/* Cliente */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl shrink-0">
              👤
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dados do Cliente</h4>
              <p className="font-black text-slate-800 text-xl">{order.client?.name || 'Cliente Avulso'}</p>
              <div className="flex gap-4 mt-2">
                {order.client?.phone && <p className="text-sm text-slate-600 font-medium">📞 {order.client.phone}</p>}
                {order.client?.cpf && <p className="text-sm text-slate-600 font-medium">📄 {order.client.cpf}</p>}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100"></div>

          {/* Endereço */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xl shrink-0">
              🛵
            </div>
            <div className="w-full">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Endereço de Entrega</h4>
              <p className="text-sm text-slate-700 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 font-medium leading-relaxed">
                {address}
              </p>
            </div>
          </div>

          {/* BLOCO DE OBSERVAÇÃO DESTACADO (Só aparece se existir) */}
          {obs && (
            <>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl shrink-0">
                  ⚠️
                </div>
                <div className="w-full">
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Observação do Cliente</h4>
                  <p className="text-sm text-red-700 bg-red-50 p-4 rounded-2xl border border-red-100 font-bold leading-relaxed">
                    {obs}
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="w-full h-px bg-slate-100"></div>

          {/* Itens */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Itens do Pedido</h4>
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {order.items?.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b border-slate-200/60 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-bold text-slate-700">
                    <span className="text-amber-500 mr-2 bg-amber-100 px-2 py-0.5 rounded-lg">{item.quantity}x</span> 
                    {item.name || item.product?.name}{getProductSizeLabel && getProductSizeLabel(item)}
                  </p>
                  <span className="text-sm text-slate-500 font-black">R$ {(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fechamento Financeiro */}
          <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>

            <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-sm text-slate-400 font-medium">
                <span>Subtotal:</span>
                <span>R$ {subtotal}</span>
              </div>
              
              <div className="flex justify-between text-sm text-slate-400 font-medium">
                <span>Taxa de Entrega:</span>
                <span>R$ {Number(order.deliveryFee || 0).toFixed(2)}</span>
              </div>

              {Number(order.cashbackUsed) > 0 && (
                <div className="flex justify-between text-sm text-emerald-400 font-bold bg-emerald-400/10 p-2 rounded-lg -mx-2 px-2">
                  <span>Desconto (Cashback / Cupom):</span>
                  <span>- R$ {Number(order.cashbackUsed).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
                <span className="font-bold text-lg uppercase tracking-wider text-slate-300">Total Pago:</span>
                <span className="text-4xl font-black text-amber-400 tracking-tighter">R$ {Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 text-xs font-black text-slate-300 uppercase tracking-[0.2em] text-center bg-black/40 py-3 rounded-xl border border-white/5 relative z-10">
              {getMetodoPagamentoLabel ? getMetodoPagamentoLabel(order.paymentMethod) : order.paymentMethod}
            </div>
          </div>
        </div>

        {/* FOOTER / AÇÕES */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-white flex gap-4">
          <button 
            onClick={() => triggerManualPrint && triggerManualPrint(order)}
            className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-black py-4 rounded-2xl transition-all border border-blue-200 shadow-sm flex items-center justify-center gap-3 text-sm md:text-base group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🖨️</span> Reimprimir Pedido
          </button>
          
          <button 
            onClick={onClose}
            className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all shadow-sm text-sm md:text-base"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}