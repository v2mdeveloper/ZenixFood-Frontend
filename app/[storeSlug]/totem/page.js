'use client';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

import { useOfflineSync } from '@/app/hooks/useOfflineSync';

import Header from '@/app/[storeSlug]/components/Header';
import Footer from '@/app/[storeSlug]/components/Footer';
import FloatingCart from '@/app/[storeSlug]/components/FloatingCart';

import MenuView from '@/app/[storeSlug]/components/views/MenuView';
import AuthView from '@/app/[storeSlug]/components/views/AuthView';
import CheckoutView from '@/app/[storeSlug]/components/views/CheckoutView';
import OrdersView from '@/app/[storeSlug]/components/views/OrdersView';

import ReviewModal from '@/app/[storeSlug]/components/modals/ReviewModal';
import CostelaModal from '@/app/[storeSlug]/components/modals/CostelaModal';
import UpsellModal from '@/app/[storeSlug]/components/modals/UpsellModal';
import ProductDetailsModal from '@/app/[storeSlug]/components/modals/ProductDetailsModal';

//FUNÇÃO INTELIGENTE PARA DEFINIR O ÍCONE DA CATEGORIA
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

  return '🍽️'; 
};

function HomeContent({ storeSlug }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedProductModal, setSelectedProductModal] = useState(null);

  const [menu, setMenu] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [upsells, setUpsells] = useState([]); 

  const [cart, setCart] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('menu');
  const [user, setUser] = useState(null);

  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', cpf: '', birthDate: '', address: '', cep: '' });
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '', phone: '', cpf: '', birthDate: '', address: '', cep: '' });

  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [observations, setObservations] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX_ONLINE');
  const [useCashback, setUseCashback] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [cpfNaNota, setCpfNaNota] = useState('');

  const [deliveryFee, setDeliveryFee] = useState(5.00);
  const [cashbackPercent, setCashbackPercent] = useState(5);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [storeSettings, setStoreSettings] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pixInfo, setPixInfo] = useState(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [showCostelaModal, setShowCostelaModal] = useState(false);
  const [costelaProduct, setCostelaProduct] = useState(null);
  const [costelaSize, setCostelaSize] = useState('500g'); 
  const [costelaTime, setCostelaTime] = useState('12:00'); 

  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellItem, setUpsellItem] = useState(null);
  const [watchingOrder, setWatchingOrder] = useState(null);
  const [currentDomain, setCurrentDomain] = useState('localhost');

  const [isTotemMode, setIsTotemMode] = useState(false);
  const [totemName, setTotemName] = useState('');

  // Estados específicos do Totem Tradicional (Tela de Idioma)
  const [isIdle, setIsIdle] = useState(true);
  const [lang, setLanguage] = useState('pt');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  const [showPizzaModal, setShowPizzaModal] = useState(false);
  const [pizzaBase, setPizzaBase] = useState(null);
  const [pizzaFlavorCount, setPizzaFlavorCount] = useState(1);
  const [pizzaSelectedFlavors, setPizzaSelectedFlavors] = useState([]);

  const API_URL = 'https://zenixfood-backend.onrender.com';
  const searchParams = useSearchParams();
  const TOKEN_JWT = typeof window !== 'undefined' ? (localStorage.getItem('@Zenix:token') || localStorage.getItem('zenix_token')) : '';

  // 🔥 INICIALIZA O MOTOR OFFLINE
  const { isOnline, pedidosPendentes, processarPedido } = useOfflineSync(API_URL, storeSlug, TOKEN_JWT);

  // Traduções Dinâmicas para o Modo Totem
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

  const fetchWithStore = async (url, options = {}) => {
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');
    const headers = {
      ...(TOKEN_JWT && { 'Authorization': `Bearer ${TOKEN_JWT}` }),
      ...(storeId && { 'x-loja-slug': storeId }),
      ...options.headers,
    };
    const finalOptions = { ...options, headers, cache: 'no-store' };
    const response = await fetch(url, finalOptions);
    if (response.status === 402 && typeof window !== 'undefined') {
        window.location.href = `/${storeSlug}/bloqueado`; 
    }
    return response;
  };

  useEffect(() => {
    if (storeSettings?.mercadoPagoPublicKey) {
      initMercadoPago(storeSettings.mercadoPagoPublicKey);
    }
  }, [storeSettings]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('@Zenix:clientTheme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedToken = localStorage.getItem('@Zenix:token') || localStorage.getItem('zenix_token');
    const savedUser = localStorage.getItem('@Zenix:user') || localStorage.getItem('zenix_user');
    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      let extCep = '';
      let extRua = parsedUser.address || '';
      const match = extRua.match(/CEP:\s*(.*?)\s*-\s*(.*)/);
      if (match) { extCep = match[1]; extRua = match[2]; }
      
      setProfileForm({ 
        name: parsedUser.name, email: parsedUser.email, phone: parsedUser.phone || '', 
        cpf: parsedUser.cpf || '', birthDate: parsedUser.birthDate || '', 
        address: extRua, cep: extCep, password: '' 
      });
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('@Zenix:clientTheme', newTheme ? 'dark' : 'light');
    if (newTheme) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleFullscreen = () => {
    if (typeof document !== 'undefined') {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (docEl.requestFullscreen) docEl.requestFullscreen().catch(()=>{});
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen().catch(()=>{});
      }
    }
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [view]);

  useEffect(() => {
     setCurrentDomain(window.location.hostname);
     if (searchParams.get('totem') === 'true') setIsTotemMode(true);
  }, [searchParams]);

  useEffect(() => {
    if (!isTotemMode) return;
    let timeout;
    const handleInteraction = () => {
        handleFullscreen();
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setIsIdle(true); setCart([]); setTotemName(''); setView('menu'); setShowUpsellModal(false); setPixInfo(null); setSelectedProductModal(null); setShowPizzaModal(false);
        }, 120000); 
    };
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('click', handleInteraction);
    handleInteraction();
    return () => {
        clearTimeout(timeout);
        window.removeEventListener('mousemove', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('click', handleInteraction);
    }
  }, [isTotemMode]);

  const fetchSystemSettings = () => {
    const timestamp = Date.now(); 
    fetchWithStore(`${API_URL}/api/settings?_=${timestamp}`)
      .then((res) => res.json())
      .then((data) => {
        const openStatus = data.isOpen !== undefined ? data.isOpen : true; 
        setIsStoreOpen(openStatus && !data.isManualFechado);
        setDeliveryFee(Number(data.deliveryFee) || 0);
        setCashbackPercent(Number(data.cashbackPercent) || 0);
        setStoreSettings(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSystemSettings();
    const settingsInterval = setInterval(() => { if(isOnline) fetchSystemSettings(); }, 30000);
    return () => clearInterval(settingsInterval);
  }, [isOnline]);

  useEffect(() => {
    const timestamp = Date.now();
    Promise.all([
      fetchWithStore(`${API_URL}/api/menu?_=${timestamp}`).then((res) => res.json()),
      fetchWithStore(`${API_URL}/api/products/highlights?_=${timestamp}`).then((res) => res.json()),
      fetchWithStore(`${API_URL}/api/suppliers?_=${timestamp}`).then((res) => res.ok ? res.json() : []).catch(() => []),
      fetchWithStore(`${API_URL}/api/upsells?_=${timestamp}`).then((res) => res.ok ? res.json() : []).catch(() => []) 
    ]).then(([menuData, highlightsData, suppliersData, upsellsData]) => {
      setMenu(menuData); 
      setHighlights(highlightsData); 
      setSuppliers(suppliersData); 
      setUpsells(upsellsData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleOpenCostelaModal = (product) => {
    setCostelaProduct(product); 
    setCostelaSize('500g'); 
    setCostelaTime('12:00'); 
    setShowCostelaModal(true);
    setSelectedProductModal(null);
  };

  const handleOpenProductModal = (product) => { 
    if (product.isPizza && product.maxFlavors > 1) {
      setPizzaBase(product);
      setPizzaFlavorCount(1);
      setPizzaSelectedFlavors([product]);
      setShowPizzaModal(true);
    } else {
      setSelectedProductModal(product); 
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
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === customId);
      if (existing) return prev.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { 
         id: customId,
         productId: pizzaBase.id, 
         name: customName, 
         price: finalPrice, 
         quantity: 1, 
         observation: '',
         flavors: pizzaSelectedFlavors.map(f => ({ productId: f.id, name: f.name }))
      }];
    });
    
    setShowPizzaModal(false);
    setPizzaBase(null);
  };

  const addToCart = (product, quantity = 1, observation = '') => {
    if (product.name.toLowerCase().includes('costela')) {
       handleOpenCostelaModal(product);
       return;
    }
    if (!isStoreOpen && !isTotemMode) {
      alert('A loja está fechada no momento! Confira nossos horários no rodapé.');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => (item.productId === product.id || item.id === product.id) && item.observation === observation && !item.flavors);
      if (existing) return prev.map((item) => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { id: product.id, productId: product.id, name: product.name, price: Number(product.price), quantity, observation }];
    });
  };

  const confirmCostelaOrder = () => {
    const price500 = Number(costelaProduct.price);
    const price700 = Number(costelaProduct.price700g) > 0 ? Number(costelaProduct.price700g) : price500 * 1.4;
    const price1000 = Number(costelaProduct.price1kg) > 0 ? Number(costelaProduct.price1kg) : price500 * 1.9;
    let finalPrice = price500;
    if (costelaSize === '700g') finalPrice = price700;
    if (costelaSize === '1kg') finalPrice = price1000;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === costelaProduct.id && item.size === costelaSize && item.time === costelaTime);
      if (existing) { return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item); }
      return [...prev, { productId: costelaProduct.id, name: `${costelaProduct.name} - ${costelaSize} (Agendado Dom: ${costelaTime})`, price: finalPrice, quantity: 1, isScheduled: true, size: costelaSize, time: costelaTime }];
    });
    setShowCostelaModal(false); setCostelaProduct(null);
  };

  const removeFromCart = (idOuProductId) => {
    setCart((prev) => prev.filter(item => item.id !== idOuProductId && item.productId !== idOuProductId));
    if (cart.length === 1) setView('menu');
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  let couponDiscount = 0;
  if (appliedCoupon && !isTotemMode) {
      if (appliedCoupon.type === 'PERCENTAGE') couponDiscount = cartTotal * (appliedCoupon.value / 100);
      else if (appliedCoupon.type === 'FIXED') couponDiscount = appliedCoupon.value;
  }

  const finalDeliveryFee = isTotemMode ? 0 : deliveryFee;
  const baseTotal = cartTotal + finalDeliveryFee - couponDiscount;
  const availableCashback = user?.cashback?.balance ? Number(user.cashback.balance) : 0;
  let discount = 0; 
  let finalTotal = baseTotal;

  if (useCashback && availableCashback > 0 && !isTotemMode) {
     discount = Math.min(availableCashback, Math.max(0, finalTotal));
     finalTotal -= discount;
  }
  finalTotal = Math.max(0, finalTotal);

  const mpInitialization = useMemo(() => ({ amount: finalTotal }), [finalTotal]);
  const mpCustomization = useMemo(() => ({ paymentMethods: { creditCard: "all", debitCard: "all", maxInstallments: 3 } }), []);

  const triggerCheckoutFlow = () => {
    const currentChannel = isTotemMode ? 'TOTEM' : 'APP';
    let matchedRule = null;
    let triggerItemIndex = -1;

    for (let i = 0; i < cart.length; i++) {
      if (cart[i].upsold) continue; 
      matchedRule = upsells.find(u => u.channels.includes(currentChannel) && u.triggerProductIds.includes(cart[i].productId));
      if (matchedRule) { triggerItemIndex = i; break; }
    }

    if (matchedRule && triggerItemIndex !== -1) {
      let offerProductFull = null;
      for (const cat of menu) {
        const found = cat.products.find(p => p.id === matchedRule.offerProductId);
        if (found) { offerProductFull = found; break; }
      }
      setUpsellItem({ ...offerProductFull, id: matchedRule.offerProductId, name: matchedRule.offerProductName, offerPrice: Number(matchedRule.offerPrice), triggerCartIndex: triggerItemIndex });
      setShowUpsellModal(true); return;
    }
    setView('checkout');
  };

  const handleVerSacola = () => {
    if (!user && !isTotemMode) { setAuthMode('login'); setView('auth'); return; }
    triggerCheckoutFlow();
  };

  const handleAcceptUpsell = () => {
    setCart(prev => {
      const newCart = [...prev];
      if (upsellItem.triggerCartIndex !== undefined && newCart[upsellItem.triggerCartIndex]) newCart[upsellItem.triggerCartIndex].upsold = true;
      newCart.push({ productId: upsellItem.id, name: `✨ Oferta: ${upsellItem.name}`, price: upsellItem.offerPrice, quantity: 1, observation: 'Adicional Automático' });
      return newCart;
    });
    setShowUpsellModal(false); setUpsellItem(null); setView('checkout');
  };

  const handleDeclineUpsell = () => {
    setCart(prev => {
      const newCart = [...prev];
      if (upsellItem.triggerCartIndex !== undefined && newCart[upsellItem.triggerCartIndex]) newCart[upsellItem.triggerCartIndex].upsold = true;
      return newCart;
    });
    setShowUpsellModal(false); setUpsellItem(null); setView('checkout');
  };

  const buildItemsPayload = () => cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      observation: item.observation,
      name: item.name,
      flavors: item.flavors ? JSON.stringify(item.flavors) : undefined
  }));

  const handleCheckoutBtnClick = async (e, customFullAddress) => {
    if (e) e.preventDefault();
    if (isSubmittingOrder) return;
    if (isTotemMode && !totemName.trim()) { alert('⚠️ Informe o seu NOME para te chamarmos no balcão!'); return; }
    if (!user && !isTotemMode) { setAuthMode('login'); setView('auth'); return; }

    const hasScheduledItem = cart.some(i => i.isScheduled);
    if (!isStoreOpen && !hasScheduledItem && !isTotemMode) { alert('A loja está fechada agora.'); return; }
    if (paymentMethod === 'CREDIT_CARD_ONLINE') { setView('payment_card'); return; }

    if (!isOnline && !isTotemMode) {
        alert("⚠️ Sem conexão com a internet. Verifique sua rede e tente novamente.");
        return;
    }

    setIsSubmittingOrder(true);
    try {
      const payloadParams = {
          clientId: isTotemMode ? 'TOTEM_MODE' : user.id,
          origin: isTotemMode ? 'TOTEM' : 'APP',
          customerName: isTotemMode ? totemName : user?.name,
          items: buildItemsPayload(),
          address: isTotemMode ? `Cliente Totem: ${totemName}` : customFullAddress,
          paymentMethod,
          total: cartTotal,
          useCashback,
          couponCode: appliedCoupon?.code || null,
          client: { name: isTotemMode ? totemName : user?.name, cpf: cpfNaNota }
      };

      if (isOnline) {
          const res = await fetch(`${API_URL}/api/orders`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-loja-slug': storeSlug },
            body: JSON.stringify(payloadParams)
          });
          const data = await res.json();
          if (res.ok && data.success) {
            if (!isTotemMode) setUser({ ...user, cashback: { balance: data.newBalance } });
            if (data.pix) { setPixInfo(data.pix); setView('payment_pix'); } 
            else {
              if (isTotemMode) { alert(`✅ Pedido realizado!\nDirija-se ao caixa para pagamento.`); setCart([]); setTotemName(''); setView('menu'); } 
              else { alert(`Pedido realizado!`); setCart([]); setUseCashback(false); setObservations(''); setCouponCode(''); setAppliedCoupon(null); setView('orders'); }
            }
          } else alert(data.error);
      } else if (isTotemMode) {
          const shortIdRandom = Math.floor(1000 + Math.random() * 9000);
          const offlineRes = await processarPedido(payloadParams);
          
          if (offlineRes.success) {
              const mockOrder = {
                  id: `OFF-${Date.now()}`,
                  shortId: shortIdRandom,
                  customerName: totemName,
                  paymentMethod: paymentMethod,
                  total: cartTotal,
                  items: cart
              };

              const printIp = localStorage.getItem('zenix_print_ip');
              if (printIp) {
                  const payloadOffline = {
                      tabId: `TOTEM-${shortIdRandom}`,
                      tabNumber: `TOTEM-${shortIdRandom}`,
                      employeeName: 'Totem de Autoatendimento',
                      items: payloadParams.items,
                      paymentMethod: paymentMethod,
                      total: cartTotal,
                      customerName: totemName
                  };
                  fetch(`http://${printIp}:8080/pedido-local`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payloadOffline)
                  }).catch(() => console.warn("Caixa local inacessível."));
              }

              setOrderSuccessData(mockOrder);
              setCart([]); setTotemName(''); setView('menu');
          } else {
              alert("Erro ao gravar pedido offline no Totem.");
          }
      }
    } catch (error) { alert("Erro de comunicação com o sistema."); } finally { setIsSubmittingOrder(false); }
  };

  const t = i18n[lang];

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-amber-500 font-bold"><div className="animate-pulse flex flex-col items-center"><span className="text-4xl mb-4">⚡</span><p>Carregando sistema...</p></div></div>;
  if (!storeData) return <div className="h-screen bg-slate-50 flex items-center justify-center text-2xl font-bold text-red-500">Loja não encontrada.</div>;

  if (isIdle && isTotemMode) {
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

        <div 
          onClick={() => {
            const atual = localStorage.getItem('zenix_print_ip') || '';
            const novo = prompt("⚙️ Configuração da Rede Local\nQual o IP local (Wi-Fi) do Computador do Caixa?", atual);
            if (novo !== null) { localStorage.setItem('zenix_print_ip', novo); alert("IP Salvo com sucesso: " + novo); }
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full text-xs text-amber-400 font-black z-50 cursor-pointer border border-amber-400/30 shadow-lg uppercase tracking-wider hover:bg-black/60 transition-colors"
        >
          ⚙️ Configurar IP do Caixa na Rede
        </div>
      </div>
    );
  }

  if (isIdle && !isTotemMode) { setIsIdle(false); }

  if (orderSuccessData && isTotemMode) {
    return (
      <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-emerald-600 animate-fade-in-up">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-2xl w-[90%]">
          <span className="text-7xl block mb-6 animate-bounce">✅</span>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{t.orderSuccessTitle}</h1>
          <p className="text-xl text-amber-600 font-black mb-8">Vá até o Caixa para efetuar o pagamento e retirar seu comprovante.</p>
          
          <div className="bg-slate-100 p-8 rounded-3xl border-2 border-slate-200 mb-8 inline-block w-full">
            <p className="text-lg text-slate-500 font-bold uppercase tracking-widest">{t.passwordIs}</p>
            <p className="text-[6rem] font-black text-emerald-600 leading-none">{orderSuccessData.shortId}</p>
            <p className="text-2xl text-slate-800 font-black mt-4">{orderSuccessData.customerName || totemName}</p>
          </div>

          <button onClick={() => { setOrderSuccessData(null); setIsIdle(true); }} className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all">
            Concluir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-zinc-100 font-sans pb-28 selection:bg-amber-500 selection:text-zinc-950 transition-colors duration-500 flex flex-col justify-between">
        
        {!isTotemMode && <Header view={view} setView={setView} isScrolled={isScrolled} user={user} availableCashback={availableCashback} setAuthMode={setAuthMode} isDarkMode={isDarkMode} toggleTheme={toggleTheme} storeSettings={storeSettings} />}
        
        {isTotemMode && (
          <div className="relative bg-white dark:bg-gradient-to-b dark:from-black dark:to-[#0a0a0a] border-b border-slate-200 dark:border-white/5 p-6 md:p-8 flex justify-between items-center sticky top-0 z-40 shadow-xl transition-colors overflow-hidden">
              {storeSettings?.totemCoverImageUrl && (
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url('${storeSettings.totemCoverImageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              )}

              <div className="flex items-center gap-4 relative z-10">
                  <span className="text-4xl animate-bounce">⚡</span>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight flex items-center gap-3">
                        {storeSettings?.store?.name || 'Zenix'}
                        {!isOnline && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black animate-pulse shadow-sm">Offline</span>}
                    </h1>
                    <span className="text-amber-600 dark:text-amber-500 font-bold text-sm tracking-widest uppercase">Autoatendimento</span>
                  </div>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <button onClick={() => toggleTheme()} className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 text-xl flex items-center justify-center z-50 transition-colors cursor-pointer">
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                {cart.length > 0 && (
                    <button onClick={() => { setCart([]); setTotemName(''); setView('menu'); }} className="bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/30 px-6 py-3 rounded-2xl font-bold transition-all text-sm shadow-md z-50 cursor-pointer">
                      Cancelar Pedido
                    </button>
                )}
              </div>
          </div>
        )}

        <div className={`transition-all duration-300 flex-1 ${(view === 'payment_card' || view === 'payment_pix' || view === 'live_cam') ? 'pt-4' : (isTotemMode ? 'pt-6' : (isScrolled ? 'pt-20' : 'pt-32 md:pt-40'))}`}>
          <main className={`mx-auto p-4 ${isTotemMode ? 'max-w-5xl' : 'max-w-4xl'}`}>
            
            {view === 'menu' && (
              <div className="flex flex-col gap-6">
                <MenuView 
                  isStoreOpen={isStoreOpen} storeSettings={isTotemMode ? { ...storeSettings, cashbackPercent: 0, promoBannerUrl: null } : storeSettings} 
                  highlights={isTotemMode ? highlights.filter(p => !p.name.toLowerCase().includes('costela') && !p.name.toLowerCase().includes('agendado')) : highlights}
                  currentSlide={currentSlide} setCurrentSlide={setCurrentSlide}
                  handleOpenProductModal={handleOpenProductModal} 
                  menu={isTotemMode ? menu.map(cat => ({ ...cat, products: cat.products.filter(p => !p.name.toLowerCase().includes('costela') && !p.name.toLowerCase().includes('agendado'))})).filter(cat => cat.products.length > 0) : menu} 
                  renderProductBadges={renderProductBadges} isTotemMode={isTotemMode}
                />
              </div>
            )}

            {view === 'checkout' && (
              <CheckoutView isStoreOpen={isStoreOpen} cart={cart} setView={setView} removeFromCart={removeFromCart} cep={cep} setCep={setCep} address={address} setAddress={setAddress} observations={observations} setObservations={setObservations} cpfNaNota={cpfNaNota} setCpfNaNota={setCpfNaNota} couponCode={couponCode} setCouponCode={setCouponCode} appliedCoupon={appliedCoupon} handleApplyCoupon={handleApplyCoupon} isValidatingCoupon={isValidatingCoupon} handleRemoveCoupon={handleRemoveCoupon} couponError={couponError} couponDiscount={couponDiscount} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} user={user} availableCashback={availableCashback} useCashback={useCashback} setUseCashback={setUseCashback} cartTotal={cartTotal} deliveryFee={finalDeliveryFee} discount={discount} finalTotal={finalTotal} isSubmittingOrder={isSubmittingOrder} handleCheckoutBtnClick={handleCheckoutBtnClick} isTotemMode={isTotemMode} totemName={totemName} setTotemName={setTotemName} />
            )}

            {view === 'payment_pix' && pixInfo && (
              <div className="animate-fade-in-up max-w-md mx-auto text-center py-10">
                <div className="bg-white dark:bg-[#121212] p-8 rounded-3xl border border-slate-200 dark:border-amber-500/30 shadow-xl relative overflow-hidden transition-colors">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{isTotemMode ? 'Escaneie para Pagar' : 'Pague seu PIX'}</h2>
                  <div className="bg-white p-3 rounded-2xl border-4 border-amber-500 inline-block shadow-lg mx-auto w-48 h-48 mb-4">
                     <img src={`data:image/jpeg;base64,${pixInfo.qr_code_base64}`} alt="QR Code PIX" className="w-full h-full object-contain" />
                  </div>
                  <button onClick={() => setView('checkout')} className="w-full bg-slate-100 dark:bg-white/5 py-3.5 rounded-xl font-bold text-sm border border-slate-200 dark:border-white/10 cursor-pointer">⬅ Cancelar</button>
                </div>
              </div>
            )}

            {view === 'auth' && !isTotemMode && (
              <AuthView authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} handleAuth={handleAuth} showPassword={showPassword} setShowPassword={setShowPassword} recoveryEmail={recoveryEmail} setRecoveryEmail={setRecoveryEmail} handleForgotPassword={handleForgotPassword} isSendingCode={isSendingCode} recoveryCode={recoveryCode} setRecoveryCode={setRecoveryCode} newPassword={newPassword} setNewPassword={setNewPassword} handleResetPassword={handleResetPassword} />
            )}

            {view === 'orders' && !isTotemMode && (
              <OrdersView clientOrders={clientOrders} setWatchingOrder={setWatchingOrder} setView={setView} translateStatus={translateStatus} setReviewOrder={setReviewOrder} availableCashback={availableCashback} storeSettings={storeSettings} user={user} fetchClientOrders={fetchClientOrders} />
            )}
          </main>
        </div>

        {!isTotemMode && <Footer view={view} getTodayScheduleText={() => "Horários"} storeSettings={storeSettings} />}
        <FloatingCart cart={cart} view={view} cartTotal={cartTotal} handleVerSacola={handleVerSacola} />
        
        <ProductDetailsModal product={selectedProductModal} onClose={() => setSelectedProductModal(null)} onAddToCart={addToCart} renderProductBadges={renderProductBadges} menu={menu} user={user} availableCashback={availableCashback} />

        {showPizzaModal && pizzaBase && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-white dark:bg-[#121212] rounded-[2rem] shadow-2xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-white/10 pb-4 shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Montar Pizza</h2>
                  <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{pizzaBase?.name}</p>
                </div>
                <button onClick={() => setShowPizzaModal(false)} className="bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-300 w-10 h-10 rounded-full font-black text-lg">X</button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
                <h3 className="font-black text-slate-700 dark:text-zinc-300 mb-2 text-sm uppercase tracking-wider">Quantos sabores?</h3>
                <div className="flex gap-3 mb-6">
                  {[1, 2, 3].map(num => {
                    if (num > (pizzaBase?.maxFlavors || 1)) return null;
                    return (
                      <button key={num} onClick={() => { setPizzaFlavorCount(num); setPizzaSelectedFlavors([pizzaBase]); }} className={`flex-1 py-3 rounded-2xl font-black text-base border-2 transition-all ${pizzaFlavorCount === num ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-black/50 dark:text-zinc-500'}`}>
                        {num} {num === 1 ? 'Sabor' : 'Sabores'}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 p-3 rounded-xl mb-6 flex items-center justify-between font-bold border border-amber-200 dark:border-amber-500/20 shadow-inner">
                  <span className="text-sm">Selecionados ({pizzaSelectedFlavors.length}/{pizzaFlavorCount}):</span>
                  <span className="text-xs">{pizzaSelectedFlavors.map(f => f.name).join(' + ')}</span>
                </div>

                <h3 className="font-black text-slate-700 dark:text-zinc-300 mb-3 text-sm uppercase tracking-wider">Escolha as metades</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {menu.flatMap(cat => cat.products).filter(p => p.isPizza).map((flavor, index, self) => {
                    if (self.findIndex(t => t.id === flavor.id) !== index) return null;
                    const isSelected = pizzaSelectedFlavors.find(f => f.id === flavor.id);
                    const isFull = !isSelected && pizzaSelectedFlavors.length >= pizzaFlavorCount;
                    return (
                      <button key={flavor.id} disabled={isFull} onClick={() => togglePizzaFlavor(flavor)} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center ${isSelected ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : isFull ? 'border-slate-100 bg-slate-100 dark:border-white/5 opacity-50 cursor-not-allowed' : 'border-slate-200 bg-white dark:bg-black/50'}`}>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 text-[10px] leading-tight line-clamp-2 min-h-[28px]">{flavor.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] mt-1">+ R$ {Number(flavor.price).toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/10 shrink-0 mt-4">
                <button onClick={confirmBuiltPizza} disabled={pizzaSelectedFlavors.length !== pizzaFlavorCount} className="w-full bg-amber-500 disabled:bg-slate-300 text-black py-4 rounded-xl font-black text-xl shadow-md cursor-pointer">
                  Adicionar Pizza - R$ {getPizzaPricePreview().toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}

        <ReviewModal reviewOrder={reviewOrder} setReviewOrder={setReviewOrder} reviewRating={reviewRating} setReviewRating={setReviewRating} reviewComment={reviewComment} setReviewComment={setReviewComment} isSubmittingReview={isSubmittingReview} handleSubmitReview={handleSubmitReview} />
        <CostelaModal showCostelaModal={showCostelaModal} setShowCostelaModal={setShowCostelaModal} costelaProduct={costelaProduct} costelaSize={costelaSize} setCostelaSize={setCostelaSize} costelaTime={costelaTime} setCostelaTime={setCostelaTime} confirmCostelaOrder={confirmCostelaOrder} />
        <UpsellModal showUpsellModal={showUpsellModal} upsellItem={upsellItem} handleAcceptUpsell={handleAcceptUpsell} handleDeclineUpsell={handleDeclineUpsell} />
      </div>
      
      {isTotemMode && (
          <div 
            onClick={() => {
              const atual = localStorage.getItem('zenix_print_ip') || '';
              const novo = prompt("⚙️ Configuração Técnica do Totem\nQual o IP local (Wi-Fi) do Computador do Caixa?", atual);
              if (novo !== null) { localStorage.setItem('zenix_print_ip', novo); alert("IP Salvo com sucesso: " + novo); }
            }}
            className="fixed bottom-2 right-4 text-[10px] text-amber-500 font-bold z-50 cursor-pointer bg-black/80 px-3 py-1.5 rounded-lg border border-amber-500/30 shadow-2xl hover:text-white transition-colors"
          >
            ⚙️ Configurar IP Caixa
          </div>
      )}
    </div>
  );
}

export default function StorePage() {
  const params = useParams();
  const storeSlug = params.storeSlug; 
  const [storeStatus, setStoreStatus] = useState('LOADING');

  useEffect(() => {
    if (!storeSlug) return;
    const identifyStore = async () => {
      try {
        const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
          ? 'http://localhost:3333' 
          : 'https://zenixfood-backend.onrender.com';

        const res = await fetch(`${API_URL}/api/settings`, { headers: { 'x-loja-slug': storeSlug } });
        if (res.status === 402) { window.location.href = `/${storeSlug}/bloqueado`; return; }
        const data = await res.json();
        if (data.success || data.isOpen !== undefined) {
          if (data.store && data.store.id) localStorage.setItem('zenix_store_id', data.store.id);
          setStoreStatus('FOUND');
        } else { setStoreStatus('NOT_FOUND'); }
      } catch (error) { setStoreStatus('NOT_FOUND'); }
    };
    identifyStore();
  }, [storeSlug]);

  if (storeStatus === 'LOADING') return <div className="min-h-screen bg-black flex items-center justify-center text-amber-500 font-black text-xl animate-pulse">Carregando loja...</div>;
  if (storeStatus === 'NOT_FOUND') return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6"><span className="text-6xl mb-4">🔍</span><h1 className="text-3xl font-black text-white mb-2">Loja não encontrada</h1></div>;

  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-amber-500">Iniciando...</div>}>
      <HomeContent storeSlug={storeSlug} />
    </Suspense>
  );
}