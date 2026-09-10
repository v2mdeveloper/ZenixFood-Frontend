export default function UpsellModal({ 
  showUpsellModal, upsellItem, handleAcceptUpsell, handleDeclineUpsell 
}) {
  if (!showUpsellModal || !upsellItem) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-[#121212] border border-emerald-200 dark:border-emerald-500/30 p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up text-center relative overflow-hidden transition-colors duration-300">
        
        {/* Efeito de luz no fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="bg-emerald-500 text-slate-950 text-xs font-black inline-block px-3 py-1 rounded-full uppercase tracking-widest mb-4 relative z-10 shadow-sm">
          Oferta Especial
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10 transition-colors">
          Faltou alguma coisa?
        </h3>
        
        <p className="text-slate-600 dark:text-zinc-400 text-sm mb-6 relative z-10 transition-colors">
          Que tal adicionar <strong className="text-emerald-600 dark:text-emerald-400 transition-colors">{upsellItem.name}</strong> ao seu pedido com desconto exclusivo?
        </p>
        
        {upsellItem.imageUrl ? (
          <img 
            src={upsellItem.imageUrl} 
            alt={upsellItem.name} 
            className="w-32 h-32 object-cover rounded-2xl mx-auto mb-4 border border-slate-200 dark:border-white/10 shadow-md dark:shadow-lg relative z-10 transition-colors" 
          />
        ) : (
          <div className="text-6xl mb-4 relative z-10 animate-bounce">🎁</div>
        )}

        <div className="flex justify-center items-end gap-3 mb-8 relative z-10">
          <span className="text-slate-400 dark:text-zinc-500 line-through text-lg transition-colors">
            R$ {Number(upsellItem.price).toFixed(2)}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black text-4xl drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-colors">
            R$ {Number(upsellItem.offerPrice).toFixed(2)}
          </span>
        </div>

        <div className="space-y-3 relative z-10">
          <button 
            onClick={() => handleAcceptUpsell()} 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl transition-all shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-lg active:scale-95 cursor-pointer"
          >
            Sim, adicionar oferta!
          </button>
          
          <button 
            onClick={handleDeclineUpsell} 
            className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400 font-bold py-3 rounded-xl transition-all text-sm border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            Não, ir para o pagamento
          </button>
        </div>
        
      </div>
    </div>
  );
}