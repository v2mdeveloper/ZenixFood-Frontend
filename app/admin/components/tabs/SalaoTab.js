'use client';
import { useState, useEffect } from 'react';

export default function SalaoTab({ employeeUser }) {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printerName, setPrinterName] = useState('');

  // Estados de Abertura de Mesa/Comanda (Atualizado com Lógica de Clientes)
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openForm, setOpenForm] = useState({ number: '', customerName: '', customerCpf: '', customerBirthDate: '', customerId: '', customerType: '' });
  const [selectedTab, setSelectedTab] = useState(null);

  // Estados de Pessoas (Clientes e Equipa) para o Autocomplete
  const [allPeople, setAllPeople] = useState([]);
  const [employeeAccounts, setEmployeeAccounts] = useState([]); 
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Estados do Modal do Gerente (Puxar Dívida)
  const [showManagerDebtModal, setShowManagerDebtModal] = useState(false);
  const [debtAmountMsg, setDebtAmountMsg] = useState('');
  const [managerAuthDebt, setManagerAuthDebt] = useState({ email: '', password: '' });

  // Estados de Transferência
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [itemToTransfer, setItemToTransfer] = useState(null);
  const [targetTabNumber, setTargetTabNumber] = useState('');
  const [managerAuth, setManagerAuth] = useState({ email: '', password: '' });

  // 🛡️ Helper local para garantir o envio do x-store-id e Token JWT
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    fetchTabs();
    fetchSettings();
    fetchPeople(); // Busca clientes e funcionários ao carregar
    const interval = setInterval(fetchTabs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setPrinterName(data.printerName || '');
      }
    } catch(e) {}
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
      if (resAcc.ok) setEmployeeAccounts(await resAcc.json()); // Guarda as contas de funcionários para exibir saldo
      
      const combined = [...clients.map(c => ({ ...c, _type: 'Cliente' })), ...emps.map(e => ({ ...e, _type: 'Equipe' }))];
      setAllPeople(combined);
    } catch (e) {}
  };

  const fetchTabs = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs`);
      if (res.ok) {
        const data = await res.json();
        setTabs(data || []);
        if (selectedTab) {
          const updated = (data || []).find(t => t.id === selectedTab.id);
          if (updated) setSelectedTab(updated);
          else setSelectedTab(null);
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  // Funções de Autocomplete para o Titular da Comanda
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

  // Abertura de Mesa com Validação de Dívida
  const handleOpenTab = async (e, overrideAuth = null) => {
    if (e) e.preventDefault();
    try {
      const payload = { 
        number: openForm.number, 
        customerName: openForm.customerName, 
        customerCpf: openForm.customerCpf, 
        openedBy: employeeUser?.name || 'Admin',
        customerId: openForm.customerId,
        customerType: openForm.customerType,
        managerAuth: overrideAuth
      };

      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/open`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setShowOpenModal(false); setShowManagerDebtModal(false); setManagerAuthDebt({ email: '', password: '' });
        setOpenForm({ number: '', customerName: '', customerCpf: '', customerBirthDate: '', customerId: '', customerType: '' });
        fetchTabs(); setSelectedTab(data.tab);
        if (overrideAuth) alert('Comanda aberta e dívida vinculada com sucesso!');
      } else { 
        if (data.code === 'CLIENT_HAS_DEBT') {
           setDebtAmountMsg(data.error);
           setShowManagerDebtModal(true);
        } else {
           alert(data.error); 
        }
      }
    } catch (e) { alert("Erro de conexão."); }
  };

  const handleDebtOverrideSubmit = (e) => { e.preventDefault(); handleOpenTab(null, managerAuthDebt); };

  const imprimirExtrato = async (tab) => {
    try {
      await fetch('http://localhost:8080/imprimir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatorio: true, tipo: 'EXTRATO_SALAO', dados: tab, printerName })
      });
      alert('Comando enviado com sucesso!');
    } catch (err) { alert('Erro de comunicação com a impressora local.'); }
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    const target = (tabs || []).find(t => t.number.toString() === targetTabNumber.trim());
    if (!target) return alert('Destino não encontrado!');
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/items/transfer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: itemToTransfer.id, targetTabId: target.id, managerAuth })
      });
      const data = await res.json();
      if (data.success) {
        alert('Item transferido!'); setShowTransferModal(false); setItemToTransfer(null);
        setTargetTabNumber(''); setManagerAuth({ email: '', password: '' }); fetchTabs();
      } else { alert(data.error); }
    } catch (e) { alert('Erro ao transferir.'); }
  };

  const handleCancelTab = async (tabId) => {
    if (!confirm('Tem a certeza que deseja cancelar e fechar esta mesa vazia?')) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${tabId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Atendimento zerado e fechado com sucesso!');
        setSelectedTab(null);
        fetchTabs();
      } else { alert(data.error); }
    } catch (e) { alert('Erro de conexão.'); }
  };

  const handleLinkTab = async (tabId, mesaNum) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/salao/tabs/${tabId}/link`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedTable: mesaNum })
      });
      const data = await res.json();
      if (data.success) fetchTabs();
      else alert(data.error);
    } catch (e) { alert('Erro ao vincular.'); }
  };

  const mesas = (tabs || []).filter(t => t.type === 'TABLE');
  const comandas = (tabs || []).filter(t => t.type === 'TAB');
  const calculateTotal = (items) => (items || []).reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const activeEmployeeData = selectedTab && selectedTab.customerName ? employeeAccounts.find(e => e.name === selectedTab.customerName || e.cpf === selectedTab.customerCpf) : null;

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Carregando mapa do salão...</div>;

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="bg-slate-900 rounded-3xl p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg border border-slate-800 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-2xl">🍽️</div>
          <div>
            <h2 className="text-white font-black text-lg leading-none mb-1">Mapa do Salão & Comandas</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {tabs.length} Atendimentos em Andamento
            </p>
          </div>
        </div>
        <button onClick={() => setShowOpenModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer">
          <span className="text-lg">➕</span> Abrir Mesa / Comanda
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-8 pr-2">
          <div>
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><span>🪑</span> Mesas Ocupadas ({mesas.length})</h3>
            {mesas.length === 0 ? (
               <p className="text-xs text-slate-400 italic bg-white border border-slate-200 p-4 rounded-xl">Nenhuma mesa aberta no momento.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mesas.map(mesa => {
                  const parcial = calculateTotal(mesa.items);
                  const isSelected = selectedTab?.id === mesa.id;
                  return (
                    <button key={mesa.id} onClick={() => setSelectedTab(mesa)} className={`relative p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all border-b-4 cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20' : 'bg-white border-slate-300 hover:border-blue-400 shadow-sm'}`}>
                      <span className="w-3 h-3 bg-emerald-500 rounded-full absolute top-3 right-3 animate-pulse"></span>
                      <span className="text-3xl mb-2 text-slate-700">🪑</span>
                      <span className="font-black text-slate-800 text-lg">Mesa {mesa.number}</span>
                      <span className="text-xs font-bold text-slate-500 mt-1">R$ {parcial.toFixed(2)}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="w-full h-px bg-slate-200"></div>
          <div>
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><span>💳</span> Comandas Abertas ({comandas.length})</h3>
            {comandas.length === 0 ? (
               <p className="text-xs text-slate-400 italic bg-white border border-slate-200 p-4 rounded-xl">Nenhuma comanda individual aberta no momento.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {comandas.map(comanda => {
                  const parcial = calculateTotal(comanda.items);
                  const isSelected = selectedTab?.id === comanda.id;
                  const isLinked = comanda.linkedTable !== null;

                  return (
                    <button key={comanda.id} onClick={() => setSelectedTab(comanda)} className={`relative p-4 rounded-2xl flex flex-col text-left transition-all border-l-4 cursor-pointer ${isSelected ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20' : (isLinked ? 'bg-purple-50 border-purple-400 shadow-sm' : 'bg-white border-amber-400 shadow-sm hover:shadow-md')}`}>
                      <div className="flex justify-between items-start mb-2 w-full">
                        <span className="font-black text-slate-800 text-base">#{comanda.number}</span>
                        <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">R$ {parcial.toFixed(2)}</span>
                      </div>
                      <span className={`font-bold ${isLinked ? 'text-purple-600' : 'text-slate-600'} text-sm truncate w-full`}>{comanda.customerName}</span>
                      
                      {isLinked && <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded font-black mt-2 w-full text-center">🔗 MESA {comanda.linkedTable}</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {selectedTab ? (
          <div className="w-[380px] md:w-[420px] bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm relative overflow-hidden shrink-0">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${selectedTab.type === 'TABLE' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
            
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-2xl text-slate-800 tracking-tight">
                  {selectedTab.type === 'TABLE' ? `Mesa ${selectedTab.number}` : `Comanda #${selectedTab.number}`}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aberta por: <span className="text-slate-600">{selectedTab.openedBy}</span></p>
                {selectedTab.customerName && <p className="text-sm font-bold text-slate-700 mt-2">👤 {selectedTab.customerName} {selectedTab.customerCpf && `| CPF: ${selectedTab.customerCpf}`}</p>}
              </div>
              <button onClick={() => setSelectedTab(null)} className="text-slate-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
            </div>

            {activeEmployeeData && (
               <div className="bg-amber-100 border border-amber-300 p-3 rounded-xl mb-4">
                  <p className="text-[10px] text-amber-800 font-black uppercase tracking-widest flex items-center gap-1"><span>👷</span> Fiado Funcionário</p>
                  <div className="flex justify-between text-xs font-bold text-amber-900 mt-1">
                     <span>Limite: R$ {activeEmployeeData.creditLimit?.toFixed(2) || '0.00'}</span>
                     <span className="text-red-600">Dívida: R$ {activeEmployeeData.currentDebt?.toFixed(2) || '0.00'}</span>
                  </div>
               </div>
            )}

            {selectedTab.type === 'TAB' && (
              <div className="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                 {selectedTab.linkedTable ? (
                    <>
                      <span className="text-xs font-black text-purple-600">🔗 Vinculada à Mesa {selectedTab.linkedTable}</span>
                      <button onClick={() => handleLinkTab(selectedTab.id, null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer">Desvincular</button>
                    </>
                 ) : (
                    <>
                      <span className="text-xs font-bold text-slate-500">📍 Comanda Avulsa</span>
                      <button onClick={() => {
                         const mesa = prompt('Digite o número da Mesa:');
                         if(mesa) handleLinkTab(selectedTab.id, mesa);
                      }} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer">🔗 Vincular à Mesa</button>
                    </>
                 )}
              </div>
            )}

            {selectedTab.type === 'TABLE' && (() => {
               const linkedComandas = comandas.filter(c => c.linkedTable === selectedTab.number);
               if(linkedComandas.length === 0) return null;
               return (
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl flex gap-2 flex-wrap mb-4">
                     <span className="text-[10px] font-black uppercase text-purple-800 shrink-0 w-full mb-1">🔗 Comandas Sentadas:</span>
                     {linkedComandas.map(c => (
                       <span key={c.id} className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded shrink-0">#{c.number} ({c.customerName})</span>
                     ))}
                  </div>
               );
            })()}
            
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extrato de Consumo</h4>
              <button onClick={() => imprimirExtrato(selectedTab)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer">
                <span>🖨️</span> Imprimir Extrato
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pr-2 mb-4">
              {(selectedTab.items || []).map((item, idx) => (
                <div key={idx} className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight pr-2">
                      <span className="text-amber-500 font-black mr-1">{item.quantity}x</span> {item.name}
                    </p>
                    <span className="font-black text-slate-800 text-sm whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.seatLabel && <p className="text-[9px] font-black text-blue-600 uppercase mt-0.5">{item.seatLabel}</p>}
                  {item.observation && <p className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 p-1.5 rounded inline-block">Obs: {item.observation}</p>}
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {item.status === 'PREPARING' && <span className="text-amber-600">🔥 Na Cozinha</span>}
                      {item.status === 'READY' && <span className="text-emerald-500 font-black">🛎️ Pronto (Garçom)</span>}
                      {item.status === 'SERVED' && <span className="text-blue-500">✅ Entregue</span>}
                      {item.status === 'PENDING' && '⏳ Pendente'}
                    </span>
                    <button onClick={() => { setItemToTransfer(item); setShowTransferModal(true); }} className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer">
                      🔄 Transferir Item
                    </button>
                  </div>
                </div>
              ))}
              {(!selectedTab.items || selectedTab.items.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-xs text-slate-400 italic text-center mb-4">Nenhum item lançado ainda.</p>
                  <button onClick={() => handleCancelTab(selectedTab.id)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
                    🗑️ Cancelar / Fechar Zerada
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Total Parcial</span>
                <span className="font-black text-3xl text-emerald-500 tracking-tighter">R$ {calculateTotal(selectedTab.items).toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-slate-400 text-center font-medium">Vá até a aba <strong>PDV / Caixa</strong> para realizar o pagamento e encerramento desta conta.</p>
            </div>
          </div>
        ) : (
          <div className="w-[380px] md:w-[420px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 shrink-0 opacity-50 bg-slate-50/50">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-slate-500 font-bold text-sm">Selecione uma Mesa ou Comanda no mapa para ver o extrato e gerenciar transferências.</p>
          </div>
        )}
      </div>

      {/* MODAL TRANSFERÊNCIA DE ITEM */}
      {showTransferModal && itemToTransfer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-slate-800">🔄 Transferir Item</h3><button onClick={() => setShowTransferModal(false)} className="text-slate-400 font-bold cursor-pointer">✕</button></div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4"><p className="text-xs font-bold text-slate-700">Item: <span className="text-amber-600 font-black">{itemToTransfer.quantity}x {itemToTransfer.name}</span></p></div>
            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Destino</label><input type="number" required value={targetTabNumber} onChange={e => setTargetTabNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800 focus:outline-none focus:border-amber-500" placeholder="Mesa ou Comanda" /></div>
              <div className="pt-3 border-t border-slate-100"><p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1"><span>🔒</span> Autorização da Gerência</p><div className="space-y-3"><input type="text" required value={managerAuth.email} onChange={e => setManagerAuth({...managerAuth, email: e.target.value})} className="w-full bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-red-400" placeholder="E-mail ou CPF do Gerente" /><input type="password" required value={managerAuth.password} onChange={e => setManagerAuth({...managerAuth, password: e.target.value})} className="w-full bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-red-400" placeholder="Senha do Gerente" /></div></div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-all mt-4 cursor-pointer">Confirmar Transferência</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ABERTURA DE MESA (COM INTELIGÊNCIA) */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${Number(openForm.number) >= 1000 ? 'from-amber-400 to-amber-600' : 'from-blue-400 to-blue-600'}`}></div>
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-slate-800">{openForm.number === '' ? 'Nova Abertura' : Number(openForm.number) >= 1000 ? '💳 Abrir Comanda' : '🪑 Abrir Mesa'}</h3><button onClick={() => setShowOpenModal(false)} className="text-slate-400 font-bold cursor-pointer">✕</button></div>
            <form onSubmit={handleOpenTab} className="space-y-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Número</label><input type="number" required min="1" value={openForm.number} onChange={e => setOpenForm({...openForm, number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-2xl text-center font-black text-slate-800 focus:outline-none focus:border-emerald-500" placeholder="1 a 999 Mesa | 1000+ Comanda" /></div>
              
              <div className={`transition-all duration-300 overflow-visible ${Number(openForm.number) >= 1000 ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-center mb-2">Dados do Titular da Comanda</p>
                  
                  <div className="relative">
                    <input 
                      type="text" required={Number(openForm.number) >= 1000} value={openForm.customerName} 
                      onChange={handleNameChange} onFocus={() => { if(openForm.customerName.length >= 2) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-sm font-bold focus:outline-none focus:border-amber-500 text-slate-800" placeholder="Nome Completo (Obrigatório)" 
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <div key={i} onMouseDown={(e) => { e.preventDefault(); selectPerson(s); }} className="p-3 border-b border-slate-100 cursor-pointer flex justify-between items-center transition-colors hover:bg-slate-50">
                             <span className="text-xs font-bold text-slate-800">{s.name}</span>
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${s._type === 'Equipe' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{s._type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <input type="text" value={openForm.customerCpf} onChange={e => setOpenForm({...openForm, customerCpf: e.target.value})} className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-sm font-bold focus:outline-none focus:border-amber-500 text-slate-800" placeholder="CPF (Opcional)" />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-all mt-6 text-base cursor-pointer">Confirmar Abertura</button>
            </form>
          </div>
        </div>
      )}

      {/* 🚨 MODAL: AUTORIZAÇÃO DO GERENTE PARA PUXAR DÍVIDA DE CLIENTE 🚨 */}
      {showManagerDebtModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-red-500 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in-up text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
            <span className="text-5xl mb-4 inline-block">⚠️</span>
            <h3 className="text-xl font-black text-slate-800 mb-2">Cliente com Pendências!</h3>
            <p className="text-xs text-red-600 font-bold mb-6">{debtAmountMsg} <br/><br/>Deseja que o gerente autorize e puxe essa dívida para esta nova comanda?</p>
            
            <form onSubmit={handleDebtOverrideSubmit} className="space-y-4 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Autenticação do Gerente</p>
                <input type="text" required value={managerAuthDebt.email} onChange={e => setManagerAuthDebt({...managerAuthDebt, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 mb-2" placeholder="E-mail ou CPF do Gerente" />
                <input type="password" required value={managerAuthDebt.password} onChange={e => setManagerAuthDebt({...managerAuthDebt, password: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500" placeholder="Senha" />
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowManagerDebtModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold text-slate-700 cursor-pointer">Cancelar Abertura</button>
                 <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Autorizar e Puxar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}