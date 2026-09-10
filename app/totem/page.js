"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShoppingBag, ChevronRight, X, Sun, Moon, CreditCard, Banknote, QrCode, MonitorDown, Loader2, Check, Maximize, Plus, Minus } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

const DICT = {
  pt: {
    start: "Toque para Iniciar",
    categories: "Categorias",
    add: "Adicionar",
    cart: "Seu Pedido",
    total: "Total",
    checkout: "Finalizar",
    cancel: "Cancelar",
    empty: "Nenhum item",
    payTitle: "Como deseja pagar?",
    credit: "Cartão",
    pix: "PIX",
    cash: "No Balcão",
    success: "Pedido Realizado!",
    password: "Sua senha é:",
    follow: "Aguarde ser chamado pelo painel.",
    addons: "Adicionais",
    addToOrder: "Adicionar",
    viewCart: "Ver Pedido",
    items: "itens",
    askName: "Qual o seu nome?",
    namePlaceholder: "Digite seu nome aqui..."
  },
  en: {
    start: "Touch to Start",
    categories: "Categories",
    add: "Add",
    cart: "Your Order",
    total: "Total",
    checkout: "Checkout",
    cancel: "Cancel",
    empty: "Empty",
    payTitle: "How would you like to pay?",
    credit: "Card",
    pix: "PIX",
    cash: "Counter",
    success: "Order Placed!",
    password: "Your number is:",
    follow: "Wait to be called on the panel.",
    addons: "Add-ons",
    addToOrder: "Add",
    viewCart: "View Order",
    items: "items",
    askName: "What is your name?",
    namePlaceholder: "Enter your name here..."
  },
  es: {
    start: "Toca para Empezar",
    categories: "Categorías",
    add: "Añadir",
    cart: "Tu Pedido",
    total: "Total",
    checkout: "Finalizar",
    cancel: "Cancelar",
    empty: "Vacío",
    payTitle: "¿Cómo deseas pagar?",
    credit: "Tarjeta",
    pix: "PIX",
    cash: "Caja",
    success: "¡Pedido Realizado!",
    password: "Tu número es:",
    follow: "Espera ser llamado en el panel.",
    addons: "Adicionales",
    addToOrder: "Añadir",
    viewCart: "Ver Pedido",
    items: "artículos",
    askName: "¿Cuál es tu nombre?",
    namePlaceholder: "Ingresa tu nombre aquí..."
  }
};

