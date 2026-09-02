'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState(null);

  const [viewingInvoicesStore, setViewingInvoicesStore] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({ reference: '', amount: '', dueDate: '', notes: '' });

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  useEffect(() => {
    if (localStorage.getItem('zenix_master_token') === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchStores(); }, [isAuthenticated]);

  const handleMasterLogin = (e) => {
    e.preventDefault();
    if (masterPassword === 'zenixadmin123') {
      localStorage.setItem('zenix_master_token', 'authenticated');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta! Acesso negado.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zenix_master_token');
    setIsAuthenticated(false);
    setMasterPassword('');
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/master/stores`, { headers: { 'Authorization': `Bearer zenix_master` } });
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (store) => {
    setEditingStore({
      ...store,
      corporateName: store.corporateName || '',
      cnpj: store.documentCnpj || store.cnpj || '',
      stateRegistration: store.stateRegistration || '',
      municipalRegistration: store.municipalRegistration || '',
      companyEmail: store.email || store.companyEmail || '',
      companyPhone: store.phone || store.companyPhone || '',
      ownerName: store.ownerName || '',
      ownerCpf: store.ownerCpf || '',
      ownerEmail: store.ownerEmail || '',
      ownerPhone: store.ownerPhone || '',
      address: store.address || '',
      logoUrl: store.logoUrl || '',
      monthlyFee: store.monthlyFee || 0,
      subscriptionStatus: store.subscriptionStatus || 'TRIAL'
    });
  };

  // --- MÁSCARAS NO MODAL DE EDIÇÃO ---
  const handleEditCnpjChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 14) val = val.slice(0, 14);
    val = val.replace(/^(\d{2})(\d)/, '$1.$2');
    val = val.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    val = val.replace(/\.(\d{3})(\d)/, '.$1/$2');
    val = val.replace(/(\d{4})(\d)/, '$1-$2');
    setEditingStore(prev => ({ ...prev, cnpj: val }));
  };

  const handleEditCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setEditingStore(prev => ({ ...prev, ownerCpf: val }));
  };

  const handleEditPhoneChange = (e, field) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/^(\d{2})(\d)/g, '($1) $2');
    val = val.replace(/(\d)(\d{4})$/, '$1-$2');
    setEditingStore(prev => ({ ...prev, [field]: val }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editingStore.cnpj && editingStore.cnpj.length > 0 && editingStore.cnpj.length < 18) return alert('O CNPJ deve estar completo.');
    if (editingStore.ownerCpf && editingStore.ownerCpf.length > 0 && editingStore.ownerCpf.length < 14) return alert('O CPF deve estar completo.');

    const payload = { ...editingStore, monthlyFee: parseFloat(editingStore.monthlyFee) || 0 };
    try {
      const res = await fetch(`${API_URL}/api/master/stores/${editingStore.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer zenix_master` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Loja atualizada com sucesso!');
        setEditingStore(null);
        fetchStores();
      } else { alert(data.error || 'Erro ao atualizar loja.'); }
    } catch (error) { alert('Erro de conexão.'); }
  };

  const toggleStoreStatus = async (store) => {
    if (!confirm(`Deseja ${store.status === 'ACTIVE' ? 'BLOQUEAR' : 'DESBLOQUEAR'} a loja ${store.name}?`)) return;
    const newStatus = store.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await fetch(`${API_URL}/api/master/stores/${store.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer zenix_master` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchStores();
    } catch (error) { alert('Erro ao alterar status.'); }
  };

  const handleOpenInvoices = async (store) => {
    setViewingInvoicesStore(store); setLoadingInvoices(true);
    try {
      const res = await fetch(`${API_URL}/api/master/stores/${store.id}/invoices`, { headers: { 'Authorization': `Bearer zenix_master` }});
      if (res.ok) { const data = await res.json(); setInvoices(data.invoices || []); } else { setInvoices([]); }
    } catch (error) { setInvoices([]); } finally { setLoadingInvoices(false); }
  };

  const handleOpenNewInvoice = () => {
    setNewInvoiceForm({ reference: '', amount: viewingInvoicesStore.monthlyFee || '', dueDate: '', notes: '' });
    setShowNewInvoiceModal(true);
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = { storeId: viewingInvoicesStore.id, reference: newInvoiceForm.reference, amount: parseFloat(newInvoiceForm.amount), dueDate: newInvoiceForm.dueDate, notes: newInvoiceForm.notes, status: 'OPEN' };
      const res = await fetch(`${API_URL}/api/master/stores/${viewingInvoicesStore.id}/invoices`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer zenix_master` },
        body: JSON.stringify(payload)
      });
      if (res.ok) { alert('Fatura gerada com sucesso!'); setShowNewInvoiceModal(false); handleOpenInvoices(viewingInvoicesStore); } 
      else { alert('Fatura mockada.'); setInvoices([...invoices, { id: Date.now().toString(), ...payload }]); setShowNewInvoiceModal(false); }
    } catch (error) { alert('Erro ao gerar fatura.'); }
  };

  const handlePrintInvoice = () => window.print();
  const handleDownloadInvoice = (invoice) => alert(`Baixando PDF da fatura: ${invoice.reference}`);

  const lojasAtivas = stores.filter(s => s.status === 'ACTIVE').length;
  const totalReceber = stores.filter(s => s.status === 'ACTIVE').reduce((acc, s) => acc + (parseFloat(s.monthlyFee) || 0), 0);
  const totalAtrasado = stores.filter(s => s.subscriptionStatus === 'OVERDUE').reduce((acc, s) => acc + (parseFloat(s.monthlyFee) || 0), 0);

  const getStatusLabel = (status) => {
    const labels = {
      'TRIAL': { text: 'Período de Teste', style: 'bg-blue-100 text-blue-600 border-blue-200' },
      'ACTIVE': { text: 'Pagamento em Dia', style: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
      'OVERDUE': { text: 'Inadimplente', style: 'bg-red-100 text-red-600 border-red-200' },
      'BLOCKED': { text: 'Cancelado/Bloqueado', style: 'bg-slate-200 text-slate-600 border-slate-300' }
    };
    return labels[status] || labels['TRIAL'];
  };

  // --- LOGIN MASTER ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="text-center mb-8">
            <span className="text-4xl mb-3 inline-block animate-pulse">⚡</span>
            <h1 className="text-2xl font-black text-slate-800">Zenix Master</h1>
            <p className="text-slate-500 text-xs mt-1">Gestão Administrativa SaaS</p>
          </div>
          <form onSubmit={handleMasterLogin} className="space-y-4">
            <div>
              <input type="password" required value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-center text-slate-900 focus:outline-none focus:border-amber-500 tracking-widest placeholder:tracking-normal" placeholder="Senha Master" />
            </div>
            {loginError && <p className="text-red-500 text-xs text-center font-bold">{loginError}</p>}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl transition-all shadow-md mt-2 cursor-pointer active:scale-95">
              Acessar Backoffice
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD MASTER ---
  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-amber-500 font-bold"><span className="text-4xl animate-spin mb-4">⚙️</span> Carregando Master...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans p-6 md:p-10">
      
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3"><span>⚡</span> Zenix Master</h1>
          <p className="text-slate-500 text-sm mt-1">Gestão central de todos os inquilinos (restaurantes).</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer text-sm shadow-sm">Sair</button>
          <button onClick={() => router.push('/master/stores/new')} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3 rounded-xl font-black transition-colors shadow-md cursor-pointer">+ Cadastrar Loja</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lojas Ativas</p>
          <p className="text-4xl font-black text-slate-800">{lojasAtivas} <span className="text-sm font-medium text-slate-500">/ {stores.length} total</span></p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">💰</div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 relative z-10">Receita Mensal Recorrente</p>
          <p className="text-4xl font-black text-emerald-700 relative z-10">R$ {totalReceber.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">⚠️</div>
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 relative z-10">Total Inadimplente (Atrasados)</p>
          <p className="text-4xl font-black text-red-700 relative z-10">R$ {totalAtrasado.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="px-6 py-5">Loja / Slug</th>
                <th className="px-6 py-5">Plano & Valor</th>
                <th className="px-6 py-5">Status Pgto</th>
                <th className="px-6 py-5">Acesso Sistema</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map(store => {
                const subStatus = getStatusLabel(store.subscriptionStatus);
                return (
                  <tr key={store.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-800 text-base">{store.name}</p>
                      <p className="text-amber-600 font-mono text-xs">/{store.slug}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-600">{store.plan}</p>
                      <p className="text-emerald-600 text-xs font-bold">R$ {parseFloat(store.monthlyFee || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${subStatus.style}`}>{subStatus.text}</span>
                    </td>
                    <td className="px-6 py-5">
                      <button onClick={() => toggleStoreStatus(store)} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-colors ${store.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300' : 'bg-red-50 text-red-600 border-red-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300'}`}>
                        {store.status === 'ACTIVE' ? 'SISTEMA LIBERADO' : 'SISTEMA BLOQUEADO'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button onClick={() => handleOpenInvoices(store)} className="bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">Faturas</button>
                      <button onClick={() => handleEditClick(store)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">Editar Dados</button>
                    </td>
                  </tr>
                );
              })}
              {stores.length === 0 && <tr><td colSpan="5" className="text-center py-12 text-slate-500">Nenhuma loja cadastrada ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIÇÃO */}
      {editingStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><span className="text-amber-500">🏢</span> Editar: {editingStore.name}</h2>
              <button onClick={() => setEditingStore(null)} className="w-10 h-10 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-full flex items-center justify-center font-black text-lg transition-colors cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto pr-4 space-y-6 flex-1 hide-scrollbar">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span>🏛️</span> Dados Jurídicos e Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Fantasia</label>
                    <input type="text" required value={editingStore.name} onChange={e => setEditingStore({...editingStore, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Slug (URL)</label>
                    <input type="text" required value={editingStore.slug} onChange={e => setEditingStore({...editingStore, slug: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-amber-600 font-mono focus:outline-none focus:border-amber-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Razão Social</label>
                    <input type="text" required value={editingStore.corporateName} onChange={e => setEditingStore({...editingStore, corporateName: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CNPJ</label>
                    <input type="text" required value={editingStore.cnpj} onChange={handleEditCnpjChange} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-mono shadow-sm" placeholder="00.000.000/0001-00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insc. Estadual</label>
                    <input type="text" value={editingStore.stateRegistration} onChange={e => setEditingStore({...editingStore, stateRegistration: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" placeholder="Apenas Números ou ISENTO" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insc. Municipal</label>
                    <input type="text" value={editingStore.municipalRegistration} onChange={e => setEditingStore({...editingStore, municipalRegistration: e.target.value.replace(/\D/g, '')})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" placeholder="Apenas Números" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email da Empresa</label>
                    <input type="email" required value={editingStore.companyEmail} onChange={e => setEditingStore({...editingStore, companyEmail: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Telefone / WhatsApp</label>
                    <input type="tel" required value={editingStore.companyPhone} onChange={e => handleEditPhoneChange(e, 'companyPhone')} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" placeholder="(11) 99999-9999" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span>👤</span> Responsável Legal / Sócio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                    <input type="text" required value={editingStore.ownerName} onChange={e => setEditingStore({...editingStore, ownerName: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPF</label>
                    <input type="text" required value={editingStore.ownerCpf} onChange={handleEditCpfChange} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-sm" placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Pessoal</label>
                    <input type="email" required value={editingStore.ownerEmail} onChange={e => setEditingStore({...editingStore, ownerEmail: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Celular Pessoal</label>
                    <input type="tel" required value={editingStore.ownerPhone} onChange={e => handleEditPhoneChange(e, 'ownerPhone')} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm" placeholder="(11) 99999-9999" />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span>💰</span> Assinatura e Cobrança (SaaS)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plano Ativo</label>
                    <select required value={editingStore.plan} onChange={e => setEditingStore({...editingStore, plan: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-sm">
                      <option value="STANDARD">Padrão (Standard)</option>
                      <option value="PRO">Profissional (Pro)</option>
                      <option value="ENTERPRISE">Enterprise / Franquia</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mensalidade (R$)</label>
                    <input type="number" required step="0.01" value={editingStore.monthlyFee} onChange={e => setEditingStore({...editingStore, monthlyFee: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 font-mono font-black focus:outline-none focus:border-emerald-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Financeiro</label>
                    <select required value={editingStore.subscriptionStatus} onChange={e => setEditingStore({...editingStore, subscriptionStatus: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-sm">
                      <option value="TRIAL">Período de Teste</option>
                      <option value="ACTIVE">Em Dia (Ativo)</option>
                      <option value="OVERDUE">Inadimplente (Atrasado)</option>
                      <option value="BLOCKED">Bloqueado Total</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span>📍</span> Endereço e Customização</h3>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Endereço Completo</label>
                    <input type="text" required value={editingStore.address} onChange={e => setEditingStore({...editingStore, address: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-purple-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">URL do Logotipo</label>
                    <input type="url" value={editingStore.logoUrl} onChange={e => setEditingStore({...editingStore, logoUrl: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-purple-500 shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4 shrink-0 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingStore(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold py-4 rounded-2xl cursor-pointer transition-colors text-sm">
                  Cancelar
                </button>
                <button type="submit" className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 rounded-2xl shadow-md cursor-pointer transition-all active:scale-95 text-base">
                  Salvar Todas as Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE FATURAS */}
      {viewingInvoicesStore && !showNewInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><span className="text-purple-600">💳</span> Faturas: {viewingInvoicesStore.name}</h2>
                <p className="text-slate-500 text-xs mt-1">Gerencie boletos e cobranças deste cliente.</p>
              </div>
              <button onClick={() => setViewingInvoicesStore(null)} className="w-10 h-10 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-full flex items-center justify-center font-black text-lg transition-colors cursor-pointer">✕</button>
            </div>
            <div className="mb-4 shrink-0 flex justify-end">
               <button onClick={handleOpenNewInvoice} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-sm cursor-pointer">+ Gerar Nova Cobrança</button>
            </div>

            <div className="overflow-y-auto pr-2 space-y-8 flex-1 hide-scrollbar">
              {loadingInvoices ? (
                <div className="text-center py-10 text-slate-500 animate-pulse">Buscando faturas...</div>
              ) : (
                <>
                  {invoices.filter(i => i.status === 'OPEN' && new Date(i.dueDate) < new Date()).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest border-b border-red-200 pb-2">Vencidas / Atrasadas</h3>
                      {invoices.filter(i => i.status === 'OPEN' && new Date(i.dueDate) < new Date()).map(inv => (
                        <div key={inv.id} className="bg-red-50 border border-red-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div>
                            <p className="font-black text-slate-900">{inv.reference}</p>
                            <p className="text-xs text-red-600 font-bold mt-1">Vencido em: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-red-600">R$ {parseFloat(inv.amount).toFixed(2)}</span>
                            <div className="flex gap-2">
                              <button onClick={() => handlePrintInvoice(inv)} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 p-2.5 rounded-lg transition-colors cursor-pointer" title="Imprimir">🖨️</button>
                              <button onClick={() => handleDownloadInvoice(inv)} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 p-2.5 rounded-lg transition-colors cursor-pointer" title="Baixar PDF">⬇️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {invoices.filter(i => i.status === 'OPEN' && new Date(i.dueDate) >= new Date()).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-200 pb-2">A Vencer</h3>
                      {invoices.filter(i => i.status === 'OPEN' && new Date(i.dueDate) >= new Date()).map(inv => (
                        <div key={inv.id} className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div>
                            <p className="font-black text-slate-900">{inv.reference}</p>
                            <p className="text-xs text-amber-600 font-bold mt-1">Vence em: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-amber-600">R$ {parseFloat(inv.amount).toFixed(2)}</span>
                            <div className="flex gap-2">
                              <button onClick={() => handlePrintInvoice(inv)} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 p-2.5 rounded-lg transition-colors cursor-pointer" title="Imprimir">🖨️</button>
                              <button onClick={() => handleDownloadInvoice(inv)} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 p-2.5 rounded-lg transition-colors cursor-pointer" title="Baixar PDF">⬇️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {invoices.filter(i => i.status === 'PAID').length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-200 pb-2">Pagas</h3>
                      {invoices.filter(i => i.status === 'PAID').map(inv => (
                        <div key={inv.id} className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div>
                            <p className="font-black text-slate-900">{inv.reference}</p>
                            <p className="text-xs text-emerald-600 font-bold mt-1">Vencimento: {new Date(inv.dueDate).toLocaleDateString('pt-BR')} (PAGO)</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-emerald-600">R$ {parseFloat(inv.amount).toFixed(2)}</span>
                            <div className="flex gap-2">
                              <button onClick={() => handlePrintInvoice(inv)} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 p-2.5 rounded-lg transition-colors cursor-pointer" title="Imprimir Recibo">🖨️</button>
                              <button onClick={() => handleDownloadInvoice(inv)} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 p-2.5 rounded-lg transition-colors cursor-pointer" title="Baixar Recibo">⬇️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {invoices.length === 0 && <div className="text-center py-10 text-slate-500 font-medium">Nenhuma fatura encontrada.</div>}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA FATURA */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative flex flex-col animate-fade-in-up">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Gerar Cobrança</h2>
            <p className="text-slate-500 text-xs mb-6">Cliente: <span className="text-amber-600 font-bold">{viewingInvoicesStore?.name}</span></p>

            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Referência / Título</label>
                <input type="text" required value={newInvoiceForm.reference} onChange={e => setNewInvoiceForm({...newInvoiceForm, reference: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm" placeholder="Ex: Mensalidade - Outubro" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" required value={newInvoiceForm.amount} onChange={e => setNewInvoiceForm({...newInvoiceForm, amount: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 font-black focus:outline-none focus:border-emerald-500 shadow-sm" placeholder="149.90" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Vencimento</label>
                  <input type="date" required value={newInvoiceForm.dueDate} onChange={e => setNewInvoiceForm({...newInvoiceForm, dueDate: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Anotações</label>
                <textarea value={newInvoiceForm.notes} onChange={e => setNewInvoiceForm({...newInvoiceForm, notes: e.target.value})} rows="2" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 resize-none shadow-sm" placeholder="Observações..."></textarea>
              </div>

              <div className="pt-4 flex gap-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowNewInvoiceModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl cursor-pointer transition-colors text-sm">Cancelar</button>
                <button type="submit" className="flex-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95 text-sm">Gerar Fatura</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}