'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LancamentosPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug;

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [storeStatus, setStoreStatus] = useState('LOADING');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeUser, setEmployeeUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeMenu, setActiveMenu] = useState('mesas');

  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  const [menu, setMenu] = useState([]);
  const [upsells, setUpsells] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [openForm, setOpenForm] = useState({ number: '', customerName: '', customerCpf: '', customerBirthDate: '', customerId: '', customerType: '' });
  const [allPeople, setAllPeople] = useState([]);
  const [employeeAccounts, setEmployeeAccounts] = useState([]); 
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [showManagerDebtModal, setShowManagerDebtModal] = useState(false);
  const [debtAmountMsg, setDebtAmountMsg] = useState('');
  const [managerAuthDebt, setManagerAuthDebt] = useState({ email: '', password: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeDietFilter, setActiveDietFilter] = useState(null); 
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemObservation, setItemObservation] = useState('');
  const [seatPosition, setSeatPosition] = useState('Lugar 1');
  const [customSeatName, setCustomSeatName] = useState('');
  const clickTimeout = useRef(null);

  const [showLimitOverrideModal, setShowLimitOverrideModal] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');
  const [managerAuthLimit, setManagerAuthLimit] = useState({ email: '', password: '' });

  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingUpsellItem, setPendingUpsellItem] = useState(null);
  const [activeUpsellRule, setActiveUpsellRule] = useState(null);

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSourceTabNumber, setMergeSourceTabNumber] = useState('');

  const [transferSourceId, setTransferSourceId] = useState('');
  const [transferItemId, setTransferItemId] = useState('');
  const [transferTargetId, setTransferTargetId] = useState('');

  const [readyAlerts, setReadyAlerts] = useState([]);
  const [alertedItemsSet, setAlertedItemsSet] = useState(new Set());

  // ESTADOS DO CONSTRUTOR DE PIZZAS
  const [pizzaBuilderOpen, setPizzaBuilderOpen] = useState(false);
  const [pizzaBase, setPizzaBase] = useState(null);
  const [pizzaFlavorCount, setPizzaFlavorCount] = useState(1);
  const [pizzaSelectedFlavors, setPizzaSelectedFlavors] = useState([]);

  // ESTADOS DO CAIXA AMBULANTE E PAGAMENTOS
  const [meuCaixa, setMeuCaixa] = useState(null);
  const [caixaLoading, setCaixaLoading] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [showCloseCaixaModal, setShowCloseCaixaModal] = useState(false);
  const [closingForm, setClosingForm] = useState({ balance: '', details: '' });

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [pagamentos, setPagamentos] = useState([]);
  const [pagamentoAtual, setPagamentoAtual] = useState({ metodo: 'PIX', valor: '' });

  // ESTADOS PARA SANGRIA E SUPRIMENTO
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementForm, setMovementForm] = useState({ type: 'OUT', amount: '', reason: '' });

  // ESTADO PARA ARMAZENAR CONFIGURAÇÕES DA LOJA
  const [fullSettings, setFullSettings] = useState(null);

  // =========================================================================
  // ESTADOS PARA PONTE NATIVA SMART POS (ANDROID WEBVIEW)
  // =========================================================================
  const [isSmartPOS, setIsSmartPOS] = useState(false);
  const [posProvider, setPosProvider] = useState(null); // 'pagseguro' ou 'stone'

  // Identifica e valida a loja pelo slug da URL
  useEffect(() => {
    if (!storeSlug) return;
    const identifyStore = async () => {
      try {
        const res = await fetch(`${API_URL || 'https://zenixfood-backend.onrender.com'}/api/settings`, { headers: { 'x-loja-slug': storeSlug } });
        const data = await res.json();
        if (data.success) { 
            localStorage.setItem('zenix_store_id', data.store.id); 
            setStoreStatus('FOUND'); 
            setFullSettings(data);
        } 
        else setStoreStatus('NOT_FOUND');
      } catch (error) { setStoreStatus('NOT_FOUND'); }
    };
    identifyStore();
  }, [storeSlug]);

  // =========================================================================
  // ESCUTADORES DA PONTE NATIVA (PAGBANK / STONE)
  // =========================================================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verifica se o App Android injetou alguma das interfaces no navegador
      if (window.ZenixPagBankPOS) {
        setIsSmartPOS(true);
        setPosProvider('pagseguro');
      } else if (window.ZenixStonePOS) {
        setIsSmartPOS(true);
        setPosProvider('stone');
      }

      // O Android chamará esta função quando o cartão for aprovado
      window.pagamentoAprovado = (transacaoId, orderId) => {
        alert(`✅ Pagamento Aprovado na Máquina!\nTransação: ${transacaoId}`);
        // Limpa a tela após sucesso na maquininha
        setShowCheckoutModal(false); 
        setPagamentos([]); 
        setSelectedTab(null);
        fetchTabs(); 
        fetchMeuCaixa();
        setCaixaLoading(false);
      };

      // O Android chamará esta função em caso de erro, senha inválida, etc.
      window.pagamentoRecusado = (motivo) => {
        alert(`❌ Erro no cartão: ${motivo}`);
        setCaixaLoading(false);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.pagamentoAprovado;
        delete window.pagamentoRecusado;
      }
    };
  }, []);

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token') || localStorage.getItem('@ZenixFood:employeeToken');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');
    const headers = { ...(token && { 'Authorization': `Bearer ${token}` }), ...(storeId && { 'x-loja-slug': storeId }), ...options.headers };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 402 && typeof window !== 'undefined') window.location.href = `/${storeSlug}/bloqueado`;
    return response;
  };

  const bgBase = isDarkMode ? 'bg-slate-950' : 'bg-slate-50';
  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const bgInput = isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgSidebar = isDarkMode ? 'bg-slate-950' : 'bg-white';
  const borderSidebar = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const textMenuUnselected = isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900';

  const handleFullscreen = () => {
    if (typeof document !== 'undefined') {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (docEl.requestFullscreen) docEl.requestFullscreen().catch(()=>{});
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen().catch(()=>{});
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('@ZenixFood:employeeToken') || localStorage.getItem('zenix_employeeToken');
    const savedUser = localStorage.getItem('@ZenixFood:employeeUser') || localStorage.getItem('zenix_employeeUser');
    const savedTheme = localStorage.getItem('@ZenixFood:theme') || localStorage.getItem('zenix_theme');
    if (savedTheme === 'light') setIsDarkMode(false);
    if (token && savedUser) { setIsAuthenticated(true); setEmployeeUser(JSON.parse(savedUser)); }
  }, []);

  useEffect(() => {
    if (isAuthenticated && storeStatus === 'FOUND' && employeeUser) {
      fetchTabs(); fetchMenu(); fetchUpsells(); fetchPeople(); fetchMeuCaixa();
      const interval = setInterval(() => { fetchTabs(); fetchMeuCaixa(); }, 5000);
      const clock = setInterval(() => setCurrentTime(Date.now()), 1000);
      return () => { clearInterval(interval); clearInterval(clock); };
    }
  }, [isAuthenticated, storeStatus, employeeUser]);

  useEffect(() => {
    if (!tabs.length || !employeeUser) return;
    const myTabs = tabs.filter(t => t.openedBy === employeeUser.name);
    const newAlerts = [];
    const newAlertedSet = new Set(alertedItemsSet);

    myTabs.forEach(tab => {
      (tab.items || []).forEach(item => {
        if (item.status === 'READY' && !newAlertedSet.has(item.id)) {
          newAlerts.push({ id: item.id, message: `O pedido "${item.name}" da ${tab.type === 'TABLE' ? 'Mesa' : 'Comanda'} ${tab.number} está Pronto no balcão!` });
          newAlertedSet.add(item.id);
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
      });
    });

    if (newAlerts.length > 0) {
      setReadyAlerts(prev => [...prev, ...newAlerts]);
      setAlertedItemsSet(newAlertedSet);
      setTimeout(() => setReadyAlerts(prev => prev.filter(a => !newAlerts.find(n => n.id === a.id))), 6000);
    }
  }, [tabs]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode; setIsDarkMode(newTheme);
    localStorage.setItem('@ZenixFood:theme', newTheme ? 'dark' : 'light');
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoadingLogin(true);
    const currentStoreId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');
    try {
      const res = await fetch(`${API_URL}/api/auth/employee/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-loja-slug': currentStoreId }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('@ZenixFood:employeeToken', data.token); localStorage.setItem('@ZenixFood:employeeUser', JSON.stringify(data.employee));
        setIsAuthenticated(true); setEmployeeUser(data.employee); handleFullscreen(); 
      } else alert(data.error || 'Credenciais inválidas.');
    } catch (e) { alert('Erro ao fazer login.'); } finally { setLoadingLogin(false); }
  };

  const logEmployeeAction = async (actionDesc) => {
    if (!employeeUser) return;
    try { await fetchWithStore(`${API_URL}/api/rh/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: employeeUser.id, action: actionDesc }) }); } catch (e) {}
  };

  const handleLogout = () => { 
    logEmployeeAction('Realizou Logout');
    localStorage.removeItem('@ZenixFood:employeeToken'); localStorage.removeItem('@ZenixFood:employeeUser'); 
    setIsAuthenticated(false); setEmployeeUser(null); 
  };

  const fetchPeople = async () => {
    try {
      const [resC, resE, resAcc] = await Promise.all([ fetchWithStore(`${API_URL}/api/customers`), fetchWithStore(`${API_URL}/api/rh/employees`), fetchWithStore(`${API_URL}/api/rh/employee-accounts`) ]);
      let clients = []; let emps = [];
      if (resC.ok) clients = await resC.json();
      if (resE.ok) emps = await resE.json();
      if (resAcc.ok) setEmployeeAccounts(await resAcc.json());
      const combined = [...clients.map(c => ({ ...c, _type: 'Cliente' })), ...emps.map(e => ({ ...e, _type: 'Equipe' }))];
      setAllPeople(combined);
    } catch (e) {}
  };

  const fetchTabs = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs`);
      if (res.ok) {
        const data = await res.json(); setTabs(data || []);
        if (selectedTab) { const updated = (data || []).find(t => t.id === selectedTab.id); if (updated) setSelectedTab(updated); else setSelectedTab(null); }
      }
    } catch (e) {}
  };

  const fetchMenu = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/menu`);
      if (res.ok) { 
          const data = await res.json(); 
          const menuLimpo = data
            .filter(cat => { const catName = (cat.name || '').toLowerCase(); return !catName.includes('agendad') && !catName.includes('encomenda') && !catName.includes('costela'); })
            .map(cat => ({
               ...cat,
               products: cat.products.filter(p => {
                  const n = (p.name || '').toLowerCase(); const d = (p.description || '').toLowerCase();
                  const isBanned = n.includes('agendad') || n.includes('encomenda') || n.includes('domingo') || n.includes('costela') || d.includes('agendad') || d.includes('encomenda') || d.includes('costela');
                  return !isBanned;
               }).sort((a, b) => (a.order || 0) - (b.order || 0))
            })).filter(cat => cat.products.length > 0);
          setMenu(menuLimpo); 
          if (menuLimpo.length > 0) setActiveCategory(menuLimpo[0].id); 
      }
    } catch (e) {}
  };

  const fetchUpsells = async () => { try { const res = await fetchWithStore(`${API_URL}/api/upsells`); if (res.ok) setUpsells(await res.json()); } catch (e) {} };

  // 💰 LÓGICA DO CAIXA AMBULANTE E MOVIMENTOS (SANGRIA/SUPRIMENTO)
  const fetchMeuCaixa = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/mobile-pos/meu-caixa`, { headers: { 'x-employee-name': employeeUser.name } });
      if (res.ok) { const data = await res.json(); setMeuCaixa(data.caixa); }
    } catch (e) {}
  };

  const handleAbrirCaixa = async (e) => {
    e.preventDefault(); setCaixaLoading(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/mobile-pos/abrir`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeName: employeeUser.name, openingBalance: Number(openingBalance || 0) })
      });
      const data = await res.json();
      if (res.ok && data.success) { setMeuCaixa(data.caixa); alert("Caixa aberto com sucesso! Boas vendas!"); setOpeningBalance(''); } 
      else alert(data.error || "Erro ao abrir o caixa.");
    } catch (e) { alert("Erro de comunicação."); } finally { setCaixaLoading(false); }
  };

  const handleFecharCaixa = async (e) => {
    e.preventDefault(); setCaixaLoading(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/mobile-pos/fechar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-employee-name': employeeUser.name },
        body: JSON.stringify({ caixaId: meuCaixa.id, closingBalance: Number(closingForm.balance), closingDetails: closingForm.details })
      });
      const data = await res.json();
      if (res.ok && data.success) { 
        setMeuCaixa(null); setShowCloseCaixaModal(false); 
        alert("Caixa encerrado com sucesso! Entregue o dinheiro físico ao gerente."); 
        setActiveMenu('mesas'); setClosingForm({ balance: '', details: '' });
      } else alert(data.error);
    } catch (e) { alert("Erro de comunicação ao fechar caixa."); } finally { setCaixaLoading(false); }
  };

  const handleCashMovement = async (e) => {
    e.preventDefault();
    if (Number(movementForm.amount) <= 0) return alert('Digite um valor válido.');
    setCaixaLoading(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/mobile-pos/movimento`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-employee-name': employeeUser.name },
        body: JSON.stringify({ caixaId: meuCaixa.id, type: movementForm.type, amount: movementForm.amount, reason: movementForm.reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(movementForm.type === 'IN' ? 'Suprimento registrado com sucesso!' : 'Sangria registrada com sucesso!');
        setShowMovementModal(false); setMovementForm({ type: 'OUT', amount: '', reason: '' }); fetchMeuCaixa();
      } else alert(data.error);
    } catch (e) { alert("Erro de comunicação."); } finally { setCaixaLoading(false); }
  };

  const handleAdicionarPagamento = () => {
    const val = Number(pagamentoAtual.valor);
    if (val <= 0) return alert("Digite um valor válido.");
    
    // Mapeamento visual para interno
    let internalMethod = pagamentoAtual.metodo;
    if (pagamentoAtual.metodo === 'CREDITO') internalMethod = 'CREDIT_CARD';
    if (pagamentoAtual.metodo === 'DEBITO') internalMethod = 'DEBIT_CARD';
    if (pagamentoAtual.metodo === 'DINHEIRO') internalMethod = 'CASH';

    setPagamentos([...pagamentos, { metodo: pagamentoAtual.metodo, internalMethod: internalMethod, valor: val }]);
    setPagamentoAtual({ metodo: 'PIX', valor: '' });
  };

  const handleRemoverPagamento = (index) => { setPagamentos(pagamentos.filter((_, i) => i !== index)); };

  // ============================================================================
  // INTEGRAÇÃO SMART POS: PONTE NATIVA (WEBVIEW) OU DEEP LINK (APP-TO-APP)
  // ============================================================================
  const dispararPagamentoSmartPos = (provider, totalFinal, metodoPagamento, orderId) => {
    const valorCentavos = Math.round(Number(totalFinal) * 100);
    
    let tipoTransacao = 'DEBIT'; 
    if (metodoPagamento.includes('CREDIT')) tipoTransacao = 'CREDIT';
    if (metodoPagamento.includes('PIX')) tipoTransacao = 'PIX';

    // 1. TENTA ACIONAR A PONTE NATIVA (WEBVIEW ANDROID DA ZENIX)
    if (isSmartPOS) {
        if (posProvider === 'pagseguro' && window.ZenixPagBankPOS) {
            window.ZenixPagBankPOS.iniciarPagamento(valorCentavos, tipoTransacao, orderId);
            return true;
        } else if (posProvider === 'stone' && window.ZenixStonePOS) {
            window.ZenixStonePOS.iniciarPagamento(valorCentavos, tipoTransacao, orderId);
            return true;
        }
    }

    // 2. FALLBACK: APP-TO-APP (DEEP LINK) PARA NAVEGADORES NORMAIS NO ANDROID
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
      
      case 'simulador':
        alert(`(SIMULADOR) O sistema chamou a máquina de cartões.\n\nValor: R$ ${Number(totalFinal).toFixed(2)}\nMétodo: ${tipoTransacao}\n\nAguardando cliente digitar a senha...`);
        setTimeout(() => {
            alert("(SIMULADOR) Pagamento Aprovado na Máquina! Imprimindo comprovante...");
            // Limpa a tela localmente no simulador
            setShowCheckoutModal(false); 
            setPagamentos([]); 
            setSelectedTab(null);
            fetchTabs(); 
            fetchMeuCaixa();
            setCaixaLoading(false);
        }, 3000);
        return true;

      default: return false;
    }

    if (provider !== 'simulador') {
        console.log(`[Smart POS] Disparando App-to-App: ${deepLink}`);
        window.location.href = deepLink;
    }
    
    return true;
  };

  const handleConfirmarPagamento = async () => {
    if (pagamentos.length === 0) return alert("Adicione pelo menos um método de pagamento.");
    setCaixaLoading(true);
    
    try {
      // 1. Regista o pagamento e fecha a conta no Backend
      const res = await fetchWithStore(`${API_URL}/api/mobile-pos/pagar-conta`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-employee-name': employeeUser.name },
        body: JSON.stringify({ tabId: selectedTab.id, pagamentos })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
         
         const orderId = data.orderId; 
         
         // =================================================================
         // INTEGRAÇÃO FISCAL E IMPRESSÃO REMOTA (WI-FI)
         // =================================================================
         if (orderId) {
             try {
                 const resFiscal = await fetchWithStore(`${API_URL}/api/fiscal/emitir/${orderId}`, { method: 'POST' });
                 const dataFiscal = await resFiscal.json();
                 
                 if (dataFiscal.success && dataFiscal.dados) {
                     let printIp = localStorage.getItem('zenix_print_ip');
                     if (!printIp) {
                         printIp = prompt("Primeira Venda! Digite o IP do computador do Caixa Principal para imprimir os Cupons (ex: 192.168.1.15):");
                         if (printIp) localStorage.setItem('zenix_print_ip', printIp);
                     }

                     if (printIp) {
                         const pedidoParaImpressao = {
                             shortId: selectedTab.number,
                             createdAt: new Date().toISOString(),
                             client: { name: selectedTab.customerName || 'Consumidor', cpf: selectedTab.customerCpf || '' },
                             items: selectedTab.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, product: { name: i.name } })),
                             total: totalDevido,
                             paymentMethod: pagamentos.map(p => p.metodo).join(', ')
                         };

                         fetch(`http://${printIp}:8080/imprimir-nfce`, {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ pedido: pedidoParaImpressao, dadosNota: dataFiscal.dados })
                         }).catch(e => console.warn("Impressora local inacessível no IP:", printIp));
                     }
                 }
             } catch (err) {
                 console.error("Erro na emissão fiscal silenciosa:", err);
             }
         }
         // =================================================================

         // 2. INTEGRAÇÃO SMART POS
         const provider = fullSettings?.smartPosProvider;
         const metodosEletronicos = ['CREDIT_CARD', 'DEBIT_CARD', 'PIX'];
         const pagamentoEletronico = pagamentos.find(p => metodosEletronicos.includes(p.internalMethod));

         if (provider && provider !== 'none' && pagamentoEletronico) {
             alert("Enviando valor para a máquina de cartões...");
             dispararPagamentoSmartPos(provider, pagamentoEletronico.valor, pagamentoEletronico.internalMethod, orderId);
             
             // Se NÃO for WebView nativo, limpamos a UI na hora, pois o App-to-App 
             // redireciona o navegador ou a gente já finalizou o fallback.
             // Se for WebView Nativo, esperamos o window.pagamentoAprovado limpar a tela!
             if (!isSmartPOS && provider !== 'simulador') {
               setShowCheckoutModal(false); 
               setPagamentos([]); 
               setSelectedTab(null);
               fetchTabs(); 
               fetchMeuCaixa();
             }

         } else {
             alert("Conta Paga e Encerrada com Sucesso!");
             setShowCheckoutModal(false); 
             setPagamentos([]); 
             setSelectedTab(null);
             fetchTabs(); 
             fetchMeuCaixa();
         }

      } else {
          alert(data.error || "Falha ao registrar pagamento.");
          setCaixaLoading(false);
      }
    } catch (e) { 
        alert("Erro ao processar pagamento."); 
        setCaixaLoading(false);
    }
  };

  const handleCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); if (val.length > 11) val = val.slice(0, 11); 
    let formatted = val; formatted = formatted.replace(/(\d{3})(\d)/, '$1.$2'); formatted = formatted.replace(/(\d{3})(\d)/, '$1.$2'); formatted = formatted.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setOpenForm({ ...openForm, customerCpf: formatted });

    if (val.length === 11) {
        const found = allPeople.find(p => p.cpf && p.cpf.replace(/\D/g, '') === val);
        if (found) { setOpenForm(prev => ({ ...prev, customerName: found.name, customerCpf: formatted, customerBirthDate: found.birthDate ? found.birthDate.split('T')[0] : '', customerId: found.id, customerType: found._type })); setShowSuggestions(false); }
    } else { if (openForm.customerId) setOpenForm(prev => ({...prev, customerId: '', customerType: ''})); }
  };

  const handleNameChange = (e) => {
    const val = e.target.value; setOpenForm({ ...openForm, customerName: val, customerId: '', customerType: '' });
    if (val.length >= 2) { const term = val.toLowerCase(); const filtered = allPeople.filter(p => p.name.toLowerCase().includes(term) || (p.cpf && p.cpf.includes(term))); setSuggestions(filtered); setShowSuggestions(true); } 
    else setShowSuggestions(false);
  };

  const selectPerson = (person) => { setOpenForm({ ...openForm, customerName: person.name, customerCpf: person.cpf || '', customerBirthDate: person.birthDate ? person.birthDate.split('T')[0] : '', customerId: person.id, customerType: person._type }); setShowSuggestions(false); };

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return null; const today = new Date(); const birth = new Date(birthDateString);
    let age = today.getFullYear() - birth.getFullYear(); const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--; return age;
  };

  const handleOpenTab = async (e, overrideAuth = null) => {
    if (e) e.preventDefault();
    const numVal = Number(openForm.number);
    if (!numVal || numVal <= 0) return alert('Digite um número válido para a Mesa ou Comanda.');
    if (numVal >= 1000 && (!openForm.customerName || openForm.customerName.trim() === '')) return alert('Para abrir uma Comanda Individual, o Nome Completo é obrigatório!');
    try {
      const payload = { number: numVal, customerName: numVal >= 1000 ? openForm.customerName : null, customerCpf: numVal >= 1000 ? openForm.customerCpf : null, customerBirthDate: numVal >= 1000 ? openForm.customerBirthDate : null, openedBy: employeeUser?.name || 'Garçom', customerId: numVal >= 1000 ? openForm.customerId : null, customerType: numVal >= 1000 ? openForm.customerType : null, managerAuth: overrideAuth };
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/open`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { setShowManagerDebtModal(false); setManagerAuthDebt({ email: '', password: '' }); setOpenForm({ number: '', customerName: '', customerCpf: '', customerBirthDate: '', customerId: '', customerType: '' }); fetchTabs(); setActiveMenu('mesas'); fetchPeople(); alert('Atendimento aberto com sucesso!'); } 
      else { if (data.code === 'CLIENT_HAS_DEBT') { setDebtAmountMsg(data.error); setShowManagerDebtModal(true); } else alert(data.error); }
    } catch (e) { alert("Erro ao abrir atendimento."); }
  };

  const handleDebtOverrideSubmit = (e) => { e.preventDefault(); handleOpenTab(null, managerAuthDebt); };

  const handleCancelTab = async (tabId) => {
    if (!confirm('Deseja cancelar esta mesa vazia?')) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${tabId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { alert('Cancelado com sucesso!'); setSelectedTab(null); fetchTabs(); } else alert(data.error);
    } catch (e) { alert('Erro.'); }
  };

  const handleUndoItem = async (itemId) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/items/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchTabs(); else alert(data.error);
    } catch (e) { alert('Erro ao estornar.'); }
  };

  const updateTabItemStatus = async (itemId, newStatus) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/items/${itemId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) { fetchTabs(); logEmployeeAction(`Retirou e Entregou um item do Balcão`); } else alert('Erro ao processar retirada.');
    } catch (e) { alert('Erro de conexão ao atualizar status do item.'); }
  };

  const handleLinkTab = async (tabId, mesaNum) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${tabId}/link`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ linkedTable: mesaNum }) });
      const data = await res.json();
      if (data.success) fetchTabs(); else alert(data.error);
    } catch (e) { alert('Erro ao vincular.'); }
  };

  const handleMergeTabs = async (e) => {
    e.preventDefault();
    if (!mergeSourceTabNumber.trim()) return;
    try {
      const resSource = await fetchWithStore(`${API_URL}/api/salao/tabs/number/${mergeSourceTabNumber.trim()}`);
      if (!resSource.ok) return alert('A Mesa/Comanda de origem não foi encontrada.');
      const sourceTabData = await resSource.json();
      const resMerge = await fetchWithStore(`${API_URL}/api/salao/tabs/merge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceTabId: sourceTabData.id, targetTabId: selectedTab.id }) });
      const mergeResult = await resMerge.json();
      if (mergeResult.success) { alert('Contas unificadas com sucesso!'); setShowMergeModal(false); setMergeSourceTabNumber(''); fetchTabs(); } else alert(mergeResult.error || 'Erro.');
    } catch (e) { alert('Erro ao juntar contas.'); }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferSourceId || !transferItemId || !transferTargetId) return alert('Preencha todos os campos da transferência.');
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/items/transfer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: transferItemId, targetTabId: transferTargetId }) });
      const data = await res.json();
      if (data.success) { alert('Item transferido com sucesso!'); setTransferSourceId(''); setTransferItemId(''); setTransferTargetId(''); fetchTabs(); } else alert(data.error);
    } catch (e) { alert('Erro na transferência.'); }
  };

  // 🍕 LÓGICA DO CONSTRUTOR DE PIZZAS E INTERCEPTAÇÃO DE CLIQUES
  const handleProductInteraction = (product) => {
    if (product.isPizza && product.maxFlavors > 1) { setPizzaBase(product); setPizzaFlavorCount(1); setPizzaSelectedFlavors([product]); setPizzaBuilderOpen(true); return; }
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current); clickTimeout.current = null;
      let targetTabId = selectedTab.id; let finalSeatLabel = selectedTab?.number >= 1000 ? 'Titular da Comanda' : 'Lugar 1';
      const fastItem = { productId: product.id, name: product.name, price: Number(product.price), quantity: 2, observation: 'Lançamento Rápido (2x)', seatLabel: finalSeatLabel, targetTabId: targetTabId, originalSeatName: finalSeatLabel };
      processCartAddition(fastItem);
    } else {
      clickTimeout.current = setTimeout(() => { clickTimeout.current = null; setSelectedProduct(product); setItemQuantity(1); setItemObservation(''); setSeatPosition('Lugar 1'); setCustomSeatName(''); }, 300); 
    }
  };

  const togglePizzaFlavor = (flavorProd) => {
    if (pizzaSelectedFlavors.find(f => f.id === flavorProd.id)) setPizzaSelectedFlavors(prev => prev.filter(f => f.id !== flavorProd.id));
    else if (pizzaSelectedFlavors.length < pizzaFlavorCount) setPizzaSelectedFlavors(prev => [...prev, flavorProd]);
  };

  const getPizzaPricePreview = () => {
    if (!pizzaBase || pizzaSelectedFlavors.length === 0) return 0;
    if (pizzaBase.pricingStrategy === 'AVERAGE') { const sum = pizzaSelectedFlavors.reduce((acc, f) => acc + Number(f.price), 0); return sum / pizzaSelectedFlavors.length; } 
    else return Math.max(...pizzaSelectedFlavors.map(f => Number(f.price))); 
  };

  const confirmBuiltPizza = () => {
    const virtualProduct = { ...pizzaBase, id: `${pizzaBase.id}-` + pizzaSelectedFlavors.map(f => f.id).sort().join('-'), productId: pizzaBase.id, name: `🍕 ${pizzaFlavorCount} Sabores: ` + pizzaSelectedFlavors.map(f => f.name).join(' / '), price: getPizzaPricePreview(), flavors: pizzaSelectedFlavors.map(f => ({ productId: f.id, name: f.name })) };
    setPizzaBuilderOpen(false); setSelectedProduct(virtualProduct); setItemQuantity(1); setItemObservation(''); setSeatPosition('Lugar 1'); setCustomSeatName('');
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    let targetTabId = selectedTab.id; let finalSeatLabel = customSeatName.trim() ? `${seatPosition} (${customSeatName.trim()})` : seatPosition;
    if (seatPosition.startsWith('Comanda')) { const cNum = Number(seatPosition.replace('Comanda ', '')); const cTab = tabs.find(t => t.number === cNum); if (cTab) { targetTabId = cTab.id; finalSeatLabel = 'Titular da Comanda'; } } 
    else if (selectedTab.number >= 1000) finalSeatLabel = 'Titular da Comanda'; 
    const newItem = { productId: selectedProduct.productId || selectedProduct.id, name: selectedProduct.name, price: Number(selectedProduct.price), quantity: itemQuantity, observation: itemObservation, seatLabel: finalSeatLabel, targetTabId: targetTabId, originalSeatName: seatPosition, flavors: selectedProduct.flavors };
    processCartAddition(newItem); setSelectedProduct(null);
  };

  const processCartAddition = (itemData) => {
    const matchedRule = upsells.find(u => u.channels.includes('SALAO') && u.triggerProductIds.includes(itemData.productId));
    if (matchedRule && !itemData.upsold) { setPendingUpsellItem(itemData); setActiveUpsellRule(matchedRule); setShowUpsellModal(true); } 
    else setCart(prev => [...(prev || []), itemData]);
  };

  const acceptUpsell = () => { setCart(prev => [ ...(prev || []), { ...pendingUpsellItem, upsold: true }, { productId: activeUpsellRule.offerProductId, name: `✨ Oferta: ${activeUpsellRule.offerProductName}`, price: Number(activeUpsellRule.offerPrice), quantity: pendingUpsellItem.quantity, observation: `Adicional Automático`, seatLabel: pendingUpsellItem.seatLabel, targetTabId: pendingUpsellItem.targetTabId, originalSeatName: pendingUpsellItem.originalSeatName } ]); setShowUpsellModal(false); setPendingUpsellItem(null); setActiveUpsellRule(null); };
  const declineUpsell = () => { setCart(prev => [...(prev || []), { ...pendingUpsellItem, upsold: true }]); setShowUpsellModal(false); setPendingUpsellItem(null); setActiveUpsellRule(null); };
  const removeCartItem = (index) => { setCart(prev => (prev || []).filter((_, i) => i !== index)); };

  const handleSendToKitchen = async (overrideAuth = null) => {
    if ((cart || []).length === 0 || !selectedTab) return;
    setLoadingData(true);
    try {
      const grouped = cart.reduce((acc, item) => { const tId = item.targetTabId || selectedTab.id; acc[tId] = acc[tId] || []; acc[tId].push(item); return acc; }, {});
      for (const [tId, itemsOfTab] of Object.entries(grouped)) {
         const payloadItems = itemsOfTab.map(i => ({ ...i, flavors: i.flavors ? JSON.stringify(i.flavors) : undefined }));
         const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${tId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: payloadItems, managerAuth: overrideAuth }) });
         const data = await res.json();
         if (!data.success) {
            if (data.code === 'LIMIT_EXCEEDED' || data.code === 'INVALID_MANAGER') { setLimitErrorMessage(data.error); setShowLimitOverrideModal(true); setLoadingData(false); return; }
            throw new Error(data.error || 'Erro.');
         }
      }
      setCart([]); fetchTabs(); setSelectedTab(null); setShowLimitOverrideModal(false); setManagerAuthLimit({ email: '', password: '' }); alert('🚀 Pedidos enviados para a cozinha!');
    } catch (e) { alert('Erro de comunicação: ' + e.message); } finally { setLoadingData(false); }
  };

  const handleLimitOverrideSubmit = (e) => { e.preventDefault(); handleSendToKitchen(managerAuthLimit); };
  const calculateTotal = (items) => (items || []).reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const getVisibleProducts = () => {
    let allProducts = [];
    menu.forEach(cat => { allProducts = [...allProducts, ...(cat.products || [])]; });
    if (activeDietFilter === 'VEGAN') allProducts = allProducts.filter(p => p.name.toLowerCase().includes('vegan') || p.description?.toLowerCase().includes('vegan') || p.description?.toLowerCase().includes('plant'));
    else if (activeDietFilter === 'NOGLUTEN') allProducts = allProducts.filter(p => p.description?.toLowerCase().includes('sem glúten') || p.description?.toLowerCase().includes('gluten free'));
    else if (activeDietFilter === 'NOLACTOSE') allProducts = allProducts.filter(p => p.description?.toLowerCase().includes('sem lactose') || p.description?.toLowerCase().includes('zero lactose'));
    
    if (searchTerm.trim() !== '') return allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeDietFilter) return allProducts;
    const currentCat = menu.find(c => c.id === activeCategory);
    return currentCat ? currentCat.products || [] : [];
  };

  // CÁLCULOS DO CAIXA E CHECKOUT
  const totalDevido = selectedTab ? calculateTotal(selectedTab.items) : 0;
  const totalPagoCheckout = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const valorRestante = Math.max(0, totalDevido - totalPagoCheckout);
  const troco = Math.max(0, totalPagoCheckout - totalDevido);

  const totalIn = meuCaixa?.movements?.filter(m => m.type === 'IN').reduce((acc, m) => acc + m.amount, 0) || 0;
  const totalOut = meuCaixa?.movements?.filter(m => m.type === 'OUT').reduce((acc, m) => acc + m.amount, 0) || 0;
  const saldoAtualCaixa = (Number(meuCaixa?.openingBalance || 0) + totalIn - totalOut).toFixed(2);

  if (storeStatus === 'LOADING') return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 font-black text-xl animate-pulse">Carregando painel de salão...</div>;
  if (storeStatus === 'NOT_FOUND') return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6"><span className="text-6xl mb-4">🚫</span><h1 className="text-3xl font-black text-white mb-2">Acesso Negado</h1></div>;
  if (!isAuthenticated) return (
    <div className={`min-h-screen ${bgBase} flex items-center justify-center p-4 font-sans transition-colors`}>
      <div className={`${bgCard} border p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden transition-colors`}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-blue-500"></div>
        <div className="text-center mb-8"><span className="text-4xl mb-3 inline-block">📋</span><h1 className={`text-2xl font-black ${textMain}`}>Portal do Salão</h1><p className={`${textMuted} text-xs mt-1`}>Acesso da Equipe</p></div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className={`text-xs font-bold ${textMuted} uppercase block mb-1`}>E-mail ou CPF</label><input type="text" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className={`w-full rounded-xl p-3.5 text-sm focus:outline-none focus:border-amber-500 ${bgInput}`} /></div>
          <div><label className={`text-xs font-bold ${textMuted} uppercase block mb-1`}>Senha</label><input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className={`w-full rounded-xl p-3.5 text-sm focus:outline-none focus:border-amber-500 ${bgInput}`} /></div>
          <button type="submit" disabled={loadingLogin} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-xl shadow-lg mt-2 cursor-pointer">{loadingLogin ? 'A entrar...' : 'Entrar no Sistema'}</button>
        </form>
      </div>
    </div>
  );

  const mesas = (tabs || []).filter(t => t.type === 'TABLE');
  const comandas = (tabs || []).filter(t => t.type === 'TAB');
  const visibleProducts = getVisibleProducts();

  const allPizzaFlavors = [];
  menu.forEach(cat => cat.products.forEach(p => { if (p.isPizza && !allPizzaFlavors.find(x => x.id === p.id)) allPizzaFlavors.push(p); }));

  let seatOptions = ['Lugar 1', 'Lugar 2', 'Lugar 3', 'Lugar 4', 'Lugar 5', 'Lugar 6'];
  if (selectedTab?.type === 'TABLE') {
     const extraSeats = comandas.filter(c => c.linkedTable === selectedTab.number).map(c => `Comanda ${c.number}`);
     seatOptions = [...seatOptions, ...extraSeats];
  }

  const linkedComandasInActiveTable = selectedTab?.type === 'TABLE' ? comandas.filter(c => c.linkedTable === selectedTab.number) : [];
  const activeEmployeeData = selectedTab && selectedTab.customerName ? employeeAccounts.find(e => e.name === selectedTab.customerName || e.cpf === selectedTab.customerCpf) : null;
  const transferSourceTabObj = tabs.find(t => t.id === transferSourceId);
  const calculatedCustomerAge = calculateAge(openForm.customerBirthDate);
  const numeroDigitadoNum = Number(openForm.number);

  return (
    <div className={`min-h-screen ${bgBase} ${textMain} font-sans flex flex-col md:flex-row selection:bg-amber-500 selection:text-slate-950 transition-colors`}>
      
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none w-full px-4">
        {readyAlerts.map((alert) => (
          <div key={alert.id} className="bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl shadow-2xl animate-fade-in-up flex items-center gap-3 border border-emerald-400 pointer-events-auto">
            <span className="text-2xl">🔔</span><p className="text-sm">{alert.message}</p>
          </div>
        ))}
      </div>

      <aside className={`${bgSidebar} border-r ${borderSidebar} w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col justify-between transition-colors z-40 fixed md:sticky bottom-0 md:top-0 h-[80px] md:h-screen shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] md:shadow-none`}>
         <div className="flex flex-row md:flex-col w-full h-full">
            <div className={`hidden md:flex p-6 border-b ${borderSidebar} items-center gap-3`}>
               <span className="text-3xl">🍽️</span>
               <div>
                  <h1 className={`font-black ${textMain} text-lg leading-none tracking-tight`}>Cânone</h1>
                  <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-1">{employeeUser?.name}</p>
               </div>
            </div>
            <nav className="p-2 md:p-4 flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar w-full justify-around md:justify-start items-center md:items-stretch">
               <button onClick={() => { setActiveMenu('mesas'); setSelectedTab(null); }} className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-sm transition-all cursor-pointer ${activeMenu === 'mesas' ? 'bg-amber-500 text-slate-950 shadow-md' : textMenuUnselected}`}>
                  <span className="text-xl md:text-lg">🪑</span> <span className="hidden sm:block md:inline">Mesas e Comandas</span>
               </button>
               <button onClick={() => { setActiveMenu('aberturas'); setSelectedTab(null); }} className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-sm transition-all cursor-pointer ${activeMenu === 'aberturas' ? 'bg-amber-500 text-slate-950 shadow-md' : textMenuUnselected}`}>
                  <span className="text-xl md:text-lg">➕</span> <span className="hidden sm:block md:inline">Abertura</span>
               </button>
               <button onClick={() => { setActiveMenu('transferencias'); setSelectedTab(null); }} className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-sm transition-all cursor-pointer ${activeMenu === 'transferencias' ? 'bg-amber-500 text-slate-950 shadow-md' : textMenuUnselected}`}>
                  <span className="text-xl md:text-lg">🔄</span> <span className="hidden sm:block md:inline">Transferir</span>
               </button>
               <button onClick={() => { setActiveMenu('caixa'); setSelectedTab(null); }} className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-sm transition-all cursor-pointer ${activeMenu === 'caixa' ? 'bg-emerald-500 text-white shadow-md' : textMenuUnselected}`}>
                  <span className="text-xl md:text-lg">💰</span> <span className="hidden sm:block md:inline">Meu Caixa</span>
               </button>
               <button onClick={() => router.push(`/${storeSlug}/recepcao`)} className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-sm transition-all cursor-pointer ${textMenuUnselected}`}>
                  <span className="text-xl md:text-lg">🎟️</span> <span className="hidden sm:block md:inline">Porta</span>
               </button>
            </nav>
         </div>
         <div className={`hidden md:flex p-4 border-t ${borderSidebar} flex-col gap-2`}>
            <button onClick={handleFullscreen} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${textMenuUnselected}`}><span className="text-base">🔲</span> Tela Cheia</button>
            <button onClick={toggleTheme} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${textMenuUnselected}`}><span className="text-base">{isDarkMode ? '☀️' : '🌙'}</span> Trocar Tema</button>
            <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-xs transition-colors cursor-pointer ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}><span className="text-base">🚪</span> Sair</button>
         </div>
      </aside>

      <main className="flex-1 h-[calc(100vh-80px)] md:h-screen pb-[100px] md:pb-0 overflow-y-auto hide-scrollbar relative">
        
        {/* ========================================================================= */}
        {/* ABA: MEU CAIXA (SMART POS COM SANGRIA E SUPRIMENTO) */}
        {/* ========================================================================= */}
        {activeMenu === 'caixa' && (
           <div className="p-4 md:p-10 max-w-3xl mx-auto animate-fade-in-up md:mt-6">
              <div className={`${bgCard} border p-6 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden`}>
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                 
                 <div className="text-center mb-8">
                    <span className="text-5xl mb-4 inline-block">💰</span>
                    <h2 className="text-2xl font-black">Meu Caixa (Smart POS)</h2>
                    <p className={`text-xs ${textMuted} mt-2 font-medium`}>Gerencie recebimentos, sangrias e suprimentos.</p>
                 </div>

                 {!meuCaixa ? (
                    <form onSubmit={handleAbrirCaixa} className="space-y-6 max-w-sm mx-auto">
                       <div className={`p-6 border rounded-2xl ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center justify-center gap-2"><span>🔓</span> Abrir Novo Caixa</h3>
                          <label className={`text-xs font-bold ${textMuted} uppercase block mb-2`}>Fundo de Troco (R$)</label>
                          <input type="number" step="0.01" min="0" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} placeholder="Ex: 50.00" className={`w-full border rounded-xl p-4 text-center text-xl font-black focus:outline-none focus:border-emerald-500 ${bgInput}`} />
                       </div>
                       <button type="submit" disabled={caixaLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg cursor-pointer transition-colors text-lg">
                          {caixaLoading ? 'Abrindo...' : 'Abrir Meu Caixa Agora'}
                       </button>
                    </form>
                 ) : (
                    <div className="space-y-6">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center text-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-[9px] font-black uppercase tracking-widest ${textMuted}`}>Fundo (Abertura)</p>
                             <p className={`text-lg font-black mt-1 ${textMain}`}>R$ {Number(meuCaixa.openingBalance).toFixed(2)}</p>
                          </div>
                          <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center text-center ${isDarkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                             <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-500' : 'text-blue-700'}`}>Entradas / Vendas</p>
                             <p className="text-lg font-black text-blue-600 mt-1">R$ {totalIn.toFixed(2)}</p>
                          </div>
                          <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center text-center ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                             <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-red-500' : 'text-red-700'}`}>Saídas / Sangrias</p>
                             <p className="text-lg font-black text-red-600 mt-1">R$ {totalOut.toFixed(2)}</p>
                          </div>
                          <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center text-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                             <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-700'}`}>Saldo Atual Caixa</p>
                             <p className="text-xl font-black text-emerald-600 mt-1">R$ {saldoAtualCaixa}</p>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <button onClick={() => { setMovementForm({type:'IN', amount:'', reason:''}); setShowMovementModal(true); }} className="flex-1 bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:bg-blue-500 hover:text-white font-black py-3 rounded-xl transition-all cursor-pointer">
                             + Suprimento (Entrada)
                          </button>
                          <button onClick={() => { setMovementForm({type:'OUT', amount:'', reason:''}); setShowMovementModal(true); }} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white font-black py-3 rounded-xl transition-all cursor-pointer">
                             - Sangria (Retirada)
                          </button>
                       </div>

                       <div className={`border p-4 rounded-2xl ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Histórico de Movimentos (Vendas, Sangrias e Suprimentos)</h4>
                          <div className="max-h-60 overflow-y-auto space-y-2 hide-scrollbar">
                             {meuCaixa.movements?.length === 0 ? <p className="text-xs text-slate-500 font-bold text-center py-4">Nenhum movimento registrado.</p> : null}
                             {meuCaixa.movements?.slice().reverse().map(m => (
                                <div key={m.id} className="flex justify-between items-center text-xs font-bold border-b border-slate-200/20 pb-2">
                                   <div className="flex flex-col">
                                      <span className={textMain}>{m.reason}</span>
                                      <span className="text-[9px] text-slate-500">{new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</span>
                                   </div>
                                   <span className={`text-sm font-black ${m.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`}>
                                      {m.type === 'IN' ? '+' : '-'} R$ {m.amount.toFixed(2)}
                                   </span>
                                </div>
                             ))}
                          </div>
                       </div>

                       <button onClick={() => setShowCloseCaixaModal(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2 mt-4">
                          🔒 Encerrar Turno (Fechar Caixa)
                       </button>
                       <button onClick={() => {
                               const atual = localStorage.getItem('zenix_print_ip') || '';
                               const novo = prompt("Qual o IP local (Wi-Fi) do Computador do Caixa?", atual);
                                    if (novo !== null) {
          localStorage.setItem('zenix_print_ip', novo);
          alert("IP da Impressora Remota atualizado para: " + novo);
      }
   }} 
   className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-2xl transition-colors mt-2 text-xs uppercase tracking-widest cursor-pointer border border-slate-200">
   ⚙️ Configurar IP da Impressora (Caixa)
</button>
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* ========================================================================= */}
        {activeMenu === 'aberturas' && !selectedTab && (
           <div className="p-4 md:p-10 max-w-xl mx-auto animate-fade-in-up md:mt-10">
              <div className={`${bgCard} border p-6 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-visible`}>
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                 <div className="text-center mb-8"><span className="text-5xl mb-4 inline-block">📝</span><h2 className="text-2xl font-black">Abrir Atendimento</h2></div>
                 <form onSubmit={handleOpenTab} className="space-y-5">
                    <div>
                      <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-2`}>Número da Mesa / Comanda</label>
                      <input type="number" required min="1" value={openForm.number} onChange={e => setOpenForm({...openForm, number: e.target.value})} className={`w-full border rounded-2xl p-4 text-3xl text-center font-black focus:outline-none focus:border-emerald-500 ${bgInput}`} placeholder="Nº..." />
                    </div>
                    {numeroDigitadoNum >= 1000 && (
                      <div className={`border p-5 rounded-2xl space-y-4 animate-fade-in-up ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center mb-1">Dados do Titular (Obrigatório para Comandas)</p>
                        <div><label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-1`}>CPF</label><input type="text" value={openForm.customerCpf} onChange={handleCpfChange} maxLength={14} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500 ${bgInput}`} placeholder="000.000.000-00 (Opcional)" /></div>
                        <div className="relative">
                          <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-1`}>Nome Completo</label>
                          <input type="text" value={openForm.customerName} onChange={handleNameChange} onFocus={() => { if(openForm.customerName.length >= 2) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500 ${bgInput}`} placeholder="Nome Completo do Cliente" />
                          {showSuggestions && suggestions.length > 0 && (
                            <div className={`absolute z-50 w-full mt-1 border rounded-xl shadow-2xl max-h-48 overflow-y-auto ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                              {suggestions.map((s, i) => (
                                <div key={i} onMouseDown={(e) => { e.preventDefault(); selectPerson(s); }} className={`p-3 border-b cursor-pointer flex justify-between items-center transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-100 hover:bg-slate-50'}`}><span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{s.name}</span></div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg mt-8 cursor-pointer transition-colors text-lg">Abrir Atendimento Agora</button>
                 </form>
              </div>
           </div>
        )}

        {activeMenu === 'transferencias' && !selectedTab && (
           <div className="p-4 md:p-10 max-w-4xl mx-auto animate-fade-in-up">
              <div className={`${bgCard} border p-6 md:p-8 rounded-[2.5rem] shadow-xl relative`}>
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                 <div className="mb-8 text-center md:text-left"><span className="text-4xl mb-4 inline-block">🔄</span><h2 className="text-2xl font-black">Central de Transferências</h2></div>
                 <form onSubmit={handleTransferSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
                    <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border p-5 rounded-2xl`}>
                       <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-3`}>1. Atendimento Origem</label>
                       <select value={transferSourceId} onChange={e => { setTransferSourceId(e.target.value); setTransferItemId(''); }} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-purple-500 ${bgInput} cursor-pointer`}><option value="">Selecione...</option>{tabs.map(t => <option key={t.id} value={t.id}>{t.type === 'TABLE' ? `Mesa ${t.number}` : `Comanda #${t.number}`} {t.customerName ? `(${t.customerName})` : ''}</option>)}</select>
                    </div>
                    <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border p-5 rounded-2xl`}>
                       <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-3`}>2. Item a Transferir</label>
                       <select value={transferItemId} onChange={e => setTransferItemId(e.target.value)} disabled={!transferSourceId || !transferSourceTabObj?.items?.length} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-purple-500 ${bgInput} cursor-pointer disabled:opacity-50`}><option value="">Selecione o item...</option>{transferSourceTabObj?.items?.map(i => <option key={i.id} value={i.id}>{i.quantity}x {i.name}</option>)}</select>
                    </div>
                    <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border p-5 rounded-2xl`}>
                       <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-3`}>3. Atendimento Destino</label>
                       <select value={transferTargetId} onChange={e => setTransferTargetId(e.target.value)} disabled={!transferItemId} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-purple-500 ${bgInput} cursor-pointer disabled:opacity-50`}><option value="">Para onde vai?</option>{tabs.filter(t => t.id !== transferSourceId).map(t => <option key={t.id} value={t.id}>{t.type === 'TABLE' ? `Mesa ${t.number}` : `Comanda #${t.number}`}</option>)}</select>
                    </div>
                    <div className="md:col-span-3 pt-4 border-t border-slate-200/20"><button type="submit" disabled={!transferSourceId || !transferItemId || !transferTargetId} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black py-4 rounded-2xl shadow-lg cursor-pointer transition-colors text-lg flex items-center justify-center gap-2">Confirmar Transferência 🚀</button></div>
                 </form>
              </div>
           </div>
        )}

        {activeMenu === 'mesas' && !selectedTab && (
          <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl md:text-2xl flex items-center gap-3">🪑 Mesas Físicas</h3>
                <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-black">{mesas.length} abertas</span>
              </div>
              {mesas.length === 0 ? <p className={`text-sm ${textMuted} italic bg-black/5 p-6 rounded-2xl border border-dashed border-slate-500/30 text-center`}>Nenhuma mesa do salão está ocupada no momento.</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {mesas.map(tab => {
                    const isOtherWaiter = tab.openedBy !== employeeUser?.name && tab.openedBy !== 'Admin';
                    const isEvento = tab.eventoId !== null && tab.eventoId !== undefined;
                    return (
                      <button key={tab.id} onClick={() => setSelectedTab(tab)} className={`${bgCard} border p-4 md:p-5 rounded-3xl flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl cursor-pointer relative overflow-hidden group`}>
                        {isOtherWaiter && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" title="Sendo atendida por outro garçom"></span>}
                        <span className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">🪑</span>
                        <span className="font-black text-lg md:text-xl mb-1 leading-none">Mesa {tab.number}</span>
                        {isEvento ? (<span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded mb-3 uppercase tracking-widest">🎉 Evento</span>) : (<span className={`text-[9px] ${textMuted} font-bold tracking-widest uppercase mb-3 truncate w-full`}>{tab.openedBy}</span>)}
                        <span className="text-xs md:text-sm font-black text-blue-500 bg-blue-500/10 px-2 py-1.5 rounded-xl w-full">R$ {calculateTotal(tab.items).toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl md:text-2xl flex items-center gap-3">💳 Comandas Individuais</h3>
                <span className="bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-xs font-black">{comandas.length} abertas</span>
              </div>
              {comandas.length === 0 ? <p className={`text-sm ${textMuted} italic bg-black/5 p-6 rounded-2xl border border-dashed border-slate-500/30 text-center`}>Nenhuma comanda individual registrada.</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {comandas.map(tab => {
                    const isOtherWaiter = tab.openedBy !== employeeUser?.name && tab.openedBy !== 'Admin';
                    const isLinked = tab.linkedTable !== null;
                    const isEvento = tab.eventoId !== null && tab.eventoId !== undefined;
                    const cardStyle = isLinked ? (isDarkMode ? 'border-purple-500 bg-purple-500/10' : 'border-purple-400 bg-purple-50') : bgCard;
                    return (
                      <button key={tab.id} onClick={() => setSelectedTab(tab)} className={`${cardStyle} border p-4 md:p-5 rounded-3xl flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:border-purple-400 hover:shadow-xl cursor-pointer relative overflow-hidden group`}>
                        {isOtherWaiter && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" title="Sendo atendida por outro garçom"></span>}
                        <span className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">💳</span>
                        <span className="font-black text-lg md:text-xl mb-1 leading-none">#{tab.number}</span>
                        {tab.customerName ? <span className={`text-[10px] md:text-[11px] font-bold ${isLinked ? 'text-purple-600' : 'text-amber-500'} truncate w-full mb-2`}>{tab.customerName.split(' ')[0]}</span> : <span className="mb-2 block"></span>}
                        {isLinked ? (<span className="text-[9px] bg-purple-500 text-white px-2 py-0.5 rounded font-black w-full text-center mb-2 shadow-sm truncate">🔗 MESA {tab.linkedTable}</span>) : isEvento ? (<span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded font-black w-full text-center mb-2 shadow-sm truncate">👥 CONVIDADO</span>) : null}
                        <span className="text-xs md:text-sm font-black text-emerald-500 bg-emerald-500/10 px-2 py-1.5 rounded-xl w-full mt-auto">R$ {calculateTotal(tab.items).toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TELA DE LANÇAMENTO DA MESA E COBRANÇA */}
        {/* ========================================================================= */}
        {activeMenu === 'mesas' && selectedTab && (
          <div className="flex flex-col lg:flex-row gap-4 h-full animate-fade-in-up p-4">
            
            <div className={`w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto hide-scrollbar pb-10 lg:pb-0`}>
               <div className={`${bgCard} border p-5 rounded-3xl flex flex-col gap-3 shadow-sm relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${selectedTab.type === 'TABLE' ? 'from-blue-400 to-blue-600' : 'from-amber-400 to-amber-600'}`}></div>
                  <div className="flex justify-between items-start pt-1">
                     <div>
                       <span className={`text-[10px] font-black ${textMuted} uppercase tracking-widest mb-1 block`}>{selectedTab.type === 'TABLE' ? 'Mesa Salão' : 'Comanda Indiv.'}</span>
                       <h2 className="text-3xl font-black leading-none">{selectedTab.type === 'TABLE' ? `Mesa ${selectedTab.number}` : `Comanda #${selectedTab.number}`}</h2>
                     </div>
                     <button onClick={() => { setSelectedTab(null); setCart([]); setSearchTerm(''); }} className="w-8 h-8 rounded-full bg-slate-500/10 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer font-bold">✕</button>
                  </div>
                  {selectedTab.type === 'TAB' && (
                     <div className="flex items-center gap-2 mt-2">
                        {selectedTab.linkedTable ? (
                          <><span className="text-[10px] font-black bg-purple-500/10 text-purple-500 px-2 py-1 rounded">🔗 Mesa {selectedTab.linkedTable}</span><button onClick={() => handleLinkTab(selectedTab.id, null)} className="text-[10px] font-black text-red-500 hover:underline cursor-pointer">Desvincular</button></>
                        ) : (
                          <button onClick={() => { const m = prompt('Nº da Mesa para sentar:'); if(m) handleLinkTab(selectedTab.id, m); }} className="text-[10px] font-black bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">🔗 Vincular à Mesa</button>
                        )}
                     </div>
                  )}
                  
                  {/*ÁREA DE TOTAL E BOTÃO DE COBRANÇA */}
                  <div className="flex justify-between items-end mt-2 pt-3 border-t border-slate-200/20">
                     <div>
                        <span className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-1`}>Total Acumulado</span>
                        <span className="text-2xl font-black text-emerald-500">R$ {calculateTotal(selectedTab.items).toFixed(2)}</span>
                     </div>
                     {selectedTab.status === 'OPEN' && selectedTab.items?.length > 0 && (
                        <button onClick={() => {
                           if(!meuCaixa) { alert("Você precisa abrir o seu caixa (Menu 'Meu Caixa') para poder receber pagamentos."); return; }
                           setShowCheckoutModal(true);
                           setPagamentoAtual({ metodo: 'PIX', valor: calculateTotal(selectedTab.items) });
                        }} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 py-2 rounded-xl shadow-md cursor-pointer transition-transform active:scale-95 text-sm flex items-center gap-2">
                           💳 Cobrar
                        </button>
                     )}
                  </div>
               </div>

               <div className={`${bgCard} border p-5 rounded-3xl flex flex-col gap-3 shadow-sm flex-1 min-h-[250px] overflow-y-auto hide-scrollbar`}>
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 sticky top-0 bg-inherit pb-2 z-10">Histórico de Lançamentos</h3>
                  {(!selectedTab.items || selectedTab.items.length === 0) ? (
                     <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                        <span className="text-4xl mb-2">🍽️</span><p className="text-xs font-bold text-center">Nenhum item lançado ainda.</p>
                        <button onClick={() => handleCancelTab(selectedTab.id)} className="mt-4 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-red-500/20 transition-colors">🗑️ Cancelar Abertura</button>
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {selectedTab.items.map((item) => {
                           const ageSeconds = (currentTime - new Date(item.createdAt).getTime()) / 1000;
                           const canUndo = ageSeconds <= 30 && item.status === 'PREPARING';
                           return (
                              <div key={item.id} className={`p-3 rounded-xl border flex flex-col gap-2 relative overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                 <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                       <p className={`text-[11px] font-bold leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}><span className="text-amber-500 font-black mr-1">{item.quantity}x</span> {item.name}</p>
                                       {item.flavors && <p className="text-[8px] text-amber-600 font-bold mt-0.5">{item.flavors.map(f => f.name).join(' + ')}</p>}
                                       {item.seatLabel && <span className="inline-block mt-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">{item.seatLabel}</span>}
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                                       <span className={`font-black text-[11px] mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                       {canUndo && (<button onClick={() => handleUndoItem(item.id)} className="text-[8px] bg-red-500 text-white font-black px-2 py-0.5 rounded animate-pulse cursor-pointer shadow-sm">Desfazer ({Math.max(0, 30 - Math.floor(ageSeconds))}s)</button>)}
                                       {item.status === 'READY' && (<button onClick={() => updateTabItemStatus(item.id, 'SERVED')} className="text-[9px] bg-emerald-500 text-white font-black px-2 py-1 rounded shadow-md cursor-pointer animate-bounce">Retirar 🏃</button>)}
                                    </div>
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  )}
               </div>

               {(cart || []).length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-3xl flex flex-col gap-3 shadow-md shrink-0">
                     <h3 className="font-black text-emerald-600 text-[10px] uppercase tracking-widest flex items-center justify-between">Fila de Disparo <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full">{cart.length}</span></h3>
                     <div className="max-h-40 overflow-y-auto space-y-2 hide-scrollbar pr-1">
                        {cart.map((item, idx) => (
                           <div key={idx} className={`${bgCard} border p-2.5 rounded-xl flex justify-between items-center shadow-sm`}>
                              <div className="flex-1 pr-2"><p className={`text-[10px] font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}><span className="text-amber-500 font-black mr-1">{item.quantity}x</span> {item.name}</p></div>
                              <div className="flex items-center gap-2 shrink-0"><button onClick={() => removeCartItem(idx)} className="text-red-500 bg-red-500/10 rounded w-5 h-5 flex items-center justify-center font-bold text-xs">✕</button></div>
                           </div>
                        ))}
                     </div>
                     <button onClick={() => handleSendToKitchen(null)} disabled={loadingData} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl shadow-md cursor-pointer transition-all mt-2 active:scale-95 text-xs">🚀 Confirmar Pedidos</button>
                  </div>
               )}
            </div>

            <div className={`${bgCard} border rounded-3xl flex-1 flex flex-col shadow-sm overflow-hidden p-2`}>
               <div className="p-3 md:p-4 border-b border-slate-200/20 shrink-0">
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Buscar lanche, bebida..." className={`w-full rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-amber-500 transition-colors mb-3 ${bgInput}`} />
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                     <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-colors cursor-pointer ${!activeCategory ? 'bg-amber-500 text-slate-950 shadow-md' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>Tudo</button>
                     {menu.map(cat => (
                        <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchTerm(''); setActiveDietFilter(null); }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-colors cursor-pointer ${activeCategory === cat.id ? 'bg-amber-500 text-slate-950 shadow-md' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>{cat.name}</button>
                     ))}
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-3 hide-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                     {visibleProducts.map(prod => (
                        <button key={prod.id} onClick={() => handleProductInteraction(prod)} className={`border rounded-2xl flex flex-col justify-between text-left cursor-pointer transition-all hover:border-amber-500 hover:shadow-md active:scale-95 group relative overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                           <div className={`w-full h-24 md:h-28 relative overflow-hidden shrink-0 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                              {prod.imageUrl ? <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🍽️</div>}
                           </div>
                           <div className="p-2 md:p-3 flex flex-col justify-between flex-1 w-full">
                              <p className={`font-black text-[10px] md:text-xs mb-1 leading-tight line-clamp-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{prod.name}</p>
                              <div className="flex items-center justify-between w-full mt-auto pt-1 border-t border-slate-100 dark:border-slate-800">
                                 <span className={`font-black text-xs ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`}>R$ {Number(prod.price).toFixed(2)}</span>
                                 <span className="w-5 h-5 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">+</span>
                              </div>
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* (MOVIMENTOS, PIZZA, CAIXA, CHECKOUT...) */}
      {/* ========================================================================= */}

      {/*MODAL DE SANGRIA E SUPRIMENTO */}
      {showMovementModal && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className={`${bgCard} border rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm animate-fade-in-up text-center`}>
               <h2 className={`text-2xl font-black mb-2 ${movementForm.type === 'IN' ? 'text-blue-500' : 'text-red-500'}`}>
                  {movementForm.type === 'IN' ? 'Suprimento (Entrada)' : 'Sangria (Saída)'}
               </h2>
               <p className={`text-xs ${textMuted} mb-6`}>
                  {movementForm.type === 'IN' ? 'Adicionar troco extra ao caixa.' : 'Retirar dinheiro em excesso para o cofre.'}
               </p>
               
               <form onSubmit={handleCashMovement} className="space-y-4 text-left">
                  <div>
                     <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-2`}>Valor (R$)</label>
                     <input type="number" required step="0.01" min="0.01" value={movementForm.amount} onChange={e => setMovementForm({...movementForm, amount: e.target.value})} className={`w-full border rounded-xl p-4 text-2xl font-black text-center focus:outline-none focus:border-${movementForm.type === 'IN' ? 'blue' : 'red'}-500 ${bgInput}`} placeholder="0.00" />
                  </div>
                  <div>
                     <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-2`}>Motivo / Observação</label>
                     <input type="text" value={movementForm.reason} onChange={e => setMovementForm({...movementForm, reason: e.target.value})} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-${movementForm.type === 'IN' ? 'blue' : 'red'}-500 ${bgInput}`} placeholder="Ex: Moedas para troco..." />
                  </div>
                  <div className="flex gap-3 pt-4">
                     <button type="button" onClick={() => setShowMovementModal(false)} className={`flex-1 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'} py-3 rounded-xl font-bold cursor-pointer transition-colors`}>Cancelar</button>
                     <button type="submit" disabled={caixaLoading} className={`flex-1 ${movementForm.type === 'IN' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer`}>Confirmar</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/*MODAL DO PRODUTO SIMPLES */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className={`${bgCard} border p-6 rounded-t-[2rem] sm:rounded-3xl w-full max-w-md shadow-2xl space-y-4 animate-fade-in-up transition-colors`}>
            <div className="flex justify-between items-start">
               <div><h3 className="text-lg font-black leading-tight mb-1">{selectedProduct.name}</h3><p className="text-amber-500 font-black">R$ {Number(selectedProduct.price).toFixed(2)}</p></div>
               <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 rounded-full bg-slate-500/10 text-slate-500 flex items-center justify-center font-bold cursor-pointer hover:bg-red-500 hover:text-white transition-colors">✕</button>
            </div>
            {selectedTab?.number <= 999 && (
              <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/20">
                <label className="text-[10px] font-black text-blue-500 uppercase block mb-2">Posição na Mesa</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {seatOptions.slice(0, 6).map(pos => (
                    <button key={pos} type="button" onClick={() => setSeatPosition(pos)} className={`py-2 rounded-xl text-[10px] font-black transition-colors border cursor-pointer ${seatPosition === pos ? 'bg-blue-600 border-blue-600 text-white' : (isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600')}`}>{pos}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
               <div className="w-1/3">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Qtd</label>
                  <div className={`flex items-center justify-between ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} p-1 rounded-xl border`}>
                     <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} className="w-8 h-8 bg-slate-800 text-white rounded-lg font-black cursor-pointer">-</button>
                     <span className="text-sm font-black w-6 text-center">{itemQuantity}</span>
                     <button onClick={() => setItemQuantity(itemQuantity + 1)} className="w-8 h-8 bg-slate-800 text-white rounded-lg font-black cursor-pointer">+</button>
                  </div>
               </div>
               <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observações</label>
                  <input type="text" value={itemObservation} onChange={e => setItemObservation(e.target.value)} placeholder="Opcional..." className={`w-full h-10 rounded-xl px-3 text-xs font-bold focus:outline-none border ${isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} />
               </div>
            </div>
            <button onClick={confirmAddToCart} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-xl shadow-md mt-2 flex justify-center items-center gap-2 cursor-pointer transition-all active:scale-95">
               Adicionar <span className="bg-slate-950/10 px-2 py-0.5 rounded text-[10px]">R$ {(Number(selectedProduct.price) * itemQuantity).toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/*MODAL: CONSTRUTOR DE PIZZA */}
      {pizzaBuilderOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className={`${bgCard} border rounded-3xl shadow-2xl p-6 w-full max-w-3xl flex flex-col max-h-[90vh] animate-fade-in-up`}>
            <div className={`flex justify-between items-center mb-6 border-b pb-4 shrink-0 ${borderSidebar}`}>
              <div>
                 <h2 className={`text-2xl font-black ${textMain}`}>Montar Pizza</h2>
                 <p className={`${textMuted} font-bold text-sm`}>{pizzaBase?.name}</p>
              </div>
              <button onClick={() => setPizzaBuilderOpen(false)} className={`w-10 h-10 rounded-full ${bgInput} font-black text-lg hover:text-red-500 transition-colors cursor-pointer`}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
               <h3 className={`font-black ${textMain} mb-2 text-sm uppercase tracking-wider`}>Quantos sabores?</h3>
               <div className="flex gap-3 mb-6">
                  {[1, 2, 3].map(num => {
                      if (num > (pizzaBase?.maxFlavors || 1)) return null;
                      return (
                          <button key={num} onClick={() => { setPizzaFlavorCount(num); setPizzaSelectedFlavors([pizzaBase]); }} className={`flex-1 py-3 rounded-2xl font-black text-base border-2 transition-all cursor-pointer ${pizzaFlavorCount === num ? 'border-amber-500 bg-amber-500/10 text-amber-500' : `${bgInput} text-slate-500 hover:border-amber-500/50${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}`}>
                              {num} {num === 1 ? 'Sabor' : 'Sabores'}
                          </button>
                      );
                  })}
               </div>
               <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl mb-6 flex items-center justify-between font-bold border border-amber-500/20 shadow-inner">
                  <span className="text-sm">Selecionados ({pizzaSelectedFlavors.length}/{pizzaFlavorCount}):</span>
                  <span className="text-xs">{pizzaSelectedFlavors.map(f => f.name).join(' + ')}</span>
               </div>
               <h3 className={`font-black ${textMain} mb-3 text-sm uppercase tracking-wider`}>Escolha as metades</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allPizzaFlavors.map(flavor => {
                      const isSelected = pizzaSelectedFlavors.find(f => f.id === flavor.id);
                      const isFull = !isSelected && pizzaSelectedFlavors.length >= pizzaFlavorCount;
                      return (
                          <button key={flavor.id} disabled={isFull} onClick={() => togglePizzaFlavor(flavor)} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${isSelected ? 'border-amber-500 bg-amber-500/10' : isFull ? `${bgInput} opacity-30 cursor-not-allowed` : `${bgInput} hover:border-amber-500/50`}`}>
                              <span className="text-2xl mb-1">🍕</span>
                              <span className={`font-bold ${textMain} text-[10px] leading-tight line-clamp-2 min-h-[28px]`}>{flavor.name}</span>
                              <span className="text-emerald-500 font-black text-[10px] mt-1">+ R$ {Number(flavor.price).toFixed(2)}</span>
                          </button>
                      )
                  })}
               </div>
            </div>
            <div className={`pt-4 border-t ${borderSidebar} shrink-0 mt-4`}>
               <button onClick={confirmBuiltPizza} disabled={pizzaSelectedFlavors.length !== pizzaFlavorCount} className="w-full bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 text-slate-950 py-4 rounded-xl font-black text-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  Confirmar Metades
               </button>
            </div>
          </div>
        </div>
      )}

      {/*MODAL DE CHECKOUT (SMART POS) */}
      {showCheckoutModal && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className={`${bgCard} border rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg animate-fade-in-up`}>
               <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-black ${textMain}`}>Cobrar Conta</h2>
                  <button onClick={() => { setShowCheckoutModal(false); setPagamentos([]); }} className={`w-8 h-8 rounded-full ${bgInput} font-black hover:text-red-500 transition-colors`}>✕</button>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                     <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Total Devido</p>
                     <p className="text-2xl font-black text-blue-500 mt-1">R$ {totalDevido.toFixed(2)}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                     <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Restante</p>
                     <p className={`text-2xl font-black mt-1 ${valorRestante > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        R$ {valorRestante.toFixed(2)}
                     </p>
                  </div>
               </div>

               <div className="space-y-4 mb-6">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${textMuted}`}>Adicionar Pagamento</h3>
                  <div className="flex gap-2">
                     <select value={pagamentoAtual.metodo} onChange={e => setPagamentoAtual({...pagamentoAtual, metodo: e.target.value})} className={`flex-1 border rounded-xl p-3 font-bold focus:outline-none focus:border-emerald-500 ${bgInput} cursor-pointer`}>
                        <option value="PIX">Pix</option>
                        <option value="CREDITO">Cartão de Crédito</option>
                        <option value="DEBITO">Cartão de Débito</option>
                        <option value="DINHEIRO">Dinheiro Vivo</option>
                     </select>
                     <input type="number" step="0.01" value={pagamentoAtual.valor} onChange={e => setPagamentoAtual({...pagamentoAtual, valor: e.target.value})} placeholder="Valor (R$)" className={`w-32 border rounded-xl p-3 font-black text-center focus:outline-none focus:border-emerald-500 ${bgInput}`} />
                     <button onClick={handleAdicionarPagamento} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-black transition-colors shadow-sm">+</button>
                  </div>
                  
                  {pagamentos.length > 0 && (
                     <div className={`mt-4 border rounded-xl p-4 space-y-2 max-h-32 overflow-y-auto ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        {pagamentos.map((pag, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm font-bold border-b border-slate-200/20 last:border-0 pb-2 last:pb-0">
                              <span className={textMain}>{pag.metodo}</span>
                              <div className="flex items-center gap-3">
                                 <span className="text-emerald-500">R$ {pag.valor.toFixed(2)}</span>
                                 <button onClick={() => handleRemoverPagamento(idx)} className="text-red-500 font-black w-6 h-6 bg-red-500/10 rounded flex items-center justify-center">✕</button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {troco > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl mb-6 text-center shadow-inner">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Troco a Devolver</p>
                     <p className="text-3xl font-black text-emerald-500">R$ {troco.toFixed(2)}</p>
                  </div>
               )}

               <button onClick={handleConfirmarPagamento} disabled={totalPagoCheckout < totalDevido || caixaLoading} className="w-full bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 hover:bg-emerald-600 text-white font-black text-xl py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2">
                  {caixaLoading ? 'Processando...' : 'Finalizar Pagamento ✅'}
               </button>
            </div>
         </div>
      )}

      {/*MODAL: FECHAR CAIXA */}
      {showCloseCaixaModal && meuCaixa && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className={`${bgCard} border rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fade-in-up text-center`}>
               <span className="text-6xl mb-4 inline-block">🔒</span>
               <h2 className={`text-2xl font-black mb-2 ${textMain}`}>Fechar Meu Caixa</h2>
               <p className={`text-xs ${textMuted} mb-6`}>Conte as notas e comprovantes, e informe o valor final encontrado no seu caixa (incluindo o troco inicial de R$ {Number(meuCaixa.openingBalance).toFixed(2)}).</p>
               
               <form onSubmit={handleFecharCaixa} className="space-y-4 text-left">
                  <div>
                     <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-2`}>Dinheiro Contado (R$)</label>
                     <input type="number" required step="0.01" min="0" value={closingForm.balance} onChange={e => setClosingForm({...closingForm, balance: e.target.value})} className={`w-full border rounded-xl p-4 text-2xl font-black text-center focus:outline-none focus:border-red-500 ${bgInput}`} />
                  </div>
                  <div>
                     <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-2`}>Observações (Faltou ou sobrou dinheiro?)</label>
                     <input type="text" value={closingForm.details} onChange={e => setClosingForm({...closingForm, details: e.target.value})} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 ${bgInput}`} placeholder="Opcional..." />
                  </div>
                  <div className="flex gap-3 pt-4">
                     <button type="button" onClick={() => setShowCloseCaixaModal(false)} className={`flex-1 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'} py-3 rounded-xl font-bold cursor-pointer transition-colors`}>Cancelar</button>
                     <button type="submit" disabled={caixaLoading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Confirmar Fecho</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/*MODAL: DÍVIDA DO CLIENTE (GERENTE) */}
      {showManagerDebtModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`${bgCard} border border-red-500 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in-up text-center`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
            <span className="text-5xl mb-4 inline-block">⚠️</span>
            <h3 className={`text-xl font-black mb-2 ${textMain}`}>Cliente com Pendências!</h3>
            <p className="text-xs text-red-500 font-bold mb-6">{debtAmountMsg} <br/><br/>Deseja que o gerente autorize e puxe essa dívida para esta nova comanda?</p>
            <form onSubmit={handleDebtOverrideSubmit} className="space-y-4 text-left">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Autenticação do Gerente</p>
                <input type="text" required value={managerAuthDebt.email} onChange={e => setManagerAuthDebt({...managerAuthDebt, email: e.target.value})} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 mb-2 ${bgInput}`} placeholder="E-mail ou CPF do Gerente" />
                <input type="password" required value={managerAuthDebt.password} onChange={e => setManagerAuthDebt({...managerAuthDebt, password: e.target.value})} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 ${bgInput}`} placeholder="Senha" />
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowManagerDebtModal(false)} className={`flex-1 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'} py-3 rounded-xl font-bold cursor-pointer`}>Cancelar</button>
                 <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Autorizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIMITE DE CRÉDITO (GERENTE) */}
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
                <input type="text" required value={managerAuthLimit.email} onChange={e => setManagerAuthLimit({...managerAuthLimit, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 mb-2 text-slate-900" placeholder="E-mail ou CPF" />
                <input type="password" required value={managerAuthLimit.password} onChange={e => setManagerAuthLimit({...managerAuthLimit, password: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 text-slate-900" placeholder="Senha" />
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => { setShowLimitOverrideModal(false); setLoadingData(false); }} className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold text-slate-700 cursor-pointer">Cancelar</button>
                 <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Autorizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*MODAL: JUNTAR CONTAS */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className={`${bgCard} border p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up text-center`}>
              <h3 className="text-xl font-black mb-2">Juntar Contas</h3>
              <p className={`text-xs ${textMuted} font-medium mb-6`}>Digite o número da Mesa ou Comanda que será ENCERRADA e transferida para a atual.</p>
              <form onSubmit={handleMergeTabs} className="space-y-4">
                 <input type="number" required min="1" value={mergeSourceTabNumber} onChange={e => setMergeSourceTabNumber(e.target.value)} className={`w-full border rounded-xl p-4 text-2xl text-center font-black focus:outline-none focus:border-blue-500 ${bgInput}`} placeholder="Nº Origem" />
                 <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowMergeModal(false)} className={`flex-1 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'} py-3 rounded-xl font-bold cursor-pointer`}>Cancelar</button>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black cursor-pointer shadow-lg">Juntar Agora</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/*MODAL: UPSELL */}
      {showUpsellModal && pendingUpsellItem && activeUpsellRule && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className={`${bgCard} border p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up text-center`}>
               <span className="text-6xl mb-4 inline-block">✨🎁</span>
               <h3 className="text-xl font-black mb-2">Completar o Pedido?</h3>
               <p className={`text-sm ${textMuted} font-medium mb-6`}>Deseja adicionar <strong className="text-amber-500">{activeUpsellRule.offerProductName}</strong> por apenas <strong>R$ {Number(activeUpsellRule.offerPrice).toFixed(2)}</strong>?</p>
               <div className="flex gap-3">
                  <button onClick={declineUpsell} className={`flex-1 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'} py-3 rounded-xl font-black cursor-pointer`}>Não, Obrigado</button>
                  <button onClick={acceptUpsell} className="flex-1 bg-amber-500 text-slate-950 py-3 rounded-xl font-black cursor-pointer shadow-lg">Sim, Adicionar!</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}