// Dicionário dinâmico para traduzir o conteúdo do banco de dados (nomes e descrições)
const translateDynamicText = (text, lang) => {
  if (!text || lang === 'pt') return text;
  
  let translated = text;
  
  const enDict = {
    "Pão brioche vegano": "Vegan brioche bun",
    "Pão brioche": "Brioche bun",
    "hambúrgueres": "burgers",
    "hambúrguer": "burger",
    "Hambúrguer": "Burger",
    "queijo prato": "prato cheese",
    "queijo vegano": "vegan cheese",
    "queijo cheddar": "cheddar cheese",
    "queijo": "cheese",
    "cebola caramelizada": "caramelized onion",
    "picles": "pickles",
    "pimenta jalapeño": "jalapeño pepper",
    "molho especial da casa": "house special sauce",
    "molho especial": "special sauce",
    "maionese vegana da casa": "house vegan mayonnaise",
    "maionese": "mayonnaise",
    "aveia e cenoura": "oat and carrot",
    "tomate": "tomato",
    "alface": "lettuce",
    "Refrigerante Lata": "Canned Soda",
    "Refrigerante": "Soda",
    "Lata": "Can",
    "ou": "or",
    " e ": " and ",
    " de ": " of ",
    "Costela": "Ribs",
    "Porção": "Portion",
    "Batata Frita": "French Fries",
    "Bacon": "Bacon",
    "Cebola": "Onion",
    "Carne": "Meat",
    "Frango": "Chicken",
    "Bebidas": "Drinks",
    "Combos": "Combos",
    "Adicionais": "Add-ons",
    "Sobremesas": "Desserts"
  };

  const esDict = {
    "Pão brioche vegano": "Pan brioche vegano",
    "Pão brioche": "Pan brioche",
    "hambúrgueres": "hamburguesas",
    "hambúrguer": "hamburguesa",
    "Hambúrguer": "Hamburguesa",
    "queijo prato": "queso prato",
    "queijo vegano": "queso vegano",
    "queijo cheddar": "queso cheddar",
    "queijo": "queso",
    "cebola caramelizada": "cebolla caramelizada",
    "picles": "pepinillos",
    "pimenta jalapeño": "chile jalapeño",
    "molho especial da casa": "salsa especial de la casa",
    "molho especial": "salsa especial",
    "maionese vegana da casa": "mayonesa vegana de la casa",
    "maionese": "mayonesa",
    "aveia e cenoura": "avena y zanahoria",
    "tomate": "tomate",
    "alface": "lechuga",
    "Refrigerante Lata": "Refresco en Lata",
    "Refrigerante": "Refresco",
    "Lata": "Lata",
    "ou": "o",
    " e ": " y ",
    " de ": " de ",
    "Costela": "Costilla",
    "Porção": "Porción",
    "Batata Frita": "Papas Fritas",
    "Bacon": "Tocino",
    "Cebola": "Cebolla",
    "Carne": "Carne",
    "Frango": "Pollo",
    "Bebidas": "Bebidas",
    "Combos": "Combos",
    "Adicionais": "Adicionales",
    "Sobremesas": "Postres"
  };

  const dict = lang === 'en' ? enDict : esDict;
  
  // Substitui as palavras maiores primeiro
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  
  keys.forEach(key => {
    const regex = new RegExp(key, "gi");
    translated = translated.replace(regex, (match) => {
       if (match[0] === match[0].toUpperCase()) {
          return dict[key].charAt(0).toUpperCase() + dict[key].slice(1);
       }
       return dict[key].toLowerCase();
    });
  });
  
  return translated;
};

