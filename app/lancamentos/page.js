'use client';
import { useState, useEffect, useRef } from 'react';

export default function LancamentosPage() {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

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


//Helper local atualizado com interceptador de Inadimplência
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    //SE O BACKEND BARRAR POR FALTA DE PAGAMENTO:
    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; // Redireciona para a tela de aviso
      }
    }

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
    const token = localStorage.getItem('@Canone:employeeToken') || localStorage.getItem('zenix_employeeToken');
    const savedUser = localStorage.getItem('@Canone:employeeUser') || localStorage.getItem('zenix_employeeUser');
    const savedTheme = localStorage.getItem('@Canone:theme') || localStorage.getItem('zenix_theme');
    if (savedTheme === 'light') setIsDarkMode(false);
    if (token && savedUser) {
      setIsAuthenticated(true);
      setEmployeeUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTabs(); 
      fetchMenu();
      fetchUpsells(); 
      fetchPeople(); 
      const interval = setInterval(fetchTabs, 5000);
      const clock = setInterval(() => setCurrentTime(Date.now()), 1000);
      return () => { clearInterval(interval); clearInterval(clock); };
    }
  }, [isAuthenticated]);

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
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('@Canone:theme', newTheme ? 'dark' : 'light');
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoadingLogin(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/employee/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('@Canone:employeeToken', data.token); localStorage.setItem('@Canone:employeeUser', JSON.stringify(data.employee));
        setIsAuthenticated(true); setEmployeeUser(data.employee);
        handleFullscreen(); 
      } else { alert(data.error || 'Credenciais inválidas.'); }
    } catch (e) { alert('Erro ao fazer login.'); } finally { setLoadingLogin(false); }
  };

  const logEmployeeAction = async (actionDesc) => {
    if (!employeeUser) return;
    try {
      await fetchWithStore(`${API_URL}/api/rh/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeUser.id, action: actionDesc })
      });
    } catch (e) {}
  };

  const handleLogout = () => { 
    logEmployeeAction('Realizou Logout');
    localStorage.removeItem('@Canone:employeeToken'); 
    localStorage.removeItem('@Canone:employeeUser'); 
    setIsAuthenticated(false); 
    setEmployeeUser(null); 
  };

  const fetchPeople = async () => {
    try {
      const [resC, resE, resAcc] = await Promise.all([
        fetchWithStore(`${API_URL}/api/customers`),
        fetchWithStore(`${API_URL}/api/rh/employees`),
        fetchWithStore(`${API_URL}/api/rh/employee-accounts`)
      ]);
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
            .filter(cat => {
               const catName = (cat.name || '').toLowerCase();
               return !catName.includes('agendad') && !catName.includes('encomenda') && !catName.includes('costela');
            })
            .map(cat => ({
               ...cat,
               products: cat.products.filter(p => {
                  const n = (p.name || '').toLowerCase();
                  const d = (p.description || '').toLowerCase();
                  const isBanned = n.includes('agendad') || n.includes('encomenda') || n.includes('domingo') || n.includes('costela') || d.includes('agendad') || d.includes('encomenda') || d.includes('costela');
                  return !isBanned;
               }).sort((a, b) => (a.order || 0) - (b.order || 0))
            })).filter(cat => cat.products.length > 0);

          setMenu(menuLimpo); 
          if (menuLimpo.length > 0) setActiveCategory(menuLimpo[0].id); 
      }
    } catch (e) {}
  };

  const fetchUpsells = async () => {
    try { const res = await fetchWithStore(`${API_URL}/api/upsells`); if (res.ok) setUpsells(await res.json()); } catch (e) {}
  };

  const handleCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 11) val = val.slice(0, 11); 

    let formatted = val;
    formatted = formatted.replace(/(\d{3})(\d)/, '$1.$2');
    formatted = formatted.replace(/(\d{3})(\d)/, '$1.$2');
    formatted = formatted.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setOpenForm({ ...openForm, customerCpf: formatted });

    if (val.length === 11) {
        const found = allPeople.find(p => p.cpf && p.cpf.replace(/\D/g, '') === val);
        if (found) {
            setOpenForm(prev => ({
                ...prev,
                customerName: found.name,
                customerCpf: formatted,
                customerBirthDate: found.birthDate ? found.birthDate.split('T')[0] : '',
                customerId: found.id,
                customerType: found._type
            }));
            setShowSuggestions(false);
        }
    } else {
        if (openForm.customerId) {
            setOpenForm(prev => ({...prev, customerId: '', customerType: ''}));
        }
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setOpenForm({ ...openForm, customerName: val, customerId: '', customerType: '' });
    if (val.length >= 2) {
      const term = val.toLowerCase();
      const filtered = allPeople.filter(p => p.name.toLowerCase().includes(term) || (p.cpf && p.cpf.includes(term)));
      setSuggestions(filtered); setShowSuggestions(true);
    } else { setShowSuggestions(false); }
  };

  const selectPerson = (person) => {
    setOpenForm({ ...openForm, customerName: person.name, customerCpf: person.cpf || '', customerBirthDate: person.birthDate ? person.birthDate.split('T')[0] : '', customerId: person.id, customerType: person._type });
    setShowSuggestions(false);
  };

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return null;
    const today = new Date();
    const birth = new Date(birthDateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  const handleOpenTab = async (e, overrideAuth = null) => {
    if (e) e.preventDefault();

    const numVal = Number(openForm.number);
    if (!numVal || numVal <= 0) return alert('Digite um número válido para a Mesa ou Comanda.');

    if (numVal >= 1000 && (!openForm.customerName || openForm.customerName.trim() === '')) {
       return alert('Para abrir uma Comanda Individual (acima de 1000), o Nome Completo é obrigatório!');
    }

    try {
      const payload = { 
          number: numVal, 
          customerName: numVal >= 1000 ? openForm.customerName : null, 
          customerCpf: numVal >= 1000 ? openForm.customerCpf : null, 
          customerBirthDate: numVal >= 1000 ? openForm.customerBirthDate : null,
          openedBy: employeeUser?.name || 'Garçom', 
          customerId: numVal >= 1000 ? openForm.customerId : null, 
          customerType: numVal >= 1000 ? openForm.customerType : null, 
          managerAuth: overrideAuth 
      };
      
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/open`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      
      if (data.success) { 
          setShowManagerDebtModal(false); setManagerAuthDebt({ email: '', password: '' });
          setOpenForm({ number: '', customerName: '', customerCpf: '', customerBirthDate: '', customerId: '', customerType: '' }); 
          fetchTabs(); setActiveMenu('mesas'); 
          fetchPeople(); 
          alert('Atendimento aberto com sucesso!');
      } else { 
          if (data.code === 'CLIENT_HAS_DEBT') { setDebtAmountMsg(data.error); setShowManagerDebtModal(true); } 
          else { alert(data.error); }
      }
    } catch (e) { alert("Erro ao abrir atendimento."); }
  };

  const handleDebtOverrideSubmit = (e) => { e.preventDefault(); handleOpenTab(null, managerAuthDebt); };

  const handleCancelTab = async (tabId) => {
    if (!confirm('Deseja cancelar esta mesa vazia?')) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${tabId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { alert('Cancelado com sucesso!'); setSelectedTab(null); fetchTabs(); } else { alert(data.error); }
    } catch (e) { alert('Erro.'); }
  };

  const handleUndoItem = async (itemId) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/items/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { fetchTabs(); } else { alert(data.error); }
    } catch (e) { alert('Erro ao estornar.'); }
  };

  const updateTabItemStatus = async (itemId, newStatus) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/items/${itemId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
         fetchTabs();
         logEmployeeAction(`Retirou e Entregou um item do Balcão`);
      } else {
         alert('Erro ao processar retirada.');
      }
    } catch (e) { alert('Erro de conexão ao atualizar status do item.'); }
  };

  const handleLinkTab = async (tabId, mesaNum) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${tabId}/link`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ linkedTable: mesaNum }) });
      const data = await res.json();
      if (data.success) { fetchTabs(); } else alert(data.error);
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

  const handleProductInteraction = (product) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current); clickTimeout.current = null;
      let targetTabId = selectedTab.id;
      let finalSeatLabel = selectedTab?.number >= 1000 ? 'Titular da Comanda' : 'Lugar 1';
      const fastItem = { productId: product.id, name: product.name, price: Number(product.price), quantity: 2, observation: 'Lançamento Rápido (2x)', seatLabel: finalSeatLabel, targetTabId: targetTabId, originalSeatName: finalSeatLabel };
      processCartAddition(fastItem);
    } else {
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null; setSelectedProduct(product); setItemQuantity(1); setItemObservation(''); setSeatPosition('Lugar 1'); setCustomSeatName('');
      }, 300); 
    }
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    let targetTabId = selectedTab.id;
    let finalSeatLabel = customSeatName.trim() ? `${seatPosition} (${customSeatName.trim()})` : seatPosition;
    if (seatPosition.startsWith('Comanda')) {
       const cNum = Number(seatPosition.replace('Comanda ', ''));
       const cTab = tabs.find(t => t.number === cNum);
       if (cTab) { targetTabId = cTab.id; finalSeatLabel = 'Titular da Comanda'; }
    } else if (selectedTab.number >= 1000) { finalSeatLabel = 'Titular da Comanda'; }
    
    const newItem = { productId: selectedProduct.id, name: selectedProduct.name, price: Number(selectedProduct.price), quantity: itemQuantity, observation: itemObservation, seatLabel: finalSeatLabel, targetTabId: targetTabId, originalSeatName: seatPosition };
    processCartAddition(newItem); setSelectedProduct(null);
  };

  const processCartAddition = (itemData) => {
    const matchedRule = upsells.find(u => u.channels.includes('SALAO') && u.triggerProductIds.includes(itemData.productId));
    if (matchedRule && !itemData.upsold) {
      setPendingUpsellItem(itemData); setActiveUpsellRule(matchedRule); setShowUpsellModal(true);
    } else { setCart(prev => [...(prev || []), itemData]); }
  };

  const acceptUpsell = () => {
    setCart(prev => [ ...(prev || []), { ...pendingUpsellItem, upsold: true }, { productId: activeUpsellRule.offerProductId, name: `✨ Oferta: ${activeUpsellRule.offerProductName}`, price: Number(activeUpsellRule.offerPrice), quantity: pendingUpsellItem.quantity, observation: `Adicional Automático`, seatLabel: pendingUpsellItem.seatLabel, targetTabId: pendingUpsellItem.targetTabId, originalSeatName: pendingUpsellItem.originalSeatName } ]);
    setShowUpsellModal(false); setPendingUpsellItem(null); setActiveUpsellRule(null);
  };

  const declineUpsell = () => {
    setCart(prev => [...(prev || []), { ...pendingUpsellItem, upsold: true }]);
    setShowUpsellModal(false); setPendingUpsellItem(null); setActiveUpsellRule(null);
  };

  const removeCartItem = (index) => { setCart(prev => (prev || []).filter((_, i) => i !== index)); };

  const handleSendToKitchen = async (overrideAuth = null) => {
    if ((cart || []).length === 0 || !selectedTab) return;
    setLoadingData(true);
    try {
      const grouped = cart.reduce((acc, item) => {
         const tId = item.targetTabId || selectedTab.id;
         acc[tId] = acc[tId] || []; acc[tId].push(item); return acc;
      }, {});
      
      for (const [tId, itemsOfTab] of Object.entries(grouped)) {
         const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${tId}/items`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ items: itemsOfTab, managerAuth: overrideAuth }) 
         });
         const data = await res.json();
         if (!data.success) {
            if (data.code === 'LIMIT_EXCEEDED' || data.code === 'INVALID_MANAGER') {
               setLimitErrorMessage(data.error);
               setShowLimitOverrideModal(true);
               setLoadingData(false);
               return;
            }
            throw new Error(data.error || 'Erro.');
         }
      }
      setCart([]); fetchTabs(); setSelectedTab(null);
      setShowLimitOverrideModal(false); setManagerAuthLimit({ email: '', password: '' });
      alert('🚀 Pedidos enviados para a cozinha!');
    } catch (e) { alert('Erro de comunicação: ' + e.message); } finally { setLoadingData(false); }
  };

  const handleLimitOverrideSubmit = (e) => {
    e.preventDefault();
    handleSendToKitchen(managerAuthLimit);
  };

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

  if (!isAuthenticated) {
    return (
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
  }

  const mesas = (tabs || []).filter(t => t.type === 'TABLE');
  const comandas = (tabs || []).filter(t => t.type === 'TAB');
  const visibleProducts = getVisibleProducts();

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
      
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full px-4">
        {readyAlerts.map((alert) => (
          <div key={alert.id} className="bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl shadow-2xl animate-fade-in-up flex items-center gap-3 border border-emerald-400 pointer-events-auto">
            <span className="text-2xl">🔔</span><p className="text-sm">{alert.message}</p>
          </div>
        ))}
      </div>

      <aside className={`${bgSidebar} border-r ${borderSidebar} w-full md:w-64 flex-shrink-0 flex flex-col justify-between transition-colors z-40 sticky top-0 md:h-screen`}>
         <div>
            <div className={`p-6 border-b ${borderSidebar} flex items-center gap-3`}>
               <span className="text-3xl">🍽️</span>
               <div>
                  <h1 className={`font-black ${textMain} text-lg leading-none tracking-tight`}>Cânone</h1>
                  <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-1">{employeeUser?.name}</p>
               </div>
            </div>
            <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible hide-scrollbar">
               <button onClick={() => { setActiveMenu('mesas'); setSelectedTab(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap cursor-pointer ${activeMenu === 'mesas' ? 'bg-amber-500 text-slate-950 shadow-md' : textMenuUnselected}`}>
                  <span className="text-lg">🪑</span> Mesas & Comandas
               </button>
               <button onClick={() => { setActiveMenu('aberturas'); setSelectedTab(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap cursor-pointer ${activeMenu === 'aberturas' ? 'bg-amber-500 text-slate-950 shadow-md' : textMenuUnselected}`}>
                  <span className="text-lg">➕</span> Novas Aberturas
               </button>
               <button onClick={() => { setActiveMenu('transferencias'); setSelectedTab(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap cursor-pointer ${activeMenu === 'transferencias' ? 'bg-amber-500 text-slate-950 shadow-md' : textMenuUnselected}`}>
                  <span className="text-lg">🔄</span> Transferências
               </button>
            </nav>
         </div>
         <div className={`p-4 border-t ${borderSidebar} flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar`}>
            <button onClick={handleFullscreen} className={`flex-1 flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${textMenuUnselected}`}>
               <span className="text-base">🔲</span> <span className="hidden md:inline">Tela Cheia</span>
            </button>
            <button onClick={toggleTheme} className={`flex-1 flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${textMenuUnselected}`}>
               <span className="text-base">{isDarkMode ? '☀️' : '🌙'}</span> <span className="hidden md:inline">Trocar Tema</span>
            </button>
            <button onClick={handleLogout} className={`flex-1 flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-black text-xs transition-colors cursor-pointer ${isDarkMode ? 'text-red-400 hover:bg-red-500/10 hover:text-red-500' : 'text-red-500 hover:bg-red-50 hover:text-red-600'}`}>
               <span className="text-base">🚪</span> <span className="hidden md:inline">Sair do Sistema</span>
            </button>
         </div>
      </aside>

      <main className="flex-1 h-[calc(100vh-140px)] md:h-screen overflow-y-auto hide-scrollbar relative">
        
        {/* TELA: NOVAS ABERTURAS (BLINDADA CONTRA CONFLITOS DE INPUT) */}
        {activeMenu === 'aberturas' && !selectedTab && (
           <div className="p-6 md:p-10 max-w-xl mx-auto animate-fade-in-up mt-10">
              <div className={`${bgCard} border p-8 rounded-[2.5rem] shadow-xl relative overflow-visible`}>
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                 <div className="text-center mb-8">
                    <span className="text-5xl mb-4 inline-block">📝</span>
                    <h2 className="text-2xl font-black">Abrir Atendimento</h2>
                    <p className={`text-xs ${textMuted} mt-2 font-medium`}>Digite um número de 1 a 999 para Mesa ou acima de 1000 para Comanda.</p>
                 </div>
                 
                 <form onSubmit={handleOpenTab} className="space-y-5">
                    <div>
                      <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-2`}>Número da Mesa / Comanda</label>
                      <input type="number" required min="1" value={openForm.number} onChange={e => setOpenForm({...openForm, number: e.target.value})} className={`w-full border rounded-2xl p-4 text-3xl text-center font-black focus:outline-none focus:border-emerald-500 ${bgInput}`} placeholder="Nº..." />
                    </div>

                    {/* MOSTRA OS CAMPOS DO CLIENTE APENAS SE FOR COMANDA (>= 1000) */}
                    {numeroDigitadoNum >= 1000 && (
                      <div className={`border p-5 rounded-2xl space-y-4 animate-fade-in-up ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center mb-1">Dados do Titular (Obrigatório para Comandas)</p>
                        
                        <div>
                           <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-1`}>CPF</label>
                           <input type="text" value={openForm.customerCpf} onChange={handleCpfChange} maxLength={14} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500 ${bgInput}`} placeholder="000.000.000-00 (Opcional)" />
                        </div>

                        <div className="relative">
                          <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-1`}>Nome Completo</label>
                          <input type="text" value={openForm.customerName} onChange={handleNameChange} onFocus={() => { if(openForm.customerName.length >= 2) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500 ${bgInput}`} placeholder="Nome Completo do Cliente" />
                          {showSuggestions && suggestions.length > 0 && (
                            <div className={`absolute z-50 w-full mt-1 border rounded-xl shadow-2xl max-h-48 overflow-y-auto ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                              {suggestions.map((s, i) => (
                                <div key={i} onMouseDown={(e) => { e.preventDefault(); selectPerson(s); }} className={`p-3 border-b cursor-pointer flex justify-between items-center transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-100 hover:bg-slate-50'}`}>
                                   <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{s.name}</span>
                                   <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${s._type === 'Equipe' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>{s._type}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div>
                           <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-1`}>Data de Nascimento</label>
                           <input type="date" value={openForm.customerBirthDate} onChange={e => setOpenForm({...openForm, customerBirthDate: e.target.value})} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500 ${bgInput}`} />
                           
                           {calculatedCustomerAge !== null && (
                               <div className={`mt-2 p-2.5 rounded-xl text-center font-black text-xs border ${calculatedCustomerAge >= 18 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                                   {calculatedCustomerAge >= 18 ? `🟢 ${calculatedCustomerAge} Anos - Maior de Idade (Liberado)` : `🔴 ${calculatedCustomerAge} Anos - MENOR DE IDADE (Proibido Álcool)`}
                               </div>
                           )}
                        </div>
                      </div>
                    )}

                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg mt-8 cursor-pointer transition-colors text-lg">
                       Abrir Atendimento Agora
                    </button>
                 </form>
              </div>
           </div>
        )}

        {/* TELA: TRANSFERÊNCIAS */}
        {activeMenu === 'transferencias' && !selectedTab && (
           <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in-up">
              <div className={`${bgCard} border p-8 rounded-[2.5rem] shadow-xl relative`}>
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                 <div className="mb-8">
                    <span className="text-4xl mb-4 inline-block">🔄</span>
                    <h2 className="text-2xl font-black">Central de Transferências</h2>
                    <p className={`text-xs ${textMuted} mt-2 font-medium`}>Mova itens lançados de uma mesa ou comanda para outra de forma rápida.</p>
                 </div>

                 <form onSubmit={handleTransferSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border p-5 rounded-2xl`}>
                       <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-3`}>1. Atendimento Origem</label>
                       <select value={transferSourceId} onChange={e => { setTransferSourceId(e.target.value); setTransferItemId(''); }} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-purple-500 ${bgInput} cursor-pointer`}>
                          <option value="">Selecione...</option>
                          {tabs.map(t => <option key={t.id} value={t.id}>{t.type === 'TABLE' ? `Mesa ${t.number}` : `Comanda #${t.number}`} {t.customerName ? `(${t.customerName})` : ''}</option>)}
                       </select>
                    </div>

                    <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border p-5 rounded-2xl`}>
                       <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-3`}>2. Item a Transferir</label>
                       <select value={transferItemId} onChange={e => setTransferItemId(e.target.value)} disabled={!transferSourceId || !transferSourceTabObj?.items?.length} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-purple-500 ${bgInput} cursor-pointer disabled:opacity-50`}>
                          <option value="">Selecione o item...</option>
                          {transferSourceTabObj?.items?.map(i => (
                             <option key={i.id} value={i.id}>{i.quantity}x {i.name} (R$ {(i.price * i.quantity).toFixed(2)})</option>
                          ))}
                       </select>
                       {transferSourceTabObj && (!transferSourceTabObj.items || transferSourceTabObj.items.length === 0) && <p className="text-[10px] text-red-500 font-bold mt-2">Esta origem não possui itens lançados.</p>}
                    </div>

                    <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border p-5 rounded-2xl`}>
                       <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-3`}>3. Atendimento Destino</label>
                       <select value={transferTargetId} onChange={e => setTransferTargetId(e.target.value)} disabled={!transferItemId} className={`w-full border rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-purple-500 ${bgInput} cursor-pointer disabled:opacity-50`}>
                          <option value="">Para onde vai?</option>
                          {tabs.filter(t => t.id !== transferSourceId).map(t => <option key={t.id} value={t.id}>{t.type === 'TABLE' ? `Mesa ${t.number}` : `Comanda #${t.number}`} {t.customerName ? `(${t.customerName})` : ''}</option>)}
                       </select>
                    </div>

                    <div className="md:col-span-3 pt-4 border-t border-slate-200/20">
                       <button type="submit" disabled={!transferSourceId || !transferItemId || !transferTargetId} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black py-4 rounded-2xl shadow-lg cursor-pointer transition-colors text-lg flex items-center justify-center gap-2">
                          Confirmar Transferência 🚀
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        )}

        {/* TELA: GRID DE MESAS E COMANDAS (VISÃO GERAL) */}
        {activeMenu === 'mesas' && !selectedTab && (
          <div className="p-6 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-2xl flex items-center gap-3">🪑 Mesas Físicas</h3>
                <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-black">{mesas.length} abertas</span>
              </div>
              {mesas.length === 0 ? <p className={`text-sm ${textMuted} italic bg-black/5 p-6 rounded-2xl border border-dashed border-slate-500/30 text-center`}>Nenhuma mesa do salão está ocupada no momento.</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mesas.map(tab => {
                    const isOtherWaiter = tab.openedBy !== employeeUser?.name && tab.openedBy !== 'Admin';
                    return (
                      <button key={tab.id} onClick={() => setSelectedTab(tab)} className={`${bgCard} border p-5 rounded-3xl flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl cursor-pointer relative overflow-hidden group`}>
                        {isOtherWaiter && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" title="Sendo atendida por outro garçom"></span>}
                        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🪑</span>
                        <span className="font-black text-xl mb-1">Mesa {tab.number}</span>
                        <span className={`text-[10px] ${textMuted} font-bold tracking-widest uppercase mb-3`}>{tab.openedBy}</span>
                        <span className="text-sm font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl w-full">R$ {calculateTotal(tab.items).toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-2xl flex items-center gap-3">💳 Comandas Individuais</h3>
                <span className="bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-xs font-black">{comandas.length} abertas</span>
              </div>
              {comandas.length === 0 ? <p className={`text-sm ${textMuted} italic bg-black/5 p-6 rounded-2xl border border-dashed border-slate-500/30 text-center`}>Nenhuma comanda individual registrada.</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {comandas.map(tab => {
                    const isOtherWaiter = tab.openedBy !== employeeUser?.name && tab.openedBy !== 'Admin';
                    const isLinked = tab.linkedTable !== null;
                    const cardStyle = isLinked ? (isDarkMode ? 'border-purple-500 bg-purple-500/10' : 'border-purple-400 bg-purple-50') : bgCard;

                    return (
                      <button key={tab.id} onClick={() => setSelectedTab(tab)} className={`${cardStyle} border p-5 rounded-3xl flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:border-purple-400 hover:shadow-xl cursor-pointer relative overflow-hidden group`}>
                        {isOtherWaiter && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" title="Sendo atendida por outro garçom"></span>}
                        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">💳</span>
                        <span className="font-black text-xl mb-1">#{tab.number}</span>
                        {tab.customerName ? <span className={`text-[11px] font-bold ${isLinked ? 'text-purple-600' : 'text-amber-500'} truncate w-full mb-3`}>{tab.customerName}</span> : <span className="mb-3 block"></span>}
                        {isLinked && <span className="text-[9px] bg-purple-500 text-white px-2 py-0.5 rounded font-black w-full text-center mb-2 shadow-sm">🔗 MESA {tab.linkedTable}</span>}
                        <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl w-full">R$ {calculateTotal(tab.items).toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TELA: PDV (LANÇAMENTO DINÂMICO DE PRODUTOS DENTRO DA MESA) */}
        {activeMenu === 'mesas' && selectedTab && (
          <div className="flex flex-col lg:flex-row gap-4 h-full animate-fade-in-up p-4">
            
            {/* COLUNA ESQUERDA: INFORMAÇÕES DA MESA, HISTÓRICO E CARRINHO */}
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

                  {activeEmployeeData && (
                     <div className="bg-amber-100 border border-amber-300 p-3 rounded-xl mt-1">
                        <p className="text-[10px] text-amber-800 font-black uppercase tracking-widest flex items-center gap-1"><span>👷</span> Fiado Funcionário</p>
                        <div className="flex justify-between text-xs font-bold text-amber-900 mt-1">
                           <span>Limite: R$ {activeEmployeeData.creditLimit?.toFixed(2) || '0.00'}</span>
                           <span className="text-red-600">Dívida: R$ {activeEmployeeData.currentDebt?.toFixed(2) || '0.00'}</span>
                        </div>
                     </div>
                  )}

                  {selectedTab.type === 'TAB' && (
                     <div className="flex items-center gap-2 mt-2">
                        {selectedTab.linkedTable ? (
                          <>
                            <span className="text-[10px] font-black bg-purple-500/10 text-purple-500 px-2 py-1 rounded">🔗 Mesa {selectedTab.linkedTable}</span>
                            <button onClick={() => handleLinkTab(selectedTab.id, null)} className="text-[10px] font-black text-red-500 hover:underline cursor-pointer">Desvincular</button>
                          </>
                        ) : (
                          <button onClick={() => { const m = prompt('Nº da Mesa para sentar:'); if(m) handleLinkTab(selectedTab.id, m); }} className="text-[10px] font-black bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">🔗 Vincular à Mesa</button>
                        )}
                        <button onClick={() => setShowMergeModal(true)} className="text-[10px] font-black bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm ml-auto">Juntar Contas</button>
                     </div>
                  )}

                  {selectedTab.type === 'TABLE' && linkedComandasInActiveTable.length > 0 && (
                     <div className="mt-2 bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-2">Comandas Sentadas</p>
                        <div className="flex flex-wrap gap-1.5">
                           {linkedComandasInActiveTable.map(c => (
                              <span key={c.id} className="bg-purple-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">#{c.number} {c.customerName && `(${c.customerName.split(' ')[0]})`}</span>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="flex justify-between items-end mt-2 pt-3 border-t border-slate-200/20">
                     <span className={`text-[10px] font-black ${textMuted} uppercase tracking-widest`}>Parcial Lançado</span>
                     <span className="text-2xl font-black text-emerald-500">R$ {calculateTotal(selectedTab.items).toFixed(2)}</span>
                  </div>
               </div>

               <div className={`${bgCard} border p-5 rounded-3xl flex flex-col gap-3 shadow-sm flex-1 min-h-[250px] overflow-y-auto hide-scrollbar`}>
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 sticky top-0 bg-inherit pb-2 z-10">Histórico de Lançamentos</h3>
                  
                  {(!selectedTab.items || selectedTab.items.length === 0) ? (
                     <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                        <span className="text-4xl mb-2">🍽️</span>
                        <p className="text-xs font-bold text-center">Nenhum item lançado ainda.</p>
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
                                    <div className="flex-1">
                                       <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                          <span className="text-amber-500 font-black mr-1">{item.quantity}x</span> {item.name}
                                       </p>
                                       {item.seatLabel && <span className="inline-block mt-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">{item.seatLabel}</span>}
                                       {item.observation && <p className="text-[9px] text-red-500 font-bold mt-1 bg-red-500/10 px-1.5 py-0.5 inline-block rounded">Obs: {item.observation}</p>}
                                    </div>
                                    <div className="text-right ml-2 flex flex-col items-end gap-1.5">
                                       <span className="font-black text-xs text-slate-800 dark:text-slate-300 mb-1">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                       {canUndo && (
                                          <button onClick={() => handleUndoItem(item.id)} className="text-[9px] bg-red-500 text-white font-black px-2 py-0.5 rounded animate-pulse cursor-pointer shadow-sm">
                                             Desfazer ({Math.max(0, 30 - Math.floor(ageSeconds))}s)
                                          </button>
                                       )}
                                       {item.status === 'READY' && (
                                          <button onClick={() => updateTabItemStatus(item.id, 'SERVED')} className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white font-black px-3 py-1.5 rounded-lg shadow-md transition-colors cursor-pointer animate-bounce">
                                             Retirar 🏃
                                          </button>
                                       )}
                                    </div>
                                 </div>
                                 <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 mt-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Status:</span>
                                    {item.status === 'PREPARING' && <span className="text-[9px] font-black text-amber-500">🔥 Na Cozinha</span>}
                                    {item.status === 'READY' && <span className="text-[9px] font-black text-emerald-500">🛎️ Pronto no Balcão</span>}
                                    {item.status === 'SERVED' && <span className="text-[9px] font-black text-blue-500">✅ Entregue</span>}
                                    {item.status === 'PENDING' && <span className="text-[9px] font-black text-slate-500">⏳ Pendente</span>}
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  )}
               </div>

               {(cart || []).length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-3xl flex flex-col gap-3 shadow-md shrink-0">
                     <h3 className="font-black text-emerald-600 text-xs uppercase tracking-widest flex items-center justify-between">
                         Fila de Disparo <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full">{cart.length}</span>
                     </h3>
                     <div className="max-h-48 overflow-y-auto space-y-2 hide-scrollbar pr-1">
                        {cart.map((item, idx) => (
                           <div key={idx} className={`${bgCard} border p-2.5 rounded-xl flex justify-between items-center shadow-sm`}>
                              <div className="flex-1 pr-2">
                                 <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate"><span className="text-amber-500 font-black mr-1">{item.quantity}x</span> {item.name}</p>
                                 {item.originalSeatName && <span className={`text-[8px] font-black mt-0.5 block ${item.originalSeatName.startsWith('Comanda') ? 'text-purple-500' : 'text-blue-500'}`}>{item.targetTabId !== selectedTab.id ? `➜ Envia p/: ${item.originalSeatName}` : item.originalSeatName}</span>}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                 <span className="font-black text-[11px]">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                 <button onClick={() => removeCartItem(idx)} className="text-red-500 hover:bg-red-500 hover:text-white transition-colors font-bold text-xs p-1 cursor-pointer bg-red-500/10 rounded w-6 h-6 flex items-center justify-center">✕</button>
                              </div>
                           </div>
                        ))}
                     </div>
                     <button onClick={() => handleSendToKitchen(null)} disabled={loadingData} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-xl cursor-pointer transition-all mt-2 active:scale-95 flex justify-center items-center gap-2 text-sm">
                         🚀 Confirmar Lançamentos
                     </button>
                  </div>
               )}
            </div>

            {/* COLUNA DIREITA: CATÁLOGO DINÂMICO (PDV STYLE) */}
            <div className={`${bgCard} border rounded-3xl flex-1 flex flex-col shadow-sm overflow-hidden p-2`}>
               <div className="p-4 border-b border-slate-200/20 shrink-0">
                  <div className="flex gap-3 mb-4">
                     <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar lanche, bebida..." className={`w-full rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:outline-none focus:border-amber-500 transition-colors ${bgInput}`} />
                     </div>
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                     <button onClick={() => setActiveCategory(null)} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shrink-0 transition-colors cursor-pointer ${!activeCategory && !searchTerm && !activeDietFilter ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Tudo</button>
                     {menu.map(cat => (
                        <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchTerm(''); setActiveDietFilter(null); }} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shrink-0 transition-colors cursor-pointer ${activeCategory === cat.id ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{cat.name}</button>
                     ))}
                  </div>

                  <div className="flex gap-2 overflow-x-auto pt-2 hide-scrollbar">
                     <button onClick={() => { setActiveDietFilter(activeDietFilter === 'VEGAN' ? null : 'VEGAN'); setActiveCategory(null); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shrink-0 transition-colors border cursor-pointer ${activeDietFilter === 'VEGAN' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/30'}`}>🌱 Vegano</button>
                     <button onClick={() => { setActiveDietFilter(activeDietFilter === 'NOGLUTEN' ? null : 'NOGLUTEN'); setActiveCategory(null); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shrink-0 transition-colors border cursor-pointer ${activeDietFilter === 'NOGLUTEN' ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30'}`}>🌾 Sem Glúten</button>
                     <button onClick={() => { setActiveDietFilter(activeDietFilter === 'NOLACTOSE' ? null : 'NOLACTOSE'); setActiveCategory(null); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shrink-0 transition-colors border cursor-pointer ${activeDietFilter === 'NOLACTOSE' ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30'}`}>🥛 Zero Lactose</button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                     {visibleProducts.length === 0 ? (
                        <div className="col-span-full py-10 flex flex-col items-center justify-center opacity-50">
                           <span className="text-4xl mb-3">🔍</span>
                           <p className="text-sm font-bold text-center">Nenhum produto encontrado neste filtro.</p>
                        </div>
                     ) : (
                        visibleProducts.map(prod => (
                           <button key={prod.id} onClick={() => handleProductInteraction(prod)} className={`border p-4 rounded-2xl flex flex-col justify-between text-left cursor-pointer transition-all hover:border-amber-500 hover:shadow-md active:scale-95 group relative overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                              <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
                              <p className="font-black text-xs text-slate-800 dark:text-slate-200 mb-2 leading-tight relative z-10 line-clamp-3">{prod.name}</p>
                              <div className="flex items-center justify-between w-full mt-auto relative z-10 pt-2 border-t border-slate-100 dark:border-slate-800">
                                 <span className="text-amber-600 dark:text-amber-500 font-black text-sm">R$ {Number(prod.price).toFixed(2)}</span>
                                 <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                              </div>
                           </button>
                        ))
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAIS SOBREPOSTOS
          ========================================================================= */}

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
                <input type="text" required value={managerAuthLimit.email} onChange={e => setManagerAuthLimit({...managerAuthLimit, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 mb-2 text-slate-900" placeholder="E-mail ou CPF do Gerente" />
                <input type="password" required value={managerAuthLimit.password} onChange={e => setManagerAuthLimit({...managerAuthLimit, password: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 text-slate-900" placeholder="Senha" />
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => { setShowLimitOverrideModal(false); setLoadingData(false); }} className={`flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold text-slate-700 cursor-pointer`}>Cancelar</button>
                 <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Autorizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMergeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className={`${bgCard} border p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up text-center`}>
              <h3 className="text-xl font-black mb-2">Juntar Contas</h3>
              <p className={`text-xs ${textMuted} font-medium mb-6`}>Digite o número da Mesa ou Comanda que será ENCERRADA e transferida para a atual ({selectedTab.number}).</p>
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

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className={`${bgCard} border p-6 sm:p-8 rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-md shadow-2xl space-y-6 animate-fade-in-up transition-colors`}>
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-xl font-black leading-tight mb-1">{selectedProduct.name}</h3>
                  <p className="text-amber-500 font-black">R$ {Number(selectedProduct.price).toFixed(2)}</p>
               </div>
               <button onClick={() => setSelectedProduct(null)} className={`w-8 h-8 rounded-full bg-slate-500/10 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer font-bold shrink-0 ml-4`}>✕</button>
            </div>

            {selectedTab?.number <= 999 && (
              <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20">
                <label className={`text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-3`}>👤 Posição na Mesa (Divisão)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {seatOptions.map(pos => (
                    <button key={pos} type="button" onClick={() => setSeatPosition(pos)} className={`py-2.5 rounded-xl text-xs font-black cursor-pointer transition-colors border shadow-sm ${seatPosition === pos ? 'bg-blue-600 border-blue-600 text-white' : (isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')} ${pos.startsWith('Comanda') ? 'ring-1 ring-purple-500/50' : ''}`}>
                      {pos.startsWith('Comanda') ? `💳 C${pos.replace('Comanda ','')}` : pos}
                    </button>
                  ))}
                </div>
                {!seatPosition.startsWith('Comanda') && (
                   <input type="text" value={customSeatName} onChange={e => setCustomSeatName(e.target.value)} placeholder="Nome da Pessoa (Opcional)" className={`w-full rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-blue-500 ${bgInput} border border-slate-300 dark:border-slate-700`} />
                )}
              </div>
            )}

            <div className="flex gap-4">
               <div className="w-1/3">
                  <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-2`}>Qtd</label>
                  <div className={`flex items-center justify-between ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} p-1.5 rounded-2xl border transition-colors`}>
                     <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} className={`w-10 h-10 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 shadow-sm'} rounded-xl font-black text-lg cursor-pointer`}>-</button>
                     <span className="text-lg font-black w-8 text-center">{itemQuantity}</span>
                     <button onClick={() => setItemQuantity(itemQuantity + 1)} className={`w-10 h-10 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 shadow-sm'} rounded-xl font-black text-lg cursor-pointer`}>+</button>
                  </div>
               </div>
               <div className="flex-1">
                  <label className={`text-[10px] font-black ${textMuted} uppercase tracking-widest block mb-2`}>Observações</label>
                  <input type="text" value={itemObservation} onChange={e => setItemObservation(e.target.value)} placeholder="Ex: Sem cebola, bem passado..." className={`w-full h-14 rounded-2xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500 border border-slate-200 dark:border-slate-800 ${bgInput}`} />
               </div>
            </div>

            <button onClick={confirmAddToCart} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg py-4 rounded-2xl shadow-xl mt-2 cursor-pointer transition-all active:scale-95 flex justify-center items-center gap-2">
               Adicionar Item <span className="bg-slate-950/10 px-2 py-0.5 rounded-lg text-sm">R$ {(Number(selectedProduct.price) * itemQuantity).toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {showManagerDebtModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`${bgCard} border border-red-500 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in-up text-center`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
            <span className="text-5xl mb-4 inline-block">⚠️</span>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Cliente com Pendências!</h3>
            <p className="text-xs text-red-500 font-bold mb-6">{debtAmountMsg} <br/><br/>Deseja que o gerente autorize e puxe essa dívida para esta nova comanda?</p>
            
            <form onSubmit={handleDebtOverrideSubmit} className="space-y-4 text-left">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Autenticação do Gerente</p>
                <input type="text" required value={managerAuthDebt.email} onChange={e => setManagerAuthDebt({...managerAuthDebt, email: e.target.value})} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 mb-2 ${bgInput}`} placeholder="E-mail ou CPF do Gerente" />
                <input type="password" required value={managerAuthDebt.password} onChange={e => setManagerAuthDebt({...managerAuthDebt, password: e.target.value})} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 ${bgInput}`} placeholder="Senha" />
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowManagerDebtModal(false)} className={`flex-1 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'} py-3 rounded-xl font-bold cursor-pointer`}>Cancelar Abertura</button>
                 <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Autorizar e Puxar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}