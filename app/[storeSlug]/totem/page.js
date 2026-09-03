'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TotemModerno() {
  const params = useParams();
  const storeSlug = params?.storeSlug || '';

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [storeData, setStoreData] = useState(null);
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Idioma e Tela de Descanso (Screensaver)
  const [isIdle, setIsIdle] = useState(true);
  const [lang, setLanguage] = useState('pt');

  // Dicionário de Traduções Dinâmicas
  const i18n = {
    pt: {
      touchToStart: "Toque para Iniciar",
      selectLanguage: "Selecione seu idioma",
      cancelOrder: "Cancelar Pedido",
      emptyCart: "Seu pedido está vazio. Toque nos itens para adicionar.",
      totalToPay: "Total a Pagar",
      checkout: "FINALIZAR PEDIDO",
      selectCategory: "Selecione uma categoria"
    },
    en: {
      touchToStart: "Touch to Start",
      selectLanguage: "Select your language",
      cancelOrder: "Cancel Order",
      emptyCart: "Your order is empty. Tap items to add.",
      totalToPay: "Total to Pay",
      checkout: "CHECKOUT",
      selectCategory: "Select a category"
    },
    es: {
      touchToStart: "Toca para Empezar",
      selectLanguage: "Selecciona tu idioma",
      cancelOrder: "Cancelar Pedido",
      emptyCart: "Tu pedido está vacío. Toca los artículos para añadir.",
      totalToPay: "Total a Pagar",
      checkout: "FINALIZAR PEDIDO",
      selectCategory: "Selecciona una categoría"
    }
  };

  useEffect(() => {
    if (!storeSlug) return;
    const fetchStoreAndMenu = async () => {
      try {
        const [resStore, resMenu] = await Promise.all([
          fetch(`${API_URL}/api/stores/slug/${storeSlug}`),
          fetch(`${API_URL}/api/menu/public/${storeSlug}`)
        ]);
        
        if (resStore.ok) {
          const sData = await resStore.json();
          setStoreData(sData.store || sData);
        }
        
        if (resMenu.ok) {
          const menuData = await resMenu.json();
          setMenu(menuData);
          if (menuData.length > 0) setActiveCategory(menuData[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do totem", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreAndMenu();
  }, [storeSlug]);

  // Lógica de Retorno para a Tela de Descanso (Inatividade de 60s)
  useEffect(() => {
    let timeoutId;
    const resetIdleTimer = () => {
      if (!isIdle) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsIdle(true);
          setCart([]); // Esvazia o carrinho
          if (menu.length > 0) setActiveCategory(menu[0].id);
        }, 60000); // 60 segundos
      }
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    
    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      clearTimeout(timeoutId);
    };
  }, [isIdle, menu]);

  // 🚀 LÓGICA DE TELA CHEIA (FULLSCREEN) AO TOCAR NA BANDEIRA
  const handleStart = (selectedLang) => {
    setLanguage(selectedLang);
    setIsIdle(false);

    // Solicita tela cheia no elemento principal da página
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.warn(err));
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen().catch(err => console.warn(err));
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen().catch(err => console.warn(err));
      }
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const totalCart = cart.reduce((acc, curr) => acc + (Number(curr.price) * curr.quantity), 0);
  const t = i18n[lang];

  if (loading) return <div className="h-screen bg-slate-50 flex items-center justify-center text-3xl font-black text-amber-500 animate-pulse">Iniciando Totem...</div>;
  if (!storeData) return <div className="h-screen bg-slate-50 flex items-center justify-center text-2xl font-bold text-red-500">Loja não encontrada.</div>;

  // ==========================================
  // TELA DE DESCANSO (SCREENSAVER)
  // ==========================================
  if (isIdle) {
    return (
      <div className="relative w-screen h-screen flex flex-col items-center justify-end pb-32 bg-slate-900 animate-fade-in-up overflow-hidden">
        {/* Fundo do Totem */}
        {storeData.totemCoverImageUrl ? (
           <img src={storeData.totemCoverImageUrl} alt="Capa do Totem" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : storeData.coverImageUrl ? (
           <img src={storeData.coverImageUrl} alt="Capa Alternativa" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
           <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-amber-500 to-orange-600 opacity-80"></div>
        )}
        
        {/* Chamada para Ação */}
        <div className="relative z-10 text-center mb-16 animate-bounce">
           <h1 className="text-6xl font-black text-white drop-shadow-2xl mb-4">Toque para Iniciar</h1>
           <p className="text-2xl font-bold text-white drop-shadow-lg">Select your language / Seleccione su idioma</p>
        </div>

        {/* Botões de Bandeira que disparam o Fullscreen */}
        <div className="relative z-10 flex gap-10">
           <button onClick={() => handleStart('pt')} className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl hover:scale-105 transition-transform bg-white focus:outline-none">
              <img src="https://flagcdn.com/w320/br.png" alt="Português (Brasil)" className="w-full h-full object-cover" />
           </button>
           <button onClick={() => handleStart('en')} className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl hover:scale-105 transition-transform bg-white focus:outline-none">
              <img src="https://flagcdn.com/w320/us.png" alt="English (USA)" className="w-full h-full object-cover" />
           </button>
           <button onClick={() => handleStart('es')} className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl hover:scale-105 transition-transform bg-white focus:outline-none">
              <img src="https://flagcdn.com/w320/es.png" alt="Español (España)" className="w-full h-full object-cover" />
           </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA DE OPERAÇÃO (CARDÁPIO DO TOTEM)
  // ==========================================
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden select-none animate-fade-in-up">
      
      {/* SIDEBAR - CATEGORIAS */}
      <aside className="w-32 md:w-48 bg-white shadow-[2px_0_15px_rgba(0,0,0,0.05)] flex flex-col z-20">
        <div className="h-24 md:h-32 flex items-center justify-center p-4 border-b border-slate-100 shrink-0">
           {storeData.logoUrl ? (
             <img src={storeData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
           ) : (
             <span className="font-black text-xl text-center text-slate-800">{storeData.name}</span>
           )}
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar py-4 space-y-2 px-2">
          {menu.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                activeCategory === cat.id 
                  ? 'bg-amber-500 text-slate-900 shadow-md transform scale-105' 
                  : 'bg-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 bg-white shadow-sm ${activeCategory === cat.id ? 'border-2 border-white' : ''}`}>
                 <span className="text-xl md:text-2xl">🍔</span>
              </div>
              <span className={`text-[10px] md:text-xs text-center leading-tight ${activeCategory === cat.id ? 'font-black' : 'font-bold'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-100">
        
        <header className="h-20 bg-white shadow-sm flex items-center px-8 shrink-0 justify-between">
          <h1 className="text-2xl font-black text-slate-800">
            {menu.find(c => c.id === activeCategory)?.name || t.selectCategory}
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsIdle(true)} className="bg-slate-100 text-slate-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-200">
              🔙
            </button>
            <button onClick={() => { setCart([]); setIsIdle(true); }} className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-full font-bold text-sm hover:bg-red-100">
              {t.cancelOrder}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-40">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {menu.find(c => c.id === activeCategory)?.products?.filter(p => p.isActive !== false).map(prod => (
              <button 
                key={prod.id} 
                onClick={() => addToCart(prod)}
                className="bg-white rounded-3xl p-4 shadow-sm flex flex-col items-center text-center transform transition-transform active:scale-95 border border-slate-200 hover:border-amber-400"
              >
                {prod.imageUrl ? (
                  <img src={prod.imageUrl} alt={prod.name} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl mb-4 shadow-sm" />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-100 rounded-2xl mb-4 flex items-center justify-center text-4xl">🍽️</div>
                )}
                <h3 className="font-black text-slate-800 text-sm md:text-base leading-tight mb-2 line-clamp-2 min-h-[40px]">{prod.name}</h3>
                <span className="mt-auto font-black text-emerald-600 text-lg md:text-xl">R$ {Number(prod.price).toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.1)] flex items-center justify-between p-4 md:p-6 z-30">
           <div className="flex-1 overflow-x-auto hide-scrollbar flex items-center gap-4 pr-6">
             {cart.length === 0 ? (
               <p className="text-slate-400 font-bold italic">{t.emptyCart}</p>
             ) : (
               cart.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl shrink-0">
                   <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                     <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-6 bg-slate-100 text-slate-700 font-black flex items-center justify-center">+</button>
                     <span className="w-8 h-8 flex items-center justify-center font-black text-amber-600 text-lg">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-6 bg-slate-100 text-slate-700 font-black flex items-center justify-center">-</button>
                   </div>
                   <div className="pr-2 max-w-[120px]">
                     <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                     <p className="text-[10px] font-black text-emerald-600">R$ {(item.price * item.quantity).toFixed(2)}</p>
                   </div>
                 </div>
               ))
             )}
           </div>

           <div className="flex items-center gap-6 shrink-0 border-l border-slate-200 pl-6">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.totalToPay}</p>
                <p className="text-3xl md:text-4xl font-black text-slate-900 leading-none">R$ {totalCart.toFixed(2)}</p>
              </div>
              <button 
                disabled={cart.length === 0}
                className="bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-emerald-600 text-white px-8 py-5 md:py-6 rounded-[2rem] font-black text-xl md:text-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3"
              >
                {t.checkout} ➔
              </button>
           </div>
        </div>
      </main>

      {/* DEV FOOTER ABSOLUTO */}
      <div className="absolute top-2 right-4 text-[10px] text-slate-400 font-bold z-50 mix-blend-multiply">
        Desenvolvido por V2M Commercial Automation & Software Developer
        &copy; {new Date().getFullYear()} - Tecnologia em Food Service. Todos os direitos reservados.
      </div>
    </div>
  );
}