export default function Totem() {
  const [isIdle, setIsIdle] = useState(true);
  const [lang, setLang] = useState("pt");
  const [theme, setTheme] = useState("light");
  
  const [menu, setMenu] = useState([]);
  const [adicionaisList, setAdicionaisList] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Formulário de Nome do Cliente
  const [customerName, setCustomerName] = useState("");

  // Product Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempAddons, setTempAddons] = useState({});

  // Inactivity Timer
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isIdle) {
      timerRef.current = setTimeout(() => {
        setIsIdle(true);
        setCart([]);
        setIsCheckout(false);
        setIsCartOpen(false);
        setSelectedProduct(null);
        setOrderSuccess(null);
        setCustomerName("");
      }, 90000); // 1.5 minutes of inactivity returns to screensaver
    }
  };

  useEffect(() => {
    const handleActivity = () => resetTimer();
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity, true);
    
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isIdle, cart, isCartOpen, selectedProduct, isCheckout, customerName]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/api/menu?_=${Date.now()}`),
        fetch(`${API_URL}/api/settings?_=${Date.now()}`)
      ]);
      
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        
        if (Array.isArray(menuData)) {
            // Separa os adicionais do menu principal
            const adicCategory = menuData.find(c => c?.slug?.includes('adicion') || c?.name?.toLowerCase().includes('adicion'));
            if (adicCategory) {
               setAdicionaisList(adicCategory.products?.filter(p => p.isActive) || []);
            }

            // Filtro rigoroso com todas as palavras obrigatoriamente em minúsculo
            const isAgendado = (str) => {
               if (!str) return false;
               const lower = str.toLowerCase();
               return lower.includes('agendad') || lower.includes('encomend') || lower.includes('costela') || lower.includes('bbq');
            };

            const filteredMenu = menuData.map(c => ({
               ...c,
               products: c.products?.filter(p => 
                  p.isActive && 
                  !isAgendado(p?.name) && 
                  !isAgendado(p?.description)
               ) || []
            })).filter(c => c.products.length > 0 && !c?.slug?.includes('adicion') && !c?.name?.toLowerCase().includes('adicion'));

            setMenu(filteredMenu);
            if (filteredMenu.length > 0) setActiveCategory(filteredMenu[0].id);
        }
      }
      
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
    } catch (e) {
      console.error("Erro ao carregar dados do totem", e);
    } finally {
      setIsLoading(false);
    }
  };

  const goFullScreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.warn(err));
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
      }
    }
  };

  const handleStart = (selectedLang) => {
    goFullScreen();
    setLang(selectedLang);
    setIsIdle(false);
    setCustomerName("");
    resetTimer();
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
    resetTimer();
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.id === productId) {
          const newQ = i.quantity + delta;
          return newQ > 0 ? { ...i, quantity: newQ } : null;
        }
        return i;
      }).filter(Boolean);
    });
    if (cart.length === 1 && cart[0].quantity === 1 && delta === -1) {
       setIsCartOpen(false);
    }
    resetTimer();
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setTempAddons({});
    resetTimer();
  };

  const handleAddAddon = (addonId, delta) => {
    setTempAddons(prev => {
      const current = prev[addonId] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      return { ...prev, [addonId]: next };
    });
    resetTimer();
  };

  const confirmAddToOrder = () => {
    addToCart(selectedProduct, 1);
    Object.entries(tempAddons).forEach(([addonId, qty]) => {
      if (qty > 0) {
        const addonObj = adicionaisList.find(a => a.id === addonId);
        if (addonObj) addToCart(addonObj, qty);
      }
    });
    setSelectedProduct(null);
  };

  const handlePayment = async (method) => {
    try {
      const finalName = customerName.trim() !== "" ? customerName.trim() : "Cliente";

      const payload = {
        clientId: "TOTEM_MODE",
        origin: "TOTEM",
        paymentMethod: method,
        total: cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0),
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        // Usando o formato padrão que o banco de dados e o KDS aceitam perfeitamente
        address: customerName.trim() !== "" ? `Cliente: ${finalName}` : "Retirada Balcão (Totem)"
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess({ shortId: data.order.shortId, name: finalName });
        setCart([]);
        setIsCartOpen(false);
        setIsCheckout(false);
        setCustomerName("");
        
        setTimeout(() => {
          setIsIdle(true);
          setOrderSuccess(null);
        }, 10000);
      } else {
        alert("Erro ao processar pedido.");
      }
    } catch (error) {
      alert("Erro de comunicação.");
    }
  };

  const scrollToCategory = (id) => {
    setActiveCategory(id);
    const el = document.getElementById(`category-${id}`);
    if (el) {
      const mainContainer = document.getElementById("totem-main-scroll");
      if (mainContainer) {
        mainContainer.scrollTo({
          top: el.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleScroll = (e) => {
    const main = e.target;
    const sections = menu.map(c => document.getElementById(`category-${c.id}`));
    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = sections[i];
      if (sec && main.scrollTop >= sec.offsetTop - 150) {
        if (activeCategory !== menu[i].id) {
          setActiveCategory(menu[i].id);
        }
        break;
      }
    }
  };

  const t = DICT[lang];
  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const formatCurrency = (val) => new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-black"><Loader2 className="w-12 h-12 text-white animate-spin" /></div>;
  }

  // ==========================================
  // TELA DE DESCANSO (SCREENSAVER)
  // ==========================================
  if (isIdle) {
    const bgUrl = (settings.totemScreensaverUrl && settings.totemScreensaverUrl.trim() !== '') 
      ? settings.totemScreensaverUrl 
      : "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1080&auto=format&fit=crop";
    
    return (
      <div className="h-screen w-full relative overflow-hidden flex flex-col items-center justify-end pb-12 md:pb-32">
        <button onClick={goFullScreen} className="absolute top-6 right-6 z-50 p-4 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-all cursor-pointer">
          <Maximize className="w-6 h-6" />
        </button>

        <div className="absolute inset-0 z-0">
          <img 
            src={bgUrl} 
            alt="Background" 
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1080&auto=format&fit=crop" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
        </div>
        
        <div className="z-10 text-center mb-8 md:mb-16 animate-bounce">
          <MonitorDown className="w-16 h-16 md:w-24 md:h-24 text-white mx-auto mb-4 md:mb-6 opacity-90 drop-shadow-xl" />
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest drop-shadow-2xl px-4 text-center">
            {t.start}
          </h1>
        </div>

        <div className="z-10 flex flex-wrap justify-center gap-4 md:gap-8 px-4">
          <button onClick={() => handleStart('pt')} className="flex flex-col items-center gap-2 md:gap-4 bg-white/10 backdrop-blur-md hover:bg-white/30 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 transition-all transform active:scale-95 shadow-2xl cursor-pointer">
            <span className="text-5xl md:text-7xl">🇧🇷</span>
            <span className="text-white font-black text-lg md:text-2xl uppercase tracking-wider">Português</span>
          </button>
          <button onClick={() => handleStart('en')} className="flex flex-col items-center gap-2 md:gap-4 bg-white/10 backdrop-blur-md hover:bg-white/30 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 transition-all transform active:scale-95 shadow-2xl cursor-pointer">
            <span className="text-5xl md:text-7xl">🇺🇸</span>
            <span className="text-white font-black text-lg md:text-2xl uppercase tracking-wider">English</span>
          </button>
          <button onClick={() => handleStart('es')} className="flex flex-col items-center gap-2 md:gap-4 bg-white/10 backdrop-blur-md hover:bg-white/30 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 transition-all transform active:scale-95 shadow-2xl cursor-pointer">
            <span className="text-5xl md:text-7xl">🇪🇸</span>
            <span className="text-white font-black text-lg md:text-2xl uppercase tracking-wider">Español</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA DE SUCESSO DO PEDIDO
  // ==========================================
  if (orderSuccess) {
    const isNamed = orderSuccess.name !== "Cliente";
    return (
      <div className={`h-screen w-full flex flex-col items-center justify-center p-6 md:p-8 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="bg-emerald-500 text-white p-8 md:p-10 rounded-full mb-8 md:mb-10 animate-bounce shadow-2xl shadow-emerald-500/30">
          <Check className="w-24 h-24 md:w-40 md:h-40" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 text-center tracking-tight">
          {isNamed ? `${orderSuccess.name}, pedido realizado!` : t.success}
        </h1>
        <p className="text-xl md:text-3xl opacity-70 mb-10 md:mb-16 text-center">
          {isNamed ? "Aguarde ser chamado pelo seu nome no painel." : t.follow}
        </p>
        <div className={`text-center p-10 md:p-16 rounded-[2rem] md:rounded-[3rem] border-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-2xl min-w-[300px] md:min-w-[500px]`}>
          <p className="text-xl md:text-3xl font-bold uppercase tracking-widest opacity-50 mb-4 md:mb-6">{t.password}</p>
          <p className="text-7xl md:text-[10rem] leading-none font-black text-amber-500">{orderSuccess.shortId}</p>
        </div>
      </div>
    );
  }

  const modalTotal = selectedProduct ? (Number(selectedProduct.price) + Object.entries(tempAddons).reduce((acc, [id, qty]) => {
    const addon = adicionaisList.find(a => a.id === id);
    return acc + (addon ? Number(addon.price) * qty : 0);
  }, 0)) : 0;

  // ==========================================
  // TELA DE AUTOATENDIMENTO
  // ==========================================
  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-50' : 'bg-slate-100 text-slate-800'}`}>
      
      {/* HEADER */}
      <header className={`h-20 md:h-28 shrink-0 flex justify-between items-center px-4 md:px-10 shadow-md z-20 ${theme === 'dark' ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-slate-200'}`}>
        <div className="flex items-center gap-3 md:gap-6">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 md:h-16 md:w-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
          <h1 className="text-xl md:text-3xl font-black tracking-tight hidden sm:block">Autoatendimento</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className={`p-3 md:p-5 rounded-full shadow-inner cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-600'}`}
          >
            {theme === 'dark' ? <Sun className="w-6 h-6 md:w-8 md:h-8" /> : <Moon className="w-6 h-6 md:w-8 md:h-8" />}
          </button>
          <button onClick={() => { setIsIdle(true); setCart([]); setIsCartOpen(false); setIsCheckout(false); setCustomerName(""); }} className="flex items-center gap-2 md:gap-3 bg-red-500 hover:bg-red-600 text-white px-4 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl font-bold text-sm md:text-xl shadow-lg active:scale-95 transition-transform cursor-pointer">
            <X className="w-5 h-5 md:w-8 md:h-8" /> <span className="hidden sm:block">{t.cancel}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR (CATEGORIAS) */}
        <aside className={`w-[110px] sm:w-[200px] lg:w-[280px] shrink-0 flex flex-col overflow-y-auto hide-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="p-3 sm:p-6 lg:p-8">
            <h2 className={`text-xs sm:text-base lg:text-xl font-black uppercase tracking-widest mb-4 sm:mb-8 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hidden sm:block`}>{t.categories}</h2>
            <div className="space-y-2 sm:space-y-4">
              {menu.filter(c => c.products?.some(p => p.isActive)).map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => scrollToCategory(cat.id)}
                  className={`w-full flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl transition-all border-2 sm:border-4 cursor-pointer ${
                    activeCategory === cat.id 
                      ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-lg transform sm:scale-105 font-black' 
                      : theme === 'dark' 
                        ? 'border-transparent bg-slate-900 text-slate-300 hover:border-slate-700 font-bold' 
                        : 'border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 font-bold'
                  }`}
                >
                  <span className="text-xs sm:text-lg lg:text-xl text-center sm:text-left leading-tight line-clamp-2">{translateDynamicText(cat.name, lang)}</span>
                  {activeCategory === cat.id && <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 shrink-0 hidden sm:block" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* GRID DE PRODUTOS */}
        <main 
          id="totem-main-scroll"
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 hide-scrollbar pb-[300px] md:pb-[400px] scroll-smooth"
        >
          {menu.map(category => {
            if (category.products.length === 0) return null;

            return (
              <div key={category.id} id={`category-${category.id}`} className="mb-10 sm:mb-16 scroll-mt-6 sm:scroll-mt-10">
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-6 sm:mb-8 capitalize tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {translateDynamicText(category.name, lang)}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {category.products.map(product => (
                    <div 
                      key={product.id} 
                      onClick={() => openProductModal(product)}
                      className={`flex flex-row md:flex-col rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-sm md:shadow-md border-2 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-amber-500' : 'bg-white border-slate-100 hover:border-amber-500'}`}
                    >
                      <div className={`h-32 w-32 md:h-48 md:w-full lg:h-64 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} relative shrink-0`}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-20"><ShoppingBag className="w-12 h-12 md:w-20 md:h-20" /></div>
                        )}
                      </div>
                      <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-1">
                        <h3 className="text-lg sm:text-xl lg:text-3xl font-black mb-1 md:mb-3 leading-tight line-clamp-2 md:line-clamp-none">{translateDynamicText(product.name, lang)}</h3>
                        <p className={`text-xs sm:text-sm lg:text-lg mb-3 md:mb-8 flex-1 line-clamp-2 md:line-clamp-3 leading-snug ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{translateDynamicText(product.description, lang)}</p>
                        
                        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-end gap-2 md:gap-4 mt-auto">
                          <span className="text-lg sm:text-2xl lg:text-4xl font-black text-amber-500">{formatCurrency(product.price)}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openProductModal(product); }}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 p-2 md:py-4 md:w-full rounded-xl md:rounded-[1.5rem] font-black text-sm md:text-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm md:shadow-lg cursor-pointer"
                          >
                            <Plus className="w-5 h-5 md:w-6 md:h-6" /> <span className="hidden md:block">{t.add}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
      </div>

      {/* BOTTOM CART BAR */}
      <div className={`fixed bottom-0 left-0 w-full z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] ${theme === 'dark' ? 'bg-slate-800 border-t border-slate-700' : 'bg-white border-t border-slate-200'}`}>
        <div className="max-w-[1920px] mx-auto flex items-center justify-between p-4 md:p-8">
          
          <button 
            onClick={() => setIsCartOpen(true)}
            disabled={cart.length === 0}
            className={`flex items-center gap-3 md:gap-6 px-4 md:px-10 py-3 md:py-6 rounded-2xl md:rounded-[2.5rem] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-white border border-slate-700' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}
          >
            <div className="relative">
              <ShoppingBag className="w-8 h-8 md:w-14 md:h-14" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-black text-xs md:text-xl w-5 h-5 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-sm md:text-xl font-bold uppercase tracking-widest opacity-60">{t.viewCart}</span>
              <span className="block text-lg md:text-3xl font-black">{cart.length === 0 ? t.empty : `${totalItemsCount} ${t.items}`}</span>
            </div>
          </button>

          <div className="flex items-center gap-4 md:gap-10 shrink-0 bg-transparent sm:bg-slate-100 sm:dark:bg-slate-900 p-0 sm:p-4 md:p-6 rounded-2xl sm:rounded-[2.5rem] sm:border border-transparent sm:border-slate-200 sm:dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className={`text-xs md:text-lg font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t.total}</p>
              <p className="text-2xl md:text-5xl font-black text-amber-500">{formatCurrency(cartTotal)}</p>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={() => setIsCheckout(true)} 
              className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 disabled:text-slate-500 text-slate-950 px-6 py-4 md:px-12 md:py-8 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-3xl uppercase tracking-widest shadow-lg md:shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              {t.checkout}
            </button>
          </div>
        </div>
      </div>

      {/* DRAWER DO CARRINHO (SIDEBAR DIREITA) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex justify-end">
          <div className={`w-[90vw] md:w-[500px] h-full flex flex-col shadow-2xl transition-transform transform translate-x-0 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="p-6 md:p-8 border-b border-slate-200/20 flex justify-between items-center shrink-0">
               <h2 className="text-2xl md:text-4xl font-black">{t.cart}</h2>
               <button onClick={() => setIsCartOpen(false)} className={`p-3 md:p-4 rounded-full cursor-pointer ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}><X className="w-6 h-6 md:w-8 md:h-8"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 hide-scrollbar">
               {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className={`flex flex-col gap-3 md:gap-4 p-4 md:p-6 border-2 rounded-2xl md:rounded-[2rem] ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                     <div className="flex justify-between items-start gap-4">
                        <span className="font-bold text-lg md:text-2xl leading-tight">{translateDynamicText(item.name, lang)}</span>
                        <span className="text-lg md:text-2xl text-amber-500 font-black whitespace-nowrap">{formatCurrency(item.price)}</span>
                     </div>
                     <div className="flex justify-end">
                       <div className={`flex items-center gap-3 md:gap-4 rounded-xl md:rounded-2xl p-1 md:p-2 w-fit ${theme === 'dark' ? 'bg-slate-950' : 'bg-white border border-slate-200'}`}>
                          <button onClick={() => updateQuantity(item.id, -1)} className={`w-10 h-10 md:w-14 h-14 flex items-center justify-center rounded-lg md:rounded-xl font-black text-2xl md:text-4xl shadow-sm active:scale-95 transition-transform cursor-pointer ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}><Minus className="w-5 h-5 md:w-8 md:h-8" /></button>
                          <span className="font-black text-xl md:text-3xl w-6 md:w-10 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 md:w-14 h-14 flex items-center justify-center bg-amber-500 text-slate-900 rounded-lg md:rounded-xl font-black text-2xl md:text-4xl shadow-sm active:scale-95 transition-transform cursor-pointer"><Plus className="w-5 h-5 md:w-8 md:h-8" /></button>
                       </div>
                     </div>
                  </div>
               ))}
               {cart.length === 0 && <p className="text-center text-xl md:text-3xl opacity-50 mt-20">{t.empty}</p>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PRODUTO (ADICIONAIS) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8">
          <div className={`w-full max-w-4xl flex flex-col max-h-[95vh] rounded-3xl md:rounded-[3rem] shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
             
             {/* Header Image */}
             <div className={`relative h-[200px] md:h-[300px] shrink-0 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
               {selectedProduct.imageUrl ? (
                 <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" alt={selectedProduct.name} />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center opacity-20"><ShoppingBag className="w-20 h-20 md:w-32 md:h-32" /></div>
               )}
               
               {/* Gradiente para o texto com pointer-events-none para não bloquear cliques */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>
               
               {/* Botão de Fechar com Z-Index Alto */}
               <button 
                  onClick={() => setSelectedProduct(null)} 
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-3 md:p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md z-50 cursor-pointer"
               >
                 <X className="w-6 h-6 md:w-10 md:h-10"/>
               </button>

               <div className="absolute bottom-4 left-6 right-6 md:bottom-6 md:left-10 md:right-10 pointer-events-none">
                 <h2 className="text-2xl md:text-5xl font-black text-white drop-shadow-lg leading-tight">{translateDynamicText(selectedProduct.name, lang)}</h2>
                 <p className="text-xl md:text-3xl font-black text-amber-500 mt-1 md:mt-2 drop-shadow-md">{formatCurrency(selectedProduct.price)}</p>
               </div>
             </div>
             
             {/* Content / Addons */}
             <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar space-y-6 md:space-y-10">
                <p className={`text-sm md:text-2xl leading-snug ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{translateDynamicText(selectedProduct.description, lang)}</p>
                
                {adicionaisList.length > 0 && (
                   <div>
                      <h3 className={`text-lg md:text-2xl font-black mb-4 md:mb-6 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t.addons}</h3>
                      <div className="space-y-3 md:space-y-4">
                         {adicionaisList.map(addon => (
                            <div key={addon.id} className={`flex items-center justify-between p-4 md:p-6 border-2 md:border-4 rounded-2xl md:rounded-[2rem] ${theme === 'dark' ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-white'}`}>
                               <div>
                                  <span className="block font-bold text-lg md:text-3xl mb-1 md:mb-2">{translateDynamicText(addon.name, lang)}</span>
                                  <span className="block text-amber-500 font-black text-sm md:text-xl">+ {formatCurrency(addon.price)}</span>
                               </div>
                               <div className={`flex items-center gap-2 md:gap-4 rounded-xl md:rounded-2xl p-1 md:p-2 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                                  <button onClick={() => handleAddAddon(addon.id, -1)} className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-lg md:rounded-xl font-black text-2xl md:text-4xl shadow-sm active:scale-95 transition-transform cursor-pointer ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}><Minus className="w-5 h-5 md:w-8 md:h-8"/></button>
                                  <span className="font-black text-xl md:text-3xl w-6 md:w-10 text-center">{tempAddons[addon.id] || 0}</span>
                                  <button onClick={() => handleAddAddon(addon.id, 1)} className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-amber-500 text-slate-900 rounded-lg md:rounded-xl font-black text-2xl md:text-4xl shadow-sm active:scale-95 transition-transform cursor-pointer"><Plus className="w-5 h-5 md:w-8 md:h-8"/></button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>

             {/* Footer Add to Cart */}
             <div className={`p-4 md:p-8 border-t shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <button onClick={confirmAddToOrder} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] text-xl md:text-4xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform flex justify-between items-center px-6 md:px-12 cursor-pointer">
                   <span>{t.addToOrder}</span>
                   <span>{formatCurrency(modalTotal)}</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL DE CHECKOUT / PAGAMENTO COM NOME */}
      {isCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8">
          <div className={`w-full max-w-5xl p-6 md:p-16 rounded-3xl md:rounded-[4rem] shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex justify-between items-center mb-6 md:mb-12">
              <h2 className="text-2xl md:text-5xl font-black">{t.payTitle}</h2>
              <button onClick={() => setIsCheckout(false)} className="p-3 md:p-6 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors active:scale-95 cursor-pointer"><X className="w-6 h-6 md:w-12 md:h-12" /></button>
            </div>
            
            <div className="mb-6 md:mb-12">
               <label className="block text-lg md:text-3xl font-black mb-3 md:mb-6">{t.askName}</label>
               <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className={`w-full p-4 md:p-8 rounded-2xl md:rounded-[2rem] text-xl md:text-3xl font-bold focus:outline-none border-4 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-700 focus:border-amber-500' : 'bg-slate-50 border-slate-200 focus:border-amber-500'}`}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16">
              <button onClick={() => handlePayment("CREDIT_CARD_DELIVERY")} className={`flex flex-col items-center justify-center gap-4 md:gap-8 p-6 md:p-12 rounded-2xl md:rounded-[3rem] border-4 transition-all active:scale-95 cursor-pointer ${theme === 'dark' ? 'border-slate-700 bg-slate-900 hover:border-amber-500' : 'border-slate-100 bg-slate-50 hover:border-amber-500'}`}>
                <CreditCard className="w-12 h-12 md:w-32 md:h-32 text-blue-500" />
                <span className="text-xl md:text-3xl font-black text-center leading-tight">{t.credit}</span>
              </button>
              
              <button onClick={() => handlePayment("PIX_ONLINE")} className={`flex flex-col items-center justify-center gap-4 md:gap-8 p-6 md:p-12 rounded-2xl md:rounded-[3rem] border-4 transition-all active:scale-95 cursor-pointer ${theme === 'dark' ? 'border-slate-700 bg-slate-900 hover:border-amber-500' : 'border-slate-100 bg-slate-50 hover:border-amber-500'}`}>
                <QrCode className="w-12 h-12 md:w-32 md:h-32 text-emerald-500" />
                <span className="text-xl md:text-3xl font-black">{t.pix}</span>
              </button>

              <button onClick={() => handlePayment("CASH")} className={`flex flex-col items-center justify-center gap-4 md:gap-8 p-6 md:p-12 rounded-2xl md:rounded-[3rem] border-4 transition-all active:scale-95 cursor-pointer ${theme === 'dark' ? 'border-slate-700 bg-slate-900 hover:border-amber-500' : 'border-slate-100 bg-slate-50 hover:border-amber-500'}`}>
                <Banknote className="w-12 h-12 md:w-32 md:h-32 text-amber-500" />
                <span className="text-xl md:text-3xl font-black text-center leading-tight">{t.cash}</span>
              </button>
            </div>

            <div className={`mt-auto p-6 md:p-10 rounded-2xl md:rounded-[3rem] flex justify-between items-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
               <span className="text-xl md:text-3xl font-bold uppercase tracking-widest opacity-50">{t.total}:</span>
               <span className="text-4xl md:text-6xl font-black text-amber-500">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
