'use client';
import { useState, useEffect } from 'react';

export default function PdvTab({ employeeUser, allProducts, menu }) {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [registerInfo, setRegisterInfo] = useState(null);
  const [shiftId, setShiftId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printerName, setPrinterName] = useState('');

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

  //Helper para injetar o x-store-id e o Token JWT automaticamente
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

  useEffect(() => {
    checkRegisterStatus();
    fetchCustomers();
    fetchEmployees();
    fetchSettings();
  }, [employeeUser]);

  const fetchSettings = async () => {
    try { const res = await fetchWithStore(`${API_URL}/api/settings`); if (res.ok) { const data = await res.json(); setPrinterName(data.printerName || ''); } } catch(e){}
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
    const randomPassword = 'Canone' + Math.floor(Math.random() * 1000000) + '!';
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

  const handleProductClick = (prod) => { addToCart(prod); };
  const addToCart = (product) => { setCart(prev => [...(prev || []), { productId: product.id, name: product.name, price: Number(product.price), quantity: 1, isScheduled: false }]); };
  const updateQty = (idx, delta) => { setCart(prev => { const newCart = [...(prev || [])]; if (newCart[idx].quantity + delta > 0) newCart[idx].quantity += delta; else newCart.splice(idx, 1); return newCart; }); };
  const removeFromCart = (idx) => { setCart(prev => (prev || []).filter((_, i) => i !== idx)); };

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
           alert(`✅ Conta paga com sucesso! R$ ${data.totalPaid.toFixed(2)}`); 
           setCart([]); setLoadedTab(null); setSearchTabNumber(''); setSearchCustomerText(''); setSelectedSeatFilter('TODOS'); setSelectedEmployeeBuyer(null); setSelectedCustomer(null); setIsEmployeePurchase(false); setShowLimitOverrideModal(false); setManagerAuthLimit({ email: '', password: '' }); fetchEmployees();
        } else {
           if (data.code === 'LIMIT_EXCEEDED') {
              setLimitErrorMessage(data.error);
              setShowLimitOverrideModal(true);
           } else { alert(data.error); }
        }
      } catch (e) { alert('Erro ao processar pagamento do salão.'); }
      return;
    }

    try {
      const payload = {
          clientId: selectedCustomer?.id || 'TOTEM_MODE', employeeBuyerId: selectedEmployeeBuyer?.id, client: { name: finalClientName },
          items: currentCart, address: 'Venda Balcão (PDV)', paymentMethod, total: subtotal, pdvDiscount: calculatedDiscountValue || 0, origin: 'PDV', registerId: registerInfo?.id, shiftId,
          managerAuth: overrideAuth
      };

      const res = await fetchWithStore(`${API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      
      if (data.success) { 
         alert("Venda registrada com sucesso!"); setCart([]); setDiscountValue(''); setSearchCustomerText(''); setSelectedCustomer(null); setSelectedEmployeeBuyer(null); setIsEmployeePurchase(false); setShowLimitOverrideModal(false); setManagerAuthLimit({ email: '', password: '' }); fetchEmployees();
      } else {
         if (data.code === 'LIMIT_EXCEEDED') {
            setLimitErrorMessage(data.error);
            setShowLimitOverrideModal(true);
         } else { alert(data.error); }
      }
    } catch (e) { alert("Erro de conexão com o servidor."); }
  };

  const handleLimitOverrideSubmit = (e) => {
      e.preventDefault();
      handleCheckoutPDV(managerAuthLimit);
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
    <div className="h-full flex flex-col animate-fade-in-up relative">
      <div className="bg-slate-900 rounded-3xl p-4 mb-6 flex justify-between items-center shadow-lg border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-2xl">🔓</div>
          <div><h2 className="text-white font-black text-lg leading-none mb-1">Ponto de Venda (PDV)</h2><p className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Caixa Aberto</p></div>
        </div>
        <div className="flex gap-2 relative z-50">
          <button type="button" onClick={() => setShowMovementsListModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-blue-500 transition-colors">📋 Consultar Sangrias</button>
          <button type="button" onClick={() => setShowMovementModal(true)} className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-amber-400 transition-colors">💸 Sangria / Suprimento</button>
          <button type="button" onClick={() => setShowCloseModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-red-400 transition-colors">🔒 Fechar Caixa</button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
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
                        <button key={prod.id} onClick={() => handleProductClick(prod)} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center hover:border-amber-500 cursor-pointer">
                          <span className="text-3xl mb-2 block">🍔</span>
                          <p className="font-bold text-xs text-slate-700 truncate">{prod.name}</p>
                          <p className="text-amber-600 font-black mt-1">R$ {Number(prod.price).toFixed(2)}</p>
                        </button>
                      ))}
                   </div>
                 </div>
               )
             })}
          </div>
        </div>

        <div className="w-[390px] bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm">
          
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
                  <p className="text-xs font-bold text-slate-800 leading-tight"><span className="text-amber-500 font-black mr-1">{item.quantity}x</span> {item.name}</p>
                  <span className="font-black text-slate-800 text-sm whitespace-nowrap pl-2">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
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

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
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