import { useState, useEffect } from 'react';

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  renderProductBadges,
  menu, // Recebido para procurar os adicionais
  user, // Recebido para o banner de cashback
  availableCashback // Recebido para saldo disponível
}) {
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState('');
  const [selectedExtras, setSelectedExtras] = useState({});

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setObservation('');
      setSelectedExtras({});
    }
  }, [product]);

  if (!product) return null;

  // Filtra automaticamente produtos que servem de "Adicional" ou "Bebida"
  let availableExtras = [];
  if (menu && menu.length > 0) {
     const extraCategories = menu.filter(cat => {
        const n = (cat.name || '').toLowerCase();
        return n.includes('adicion') || n.includes('bebida') || n.includes('acompanha') || n.includes('extra');
     });
     extraCategories.forEach(cat => {
        (cat.products || []).forEach(p => {
           // Não sugere o próprio produto como adicional dele mesmo
           if (p.id !== product.id && p.isActive) {
               if (!availableExtras.find(ex => ex.id === p.id)) {
                   availableExtras.push(p);
               }
           }
        });
     });
  }

  const handleExtraChange = (extraId, delta) => {
     setSelectedExtras(prev => {
        const current = prev[extraId] || 0;
        const next = current + delta;
        if (next <= 0) {
           const newState = { ...prev };
           delete newState[extraId];
           return newState;
        }
        return { ...prev, [extraId]: next };
     });
  };

  // Calcula o Total Dinâmico (Produto Principal + Adicionais)
  let total = Number(product.price) * quantity;
  Object.entries(selectedExtras).forEach(([id, qty]) => {
     const extraProd = availableExtras.find(p => p.id === id);
     if (extraProd) total += Number(extraProd.price) * qty;
  });

  const handleConfirm = () => {
     // Envia o produto principal para a sacola
     onAddToCart(product, quantity, observation);

     // Envia os adicionais selecionados para a sacola com uma observação de vínculo
     Object.entries(selectedExtras).forEach(([id, qty]) => {
         const extraProd = availableExtras.find(p => p.id === id);
         if (extraProd) {
             onAddToCart(extraProd, qty, `Adicional para: ${product.name}`);
         }
     });

     onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-0 md:p-4 animate-fade-in-up">
      {/* Container Principal do Modal com altura máxima travada (max-h) para forçar o scroll interno */}
      <div className="bg-white dark:bg-[#121212] w-full max-w-4xl md:rounded-[2rem] rounded-t-[2rem] flex flex-col md:flex-row shadow-2xl relative max-h-[95vh] md:max-h-[85vh] overflow-hidden">
         
         {/* Botão Fechar Mobile */}
         <button onClick={onClose} className="md:hidden absolute top-3 right-3 z-50 w-8 h-8 bg-slate-200/90 dark:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 dark:text-white shadow-md font-black">✕</button>

         {/* Lado Esquerdo: Imagem de Destaque (Agora com padding e cantos ovais/arredondados) */}
         <div className="w-full md:w-[45%] shrink-0 p-4 md:p-6 h-64 md:h-auto flex flex-col">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full flex-1 object-cover rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5" />
            ) : (
              <div className="w-full h-full flex-1 flex items-center justify-center text-6xl bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2rem]">🍔</div>
            )}
         </div>

         {/* Lado Direito: Conteúdo e Interação (min-h-0 garante que o scroll funcione) */}
         <div className="w-full md:w-[55%] flex flex-col flex-1 min-h-0 overflow-hidden">
            
            {/* Cabeçalho Desktop (Apenas para telas maiores) */}
            <div className="hidden md:flex justify-between items-center p-6 pb-2 shrink-0 border-b border-transparent dark:border-transparent">
              <h2 className="text-lg font-black text-slate-800 dark:text-white">Detalhes do produto</h2>
              <button onClick={onClose} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full flex items-center justify-center text-slate-500 transition-colors font-bold cursor-pointer">✕</button>
            </div>

            {/* CORPO ROLÁVEL (Onde o deslize mágico acontece) */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 md:pt-2 space-y-6 hide-scrollbar">
               
               {/* Informações do Produto */}
               <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{product.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{product.description}</p>
                  <div className="flex items-center gap-3 mb-1">
                     <span className="text-2xl font-black text-emerald-500">R$ {Number(product.price).toFixed(2)}</span>
                     {product.price700g && <span className="text-xs text-slate-400 font-bold line-through">R$ {(Number(product.price) * 1.3).toFixed(2)}</span>}
                     {product.price700g && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black px-2 py-1 rounded-md">-20%</span>}
                  </div>
                  <div className="flex gap-2 mt-3">{renderProductBadges && renderProductBadges(product.name)}</div>
               </div>

               {/* Banner de Cashback Inteligente (Igual à sua imagem) */}
               {user && availableCashback > 0 && (
                  <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex gap-4 items-start shadow-sm bg-white dark:bg-[#151515]">
                     <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center shrink-0 text-2xl shadow-sm">🎁</div>
                     <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-sm mb-1">Cashback Inteligente</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Você possui <strong className="text-purple-600 dark:text-purple-400">R$ {availableCashback.toFixed(2)}</strong> de saldo. Adicione este produto à sacola e utilize o seu cashback no fechamento.</p>
                     </div>
                  </div>
               )}

               {/* Seção de Adicionais (Upsell Interno) */}
               {availableExtras.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-white/5 pt-6">
                     <h4 className="font-black text-slate-800 dark:text-white text-base mb-1">Que tal turbinar seu lanche?</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Escolha opções adicionais</p>
                     
                     <div className="space-y-3">
                        {availableExtras.map(extra => (
                           <div key={extra.id} className="flex justify-between items-center p-3 bg-white dark:bg-[#151515] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:border-amber-400 transition-colors">
                              <div className="flex items-center gap-4">
                                 {extra.imageUrl ? (
                                    <img src={extra.imageUrl} className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-white/5" alt={extra.name} />
                                 ) : (
                                    <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-2xl shadow-sm">🍟</div>
                                 )}
                                 <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-0.5">{extra.name}</p>
                                    <p className="font-black text-xs text-slate-500 dark:text-slate-400">+ R$ {Number(extra.price).toFixed(2)}</p>
                                 </div>
                              </div>
                              
                              {/* Botões de + e - do Adicional */}
                              {selectedExtras[extra.id] ? (
                                 <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
                                    <button onClick={() => handleExtraChange(extra.id, -1)} className="w-7 h-7 flex justify-center items-center font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-[#121212] rounded-lg shadow-sm cursor-pointer">-</button>
                                    <span className="text-sm font-black w-4 text-center text-slate-800 dark:text-white">{selectedExtras[extra.id]}</span>
                                    <button onClick={() => handleExtraChange(extra.id, 1)} className="w-7 h-7 flex justify-center items-center font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-[#121212] rounded-lg shadow-sm cursor-pointer">+</button>
                                 </div>
                              ) : (
                                 <button onClick={() => handleExtraChange(extra.id, 1)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shadow-sm cursor-pointer shrink-0 mr-1">
                                    <span className="text-xl leading-none mb-0.5">+</span>
                                 </button>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Observações */}
               <div className="border-t border-slate-100 dark:border-white/5 pt-6 pb-2">
                  <label className="font-black text-slate-800 dark:text-white text-sm block mb-3">Alguma observação?</label>
                  <textarea rows="2" placeholder="Ex: Tirar cebola, hambúrguer bem passado..." value={observation} onChange={e => setObservation(e.target.value)} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 resize-none text-slate-800 dark:text-white transition-colors"></textarea>
               </div>

            </div>

            {/* RODAPÉ TRAVADO (Sempre visível no fundo do modal) */}
            <div className="p-4 md:p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#121212] flex gap-4 items-center shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-none relative z-20">
               <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 w-28 md:w-32 shrink-0">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-[#121212] rounded-xl font-black text-lg text-slate-700 dark:text-white shadow-sm cursor-pointer">-</button>
                 <span className="text-lg font-black text-slate-800 dark:text-white">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-[#121212] rounded-xl font-black text-lg text-slate-700 dark:text-white shadow-sm cursor-pointer">+</button>
               </div>
               <button onClick={handleConfirm} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex justify-between px-5 md:px-6 items-center cursor-pointer">
                  <span className="text-sm md:text-base">Adicionar</span>
                  <span className="text-sm md:text-base">R$ {total.toFixed(2)}</span>
               </button>
            </div>

         </div>
      </div>
    </div>
  );
}