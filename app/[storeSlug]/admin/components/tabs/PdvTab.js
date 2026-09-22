'use client';
import { useState, useEffect } from 'react';

export default function PdvTab({ employeeUser, allProducts, menu }) {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [registerInfo, setRegisterInfo] = useState(null);
  const [shiftId, setShiftId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printerName, setPrinterName] = useState('');
  
  // NOVO: Estado para armazenar configurações gerais (Smart POS, etc)
  const [fullSettings, setFullSettings] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [isEmployeePurchase, setIsEmployeePurchase] = useState(false);
  const [searchCustomerText, setSearchCustomerText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedEmployeeBuyer, setSelectedEmployeeBuyer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', email: '', phone: '', cpf: '', birthDate: '', address: '' });

  const [openingBalance, setOpeningBalance] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeForm, setCloseForm] = useState({ cash: '', credit: '', debit: '', pix: '' });
  
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showMovementsListModal, setShowMovementsListModal] = useState(false);
  const [movementForm, setMovementForm] = useState({ type: 'OUT', amount: '', reason: '' });
  const [managerAuth, setManagerAuth] = useState({ email: '', password: '' });

  const [showLimitOverrideModal, setShowLimitOverrideModal] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');
  const [managerAuthLimit, setManagerAuthLimit] = useState({ email: '', password: '' });

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [discountType, setDiscountType] = useState('R$'); 
  const [discountValue, setDiscountValue] = useState('');
  
  const [searchTabNumber, setSearchTabNumber] = useState('');
  const [loadedTab, setLoadedTab] = useState(null);
  const [splitCount, setSplitCount] = useState(1);
  const [selectedSeatFilter, setSelectedSeatFilter] = useState('TODOS');

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSourceTabNumber, setMergeSourceTabNumber] = useState('');

  // 🍕 ESTADOS DO CONSTRUTOR DE PIZZAS
  const [pizzaBuilderOpen, setPizzaBuilderOpen] = useState(false);
  const [pizzaBase, setPizzaBase] = useState(null);
  const [pizzaFlavorCount, setPizzaFlavorCount] = useState(1);
  const [pizzaSelectedFlavors, setPizzaSelectedFlavors] = useState([]);

  // 🔥 ESTADOS DO TOTEM (PAGAMENTOS PENDENTES NO CAIXA)
  const [awaitingTotemOrders, setAwaitingTotemOrders] = useState([]);
  const [isTotemSidebarOpen, setIsTotemSidebarOpen] = useState(false);
  const [selectedTotemOrder, setSelectedTotemOrder] = useState(null);
  const [totemPaymentMethod, setTotemPaymentMethod] = useState('PIX');
  const [processingTotem, setProcessingTotem] = useState(false);

  //Helper para injetar o x-store-id e o Token JWT automaticamente
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-loja-slug': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    //SE O BACKEND BARRAR POR FALTA DE PAGAMENTO:
    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; 
      }
    }

    return response;
  };

  useEffect(() => {
    checkRegisterStatus();
    fetchCustomers();
    fetchEmployees();
    fetchSettings();
  }, [employeeUser]);

  // 🔥 BUSCAR PEDIDOS DO TOTEM AGUARDANDO PAGAMENTO A CADA 5 SEGUNDOS
  useEffect(() => {
    fetchAwaitingTotemOrders();
    const interval = setInterval(fetchAwaitingTotemOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAwaitingTotemOrders = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/awaiting-payment`);
      if (res.ok) {
         const data = await res.json();
         setAwaitingTotemOrders(data || []);
      }
    } catch (e) {}
  };

  const fetchSettings = async () => {
    try { 
        const res = await fetchWithStore(`${API_URL}/api/settings`); 
        if (res.ok) { 
            const data = await res.json(); 
            setPrinterName(data.printerName || ''); 
            setFullSettings(data); // Guarda configurações do Smart POS
        } 
    } catch(e){}
  }

  const checkRegisterStatus = async () => {
    if (!employeeUser) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/status?employeeId=${employeeUser.id}`);
      if (res.ok) { const data = await res.json(); setShiftId(data.shiftId || null); setRegisterInfo(data.activeRegister || null); }
    } catch (e) {}
    setLoading(false);
  };

  const fetchCustomers = async () => { try { const res = await fetchWithStore(`${API_URL}/api/customers`); if (res.ok) setCustomers(await res.json()); } catch (e) {} };
  const fetchEmployees = async () => { try { const res = await fetchWithStore(`${API_URL}/api/rh/employee-accounts`); if (res.ok) setEmployees(await res.json()); } catch (e) {} };

  const handlePrint = (tipo, dados) => {
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'fixed top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black animate-fade-in-up';
    toast.innerText = '🖨️ Enviando para a impressora...';
    document.body.appendChild(toast);

    fetch('http://localhost:8080/imprimir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relatorio: true, tipo, dados, printerName })
    })
    .then(async (res) => {
       setTimeout(() => { const t = document.getElementById(toastId); if(t) t.remove(); }, 1500);
       if (!res.ok) {
          alert(`ERRO: O programa de impressão local está aberto, mas não conseguiu gerar o layout (Erro ${res.status}).`);
       }
    })
    .catch(err => {
      console.error(err);
      setTimeout(() => { const t = document.getElementById(toastId); if(t) t.remove(); }, 500);
      alert('⚠️ FALHA DE COMUNICAÇÃO: O sistema não conseguiu encontrar o seu "Programa de Impressão Local" rodando.\n\nVerifique se o programa da impressora (tela preta) está aberto no computador do caixa.');
    });
  };

  const handleOpenRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/register/open`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: employeeUser.id, openingBalance }) });
      const data = await res.json();
      if (data.success) { alert('Caixa aberto com sucesso!'); checkRegisterStatus(); } else alert(data.error);
    } catch (e) { alert('Erro ao abrir caixa.'); }
  };

  const handleCloseRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/register/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ registerId: registerInfo.id, closingBalance: closeForm.cash || 0, closingDetails: closeForm }) });
      const data = await res.json();
      if (data.success) {
        handlePrint('FECHAMENTO_CAIXA', data.register); 
        alert('Caixa fechado com sucesso!'); 
        setShowCloseModal(false); setCloseForm({ cash: '', credit: '', debit: '', pix: '' }); checkRegisterStatus();
      } else alert(data.error);
    } catch(e) { alert('Erro ao fechar caixa.'); }
  };

  const handleMovement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/movement`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ registerId: registerInfo.id, type: movementForm.type, amount: movementForm.amount, reason: movementForm.reason, managerAuth }) });
      const data = await res.json();
      if (data.success) { 
        handlePrint('MOVIMENTO_CAIXA', data.movement); 
        alert('Movimentação registrada com sucesso!'); 
        setShowMovementModal(false); setMovementForm({ type: 'OUT', amount: '', reason: '' }); setManagerAuth({ email: '', password: '' }); checkRegisterStatus(); 
      } else alert(data.error);
    } catch (e) { alert('Erro ao registrar.'); }
  };

  const loadTabByNumber = async (numberToSearch) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/number/${numberToSearch.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setLoadedTab(data); 
        setSelectedSeatFilter('TODOS');
        setCart((data.items || []).map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, seatLabel: i.seatLabel })));
        
        let foundEmp = null;
        let foundCust = null;

        if (data.customerName || data.customerCpf) {
          foundEmp = employees.find(e => e.name === data.customerName || (e.cpf && e.cpf === data.customerCpf));
          if (foundEmp) {
            setIsEmployeePurchase(true);
            setSelectedEmployeeBuyer(foundEmp);
            setSearchCustomerText('');
          } else {
            foundCust = customers.find(c => c.name === data.customerName || (c.cpf && c.cpf === data.customerCpf));
            if (foundCust) {
              setIsEmployeePurchase(false);
              setSelectedCustomer(foundCust);
              setSearchCustomerText(foundCust.name);
            }
          }
        }

        if (!foundEmp && !foundCust) {
          setIsEmployeePurchase(false);
          setSelectedEmployeeBuyer(null);
          setSelectedCustomer(null);
          setSearchCustomerText(data.customerName || `Mesa ${data.number}`);
        }

        return true;
      } else { 
        alert('Atendimento não encontrado ou já fechado.'); 
        setLoadedTab(null); setCart([]); setSelectedSeatFilter('TODOS'); 
        setIsEmployeePurchase(false); setSelectedEmployeeBuyer(null); setSelectedCustomer(null); setSearchCustomerText('');
        return false; 
      }
    } catch (e) { alert('Erro ao procurar atendimento.'); return false; }
  };

  const handleSearchTab = async (e) => { e.preventDefault(); if (!searchTabNumber.trim()) return; await loadTabByNumber(searchTabNumber); };

  const handleMergeTabs = async (e) => {
    e.preventDefault();
    if (!mergeSourceTabNumber.trim()) return;
    try {
      const resSource = await fetchWithStore(`${API_URL}/api/salao/tabs/number/${mergeSourceTabNumber.trim()}`);
      if (!resSource.ok) return alert('A Mesa que você quer juntar não foi encontrada.');
      const sourceTabData = await resSource.json();
      const resMerge = await fetchWithStore(`${API_URL}/api/salao/tabs/merge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceTabId: sourceTabData.id, targetTabId: loadedTab.id }) });
      const mergeResult = await resMerge.json();
      if (mergeResult.success) { alert('Contas unificadas!'); setShowMergeModal(false); setMergeSourceTabNumber(''); await loadTabByNumber(loadedTab.number.toString()); } else alert(mergeResult.error || 'Erro.');
    } catch (e) { alert('Erro.'); }
  };

  const handleSeatFilterChange = (e) => {
    const seat = e.target.value; setSelectedSeatFilter(seat);
    const filteredItems = seat === 'TODOS' ? (loadedTab?.items || []) : (loadedTab?.items || []).filter(i => i.seatLabel === seat);
    setCart(filteredItems.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, seatLabel: i.seatLabel, isScheduled: false })));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const randomPassword = 'ZenixFood' + Math.floor(Math.random() * 1000000) + '!';
    try {
      const res = await fetchWithStore(`${API_URL}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCustomerForm, password: randomPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert('Cliente cadastrado!'); setCustomers(prev => [data.user, ...prev]); setSelectedCustomer(data.user);
        setSearchCustomerText(data.user.name); setShowNewCustomerModal(false); setNewCustomerForm({ name: '', email: '', phone: '', cpf: '', birthDate: '', address: '' });
      } else alert(data.error);
    } catch (e) { alert('Erro de comunicação.'); }
  };

  // ==============================================================
  // 🎯 LÓGICA DE CARRINHO (Suporta Pizzas e Combos)
  // ==============================================================
  const handleProductClick = (prod) => {
    if (prod.isPizza && prod.maxFlavors > 1) {
      setPizzaBase(prod);
      setPizzaFlavorCount(1);
      setPizzaSelectedFlavors([prod]); // Primeiro sabor pré-selecionado
      setPizzaBuilderOpen(true);
    } else {
      addToCart({ ...prod, productId: prod.id });
    }
  };

  const addToCart = (product) => { 
    setCart(prev => {
        const existingIdx = (prev || []).findIndex(item => item.id === (product.id || product.productId));
        if (existingIdx >= 0 && !loadedTab) {
            const newCart = [...prev];
            newCart[existingIdx].quantity += 1;
            return newCart;
        }
        return [...(prev || []), { 
            id: product.id || product.productId, 
            productId: product.productId || product.id, 
            name: product.name, 
            price: Number(product.price), 
            quantity: 1, 
            isScheduled: false,
            flavors: product.flavors || null
        }];
    }); 
  };
  
  const updateQty = (idx, delta) => { setCart(prev => { const newCart = [...(prev || [])]; if (newCart[idx].quantity + delta > 0) newCart[idx].quantity += delta; else newCart.splice(idx, 1); return newCart; }); };
  const removeFromCart = (idx) => { setCart(prev => (prev || []).filter((_, i) => i !== idx)); };

  // 🍕 LÓGICA DO CONSTRUTOR DE PIZZAS (PDV)
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
      return Math.max(...pizzaSelectedFlavors.map(f => Number(f.price))); // HIGHEST (Maior valor)
    }
  };

  const confirmBuiltPizza = () => {
    const finalPrice = getPizzaPricePreview();
    const customId = `${pizzaBase.id}-` + pizzaSelectedFlavors.map(f => f.id).sort().join('-');
    const customName = `🍕 ${pizzaFlavorCount} Sabores: ` + pizzaSelectedFlavors.map(f => f.name).join(' / ');
    
    const cartItem = {
      id: customId,            
      productId: pizzaBase.id,  
      name: customName,
      price: finalPrice,
      flavors: pizzaSelectedFlavors.map(f => ({ productId: f.id, name: f.name })) 
    };

    addToCart(cartItem);
    setPizzaBuilderOpen(false);
  };

  // ==============================================================
  // INTEGRAÇÃO SMART POS PDV (APP-TO-APP)
  // ==============================================================
  const dispararPagamentoSmartPos = (provider, totalFinal, metodoPagamento, orderId) => {
    const valorCentavos = Math.round(Number(totalFinal) * 100);
    
    let tipoTransacao = 'DEBIT'; 
    if (metodoPagamento.includes('CREDIT')) tipoTransacao = 'CREDIT';
    if (metodoPagamento.includes('PIX')) tipoTransacao = 'PIX';

    // Pega a URL exata em que você está agora para a máquina saber para onde voltar
    const returnUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}`);

    let deepLink = '';

    switch (provider) {
      case 'stone':
        deepLink = `stone://pay?amount=${valorCentavos}&editable_amount=0&transaction_type=${tipoTransacao}&return_scheme=${returnUrl}`;
        break;
      case 'pagseguro':
        let pagTipo = 2; if (tipoTransacao === 'CREDIT') pagTipo = 1; if (tipoTransacao === 'PIX') pagTipo = 4;
        deepLink = `pagseguro://pay?amount=${valorCentavos}&type=${pagTipo}&return_scheme=${returnUrl}`;
        break;
      case 'mercado_pago':
        deepLink = `mercadopago://pay?amount=${Number(totalFinal).toFixed(2)}&return_url=${returnUrl}`;
        break;
      
      // 🔥 O NOSSO SIMULADOR DE MÁQUINA!
      case 'simulador':
        alert(`(SIMULADOR) O sistema chamou a máquina de cartões.\n\nValor: R$ ${Number(totalFinal).toFixed(2)}\nMétodo: ${tipoTransacao}\n\nAguardando cliente digitar a senha...`);
        
        // Finge que o cliente demorou 3 segundos a pagar e devolve para o sistema!
        setTimeout(() => {
            alert("(SIMULADOR) Pagamento Aprovado na Máquina! Imprimindo comprovante...");
            // Como estamos num teste web, não precisamos redirecionar pois já estamos na tela, 
            // basta deixar o fluxo do React continuar!
        }, 3000);
        return true;

      default: return false;
    }

    // Só tenta abrir o Deep Link se NÃO for o simulador (para evitar erros no PC)
    if (provider !== 'simulador') {
        console.log(`[Smart POS] Disparando: ${deepLink}`);
        window.location.href = deepLink;
    }
    
    return true;
  };

  // ==============================================================
  // MOTOR DE EMISSÃO FISCAL NATIVA E IMPRESSÃO LOCAL
  // ==============================================================
  const processFiscalAndPrint = async (orderId, currentCart, finalClientName, finalTotal, chosenPayment) => {
      try {
          // 1. Emissão Silenciosa na SEFAZ
          const resFiscal = await fetchWithStore(`${API_URL}/api/fiscal/emitir/${orderId}`, { method: 'POST' });
          const dataFiscal = await resFiscal.json();
          
          if (dataFiscal.success && dataFiscal.dados) {
              // 2. Monta objeto legível para a impressora
              const pedidoImpressao = {
                  shortId: loadedTab ? loadedTab.number : orderId,
                  createdAt: new Date().toISOString(),
                  client: { name: finalClientName },
                  items: currentCart,
                  total: finalTotal,
                  paymentMethod: chosenPayment
              };

              // 3. Imprime Localmente na porta 8080 do próprio PC!
              fetch(`http://localhost:8080/imprimir-nfce`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ pedido: pedidoImpressao, dadosNota: dataFiscal.dados, printerName })
              }).catch(e => console.warn("Impressora local inacessível no localhost:8080"));
          }
      } catch(err) {
          console.error("Erro fiscal silencioso:", err);
      }
  };

  // ==============================================================
  // FINALIZAÇÃO DE VENDA
  // ==============================================================
  const subtotal = (cart || []).reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  
  let calculatedDiscountValue = discountValue;
  let calculatedDiscountType = discountType;
  if (isEmployeePurchase && selectedEmployeeBuyer) {
       calculatedDiscountType = '%';
       calculatedDiscountValue = selectedEmployeeBuyer.discountPercent || 0;
  }

  const subtotalComDesconto = Math.max(0, subtotal - (calculatedDiscountValue ? (calculatedDiscountType === 'R$' ? Number(calculatedDiscountValue) : subtotal * (Number(calculatedDiscountValue)/100)) : 0));
  const cartTotal = subtotalComDesconto / Math.max(1, splitCount);

  useEffect(() => { if (isEmployeePurchase) setPaymentMethod('EMPLOYEE_ACCOUNT'); else setPaymentMethod('CASH'); }, [isEmployeePurchase]);

  const resetPdvState = () => {
      setCart([]); setLoadedTab(null); setSearchTabNumber(''); setSearchCustomerText(''); setSelectedSeatFilter('TODOS'); 
      setSelectedEmployeeBuyer(null); setSelectedCustomer(null); setIsEmployeePurchase(false); 
      setShowLimitOverrideModal(false); setManagerAuthLimit({ email: '', password: '' }); fetchEmployees();
  };

  const executeSmartPosOrFinish = (orderId, totalPaid, method) => {
      const provider = fullSettings?.smartPosProvider;
      const metodosEletronicos = ['CREDIT_CARD_DELIVERY', 'DEBIT_CARD', 'PIX'];
      
      if (provider && provider !== 'none' && metodosEletronicos.includes(method)) {
          alert("A enviar valor para a máquina de cartões...");
          dispararPagamentoSmartPos(provider, totalPaid, method, orderId);
      } else {
          alert(`✅ Transação concluída com sucesso!`);
      }
      resetPdvState();
  };

  const handleCheckoutPDV = async (overrideAuth = null) => {
    const currentCart = cart || [];
    if (currentCart.length === 0) return alert("Carrinho vazio!");

    const finalClientName = isEmployeePurchase ? selectedEmployeeBuyer?.name : (searchCustomerText.trim() || 'Cliente Balcão (PDV)');

    if (loadedTab) {
      try {
        const payload = { 
             paymentMethod, registerId: registerInfo?.id, shiftId, splitCount, 
             seatFilter: selectedSeatFilter === 'TODOS' ? null : selectedSeatFilter, 
             employeeBuyerId: selectedEmployeeBuyer?.id,
             clientId: selectedCustomer?.id,
             managerAuth: overrideAuth
        };

        const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${loadedTab.id}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        
        if (data.success) { 
           const finalOrderId = data.orderId || loadedTab.id;
           if (paymentMethod !== 'CUSTOMER_ACCOUNT' && paymentMethod !== 'EMPLOYEE_ACCOUNT') {
               await processFiscalAndPrint(finalOrderId, currentCart, finalClientName, data.totalPaid, paymentMethod);
           }
           executeSmartPosOrFinish(finalOrderId, data.totalPaid, paymentMethod);
        } else {
           if (data.code === 'LIMIT_EXCEEDED') {
              setLimitErrorMessage(data.error); setShowLimitOverrideModal(true);
           } else { alert(data.error); }
        }
      } catch (e) { alert('Erro ao processar pagamento do salão.'); }
      return;
    }

    // 🎯 VENDA BALCÃO (Direta) COM MAPEAMENTO DE SABORES DE PIZZA
    try {
      const payload = {
          clientId: selectedCustomer?.id || 'TOTEM_MODE', 
          employeeBuyerId: selectedEmployeeBuyer?.id, 
          client: { name: finalClientName },
          items: currentCart.map(item => ({
             productId: item.productId || item.id,
             quantity: item.quantity,
             price: item.price,
             flavors: item.flavors ? JSON.stringify(item.flavors) : undefined
          })), 
          address: 'Venda Balcão (PDV)', 
          paymentMethod, 
          total: subtotal, 
          pdvDiscount: calculatedDiscountValue || 0, 
          origin: 'PDV', 
          registerId: registerInfo?.id, 
          shiftId,
          managerAuth: overrideAuth
      };

      const res = await fetchWithStore(`${API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      
      if (data.success) { 
         const finalOrderId = data.order?.id || data.orderId;
         if (paymentMethod !== 'CUSTOMER_ACCOUNT' && paymentMethod !== 'EMPLOYEE_ACCOUNT') {
             await processFiscalAndPrint(finalOrderId, currentCart, finalClientName, cartTotal, paymentMethod);
         }
         executeSmartPosOrFinish(finalOrderId, cartTotal, paymentMethod);
      } else {
         if (data.code === 'LIMIT_EXCEEDED') {
            setLimitErrorMessage(data.error); setShowLimitOverrideModal(true);
         } else { alert(data.error); }
      }
    } catch (e) { alert("Erro de conexão com o servidor."); }
  };

  const handleLimitOverrideSubmit = (e) => {
      e.preventDefault();
      handleCheckoutPDV(managerAuthLimit);
  };

  // 🔥 PROCESSAR PAGAMENTO DO TOTEM
  const approveTotemOrder = async () => {
    if (!selectedTotemOrder) return;
    setProcessingTotem(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/awaiting-payment/${selectedTotemOrder.id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-employee-name': employeeUser.name },
        body: JSON.stringify({ paymentMethod: totemPaymentMethod })
      });
      const data = await res.json();
      if (data.success) {
        
        // Emite Fiscalmente a Venda do Totem Recebida no Caixa
        await processFiscalAndPrint(selectedTotemOrder.id, selectedTotemOrder.items, selectedTotemOrder.customerName, selectedTotemOrder.total, totemPaymentMethod);
        
        alert("Recebimento do Totem confirmado e pedido liberado para Cozinha!");
        
        // Verifica se envia para a Maquininha (Smart POS)
        const provider = fullSettings?.smartPosProvider;
        const metodosEletronicos = ['CREDIT_CARD_DELIVERY', 'DEBIT_CARD', 'PIX'];
        if (provider && provider !== 'none' && metodosEletronicos.includes(totemPaymentMethod)) {
            dispararPagamentoSmartPos(provider, selectedTotemOrder.total, totemPaymentMethod, selectedTotemOrder.id);
        }

        setSelectedTotemOrder(null);
        fetchAwaitingTotemOrders();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Erro ao aprovar pedido do totem.");
    }
    setProcessingTotem(false);
  };

  const cancelTotemOrder = async () => {
    if (!selectedTotemOrder || !confirm("Tem certeza que deseja CANCELAR este pedido do Totem? Ele será removido da cozinha.")) return;
    setProcessingTotem(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/awaiting-payment/${selectedTotemOrder.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        alert("Pedido Cancelado.");
        setSelectedTotemOrder(null);
        fetchAwaitingTotemOrders();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Erro ao cancelar pedido.");
    }
    setProcessingTotem(false);
  };


  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Verificando situação do caixa...</div>;

  if (!registerInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto animate-fade-in-up mt-20">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-amber-500"></div>
          <span className="text-6xl mb-4 inline-block">🔒</span><h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Caixa Fechado</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">Informe o troco inicial para abrir o seu caixa e iniciar as vendas no PDV.</p>
          <form onSubmit={handleOpenRegister} className="space-y-6">
            <div className="text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Fundo de Caixa (Troco) R$</label><input type="number" step="0.01" required value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xl font-black text-slate-800 focus:outline-none focus:border-amber-500 text-center" placeholder="0.00" /></div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg cursor-pointer">Abrir Caixa Agora</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in-up relative overflow-hidden">
      
      {/* HEADER DO CAIXA E ALERTA DO TOTEM */}
      <div className="bg-slate-900 rounded-3xl p-4 mb-6 flex justify-between items-center shadow-lg border border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-2xl">🔓</div>
          <div><h2 className="text-white font-black text-lg leading-none mb-1">Ponto de Venda (PDV)</h2><p className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Caixa Aberto</p></div>
        </div>
        
        <div className="flex gap-2 relative z-50 items-center">
          
          {/* 🔥 ALERTA PULSANTE PARA O CAIXA SE TIVER PEDIDOS DO TOTEM */}
          {awaitingTotemOrders.length > 0 && (
             <button onClick={() => setIsTotemSidebarOpen(!isTotemSidebarOpen)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-red-500/50 flex items-center gap-2 mr-4 animate-pulse">
                <span className="text-base">🚨</span> 
                {awaitingTotemOrders.length} TOTEM PENDENTE
             </button>
          )}

          <button type="button" onClick={() => setShowMovementsListModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-blue-500 transition-colors">📋 Consultar Sangrias</button>
          <button type="button" onClick={() => setShowMovementModal(true)} className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-amber-400 transition-colors">💸 Sangria / Suprimento</button>
          <button type="button" onClick={() => setShowCloseModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-red-400 transition-colors">🔒 Fechar Caixa</button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* ÁREA CENTRAL - CATÁLOGO */}
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 overflow-y-auto hide-scrollbar">
          <h3 className="font-black text-slate-800 mb-6 text-lg">Catálogo Rápido</h3>
          <div className="space-y-8">
             {menu.map(cat => {
               if (!cat.products || cat.products.length === 0) return null;
               return (
                 <div key={cat.id}>
                   <h4 className="font-black text-slate-500 uppercase tracking-widest text-xs mb-4">{cat.name}</h4>
                   <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {cat.products.map(prod => (
                        <button key={prod.id} onClick={() => handleProductClick(prod)} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center hover:border-amber-500 cursor-pointer relative overflow-hidden transition-all active:scale-95">
                          {prod.isPizza && <span className="absolute top-0 left-0 w-full bg-amber-100 text-amber-700 text-[9px] font-black py-1 uppercase tracking-widest">🍕 Pizza</span>}
                          {prod.isCombo && <span className="absolute top-0 left-0 w-full bg-blue-100 text-blue-700 text-[9px] font-black py-1 uppercase tracking-widest">🍔 Combo</span>}
                          
                          <span className={`text-3xl block ${prod.isPizza || prod.isCombo ? 'mt-4 mb-1' : 'mb-2'}`}>🍽️</span>
                          <p className="font-bold text-xs text-slate-700 truncate mt-1">{prod.name}</p>
                          <p className="text-amber-600 font-black mt-1">R$ {Number(prod.price).toFixed(2)}</p>
                        </button>
                      ))}
                   </div>
                 </div>
               )
             })}
          </div>
        </div>

        {/* BARRA LATERAL - CARRINHO DO CAIXA E TOTEM */}
        <div className="w-[390px] flex flex-col gap-4 overflow-hidden shrink-0">
            
            {/* 🔥 PAINEL DOS PEDIDOS DO TOTEM (SÓ APARECE SE ABERTO) */}
            {isTotemSidebarOpen && (
               <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-4 flex flex-col shadow-xl animate-fade-in-up shrink-0 max-h-[50%]">
                  <div className="flex justify-between items-center mb-3 border-b border-red-200 pb-2">
                     <h3 className="font-black text-red-700 text-sm flex items-center gap-2"><span className="animate-pulse">🚨</span> Pendentes (Totem)</h3>
                     <button onClick={() => setIsTotemSidebarOpen(false)} className="text-red-500 font-black bg-red-100 w-6 h-6 rounded-full hover:bg-red-200">✕</button>
                  </div>

                  <div className="overflow-y-auto hide-scrollbar flex-1 space-y-2">
                     {awaitingTotemOrders.length === 0 ? <p className="text-[10px] text-red-400 font-bold text-center">Nenhum pedido do Totem na fila.</p> : null}
                     {awaitingTotemOrders.map(order => (
                        <button key={order.id} onClick={() => setSelectedTotemOrder(order)} className={`w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedTotemOrder?.id === order.id ? 'bg-red-100 border-red-500' : 'bg-white border-red-200 hover:border-red-400'}`}>
                           <div className="flex justify-between items-start">
                              <div>
                                 <span className="font-black text-slate-800 text-xs">#{order.shortId}</span>
                                 <p className="text-[10px] font-bold text-slate-500 mt-0.5">{order.customerName}</p>
                              </div>
                              <span className="font-black text-red-600 text-sm">R$ {Number(order.total).toFixed(2)}</span>
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {/* CARRINHO NORMAL DO PDV */}
            <div className={`bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm flex-1 ${isTotemSidebarOpen ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                 <h3 className="font-black text-slate-800 text-lg">Venda Balcão / Caixa</h3>
                 <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors">
                   <input type="checkbox" checked={isEmployeePurchase} onChange={(e) => { setIsEmployeePurchase(e.target.checked); setSelectedEmployeeBuyer(null); setDiscountValue(''); }} className="accent-amber-500" />
                   Venda p/ Equipe
                 </label>
              </div>

              <form onSubmit={handleSearchTab} className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-2xl">
                <input type="number" value={searchTabNumber} onChange={e => setSearchTabNumber(e.target.value)} placeholder="Nº Mesa ou Comanda" className="w-full bg-white border border-blue-200 rounded-xl p-2 text-xs font-black text-slate-800 text-center mb-2 focus:outline-none focus:border-blue-500" />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded-xl text-xs font-black cursor-pointer">Carregar Conta</button>
              </form>

              {loadedTab && (
                <div className="mb-4 p-3 bg-blue-100/60 rounded-xl border border-blue-200">
                   <div className="flex justify-between items-center mb-2"><h4 className="font-black text-blue-900 text-sm">{loadedTab.type === 'TABLE' ? `Mesa ${loadedTab.number}` : `Comanda #${loadedTab.number}`}</h4><button onClick={() => setShowMergeModal(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-[10px] font-black cursor-pointer transition-colors shadow-sm flex items-center gap-1"><span>🔗</span> Juntar Contas</button></div>
                   <label className="text-[10px] font-black text-blue-700 uppercase mb-1 block mt-2">Filtrar por Posição/Lugar:</label>
                   <select value={selectedSeatFilter} onChange={handleSeatFilterChange} className="w-full p-2 bg-white border border-blue-300 focus:outline-none focus:border-blue-500 rounded-lg text-xs font-bold cursor-pointer"><option value="TODOS">Mesa/Comanda Completa</option>{[...new Set((loadedTab?.items || []).map(i => i.seatLabel).filter(Boolean))].map(seat => (<option key={seat} value={seat}>{seat}</option>))}</select>
                   <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-200/50"><label className="text-[10px] font-black text-blue-700 uppercase">Dividir em partes:</label><select value={splitCount} onChange={(e) => setSplitCount(Number(e.target.value))} className="p-1 bg-white border border-blue-300 rounded text-xs font-bold cursor-pointer"><option value="1">Não dividir (1x)</option><option value="2">2 Pessoas</option><option value="3">3 Pessoas</option><option value="4">4 Pessoas</option></select></div>
                   <button type="button" onClick={() => { setLoadedTab(null); setCart([]); setSearchTabNumber(''); setSelectedSeatFilter('TODOS'); setIsEmployeePurchase(false); setSelectedEmployeeBuyer(null); setSelectedCustomer(null); setSearchCustomerText(''); }} className="text-red-500 text-[10px] font-black hover:underline mt-2 block text-center w-full cursor-pointer">✕ Cancelar e Limpar</button>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 relative">
                {isEmployeePurchase ? (
                  <>
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Selecione o Funcionário (Dívida)</label>
                    <select value={selectedEmployeeBuyer?.id || ''} onChange={e => { const emp = employees.find(x => x.id === e.target.value); setSelectedEmployeeBuyer(emp); }} className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-amber-500">
                       <option value="">Escolha...</option>
                       {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                    {selectedEmployeeBuyer && (
                       <div className="mt-2 bg-amber-100 text-amber-800 p-2 rounded-lg text-[10px] font-bold">
                          Dívida Atual: R$ {selectedEmployeeBuyer.currentDebt?.toFixed(2) || '0.00'} / Limite: R$ {selectedEmployeeBuyer.creditLimit?.toFixed(2) || '0.00'}<br/>
                          Desconto Automático: {selectedEmployeeBuyer.discountPercent || 0}%
                       </div>
                    )}
                  </>
                ) : (
                  <>
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">Cliente / Fiado de Cliente</label>
                    <input 
                      type="text" 
                      placeholder="Buscar Cliente por Nome ou CPF..." 
                      value={searchCustomerText}
                      onChange={(e) => {
                        setSearchCustomerText(e.target.value);
                        if (e.target.value.length >= 2) setShowCustomerDropdown(true);
                        else setShowCustomerDropdown(false);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 mb-3"
                    />
                    {showCustomerDropdown && searchCustomerText.length >= 2 && (
                      <div className="absolute z-50 w-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                        {customers.filter(c => c.name.toLowerCase().includes(searchCustomerText.toLowerCase()) || (c.cpf && c.cpf.includes(searchCustomerText))).map(c => (
                          <div key={c.id} onClick={() => { setSelectedCustomer(c); setSearchCustomerText(c.name); setShowCustomerDropdown(false); }} className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex justify-between items-center">
                             <span className="text-xs font-bold text-slate-800">{c.name}</span>
                             {c.isBlocked && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">BLOQUEADO</span>}
                          </div>
                        ))}
                        <div onClick={() => { setShowNewCustomerModal(true); setShowCustomerDropdown(false); }} className="p-3 bg-emerald-50 hover:bg-emerald-100 cursor-pointer text-emerald-700 text-xs font-black text-center">
                          ➕ Cadastrar Novo Cliente
                        </div>
                      </div>
                    )}

                    {!loadedTab && (
                      <>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Aplicar Desconto Manual</label>
                        <div className="flex gap-2">
                          <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-700 cursor-pointer"><option value="R$">R$</option><option value="%">%</option></select>
                          <input type="number" step="0.01" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="Valor..." className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500" />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pr-2">
                {(cart || []).map((item, idx) => (
                  <div key={idx} className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm relative">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-slate-800 leading-tight pr-2"><span className="text-amber-500 font-black mr-1">{item.quantity}x</span> {item.name}</p>
                      <span className="font-black text-slate-800 text-sm whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.flavors && <p className="text-[9px] text-slate-500 font-bold leading-tight mt-0.5">{item.flavors.map(f => f.name).join(' + ')}</p>}
                    
                    {item.seatLabel && <p className="text-[9px] text-blue-500 font-black uppercase mt-0.5">{item.seatLabel}</p>}
                    
                    {!loadedTab && (
                      <div className="flex justify-between items-center mt-2 border-t border-slate-200 pt-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                          <button type="button" onClick={() => updateQty(idx, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-700 font-black cursor-pointer">-</button>
                          <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQty(idx, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-700 font-black cursor-pointer">+</button>
                        </div>
                        <button type="button" onClick={() => removeFromCart(idx)} className="text-red-500 text-xs font-bold cursor-pointer">Remover</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 shrink-0">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
                {isEmployeePurchase && selectedEmployeeBuyer?.discountPercent > 0 && <div className="flex justify-between items-center text-amber-600 text-xs font-bold"><span>Desconto Equipe (-{selectedEmployeeBuyer.discountPercent}%):</span><span>-R$ {(subtotal * (selectedEmployeeBuyer.discountPercent / 100)).toFixed(2)}</span></div>}
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Total a Pagar</span>
                  <span className="font-black text-3xl text-slate-800 tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
                </div>

                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={`w-full border rounded-xl p-3 text-sm font-black focus:outline-none cursor-pointer ${isEmployeePurchase ? 'bg-amber-100 border-amber-300 text-amber-800 focus:border-amber-500' : 'bg-slate-100 border-slate-200 text-slate-700 focus:border-blue-500'}`}>
                  {isEmployeePurchase ? (
                     <option value="EMPLOYEE_ACCOUNT">Fiado / Agendamento Funcionário</option>
                  ) : (
                     <>
                       <option value="CASH">Dinheiro Físico</option>
                       <option value="CREDIT_CARD_DELIVERY">Cartão de Crédito</option>
                       <option value="DEBIT_CARD">Cartão de Débito</option>
                       <option value="PIX">PIX (Máquina/QR Code)</option>
                       <option value="CUSTOMER_ACCOUNT">Fiado / Deixar Pendente</option>
                     </>
                  )}
                </select>

                <button type="button" onClick={() => handleCheckoutPDV(null)} disabled={(cart || []).length === 0} className={`w-full text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg cursor-pointer disabled:bg-slate-300 ${isEmployeePurchase ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                  {loadedTab ? 'Receber Valor' : 'Finalizar Venda'}
                </button>
              </div>
            </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🔥 MODAL DE PAGAMENTO DO TOTEM (QUANDO O CAIXA CLICA NO PEDIDO LATERAL) */}
      {/* ========================================================================= */}
      {selectedTotemOrder && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full animate-fade-in-up border-2 border-red-500">
               <div className="text-center mb-6">
                  <span className="text-4xl block mb-2">💵</span>
                  <h2 className="text-xl font-black text-slate-800">Receber Pedido do Totem</h2>
                  <p className="text-sm font-bold text-slate-500 mt-1">{selectedTotemOrder.customerName}</p>
                  <p className="text-3xl font-black text-red-600 mt-2">R$ {Number(selectedTotemOrder.total).toFixed(2)}</p>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Como o cliente está pagando agora?</label>
                  <select value={totemPaymentMethod} onChange={e => setTotemPaymentMethod(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center font-black focus:border-red-500 focus:outline-none cursor-pointer">
                     <option value="PIX">Pago com PIX</option>
                     <option value="CASH">Pago em Dinheiro</option>
                     <option value="CREDIT_CARD_DELIVERY">Pago no Cartão de Crédito</option>
                     <option value="DEBIT_CARD">Pago no Cartão de Débito</option>
                  </select>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                     <button disabled={processingTotem} onClick={cancelTotemOrder} className="bg-slate-100 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors cursor-pointer">
                        Desistiu
                     </button>
                     <button disabled={processingTotem} onClick={approveTotemOrder} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer">
                        Confirmar
                     </button>
                  </div>
                  <button onClick={() => setSelectedTotemOrder(null)} className="w-full text-[10px] font-black text-slate-400 mt-2 hover:underline cursor-pointer">Voltar / Minimizar</button>
               </div>
            </div>
         </div>
      )}

      {/* 🍕 MODAL: CONSTRUTOR DE PIZZA (PDV) */}
      {pizzaBuilderOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fade-in-up">
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 shrink-0">
              <div>
                 <h2 className="text-2xl font-black text-slate-800">Montar Pizza</h2>
                 <p className="text-slate-500 font-bold text-sm">{pizzaBase?.name}</p>
              </div>
              <button onClick={() => setPizzaBuilderOpen(false)} className="bg-slate-100 text-slate-500 w-10 h-10 rounded-full font-black text-lg hover:bg-slate-200">X</button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <h3 className="font-black text-slate-700 mb-2 text-sm uppercase tracking-wider">Quantos sabores?</h3>
                <div className="flex gap-4 mb-6">
                    {[1, 2, 3].map(num => {
                        if (num > (pizzaBase?.maxFlavors || 1)) return null;
                        return (
                            <button 
                                key={num} 
                                onClick={() => { setPizzaFlavorCount(num); setPizzaSelectedFlavors([pizzaBase]); }}
                                className={`flex-1 py-3 rounded-2xl font-black text-lg border-2 transition-all ${pizzaFlavorCount === num ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-amber-300'}`}
                            >
                                {num} {num === 1 ? 'Sabor' : 'Sabores'}
                            </button>
                        );
                    })}
                </div>
                <div className="bg-amber-100 text-amber-800 p-3 rounded-xl mb-6 flex items-center justify-between font-bold border border-amber-200 shadow-inner">
                    <span className="text-sm">Selecionados ({pizzaSelectedFlavors.length}/{pizzaFlavorCount}):</span>
                    <span className="text-xs">{pizzaSelectedFlavors.map(f => f.name).join(' + ')}</span>
                </div>
                <h3 className="font-black text-slate-700 mb-3 text-sm uppercase tracking-wider">Escolha as metades</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {allProducts.filter(p => p.isPizza).map(flavor => {
                        const isSelected = pizzaSelectedFlavors.find(f => f.id === flavor.id);
                        const isFull = !isSelected && pizzaSelectedFlavors.length >= pizzaFlavorCount;
                        return (
                            <button 
                                key={flavor.id}
                                disabled={isFull}
                                onClick={() => togglePizzaFlavor(flavor)}
                                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center ${isSelected ? 'border-amber-500 bg-amber-50' : isFull ? 'border-slate-100 bg-slate-100 opacity-50 cursor-not-allowed' : 'border-slate-100 bg-white hover:border-amber-300'}`}
                            >
                                <span className="text-2xl mb-1">🍕</span>
                                <span className="font-bold text-slate-800 text-[10px] leading-tight line-clamp-2 min-h-[28px]">{flavor.name}</span>
                                <span className="text-emerald-600 font-black text-[10px] mt-1">+ R$ {Number(flavor.price).toFixed(2)}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="pt-4 border-t border-slate-100 shrink-0 mt-4">
               <button 
                  onClick={confirmBuiltPizza}
                  disabled={pizzaSelectedFlavors.length !== pizzaFlavorCount}
                  className="w-full bg-amber-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-amber-600 text-black py-4 rounded-xl font-black text-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                  Confirmar Pizza - R$ {getPizzaPricePreview().toFixed(2)}
               </button>
            </div>
          </div>
        </div>
      )}

      {/*MODAL AUTORIZAÇÃO DE LIMITE */}
      {showLimitOverrideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-red-500 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in-up text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
            <span className="text-5xl mb-4 inline-block">⚠️</span>
            <h3 className="text-xl font-black text-slate-800 mb-2">Limite Excedido!</h3>
            <p className="text-xs text-red-600 font-bold mb-6">{limitErrorMessage}</p>
            <form onSubmit={handleLimitOverrideSubmit} className="space-y-4 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Autenticação do Gerente</p>
                <input type="text" required value={managerAuthLimit.email} onChange={e => setManagerAuthLimit({...managerAuthLimit, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 mb-2" placeholder="E-mail ou CPF do Gerente" />
                <input type="password" required value={managerAuthLimit.password} onChange={e => setManagerAuthLimit({...managerAuthLimit, password: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500" placeholder="Senha" />
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowLimitOverrideModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold text-slate-700 cursor-pointer">Cancelar</button>
                 <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Autorizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*MODAL: CADASTRAR NOVO CLIENTE */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-800 mb-4">Cadastrar Novo Cliente</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <input type="text" required value={newCustomerForm.name} onChange={e => setNewCustomerForm({...newCustomerForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-blue-500" placeholder="Nome Completo" />
              <input type="text" value={newCustomerForm.cpf} onChange={e => setNewCustomerForm({...newCustomerForm, cpf: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-blue-500" placeholder="CPF" />
              <input type="email" required value={newCustomerForm.email} onChange={e => setNewCustomerForm({...newCustomerForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-blue-500" placeholder="E-mail" />
              <input type="tel" value={newCustomerForm.phone} onChange={e => setNewCustomerForm({...newCustomerForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-blue-500" placeholder="WhatsApp" />
              <input type="date" value={newCustomerForm.birthDate} onChange={e => setNewCustomerForm({...newCustomerForm, birthDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-blue-500" title="Data de Nascimento (Opcional)" />
              <input type="text" value={newCustomerForm.address} onChange={e => setNewCustomerForm({...newCustomerForm, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-blue-500" placeholder="Endereço Completo" />
              <div className="flex gap-3 pt-4">
                 <button type="button" onClick={() => setShowNewCustomerModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold cursor-pointer">Cancelar</button>
                 <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl cursor-pointer">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FECHAR CAIXA */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-amber-500"></div>
            <h3 className="text-xl font-black text-slate-800 mb-4">Fechar o Caixa</h3>
            <form onSubmit={handleCloseRegister} className="space-y-3 text-left">
              <div><label className="text-xs font-bold text-slate-700 block mb-1">Dinheiro na Gaveta</label><input type="number" step="0.01" required value={closeForm.cash} onChange={e => setCloseForm({...closeForm, cash: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800" placeholder="R$ 0.00" /></div>
              <div><label className="text-xs font-bold text-slate-700 block mb-1">Total Crédito</label><input type="number" step="0.01" required value={closeForm.credit} onChange={e => setCloseForm({...closeForm, credit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800" placeholder="R$ 0.00" /></div>
              <div><label className="text-xs font-bold text-slate-700 block mb-1">Total Débito</label><input type="number" step="0.01" required value={closeForm.debit} onChange={e => setCloseForm({...closeForm, debit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800" placeholder="R$ 0.00" /></div>
              <div><label className="text-xs font-bold text-slate-700 block mb-1">Total PIX</label><input type="number" step="0.01" required value={closeForm.pix} onChange={e => setCloseForm({...closeForm, pix: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800" placeholder="R$ 0.00" /></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowCloseModal(false)} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold cursor-pointer">Cancelar</button><button type="submit" className="flex-1 bg-red-500 text-white font-black py-3 rounded-xl cursor-pointer">Encerrar e Imprimir</button></div>
            </form>
          </div>
        </div>
      )}

      {/*MOVIMENTAÇÃO (SANGRIA) */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-800 mb-4">💸 Nova Movimentação</h3>
            <form onSubmit={handleMovement} className="space-y-4 text-left">
               <select value={movementForm.type} onChange={e => setMovementForm({...movementForm, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800 focus:outline-none">
                  <option value="OUT">Retirada (Sangria)</option>
                  <option value="IN">Entrada (Suprimento)</option>
               </select>
               <input type="number" step="0.01" required value={movementForm.amount} onChange={e => setMovementForm({...movementForm, amount: e.target.value})} placeholder="Valor R$" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800 focus:border-amber-500 focus:outline-none" />
               <input type="text" required value={movementForm.reason} onChange={e => setMovementForm({...movementForm, reason: e.target.value})} placeholder="Motivo (Ex: Pagamento Fornecedor)" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-amber-500 focus:outline-none" />
               <div className="pt-3 border-t border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Autorização (Gerente)</p>
                 <input type="text" required value={managerAuth.email} onChange={e => setManagerAuth({...managerAuth, email: e.target.value})} placeholder="E-mail ou CPF" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 mb-2 focus:border-red-500 focus:outline-none" />
                 <input type="password" required value={managerAuth.password} onChange={e => setManagerAuth({...managerAuth, password: e.target.value})} placeholder="Senha" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 focus:border-red-500 focus:outline-none" />
               </div>
               <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowMovementModal(false)} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold text-slate-700 cursor-pointer hover:bg-slate-200">Cancelar</button>
                 <button type="submit" className="flex-1 bg-amber-500 text-slate-950 font-black py-3 rounded-xl cursor-pointer hover:bg-amber-400">Confirmar</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/*LISTA DE MOVIMENTAÇÕES (SANGRIA) */}
      {showMovementsListModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-slate-800">📋 Movimentações do Caixa</h3><button type="button" onClick={() => setShowMovementsListModal(false)} className="text-slate-400 font-bold cursor-pointer hover:text-red-500">✕</button></div>
            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
               {registerInfo?.movements?.length === 0 ? <p className="text-slate-500 text-sm italic text-center py-4">Nenhuma movimentação registrada neste caixa.</p> : null}
               {registerInfo?.movements?.map(mov => (
                 <div key={mov.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${mov.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{mov.type === 'IN' ? 'Entrada' : 'Sangria'}</span>
                      <p className="font-bold text-sm text-slate-800 mt-1">{mov.reason}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="font-black text-slate-900">R$ {Number(mov.amount).toFixed(2)}</span>
                      <button type="button" onClick={() => handlePrint('MOVIMENTO_CAIXA', mov)} className="text-[10px] font-black text-blue-600 mt-1 flex items-center gap-1 cursor-pointer hover:underline">🖨️ Re-imprimir</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: JUNTAR CONTAS */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up text-center">
              <h3 className="text-xl font-black text-slate-800 mb-2">Juntar Contas</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Digite o número da Mesa ou Comanda que será <strong>ENCERRADA</strong> e transferida para a atual ({loadedTab?.number}).</p>
              <form onSubmit={handleMergeTabs} className="space-y-4">
                 <input type="number" required min="1" value={mergeSourceTabNumber} onChange={e => setMergeSourceTabNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-2xl text-center font-black focus:outline-none focus:border-blue-500 text-slate-900" placeholder="Nº Origem" />
                 <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowMergeModal(false)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 rounded-xl font-bold cursor-pointer transition-colors">Cancelar</button>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black cursor-pointer shadow-lg transition-colors">Juntar Agora</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}