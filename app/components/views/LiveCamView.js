export default function LiveCamView({ watchingOrder, setView, setWatchingOrder, storeSettings }) {
  if (!watchingOrder) return null;
  
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-[#050505] flex flex-col animate-fade-in transition-colors duration-300">
      <div className="p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-white/90 dark:from-black/90 to-transparent absolute top-0 w-full z-10 pointer-events-none transition-colors duration-300">
        <h2 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 drop-shadow-lg transition-colors duration-300">
          <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></span>
          Preparo do Pedido #{watchingOrder.shortId}
        </h2>
        <button onClick={() => { setView('orders'); setWatchingOrder(null); }} className="text-slate-900 dark:text-white font-bold bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 border border-slate-300 dark:border-white/20 backdrop-blur-md px-4 py-2 rounded-xl pointer-events-auto transition-all text-xs md:text-sm shadow-lg cursor-pointer">
          ✕ Fechar Live
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {watchingOrder.status === 'PREPARING' ? (
          <div className="w-full max-w-5xl aspect-video bg-slate-100 dark:bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.1)] dark:shadow-[0_0_80px_rgba(239,68,68,0.15)] relative border border-slate-300 dark:border-white/5 ring-1 ring-slate-200 dark:ring-white/10 transition-colors duration-300">
            <iframe
              src={`https://www.youtube.com/embed/${storeSettings?.youtubeLiveId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&origin=${currentOrigin}`}
              title="Transmissão ao Vivo Cânone"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        ) : (
          <div className="text-center animate-fade-in-up bg-white dark:bg-[#121212] p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-lg w-full transition-colors duration-300">
            <span className="text-7xl mb-6 block animate-bounce drop-shadow-md dark:drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]">🛵</span>
            <h3 className="text-emerald-600 dark:text-emerald-400 font-black text-4xl mb-4 transition-colors duration-300">A Grelha Esfriou!</h3>
            <p className="text-slate-600 dark:text-zinc-300 text-lg max-w-md mx-auto mb-8 transition-colors duration-300">O seu pedido já está pronto e não está mais sendo transmitido. Ele já saiu para a entrega!</p>
            <button onClick={() => { setView('orders'); setWatchingOrder(null); }} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black w-full py-4 rounded-xl transition-all shadow-lg dark:shadow-[0_0_30px_rgba(52,211,153,0.3)] text-lg cursor-pointer">
              Voltar aos Meus Pedidos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}