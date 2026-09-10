export default function FloatingCart({ cart, view, cartTotal, handleVerSacola }) {
  if (cart.length === 0 || view !== 'menu' || view === 'payment_card' || view === 'payment_pix' || view === 'live_cam') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full max-w-4xl z-40 animate-fade-in-up">
      <div className="bg-amber-500 text-black p-4 md:p-5 rounded-2xl shadow-[0_10px_40px_rgba(245,158,11,0.3)] flex justify-between items-center">
        <div>
          <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-wider">Total do Pedido</p>
          <p className="text-2xl md:text-3xl font-black">R$ {cartTotal.toFixed(2)}</p>
        </div>
        <button onClick={handleVerSacola} className="bg-black hover:bg-zinc-900 text-amber-500 font-black px-6 md:px-8 py-3 md:py-4 rounded-xl flex items-center gap-2 transition-all active:scale-95">
          Ver Sacola <span className="bg-amber-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">{cart.reduce((acc, i) => acc + i.quantity, 0)}</span>
        </button>
      </div>
    </div>
  );
}