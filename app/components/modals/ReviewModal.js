export default function ReviewModal({
  reviewOrder, setReviewOrder, reviewRating, setReviewRating,
  reviewComment, setReviewComment, isSubmittingReview, handleSubmitReview
}) {
  if (!reviewOrder) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in transition-colors duration-300">
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-amber-500/30 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md relative transition-colors duration-300">
        
        <button onClick={() => setReviewOrder(null)} className="absolute top-4 right-4 text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-white font-bold text-xl cursor-pointer transition-colors">
          ✕
        </button>
        
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center transition-colors">Avaliar Pedido</h2>
        <p className="text-slate-500 dark:text-zinc-400 text-sm text-center mb-6 transition-colors">Como estava o seu pedido #{reviewOrder.shortId}?</p>
        
        <form onSubmit={handleSubmitReview} className="flex flex-col items-center">
          <div className="flex gap-2 mb-6 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                onClick={() => setReviewRating(star)} 
                className={`text-4xl transition-all ${star <= reviewRating ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-slate-300 dark:text-zinc-600 hover:text-amber-400/50'}`}
              >
                ★
              </span>
            ))}
          </div>
          
          <textarea 
            placeholder="Conte para nós o que achou... (opcional)" 
            value={reviewComment} 
            onChange={(e) => setReviewComment(e.target.value)} 
            rows="3" 
            className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 resize-none mb-6 transition-colors" 
          />
          
          <button 
            type="submit" 
            disabled={isSubmittingReview} 
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg py-4 rounded-xl transition-all shadow-md dark:shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer active:scale-95"
          >
            {isSubmittingReview ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </form>
        
      </div>
    </div>
  );
}