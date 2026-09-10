'use client';

export default function Header({ view, setView, isScrolled, user, availableCashback, setAuthMode, isDarkMode, toggleTheme }) {
  if (view === 'payment_card' || view === 'payment_pix' || view === 'live_cam') return null;

  return (
    <header className={`fixed top-0 w-full z-40 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-all duration-500 ${isScrolled ? 'py-3 h-16 shadow-sm' : 'py-5 h-auto'} overflow-hidden`}>
      <div
        className="absolute inset-0 z-[-1] opacity-10 dark:opacity-30 pointer-events-none transition-opacity duration-500"
        style={{ backgroundImage: "url('/textura-header.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-full relative z-10">
        
        <button onClick={() => setView('menu')} className="transition-all duration-300 flex items-center gap-3 cursor-pointer">
          <img 
            src="/logo.png" 
            alt="Cânone Burger" 
            className={`object-contain transition-all duration-500 drop-shadow-md ${isScrolled ? 'h-10' : 'h-20 md:h-24'}`} 
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
          />
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase hidden">Cânone Burger</h1>
        </button>
        
        <div className="flex items-center gap-3 md:gap-5">
          <button 
            onClick={toggleTheme} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-amber-400 hover:scale-110 transition-all cursor-pointer shadow-sm border border-slate-200 dark:border-transparent"
            title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="flex flex-col items-end gap-1.5">
              {Number(availableCashback || 0) > 0 && (
                 <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                   Cashback: R$ {Number(availableCashback || 0).toFixed(2)}
                 </span>
              )}
              <div className="flex gap-4">
                {view !== 'orders' && <button onClick={() => setView('orders')} className="text-slate-600 dark:text-zinc-300 text-xs hover:text-amber-500 font-bold transition-colors cursor-pointer">Meus Pedidos</button>}
                {view !== 'profile' && <button onClick={() => setView('profile')} className="text-blue-600 dark:text-blue-400 text-xs hover:text-blue-500 font-bold transition-colors cursor-pointer">Meu Perfil</button>}
              </div>
            </div>
          ) : (
            view === 'menu' && (
               <button onClick={() => { setAuthMode('login'); setView('auth'); }} className="text-xs font-black uppercase tracking-widest bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 px-5 py-2.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer">
                 Entrar
               </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}