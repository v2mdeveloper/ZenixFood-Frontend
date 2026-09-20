'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// 🎯 FUNÇÃO INTELIGENTE PARA DEFINIR O ÍCONE DA CATEGORIA
const getCategoryIcon = (category) => {
  const textToSearch = `${category.name || ''} ${category.description || ''}`.toLowerCase();
  
  if (/pizza/i.test(textToSearch)) return '🍕';
  if (/bebida|drink|suco|refri|água|agua|chopp|cerveja/i.test(textToSearch)) return '🥤';
  if (/lanche|hamburguer|burger|sanduiche|sanduíche|combo/i.test(textToSearch)) return '🍔';
  if (/sobremesa|doce|sorvete|açai|açaí|acai|bolo/i.test(textToSearch)) return '🍨';
  if (/prato|pratos|principal|entradas|entrada|prato|refeicao|refeição|marmita|almoço|almoco|janta|restaurante/i.test(textToSearch)) return '🍽️';
  if (/porçao|porção|porcao|petisco|fritas/i.test(textToSearch)) return '🍟';
  if (/salgado|pastel|coxinha/i.test(textToSearch)) return '🥟';
  if (/cafe|café|cappuccino/i.test(textToSearch)) return '☕';
  if (/churasco|espetinho|/i.test(textToSearch)) return '🥩';

  return '🍽️'; // Ícone Padrão caso não ache nenhuma palavra-chave
};

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

  // Estados de Idioma, Inatividade e Checkout
  const [isIdle, setIsIdle] = useState(true);
  const [lang, setLanguage] = useState('pt');
  
  // ESTADOS PARA O PAGAMENTO E NOME
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // 🍕 ESTADOS DO CONSTRUTOR DE PIZZAS
  const [pizzaBuilderOpen, setPizzaBuilderOpen] = useState(false);
  const [pizzaBase, setPizzaBase] = useState(null);
  const [pizzaFlavorCount, setPizzaFlavorCount] = useState(1);
  const [pizzaSelectedFlavors, setPizzaSelectedFlavors] = useState([]);

  // Traduções Dinâmicas
  const i18n = {
    pt: {
      touchToStart: "Toque para Iniciar", selectLanguage: "Selecione seu idioma", cancelOrder: "Cancelar Pedido",
      emptyCart: "Seu pedido está vazio. Toque nos itens para adicionar.", totalToPay: "Total a Pagar",
      checkout: "FINALIZAR PEDIDO", selectCategory: "Selecione uma categoria",
      namePrompt: "Como quer ser chamado?", payMethodPrompt: "Como você prefere pagar?", payNow: "Confirmar Pedido",
      payMachine: "Máquina de Cartão (Aqui no Totem)", payPix: "Pix", payCash: "Pagar no Caixa Principal", insertingOrder: "Enviando...",
      orderSuccessTitle: "Pedido Confirmado!", orderSuccessSub: "Aguarde o seu nome ou número no painel.", passwordIs: "Sua Senha:",
      buildPizza: "Montar Pizza", howManyFlavors: "Quantos sabores?", chooseFlavors: "Escolha suas metades", confirmPizza: "Confirmar Pizza"
    },
    en: {
      touchToStart: "Touch to Start", selectLanguage: "Select your language", cancelOrder: "Cancel Order",
      emptyCart: "Your order is empty. Tap items to add.", totalToPay: "Total to Pay",
      checkout: "CHECKOUT", selectCategory: "Select a category",
      namePrompt: "What's your name?", payMethodPrompt: "How would you like to pay?", payNow: "Confirm Order",
      payMachine: "Card Terminal", payPix: "Pix", payCash: "Pay at the Counter", insertingOrder: "Sending...",
      orderSuccessTitle: "Order Confirmed!", orderSuccessSub: "Wait for your name or number on the screen.", passwordIs: "Your Password:",
      buildPizza: "Build Pizza", howManyFlavors: "How many flavors?", chooseFlavors: "Choose your flavors", confirmPizza: "Confirm Pizza"
    },
    es: {
      touchToStart: "Toca para Empezar", selectLanguage: "Selecciona tu idioma", cancelOrder: "Cancelar Pedido",
      emptyCart: "Tu pedido está vacío. Toca los artículos para añadir.", totalToPay: "Total a Pagar",
      checkout: "FINALIZAR PEDIDO", selectCategory: "Selecciona una categoría",
      namePrompt: "¿Cómo te llamas?", payMethodPrompt: "¿Cómo prefieres pagar?", payNow: "Confirmar Pedido",
      payMachine: "Tarjeta en el Totem", payPix: "Pix", payCash: "Pagar en la Caja", insertingOrder: "Enviando...",
      orderSuccessTitle: "¡Pedido Confirmado!", orderSuccessSub: "Espera tu nombre o número en la pantalla.", passwordIs: "Tu Contraseña:",
      buildPizza: "Armar Pizza", howManyFlavors: "¿Cuántos sabores?", chooseFlavors: "Elige tus sabores", confirmPizza: "Confirmar Pizza"
    }
  };

  useEffect(() => {
    if (!storeSlug) return;
    const fetchStoreAndMenu = async () => {
      try {
        const [resStore, resMenu] = await Promise.all([
          fetch(`${API_URL}/api/settings/public/${storeSlug}`),
          fetch(`${API_URL}/api/menu/public/${storeSlug}`)
        ]);
        
        if (resStore.ok) setStoreData(await resStore.json());
        if (resMenu.ok) {
          const menuData = await resMenu.json();
          setMenu(menuData);
          if (menuData.length > 0) setActiveCategory(menuData[0].id);
        }
      } catch (error) { console.error("Erro ao carregar dados", error); } finally { setLoading(false); }
    };
    fetchStoreAndMenu();
  }, [storeSlug]);

  useEffect(() => {
    let timeoutId;
    const resetIdleTimer = () => {
      if (!isIdle && !orderSuccessData) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsIdle(true); setCart([]); setIsCheckoutOpen(false); setPizzaBuilderOpen(false);
          if (menu.length > 0) setActiveCategory(menu[0].id);
        }, 60000); 
      }
    };
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    resetIdleTimer();
    return () => {
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      clearTimeout(timeoutId);
    };
  }, [isIdle, menu, orderSuccessData]);

  useEffect(() => {
    if (orderSuccessData) {
      const timer = setTimeout(() => {
        setOrderSuccessData(null); setIsIdle(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [orderSuccessData]);

  const handleStart = (selectedLang) => {
    setLanguage(selectedLang); setIsIdle(false);
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen().catch(e => {});
    }
  };

  // 🎯 LÓGICA DE CARRINHO
  const addToCart = (productToAdd) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productToAdd.id);
      if (existing) return prev.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...productToAdd, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(i => i.quantity > 0));
  };

  // 🍕 LÓGICA DO CONSTRUTOR DE PIZZAS
  const handleProductClick = (prod) => {
    if (prod.isPizza && prod.maxFlavors > 1) {
      setPizzaBase(prod);
      setPizzaFlavorCount(1);
      setPizzaSelectedFlavors([prod]); 
      setPizzaBuilderOpen(true);
    } else {
      addToCart(prod);
    }
  };

  const togglePizzaFlavor = (flavorProd) => {
    if (pizzaSelectedFlavors.find(f => f.id === flavorProd.id)) {
      setPizzaSelectedFlavors(prev => prev.filter(f => f.id !== flavorProd.id));
    } else {
      if (pizzaSelectedFlavors.length < pizzaFlavorCount) {
        setPizzaSelectedFlavors(prev => [...prev, flavorProd]); 
      }
    }
  };

  const getPizzaPricePreview = () => {
    if (!pizzaBase || pizzaSelectedFlavors.length === 0) return 0;
    if (pizzaBase.pricingStrategy === 'AVERAGE') {
      const sum = pizzaSelectedFlavors.reduce((acc, f) => acc + Number(f.price), 0);
      return sum / pizzaSelectedFlavors.length;
    } else {
      return Math.max(...pizzaSelectedFlavors.map(f => Number(f.price)));
    }
  };

  const confirmBuiltPizza = () => {
    const finalPrice = getPizzaPricePreview();
    const customId = `${pizzaBase.id}-` + pizzaSelectedFlavors.map(f => f.id).sort().join('-');
    const customName = `🍕 ${pizzaFlavorCount} Sabores: ` + pizzaSelectedFlavors.map(f => f.name).join(' / ');
    
    const cartItem = {
      ...pizzaBase,
      id: customId,
      productId: pizzaBase.id,
      name: customName,
      price: finalPrice,
      flavors: pizzaSelectedFlavors.map(f => ({ productId: f.id, name: f.name }))
    };

    addToCart(cartItem);
    setPizzaBuilderOpen(false);
  };

  // ==========================================
  // FINALIZAÇÃO DE PEDIDO
  // ==========================================
  const handleFinalizeOrder = async () => {
    if (!customerName.trim() || !paymentMethod) return alert(t.namePrompt);
    setIsSubmitting(true);
    
    try {
      const payload = {
        clientId: "TOTEM_MODE", 
        origin: "TOTEM",
        customerName: customerName,
        address: `Cliente: ${customerName}`, 
        paymentMethod: paymentMethod, 
        total: totalCart,
        items: cart.map(item => ({ 
          productId: item.productId || item.id, 
          quantity: item.quantity, 
          price: item.price,
          name: item.name,
          flavors: item.flavors ? JSON.stringify(item.flavors) : null 
        }))
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json',
           'x-loja-slug': storeSlug 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setOrderSuccessData(data.order);
        setCart([]); setCustomerName(''); setPaymentMethod(''); setIsCheckoutOpen(false);
      } else {
        alert(`Erro:\n\n${data.details || data.error}`);
      }
    } catch (e) { alert("Erro de conexão."); }
    setIsSubmitting(false);
  };

  const totalCart = cart.reduce((acc, curr) => acc + (Number(curr.price) * curr.quantity), 0);
  const t = i18n[lang];

  if (loading) return <div className="h-screen bg-slate-50 flex items-center justify-center text-3xl font-black text-amber-500 animate-pulse">Iniciando Totem...</div>;
  if (!storeData) return <div className="h-screen bg-slate-50 flex items-center justify-center text-2xl font-bold text-red-500">Loja não encontrada.</div>;

  // ==========================================
  // TELA DE DESCANSO
  // ==========================================
  if (isIdle) {
    return (
      <div className="relative w-screen h-screen flex flex-col items-center justify-end pb-32 bg-slate-900 animate-fade-in-up overflow-hidden">
        {storeData.totemCoverImageUrl ? <img src={storeData.totemCoverImageUrl} alt="Capa" className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-amber-500 to-orange-600 opacity-80"></div>}
        <div className="relative z-10 text-center mb-16 animate-bounce">
           <h1 className="text-6xl font-black text-white drop-shadow-2xl mb-4">Toque para Iniciar</h1>
           <p className="text-2xl font-bold text-white drop-shadow-lg">Select your language / Seleccione su idioma</p>
        </div>
        <div className="relative z-10 flex gap-10">
           <button onClick={() => handleStart('pt')} className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl hover:scale-105 transition-transform bg-white focus:outline-none"><img src="https://flagcdn.com/w320/br.png" alt="BR" className="w-full h-full object-cover" /></button>
           <button onClick={() => handleStart('en')} className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl hover:scale-105 transition-transform bg-white focus:outline-none"><img src="https://flagcdn.com/w320/us.png" alt="US" className="w-full h-full object-cover" /></button>
           <button onClick={() => handleStart('es')} className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl hover:scale-105 transition-transform bg-white focus:outline-none"><img src="https://flagcdn.com/w320/es.png" alt="ES" className="w-full h-full object-cover" /></button>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA DE SUCESSO
  // ==========================================
  if (orderSuccessData) {
    const orientacao = orderSuccessData.paymentMethod === 'PAGAR_NO_CAIXA' 
       ? (lang === 'pt' ? 'Vá até o Caixa para efetuar o pagamento.' : lang === 'en' ? 'Please proceed to the counter to pay.' : 'Vaya a la caja para pagar.')
       : t.orderSuccessSub;

    return (
      <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-emerald-600 animate-fade-in-up">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-2xl w-[90%]">
          <span className="text-7xl block mb-6 animate-bounce">✅</span>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{t.orderSuccessTitle}</h1>
          <p className="text-xl text-amber-600 font-black mb-8">{orientacao}</p>
          
          <div className="bg-slate-100 p-8 rounded-3xl border-2 border-slate-200 mb-8 inline-block w-full">
            <p className="text-lg text-slate-500 font-bold uppercase tracking-widest">{t.passwordIs}</p>
            <p className="text-[6rem] font-black text-emerald-600 leading-none">{orderSuccessData.shortId}</p>
            {/* 🔥 CORREÇÃO AQUI: Usa a variável do estado direto para evitar o erro */}
            <p className="text-2xl text-slate-800 font-black mt-4">{orderSuccessData.customerName || customerName}</p>
          </div>

          <button onClick={() => { setOrderSuccessData(null); setIsIdle(true); }} className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all">
            Concluir
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA PRINCIPAL DO TOTEM
  // ==========================================
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden select-none animate-fade-in-up relative">
      
      {/* SIDEBAR */}
      <aside className="w-32 md:w-48 bg-white shadow-[2px_0_15px_rgba(0,0,0,0.05)] flex flex-col z-20">
        <div className="h-24 md:h-32 flex items-center justify-center p-4 border-b border-slate-100 shrink-0">
           {storeData.logoUrl || storeData.store?.logoUrl ? (
             <img src={storeData.logoUrl || storeData.store?.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
           ) : <span className="font-black text-xl text-center text-slate-800">{storeData.store?.razaoSocial || 'ZenixFood'}</span>}
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar py-4 space-y-2 px-2">
          {menu.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${activeCategory === cat.id ? 'bg-amber-500 text-slate-900 shadow-md transform scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 bg-white shadow-sm ${activeCategory === cat.id ? 'border-2 border-white' : ''}`}>
                 <span className="text-xl md:text-2xl">{getCategoryIcon(cat)}</span>
              </div>
              <span className={`text-[10px] md:text-xs text-center leading-tight ${activeCategory === cat.id ? 'font-black' : 'font-bold'}`}>{cat.name}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-100">
        <header className="h-20 bg-white shadow-sm flex items-center px-8 shrink-0 justify-between">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             <span>{menu.find(c => c.id === activeCategory) ? getCategoryIcon(menu.find(c => c.id === activeCategory)) : ''}</span>
             {menu.find(c => c.id === activeCategory)?.name || t.selectCategory}
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsIdle(true)} className="bg-slate-100 text-slate-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-200">🔙</button>
            <button onClick={() => { setCart([]); setIsIdle(true); }} className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-full font-bold text-sm hover:bg-red-100">{t.cancelOrder}</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-40">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {menu.find(c => c.id === activeCategory)?.products?.filter(p => p.isActive !== false).map(prod => (
              <button key={prod.id} onClick={() => handleProductClick(prod)} className="bg-white rounded-3xl p-4 shadow-sm flex flex-col items-center text-center transform transition-transform active:scale-95 border border-slate-200 hover:border-amber-400 relative">
                {prod.isPizza && <span className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase shadow-sm">🍕 Pizza</span>}
                {prod.isCombo && <span className="absolute top-2 left-2 bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase shadow-sm">🍔 Combo</span>}
                
                {prod.imageUrl ? <img src={prod.imageUrl} alt={prod.name} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl mb-4 shadow-sm" /> : <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-100 rounded-2xl mb-4 flex items-center justify-center text-4xl">🍽️</div>}
                
                <h3 className="font-black text-slate-800 text-sm md:text-base leading-tight mb-1 line-clamp-2 min-h-[40px]">{prod.name}</h3>
                {prod.isCombo && <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight mb-2">Combo especial com acompanhamentos.</p>}
                
                <span className="mt-auto font-black text-emerald-600 text-lg md:text-xl">R$ {Number(prod.price).toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RODAPÉ DO CARRINHO */}
        <div className="absolute bottom-0 left-0 w-full bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.1)] flex items-center justify-between p-4 md:p-6 z-30">
           <div className="flex-1 overflow-x-auto hide-scrollbar flex items-center gap-4 pr-6">
             {cart.length === 0 ? <p className="text-slate-400 font-bold italic">{t.emptyCart}</p> : cart.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl shrink-0">
                   <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                     <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-6 bg-slate-100 text-slate-700 font-black flex items-center justify-center">+</button>
                     <span className="w-8 h-8 flex items-center justify-center font-black text-amber-600 text-lg">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-6 bg-slate-100 text-slate-700 font-black flex items-center justify-center">-</button>
                   </div>
                   <div className="pr-2 max-w-[120px]">
                     <p className="text-xs font-bold text-slate-800 truncate" title={item.name}>{item.name}</p>
                     <p className="text-[10px] font-black text-emerald-600">R$ {(item.price * item.quantity).toFixed(2)}</p>
                   </div>
                 </div>
               ))}
           </div>

           <div className="flex items-center gap-6 shrink-0 border-l border-slate-200 pl-6">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.totalToPay}</p>
                <p className="text-3xl md:text-4xl font-black text-slate-900 leading-none">R$ {totalCart.toFixed(2)}</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(true)} disabled={cart.length === 0} className="bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-emerald-600 text-white px-8 py-5 md:py-6 rounded-[2rem] font-black text-xl md:text-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3">
                {t.checkout} ➔
              </button>
           </div>
        </div>
      </main>

      {/* 🍕 MODAL: CONSTRUTOR DE PIZZA */}
      {pizzaBuilderOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-fade-in-up">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-4xl flex flex-col h-[85vh]">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 shrink-0">
              <div>
                 <h2 className="text-3xl font-black text-slate-800">{t.buildPizza}</h2>
                 <p className="text-slate-500 font-bold">{pizzaBase?.name}</p>
              </div>
              <button onClick={() => setPizzaBuilderOpen(false)} className="bg-slate-100 text-slate-500 w-12 h-12 rounded-full font-black text-xl hover:bg-slate-200">X</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                <h3 className="font-black text-slate-700 mb-3">{t.howManyFlavors}</h3>
                <div className="flex gap-4 mb-8">
                    {[1, 2, 3].map(num => {
                        if (num > (pizzaBase?.maxFlavors || 1)) return null;
                        return (
                            <button 
                                key={num} 
                                onClick={() => { setPizzaFlavorCount(num); setPizzaSelectedFlavors([pizzaBase]); }}
                                className={`flex-1 py-4 rounded-2xl font-black text-xl border-4 transition-all ${pizzaFlavorCount === num ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-amber-300'}`}
                            >
                                {num} {num === 1 ? 'Sabor' : 'Sabores'}
                            </button>
                        );
                    })}
                </div>

                <div className="bg-amber-100 text-amber-800 p-4 rounded-2xl mb-6 flex items-center justify-between font-bold border border-amber-200 shadow-inner">
                    <span>Selecionados ({pizzaSelectedFlavors.length}/{pizzaFlavorCount}):</span>
                    <span className="text-sm">{pizzaSelectedFlavors.map(f => f.name).join(' + ')}</span>
                </div>

                <h3 className="font-black text-slate-700 mb-3">{t.chooseFlavors}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {menu.find(c => c.id === activeCategory)?.products?.filter(p => p.isPizza).map(flavor => {
                        const isSelected = pizzaSelectedFlavors.find(f => f.id === flavor.id);
                        const isFull = !isSelected && pizzaSelectedFlavors.length >= pizzaFlavorCount;
                        
                        return (
                            <button 
                                key={flavor.id}
                                disabled={isFull}
                                onClick={() => togglePizzaFlavor(flavor)}
                                className={`p-4 rounded-2xl border-4 transition-all flex flex-col items-center text-center ${isSelected ? 'border-amber-500 bg-amber-50' : isFull ? 'border-slate-100 bg-slate-100 opacity-50 cursor-not-allowed' : 'border-slate-100 bg-white hover:border-amber-300'}`}
                            >
                                {flavor.imageUrl ? <img src={flavor.imageUrl} className="w-20 h-20 object-cover rounded-full mb-2 shadow-sm" /> : <div className="w-20 h-20 bg-slate-200 rounded-full mb-2 flex items-center justify-center text-2xl">🍕</div>}
                                <span className="font-bold text-slate-800 text-sm leading-tight">{flavor.name}</span>
                                <span className="text-emerald-600 font-black text-xs mt-1">+ R$ {Number(flavor.price).toFixed(2)}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 shrink-0 mt-4">
               <button 
                  onClick={confirmBuiltPizza}
                  disabled={pizzaSelectedFlavors.length !== pizzaFlavorCount}
                  className="w-full bg-amber-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-amber-600 text-black py-6 rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4"
               >
                  {t.confirmPizza} - R$ {getPizzaPricePreview().toFixed(2)}
               </button>
            </div>

          </div>
        </div>
      )}

      {/* 🎯 MODAL DE CHECKOUT (NOME E PAGAMENTO) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in-up">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full max-w-4xl flex flex-col">
            
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-3xl font-black text-slate-800">{t.checkout}</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="bg-slate-100 text-slate-500 w-12 h-12 rounded-full font-black text-xl hover:bg-slate-200">X</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Lado Esquerdo: Nome */}
              <div>
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3 block">{t.namePrompt}</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-2xl font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Lado Direito: Seleção de Pagamento */}
              <div>
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3 block">{t.payMethodPrompt}</label>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setPaymentMethod('CREDIT_CARD')} 
                    className={`p-5 rounded-2xl border-2 font-black text-left transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-300'}`}
                  >
                    💳 {t.payMachine}
                  </button>
                  
                  <button 
                    onClick={() => setPaymentMethod('PIX')} 
                    className={`p-5 rounded-2xl border-2 font-black text-left transition-all ${paymentMethod === 'PIX' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-300'}`}
                  >
                    💠 {t.payPix}
                  </button>
                  
                  <button 
                    onClick={() => setPaymentMethod('PAGAR_NO_CAIXA')} 
                    className={`p-5 rounded-2xl border-2 font-black text-left transition-all ${paymentMethod === 'PAGAR_NO_CAIXA' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300'}`}
                  >
                    💵 {t.payCash}
                  </button>
                </div>
              </div>

            </div>

            <button 
              onClick={handleFinalizeOrder} 
              disabled={isSubmitting || !customerName.trim() || !paymentMethod}
              className="w-full mt-10 bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-emerald-600 text-white py-6 rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all"
            >
              {isSubmitting ? t.insertingOrder : t.payNow}
            </button>

          </div>
        </div>
      )}

      {/* DEV FOOTER ABSOLUTO */}
      <div className="absolute top-2 right-4 text-[10px] text-slate-400 font-bold z-50 mix-blend-multiply pointer-events-none">
        Desenvolvido por V2M Commercial Automation & Software Developer
      </div>
    </div>
  );
}