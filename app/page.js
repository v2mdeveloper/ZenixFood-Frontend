'use client';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

import Header from './components/Header';
import Footer from './components/Footer';
import FloatingCart from './components/FloatingCart';

import MenuView from './components/views/MenuView';
import AuthView from './components/views/AuthView';
import CheckoutView from './components/views/CheckoutView';
import OrdersView from './components/views/OrdersView';
import ProfileView from './components/views/ProfileView';
import LiveCamView from './components/views/LiveCamView';

import CarrosselAvaliacoes from './components/CarrosselAvaliacoes';
import ReviewModal from './components/modals/ReviewModal';
import CostelaModal from './components/modals/CostelaModal';
import UpsellModal from './components/modals/UpsellModal';
import ProductDetailsModal from './components/modals/ProductDetailsModal';

function HomeContent() {
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

  const API_URL = 'https://zenixfood-backend.onrender.com';
  const searchParams = useSearchParams();

  // 🛡️ Helper local para multi-tenant (envio do x-store-id e Token JWT)
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    // E O BACKEND BARRAR POR FALTA DE PAGAMENTO:
    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; // Redireciona para a tela de aviso
      }
    }

    return response;
  };

  // 💳 Inicializa o Mercado Pago dinamicamente com a chave da loja
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
        name: parsedUser.name, 
        email: parsedUser.email, 
        phone: parsedUser.phone || '', 
        cpf: parsedUser.cpf || '', 
        birthDate: parsedUser.birthDate || '', 
        address: extRua, 
        cep: extCep,
        password: '' 
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
          setCart([]); setTotemName(''); setView('menu'); setShowUpsellModal(false); setPixInfo(null); setSelectedProductModal(null);
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
    fetchWithStore(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        setDeliveryFee(Number(data.deliveryFee));
        setCashbackPercent(Number(data.cashbackPercent));
        setIsStoreOpen(data.isOpen);
        setStoreSettings(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSystemSettings();
    const settingsInterval = setInterval(fetchSystemSettings, 20000);
    return () => clearInterval(settingsInterval);
  }, []);

  useEffect(() => {
    const registerVisit = async () => {
      if (sessionStorage.getItem('@Zenix:visitLogged') || isTotemMode) return;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      try {
        await fetchWithStore(`${API_URL}/api/analytics/visit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?.id || null, device: isMobile ? 'Celular' : 'Computador' }) });
        sessionStorage.setItem('@Zenix:visitLogged', 'true');
      } catch (e) {}
    };
    const timer = setTimeout(registerVisit, 2000);
    return () => clearTimeout(timer);
  }, [user, isTotemMode, API_URL]);

  useEffect(() => {
    if (view === 'payment_card' || view === 'payment_pix' || view === 'live_cam' || isTotemMode) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view, isTotemMode]);

  useEffect(() => {
    let intervalId;
    if (view === 'payment_pix' && pixInfo && pixInfo.orderId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetchWithStore(`${API_URL}/api/orders/${pixInfo.orderId}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'PREPARING' || data.status === 'PAID') {
              clearInterval(intervalId);
              if (isTotemMode) {
                  alert('✅ Pagamento Aprovado! Seu pedido já está em preparação. Fique atento no balcão que vamos chamar o seu nome!');
                  setCart([]); setTotemName(''); setPixInfo(null); setView('menu');
              } else {
                  alert('✅ Pagamento PIX Aprovado! O seu pedido já foi encaminhado para a operação.');
                  setCart([]); setUseCashback(false); setObservations(''); setCouponCode(''); setAppliedCoupon(null); setView('orders');
              }
            }
          }
        } catch (error) {}
      }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [view, pixInfo, isTotemMode, API_URL]);

  useEffect(() => {
    Promise.all([
      fetchWithStore(`${API_URL}/api/menu`).then((res) => res.json()),
      fetchWithStore(`${API_URL}/api/products/highlights`).then((res) => res.json()),
      fetchWithStore(`${API_URL}/api/suppliers`).then((res) => res.ok ? res.json() : []).catch(() => []),
      fetchWithStore(`${API_URL}/api/upsells`).then((res) => res.ok ? res.json() : []).catch(() => []) 
    ]).then(([menuData, highlightsData, suppliersData, upsellsData]) => {
      setMenu(menuData); 
      setHighlights(highlightsData); 
      setSuppliers(suppliersData); 
      setUpsells(upsellsData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (menu.length > 0) {
      const imagesToPreload = [];
      highlights.forEach(h => { if(h.imageUrl) imagesToPreload.push(h.imageUrl) });
      menu.forEach(cat => cat.products.slice(0, 5).forEach(p => { if(p.imageUrl) imagesToPreload.push(p.imageUrl) }));
      [...new Set(imagesToPreload)].forEach(url => { const img = new Image(); img.src = url; });
    }
  }, [menu, highlights]);

  useEffect(() => {
    if (highlights.length > 1 && view === 'menu') {
      const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % highlights.length), 5000);
      return () => clearInterval(timer);
    }
  }, [highlights, view]);

  useEffect(() => {
    if (user && !isTotemMode && (view === 'orders' || view === 'live_cam')) {
      fetchClientOrders();
      const interval = setInterval(fetchClientOrders, 8000);
      return () => clearInterval(interval);
    }
  }, [user, view, isTotemMode]);

  const fetchClientOrders = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/orders/client/${user.id}`);
      if (res.ok) setClientOrders(await res.json());
    } catch (error) {}
  };

  const handleOpenCostelaModal = (product) => {
    setCostelaProduct(product); 
    setCostelaSize('500g'); 
    setCostelaTime('12:00'); 
    setShowCostelaModal(true);
    setSelectedProductModal(null);
  };

  const handleOpenProductModal = (product) => { setSelectedProductModal(product); };

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
      const existing = prev.find((item) => item.productId === product.id && item.observation === observation);
      if (existing) return prev.map((item) => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { productId: product.id, name: product.name, price: Number(product.price), quantity, observation }];
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

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter(item => item.productId !== productId));
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

  const handleApplyCoupon = async () => {
    if (useCashback) { alert("⚠️ Desmarque o saldo de Cashback primeiro para poder aplicar o cupom."); return; }
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true); setCouponError('');
    try {
        const res = await fetchWithStore(`${API_URL}/api/coupons/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode, cartTotal, clientId: user.id }) });
        const data = await res.json();
        if (data.success) setAppliedCoupon(data.coupon);
        else { setCouponError(data.error); setAppliedCoupon(null); }
    } catch (error) { setCouponError('Erro ao validar cupom.'); setAppliedCoupon(null); } finally { setIsValidatingCoupon(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const payload = { ...authForm };
      if (authMode === 'register') {
         payload.address = `CEP: ${authForm.cep || ''} - ${authForm.address || ''}`;
      }

      const res = await fetchWithStore(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        
        let extCep = '';
        let extRua = data.user.address || '';
        const match = extRua.match(/CEP:\s*(.*?)\s*-\s*(.*)/);
        if (match) { extCep = match[1]; extRua = match[2]; }

        setProfileForm({ 
          name: data.user.name, 
          email: data.user.email, 
          phone: data.user.phone || '', 
          cpf: data.user.cpf || '', 
          birthDate: data.user.birthDate || '', 
          address: extRua, 
          cep: extCep,
          password: '' 
        });
        
        localStorage.setItem('@Zenix:token', data.token);
        localStorage.setItem('@Zenix:user', JSON.stringify(data.user));

        if (data.user.lastAddress) {
          let enderecoLimpo = data.user.lastAddress.split('| OBS:')[0].split('| CUPOM')[0].trim();
          const matchCep = enderecoLimpo.match(/CEP:\s*(.*?)\s*-\s*(.*)/);
          if (matchCep) { setCep(matchCep[1]); setAddress(matchCep[2]); } else { setAddress(enderecoLimpo); }
        }
        if (cart.length > 0) triggerCheckoutFlow(); else setView('menu');
      } else alert(data.error);
    } catch (error) { alert('Erro na conexão'); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault(); setIsSendingCode(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: recoveryEmail }) });
      const data = JSON.parse(await res.text());
      if (data.success) { alert('✅ E-mail enviado!'); setAuthMode('reset'); } else { alert(`⚠️ Erro: ${data.error}`); }
    } catch (error) {} finally { setIsSendingCode(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: recoveryEmail, code: recoveryCode, newPassword }) });
      const data = await res.json();
      if (data.success) { alert('Senha alterada!'); setAuthMode('login'); setAuthForm({ ...authForm, email: recoveryEmail, password: '' }); } else alert(data.error);
    } catch (error) {}
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...profileForm, address: `CEP: ${profileForm.cep || ''} - ${profileForm.address || ''}` };
      const res = await fetchWithStore(`${API_URL}/api/users/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { 
        setUser(data.user); 
        localStorage.setItem('@Zenix:user', JSON.stringify(data.user));
        alert('Atualizado com sucesso!'); 
        setProfileForm(prev => ({ ...prev, password: '' })); 
      } else alert('Erro ao atualizar os dados.');
    } catch (error) {}
  };

  const handleCheckoutBtnClick = async (e, customFullAddress) => {
    if (e) e.preventDefault();
    if (isSubmittingOrder) return;
    if (isTotemMode && !totemName.trim()) { alert('⚠️ Informe o seu NOME para te chamarmos no balcão!'); return; }
    if (!user && !isTotemMode) { setAuthMode('login'); setView('auth'); return; }

    const hasScheduledItem = cart.some(i => i.isScheduled);
    if (!isStoreOpen && !hasScheduledItem && !isTotemMode) { alert('A loja está fechada agora.'); return; }
    if (paymentMethod === 'CREDIT_CARD_ONLINE') { setView('payment_card'); return; }

    setIsSubmittingOrder(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: isTotemMode ? 'TOTEM_MODE' : user.id, items: cart, address: customFullAddress, paymentMethod, total: cartTotal, useCashback, couponCode: appliedCoupon?.code || null, client: { name: isTotemMode ? totemName : user?.name, cpf: cpfNaNota } })
      });
      const data = await res.json();
      if (data.success) {
        if (!isTotemMode) setUser({ ...user, cashback: { balance: data.newBalance } });
        if (data.pix) { setPixInfo(data.pix); setView('payment_pix'); } 
        else {
          if (isTotemMode) { alert(`✅ Pedido realizado!\nDirija-se ao caixa para pagamento.`); setCart([]); setTotemName(''); setView('menu'); } 
          else { alert(`Pedido realizado!`); setCart([]); setUseCashback(false); setObservations(''); setCouponCode(''); setAppliedCoupon(null); setView('orders'); }
        }
      } else alert(data.error);
    } catch (error) {} finally { setIsSubmittingOrder(false); }
  };

  const copyPixToClipboard = () => {
    if (pixInfo && pixInfo.qr_code) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pixInfo.qr_code);
        setPixCopied(true);
        setTimeout(() => setPixCopied(false), 3000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = pixInfo.qr_code;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setPixCopied(true);
          setTimeout(() => setPixCopied(false), 3000);
        } catch (err) {
          alert('Por favor, selecione e copie o texto manualmente.');
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const onSubmitCard = async ({ selectedPaymentMethod, formData }) => {
    const hasScheduledItem = cart.some(i => i.isScheduled);
    const obsTratada = hasScheduledItem ? `[AGENDADO DOM: ${cart.find(i => i.isScheduled)?.time || ''}] ${observations}`.trim() : observations;
    const fullAddress = `CEP: ${cep} - ${address}${obsTratada ? ` | OBS: ${obsTratada}` : ''}`;

    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetchWithStore(`${API_URL}/api/orders`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: user.id, items: cart, address: fullAddress, paymentMethod: 'CREDIT_CARD_ONLINE', total: cartTotal, useCashback, mpData: formData, couponCode: appliedCoupon?.code || null, client: { name: user?.name, cpf: cpfNaNota } })
        });
        const data = await res.json();
        if (data.success) {
          setUser({ ...user, cashback: { balance: data.newBalance } });
          setCart([]); setUseCashback(false); setObservations(''); setCouponCode(''); setAppliedCoupon(null);
          alert(`Pagamento Aprovado! O seu pedido já foi enviado para a cozinha.`);
          setView('orders'); resolve();
        } else { alert(`Pagamento Recusado: ${data.error}`); reject(); }
      } catch (error) { reject(); }
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/avaliacoes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clienteNome: user.name, nota: reviewRating, comentario: reviewComment }) });
      const data = await res.json();
      if (data.success) { 
          alert('Obrigado pela sua avaliação!'); 
          setReviewOrder(null); 
          setReviewComment(''); 
          setReviewRating(5); 
      } else { alert(data.error || 'Erro ao enviar avaliação.'); }
    } catch (error) { alert('Erro de conexão ao enviar avaliação.'); } finally { setIsSubmittingReview(false); }
  };

  const translateStatus = (status) => {
    const mapping = {
      'PENDING': { label: 'Aguardando Pagamento ⏳', color: 'text-zinc-500 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-500/10 dark:border-zinc-500/20' },
      'PREPARING': { label: 'Em Preparação 🔥', color: 'text-amber-600 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20' },
      'READY': { label: 'Pedido Pronto 🛎️', color: 'text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
      'IN_TRANSIT': { label: 'Saiu para entrega 🛵', color: 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20' },
      'DELIVERED': { label: 'Pedido Entregue ✅', color: 'text-slate-700 bg-slate-200 border-slate-300 dark:text-zinc-300 dark:bg-zinc-800 dark:border-zinc-700' },
      'CANCELED': { label: 'Cancelado ❌', color: 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20' }
    };
    return mapping[status] || { label: status, color: 'text-slate-800 dark:text-white' };
  };

  const renderProductBadges = (name) => {
    const badges = [];
    if (name.toLowerCase().includes('vegano') || name.toLowerCase().includes('aveia')) badges.push(<span key="veg" className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider border border-emerald-200 dark:border-transparent">🌱 Vegano</span>);
    if (name.toLowerCase().includes('pimenta') || name.toLowerCase().includes('jalapeño')) badges.push(<span key="spi" className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider border border-red-200 dark:border-transparent">🌶️ Picante</span>);
    return badges;
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-amber-500 font-bold"><div className="animate-pulse flex flex-col items-center"><span className="text-4xl mb-4">⚡</span><p>Carregando sistema...</p></div></div>;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-zinc-100 font-sans pb-28 selection:bg-amber-500 selection:text-zinc-950 transition-colors duration-500 flex flex-col justify-between">
        
        {!isTotemMode && <Header view={view} setView={setView} isScrolled={isScrolled} user={user} availableCashback={availableCashback} setAuthMode={setAuthMode} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
        
        {isTotemMode && (
          <div className="bg-white dark:bg-gradient-to-b dark:from-black dark:to-[#0a0a0a] border-b border-slate-200 dark:border-white/5 p-6 md:p-8 flex justify-between items-center sticky top-0 z-40 shadow-xl cursor-pointer transition-colors" onClick={handleFullscreen}>
              <div className="flex items-center gap-4">
                  <span className="text-4xl animate-bounce">⚡</span>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Zenix</h1>
                    <span className="text-amber-600 dark:text-amber-500 font-bold text-sm tracking-widest uppercase">Autoatendimento</span>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={(e) => { e.stopPropagation(); toggleTheme(); }} className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 text-xl flex items-center justify-center z-50 transition-colors cursor-pointer">
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                {cart.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); setCart([]); setTotemName(''); setView('menu'); }} className="bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/30 px-6 py-3 rounded-2xl font-bold transition-all text-sm shadow-md z-50 cursor-pointer">
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
                
                {storeSettings?.aboutUsText && (
                  <section className="w-full animate-fade-in-up mt-2">
                    <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-amber-500/20 rounded-[2rem] p-6 md:p-10 text-center shadow-lg dark:shadow-[0_10px_40px_rgba(245,158,11,0.06)] relative overflow-hidden transition-colors">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-70"></div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
                      
                      <h2 className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-500 mb-6 uppercase tracking-[0.2em] drop-shadow-sm dark:drop-shadow-md">
                        ✨ Sobre o Estabelecimento
                      </h2>
                      <p className="text-slate-600 dark:text-zinc-300 text-sm md:text-base leading-loose italic relative z-10 font-medium md:px-8">
                        "{storeSettings.aboutUsText}"
                      </p>
                    </div>
                  </section>
                )}

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
                <div className="bg-white dark:bg-[#121212] p-8 rounded-3xl border border-slate-200 dark:border-amber-500/30 shadow-xl dark:shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-emerald-400"></div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">{isTotemMode ? 'Escaneie para Pagar' : 'Pague seu PIX'}</h2>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6 transition-colors">Aponte a câmera do celular para finalizar.</p>
                  
                  <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 p-4 sm:p-6 rounded-2xl mb-6">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Leia o QR Code abaixo</p>
                    <div className="bg-white p-3 rounded-2xl border-4 border-amber-500 inline-block shadow-lg mx-auto w-48 h-48 mb-4">
                       <img src={`data:image/jpeg;base64,${pixInfo.qr_code_base64}`} alt="QR Code PIX" className="w-full h-full object-contain" />
                    </div>

                    <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ou use o código Pix Copia e Cola</p>
                       <div className="flex flex-col gap-3">
                          <textarea 
                            readOnly 
                            value={pixInfo.qr_code || ''} 
                            className="w-full text-[10px] font-mono text-slate-500 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-xl p-3 resize-none focus:outline-none shadow-inner"
                            rows="3"
                            onClick={(e) => e.target.select()}
                          />
                          <button 
                             onClick={copyPixToClipboard} 
                             className={`w-full py-3.5 rounded-xl font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${pixCopied ? 'bg-emerald-500 text-slate-900' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'}`}
                          >
                             <span>{pixCopied ? '✅' : '📋'}</span>
                             {pixCopied ? 'Código Copiado!' : 'Copiar Código PIX'}
                          </button>
                       </div>
                    </div>
                  </div>

                  <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 mb-6"><span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> Aguardando banco confirmar...</p>
                  <button onClick={() => setView('checkout')} className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold py-3.5 rounded-xl transition-all text-sm border border-slate-200 dark:border-white/10 cursor-pointer">⬅ Cancelar</button>
                </div>
              </div>
            )}

            {view === 'payment_card' && !isTotemMode && (
              <div className="animate-fade-in-up w-full max-w-2xl mx-auto py-4">
                <div className="bg-white dark:bg-[#121212] p-4 md:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 transition-colors">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center transition-colors">💳 Pagamento Seguro</h2>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm text-center mb-6 transition-colors">Processado pelo Mercado Pago</p>
                  <Payment initialization={mpInitialization} customization={mpCustomization} onSubmit={onSubmitCard} />
                  <button onClick={() => setView('checkout')} className="w-full text-center mt-8 text-slate-500 dark:text-zinc-400 font-bold hover:text-slate-900 dark:hover:text-white underline text-sm cursor-pointer">⬅ Cancelar e voltar para a sacola</button>
                </div>
              </div>
            )}

            {view === 'auth' && !isTotemMode && (
              <AuthView authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} handleAuth={handleAuth} showPassword={showPassword} setShowPassword={setShowPassword} recoveryEmail={recoveryEmail} setRecoveryEmail={setRecoveryEmail} handleForgotPassword={handleForgotPassword} isSendingCode={isSendingCode} recoveryCode={recoveryCode} setRecoveryCode={setRecoveryCode} newPassword={newPassword} setNewPassword={setNewPassword} handleResetPassword={handleResetPassword} />
            )}

            {view === 'orders' && !isTotemMode && (
              <OrdersView clientOrders={clientOrders} setWatchingOrder={setWatchingOrder} setView={setView} translateStatus={translateStatus} setReviewOrder={setReviewOrder} availableCashback={availableCashback} storeSettings={storeSettings} user={user} fetchClientOrders={fetchClientOrders} />
            )}

            {view === 'profile' && user && !isTotemMode && (
              <ProfileView profileForm={profileForm} setProfileForm={setProfileForm} handleUpdateProfile={handleUpdateProfile} />
            )}

            {view === 'live_cam' && watchingOrder && !isTotemMode && (
              <LiveCamView watchingOrder={watchingOrder} setView={setView} setWatchingOrder={setWatchingOrder} storeSettings={storeSettings} />
            )}
          </main>
        </div>

        {!isTotemMode && view === 'menu' && (
          <div className="w-full pb-10 flex flex-col">
            <CarrosselAvaliacoes />
            {suppliers?.filter(s => s.active).length > 0 && (
              <section className="mt-16 mb-14 w-full max-w-4xl mx-auto px-4 animate-fade-in-up">
                <h3 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                  <span className="w-8 md:w-16 h-[1px] bg-slate-300 dark:bg-zinc-800 rounded-full"></span>
                  Nossos Parceiros Oficiais
                  <span className="flex-1 h-[1px] bg-slate-300 dark:bg-zinc-800 rounded-full"></span>
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x px-2">
                  {suppliers.filter(s => s.active).map(supplier => (
                    <div key={supplier.id} className="snap-start shrink-0 w-32 md:w-40 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center gap-4 hover:border-amber-500 dark:hover:border-amber-500/30 transition-all duration-300 shadow-sm dark:shadow-lg">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 dark:bg-white/5 p-3 flex items-center justify-center overflow-hidden shadow-inner">
                        {supplier.logoUrl ? <img src={supplier.logoUrl} alt={supplier.name} className="w-full h-full object-contain" loading="lazy" decoding="async" /> : <span className="text-2xl">🤝</span>}
                      </div>
                      <div className="text-center w-full">
                        <span className="text-[11px] md:text-xs font-black text-slate-800 dark:text-zinc-300 uppercase tracking-wider truncate block w-full">{supplier.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {!isTotemMode && <Footer view={view} getTodayScheduleText={() => storeSettings?.schedule ? `${storeSettings.schedule[new Date().getDay()].open} às ${storeSettings.schedule[new Date().getDay()].close}` : "Carregando..."} storeSettings={storeSettings} />}
        
        <FloatingCart cart={cart} view={view} cartTotal={cartTotal} handleVerSacola={handleVerSacola} />
        
        <ProductDetailsModal 
            product={selectedProductModal} 
            onClose={() => setSelectedProductModal(null)} 
            onAddToCart={addToCart} 
            renderProductBadges={renderProductBadges} 
            menu={menu}
            user={user}
            availableCashback={availableCashback}
        />

        <ReviewModal reviewOrder={reviewOrder} setReviewOrder={setReviewOrder} reviewRating={reviewRating} setReviewRating={setReviewRating} reviewComment={reviewComment} setReviewComment={setReviewComment} isSubmittingReview={isSubmittingReview} handleSubmitReview={handleSubmitReview} />
        <CostelaModal showCostelaModal={showCostelaModal} setShowCostelaModal={setShowCostelaModal} costelaProduct={costelaProduct} costelaSize={costelaSize} setCostelaSize={setCostelaSize} costelaTime={costelaTime} setCostelaTime={setCostelaTime} confirmCostelaOrder={confirmCostelaOrder} />
        <UpsellModal showUpsellModal={showUpsellModal} upsellItem={upsellItem} handleAcceptUpsell={handleAcceptUpsell} handleDeclineUpsell={handleDeclineUpsell} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-amber-500">Iniciando...</div>}>
      <HomeContent />
    </Suspense>
  );
}