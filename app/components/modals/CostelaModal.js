export default function CostelaModal({
  showCostelaModal, setShowCostelaModal, costelaProduct,
  costelaSize, setCostelaSize, costelaTime, setCostelaTime, confirmCostelaOrder
}) {
  if (!showCostelaModal || !costelaProduct) return null;

  const price500 = Number(costelaProduct.price);
  const price700 = Number(costelaProduct.price700g) > 0 ? Number(costelaProduct.price700g) : price500 * 1.4;
  const price1000 = Number(costelaProduct.price1kg) > 0 ? Number(costelaProduct.price1kg) : price500 * 1.9;

  let currentPrice = price500;
  if (costelaSize === '700g') currentPrice = price700;
  if (costelaSize === '1kg') currentPrice = price1000;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-amber-500/30 p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up transition-colors duration-300">
        <h3 className="text-xl font-black text-amber-600 dark:text-amber-500 mb-2 transition-colors">🔥 Encomenda</h3>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mb-4 transition-colors">Agende a retirada/entrega da sua {costelaProduct.name}.</p>

        <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 p-4 rounded-2xl mb-6 text-center shadow-sm dark:shadow-inner transition-colors">
           <p className="text-xs text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1 transition-colors">Valor do Item</p>
           <p className="text-emerald-600 dark:text-emerald-400 font-black text-4xl drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-colors">
              R$ {currentPrice.toFixed(2)}
           </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 dark:text-zinc-500 font-bold uppercase block mb-1 transition-colors">Tamanho da Porção</label>
            <select 
               value={costelaSize} 
               onChange={(e) => setCostelaSize(e.target.value)} 
               className="w-full bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors font-bold cursor-pointer"
            >
              <option value="500g">500g (Padrão)</option>
              {costelaProduct.price700g && <option value="700g">700g (Média)</option>}
              {costelaProduct.price1kg && <option value="1kg">1kg (Família)</option>}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-zinc-500 font-bold uppercase block mb-1 transition-colors">Horário de Entrega (Domingo)</label>
            <select 
               value={costelaTime} 
               onChange={(e) => setCostelaTime(e.target.value)} 
               className="w-full bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors font-bold cursor-pointer"
            >
              <option value="12:00">12:00</option>
              <option value="12:30">12:30</option>
              <option value="13:00">13:00</option>
              <option value="13:30">13:30</option>
              <option value="14:00">14:00</option>
              <option value="14:30">14:30</option>
              <option value="15:00">15:00</option>
              <option value="15:30">15:30</option>
              <option value="16:00">16:00</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-6">
          <button onClick={() => setShowCostelaModal(false)} className="flex-1 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold py-3 rounded-xl transition-all cursor-pointer">Cancelar</button>
          <button onClick={confirmCostelaOrder} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-md cursor-pointer">Confirmar</button>
        </div>
      </div>
    </div>
  );
}