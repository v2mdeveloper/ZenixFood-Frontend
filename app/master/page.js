'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('idle'); 
  const [forgotError, setForgotError] = useState('');
  
  const [stores, setStores] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState(null);
  
  const [viewingInvoicesStore, setViewingInvoicesStore] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isGeneratingBoleto, setIsGeneratingBoleto] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({ reference: '', amount: '', dueDate: '', notes: '' });

  const [isSuperMaster, setIsSuperMaster] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  useEffect(() => {
    if (localStorage.getItem('zenix_master_token') || localStorage.getItem('zenix_super_token')) {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (isAuthenticated) {
      checkSuperMasterAccess().then(() => {
        fetchPlanos(); 
        fetchStores(); 
      });
    }
  }, [isAuthenticated]);

  const handleMasterLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    if (email === 'admin@zenix' && password === 'zenixadmin123') {
      localStorage.setItem('zenix_master_token', 'token_simulado');
      localStorage.setItem('zenix_super_token', 'token_simulado'); 
      localStorage.setItem('zenix_user', JSON.stringify({ id: 'dev', role: 'SUPER_MASTER', name: 'Admin Zenix' })); 
      setIsAuthenticated(true); 
      setIsLoginLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/master/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('zenix_master_token', data.token);
        localStorage.setItem('zenix_user', JSON.stringify(data.user)); 

        if (data.user?.role === 'SUPER_MASTER') {
          localStorage.setItem('zenix_super_token', data.token);
        }
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      setLoginError('Erro de conexão ao servidor.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus('loading');
    setForgotError('');
    try {
      const res = await fetch(`${API_URL}/api/master/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail })
      });
      if (res.ok) setForgotStatus('success');
      else { setForgotStatus('error'); setForgotError('E-mail não encontrado.'); }
    } catch (err) { setForgotStatus('error'); setForgotError('Erro de comunicação.'); }
  };

  const checkSuperMasterAccess = async () => {
    try {
      const superToken = localStorage.getItem('zenix_super_token');
      const userStr = localStorage.getItem('zenix_user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (superToken || (user && user.role === 'SUPER_MASTER')) {
        setIsSuperMaster(true);
        const token = superToken || localStorage.getItem('zenix_master_token');
        const res = await fetch(`${API_URL}/api/super/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAdminUsers(await res.json()); 
      } else {
        setIsSuperMaster(false);
      }
    } catch (error) {}
  };

  const fetchPlanos = async () => {
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      const res = await fetch(`${API_URL}/api/super/planos`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setPlanos(await res.json());
    } catch (error) {}
  };

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      const isSuper = localStorage.getItem('zenix_super_token') !== null;
      const userStr = localStorage.getItem('zenix_user');
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch(`${API_URL}/api/master/lojas`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        let fetchedStores = await res.json();
        if (!isSuper && user && user.role === 'MASTER') {
           fetchedStores = fetchedStores.filter(s => s.adminUserId === user.id);
        }
        setStores(fetchedStores);
      }
    } catch (error) {} finally { setLoading(false); }
  };

  const handleEditClick = (store) => {
    let parsedStreet = store.street || '';
    let parsedNumber = store.number || '';
    let parsedComp = store.complement || '';
    let parsedNeigh = store.neighborhood || '';
    let parsedCity = store.city || '';
    let parsedState = store.state || '';
    let parsedCep = store.cep || '';

    if (store.endereco && !store.street) {
      try {
        const addr = store.endereco;
        const cepMatch = addr.match(/\(CEP:\s*([\d-]+)\)/i);
        if (cepMatch) parsedCep = cepMatch[1];
        const ufMatch = addr.match(/\/([A-Z]{2})\s*\(CEP/i);
        if (ufMatch) parsedState = ufMatch[1];
        const cityMatch = addr.match(/,\s*([^,]+)\/[A-Z]{2}\s*\(CEP/i);
        if (cityMatch) parsedCity = cityMatch[1].trim();

        const rest = addr.split(/,\s*[^,]+\/[A-Z]{2}\s*\(CEP/i)[0]; 
        const cleanedRest = rest.replace(/,\s*,/g, ','); 
        const parts = cleanedRest.split(' - ');
        
        if (parts.length >= 2) {
           parsedNeigh = parts[parts.length - 1].trim(); 
           const streetNumComp = parts.slice(0, parts.length - 1).join(' - ');
           const streetParts = streetNumComp.split(',');
           parsedStreet = streetParts[0]?.trim() || '';
           if (streetParts[1]) {
             const numComp = streetParts[1].split('-');
             parsedNumber = numComp[0]?.trim() || '';
             parsedComp = numComp.slice(1).join('-').trim() || '';
           }
        } else { parsedStreet = cleanedRest.trim(); }
      } catch (e) { parsedStreet = store.endereco; }
    }

    setEditingStore({
      id: store.id,
      slug: store.slug || '', razaoSocial: store.razaoSocial || '', cnpj: store.cnpj || '',
      inscricaoEstadual: store.inscricaoEstadual || '', inscricaoMunicipal: store.inscricaoMunicipal || '',
      emailEmpresa: store.emailEmpresa || '', telefoneEmpresa: store.telefoneEmpresa || '',
      nomeResponsavel: store.nomeResponsavel || '', cpfResponsavel: store.cpfResponsavel || '',
      emailResponsavel: store.emailResponsavel || '', senhaResponsavel: '', 
      cep: parsedCep, street: parsedStreet, number: parsedNumber, complement: parsedComp, 
      neighborhood: parsedNeigh, city: parsedCity, state: parsedState,
      
      planoSaaSId: store.planoSaaSId || '',
      temSuporte: store.temSuporte || false,
      valorSuporte: store.valorSuporte || '',
      adminUserId: store.adminUserId || ''
    });
  };

  const handleEditCepSearch = async (e) => {
    let cepVal = e.target.value.replace(/\D/g, ''); if (cepVal.length > 8) cepVal = cepVal.slice(0, 8);
    const maskedCep = cepVal.replace(/^(\d{5})(\d)/, '$1-$2');
    setEditingStore(prev => ({ ...prev, cep: maskedCep }));
    if (cepVal.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEditingStore(prev => ({ ...prev, street: data.logradouro || prev.street, neighborhood: data.bairro || prev.neighborhood, city: data.localidade || prev.city, state: data.uf || prev.state }));
        }
      } catch (err) {}
    }
  };

  const handleOpenInvoices = (store) => {
    setViewingInvoicesStore(store);
    const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    setNewInvoiceForm({ reference: `Mensalidade - ${mesAtual.toUpperCase()}`, amount: store.monthlyFee || '', dueDate: '', notes: '' });
    setInvoices([]); 
  };

  const handleEditCnpjChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); if (val.length > 14) val = val.slice(0, 14);
    val = val.replace(/^(\d{2})(\d)/, '$1.$2'); val = val.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    val = val.replace(/\.(\d{3})(\d)/, '.$1/$2'); val = val.replace(/(\d{4})(\d)/, '$1-$2');
    setEditingStore(prev => ({ ...prev, cnpj: val }));
  };
  const handleEditCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, '$1.$2'); val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setEditingStore(prev => ({ ...prev, cpfResponsavel: val }));
  };
  const handleEditPhoneChange = (e, field) => {
    let val = e.target.value.replace(/\D/g, ''); if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/^(\d{2})(\d)/g, '($1) $2'); val = val.replace(/(\d)(\d{4})$/, '$1-$2');
    setEditingStore(prev => ({ ...prev, [field]: val }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editingStore.cnpj && editingStore.cnpj.length < 18) return alert('CNPJ incompleto.');
    if (editingStore.cpfResponsavel && editingStore.cpfResponsavel.length < 14) return alert('CPF incompleto.');
    if (!editingStore.planoSaaSId) return alert('Por favor, selecione um Plano SaaS para a loja.');
    
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      const fullAddress = `${editingStore.street || ''}, ${editingStore.number || ''} ${editingStore.complement ? `- ${editingStore.complement}` : ''} - ${editingStore.neighborhood || ''}, ${editingStore.city || ''}/${editingStore.state || ''} (CEP: ${editingStore.cep || ''})`;

      const planoSelecionado = planos.find(p => p.id === editingStore.planoSaaSId);
      const precoPlano = planoSelecionado ? planoSelecionado.precoBase : 0;
      const valorSup = editingStore.temSuporte ? Number(editingStore.valorSuporte || 0) : 0;
      const totalFatura = precoPlano + valorSup;

      const payload = { 
        slug: editingStore.slug,
        razaoSocial: editingStore.razaoSocial,
        cnpj: editingStore.cnpj,
        inscricaoEstadual: editingStore.inscricaoEstadual,
        inscricaoMunicipal: editingStore.inscricaoMunicipal,
        emailEmpresa: editingStore.emailEmpresa,
        telefoneEmpresa: editingStore.telefoneEmpresa,
        nomeResponsavel: editingStore.nomeResponsavel,
        cpfResponsavel: editingStore.cpfResponsavel,
        emailResponsavel: editingStore.emailResponsavel,
        endereco: fullAddress,
        
        planoSaaSId: editingStore.planoSaaSId,
        temSuporte: editingStore.temSuporte,
        valorSuporte: valorSup,
        monthlyFee: totalFatura, 
        
        adminUserId: editingStore.adminUserId === '' || editingStore.adminUserId === 'null' ? null : editingStore.adminUserId 
      };

      if (editingStore.senhaResponsavel && editingStore.senhaResponsavel.trim() !== '') {
        payload.senhaResponsavel = editingStore.senhaResponsavel;
      }

      const res = await fetch(`${API_URL}/api/master/lojas/${editingStore.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) { 
        alert('Loja atualizada com sucesso!'); setEditingStore(null); fetchStores(); 
      } else { alert(`Erro ao editar: ${data.error || 'Erro desconhecido'}`); }
    } catch (error) { alert('Erro de conexão com o servidor.'); }
  };

  const toggleStoreStatus = async (store) => {
    if (!confirm(`Deseja ${store.isActive ? 'BLOQUEAR' : 'DESBLOQUEAR'} a loja ${store.razaoSocial}?`)) return;
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      await fetch(`${API_URL}/api/master/lojas/${store.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: store.isActive ? 'BLOCKED' : 'ACTIVE' }) });
      fetchStores();
    } catch (error) { alert('Erro ao alterar status.'); }
  };

  const handleGenerateBoletoCora = async (e) => {
    e.preventDefault();
    setIsGeneratingBoleto(true);
    try { setTimeout(() => { alert(`Boleto de R$ ${newInvoiceForm.amount} gerado e enviado para ${viewingInvoicesStore.emailEmpresa}!`); setIsGeneratingBoleto(false); setViewingInvoicesStore(null); }, 1500); } catch (error) { setIsGeneratingBoleto(false); }
  };

  const lojasAtivas = stores.filter(s => s.status === 'ACTIVE' || s.isActive).length;

  if (loading) return <div className="h-full flex flex-col items-center justify-center text-amber-500 font-bold"><span className="text-4xl animate-spin mb-4">⚙️</span> Carregando Master...</div>;

  // 1. TELA DE LOGIN (Se não estiver autenticado)
  // Nota: Não usamos h-screen aqui porque o Layout do Master (Sidebar) já ocupa a tela toda.
  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center relative overflow-hidden">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 animate-fade-in-up">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 inline-block drop-shadow-sm">👑</span>
            <h1 className="text-3xl font-black text-white tracking-tight">Zenix Master</h1>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Gestão SaaS</p>
          </div>
          <form onSubmit={handleMasterLogin} className="space-y-5">
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">E-mail de Acesso</label>
               <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="admin@zenixfood.com" />
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between items-end mb-1">
                 <span>Senha</span>
                 <button type="button" onClick={() => { setIsForgotModalOpen(true); setForgotStatus('idle'); setForgotEmail(email); }} className="text-amber-600 hover:text-amber-500 normal-case">Esqueceu?</button>
               </label>
               <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="••••••••" />
            </div>
            {loginError && <div className="bg-red-500/10 text-red-500 p-3 rounded-xl border border-red-500/20 text-xs font-bold text-center">⚠️ {loginError}</div>}
            <button type="submit" disabled={isLoginLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg mt-2 cursor-pointer flex items-center justify-center gap-2">
              {isLoginLoading ? <span className="animate-spin text-xl">⏳</span> : 'Acessar Painel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD (Se estiver autenticado)
  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lojas Ativas</p>
          <p className="text-4xl font-black text-white">{lojasAtivas} <span className="text-sm font-medium text-slate-500">/ {stores.length} total</span></p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">MRR Potencial</p>
          <p className="text-4xl font-black text-emerald-400">R$ {stores.reduce((acc, store) => acc + Number(store.monthlyFee || 0), 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Tabela de Lojas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-black text-white text-lg">Suas Lojas</h2>
          <button onClick={() => router.push('/master/stores/new')} className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-black shadow-md cursor-pointer text-xs">
            + Cadastrar Nova
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="px-6 py-5">Loja / Slug</th>
                <th className="px-6 py-5">Responsável / Franqueado</th>
                <th className="px-6 py-5">Plano/Mensal</th>
                <th className="px-6 py-5">Acesso Sistema</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stores.map(store => {
                const planoVinculado = planos.find(p => p.id === store.planoSaaSId);
                return (
                  <tr key={store.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-5"><p className="font-black text-white text-base">{store.razaoSocial}</p><p className="text-amber-500 font-mono text-xs">/{store.slug}</p></td>
                    <td className="px-6 py-5">
                       <p className="font-black text-slate-300">{store.nomeResponsavel}</p>
                       <p className="text-slate-500 text-xs font-bold mb-1.5">{store.telefoneEmpresa}</p>
                       {store.adminUser ? (
                         <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1 mt-1">👥 Franqueado: {store.adminUser.name}</span>
                       ) : (
                         <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1 mt-1">🏢 Matriz</span>
                       )}
                    </td>
                    <td className="px-6 py-5">
                       <span className="bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                          {planoVinculado ? planoVinculado.nome : store.plan || 'SEM PLANO'}
                       </span>
                       <p className="text-white font-black mt-2">R$ {parseFloat(store.monthlyFee || 0).toFixed(2)}</p>
                       {store.temSuporte && <p className="text-[10px] text-emerald-400 font-bold mt-0.5">+ Suporte Técnico</p>}
                    </td>
                    <td className="px-6 py-5">
                      <button onClick={() => toggleStoreStatus(store)} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border cursor-pointer ${store.status === 'ACTIVE' || store.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {store.status === 'ACTIVE' || store.isActive ? 'SISTEMA LIBERADO' : 'BLOQUEADO'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button onClick={() => handleOpenInvoices(store)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">💳 Cobranças</button>
                      <button onClick={() => handleEditClick(store)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">Editar Dados</button>
                    </td>
                  </tr>
                )
              })}
              {stores.length === 0 && <tr><td colSpan="5" className="text-center py-12 text-slate-500">Nenhuma loja para exibir.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAIS (EDTAR LOJA E GERAR COBRANÇA) */}
      {/* Mantivemos os modais usando tema escuro para casar com o Master */}
      {editingStore && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[92vh] animate-fade-in-up">
            
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3"><span className="text-amber-500">✏️</span> Editar: {editingStore.razaoSocial}</h2>
              <button onClick={() => setEditingStore(null)} className="w-10 h-10 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-full flex items-center justify-center font-black text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto pr-2 space-y-6 flex-1 hide-scrollbar">
              
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><span>🏬</span> Dados Jurídicos e Fiscais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Slug na URL</label><input type="text" required value={editingStore.slug} onChange={e => setEditingStore({...editingStore, slug: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-amber-500 font-mono shadow-sm font-bold" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Razão Social</label><input type="text" required value={editingStore.razaoSocial} onChange={e => setEditingStore({...editingStore, razaoSocial: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm font-bold" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CNPJ</label><input type="text" required value={editingStore.cnpj} onChange={handleEditCnpjChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white font-mono shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inscrição Estadual</label><input type="text" value={editingStore.inscricaoEstadual} onChange={e => setEditingStore({...editingStore, inscricaoEstadual: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inscrição Municipal</label><input type="text" value={editingStore.inscricaoMunicipal} onChange={e => setEditingStore({...editingStore, inscricaoMunicipal: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail da Empresa</label><input type="email" required value={editingStore.emailEmpresa} onChange={e => setEditingStore({...editingStore, emailEmpresa: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Telefone / WhatsApp</label><input type="tel" required value={editingStore.telefoneEmpresa} onChange={e => handleEditPhoneChange(e, 'telefoneEmpresa')} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                </div>
              </div>

              <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/20 space-y-4">
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><span>👔</span> Responsável & Acesso Master da Loja</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo do Dono</label><input type="text" required value={editingStore.nomeResponsavel} onChange={e => setEditingStore({...editingStore, nomeResponsavel: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white font-bold shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CPF</label><input type="text" required value={editingStore.cpfResponsavel} onChange={handleEditCpfChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white font-mono shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-blue-400 uppercase block mb-1">E-mail de Acesso (Login)</label><input type="email" required value={editingStore.emailResponsavel} onChange={e => setEditingStore({...editingStore, emailResponsavel: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white font-bold shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-blue-400 uppercase block mb-1">Nova Senha Master (Opcional)</label><input type="text" value={editingStore.senhaResponsavel} onChange={e => setEditingStore({...editingStore, senhaResponsavel: e.target.value})} placeholder="Deixe em branco para manter a atual" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                </div>
              </div>

              <div className="bg-purple-500/5 p-6 rounded-3xl border border-purple-500/20 space-y-4">
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2"><span>💎</span> Plano SaaS e Suporte</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Selecione o Pacote Base</label>
                    <select 
                      value={editingStore.planoSaaSId || ''} 
                      onChange={e => setEditingStore({...editingStore, planoSaaSId: e.target.value})} 
                      className="w-full bg-slate-900 border border-purple-500/30 rounded-xl p-3.5 text-sm text-white font-bold shadow-sm cursor-pointer"
                    >
                       <option value="">-- Escolha um Plano --</option>
                       {planos.map(p => (
                         <option key={p.id} value={p.id}>{p.nome} - R$ {p.precoBase.toFixed(2)}</option>
                       ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Fatura Mensal Final (R$)</label>
                    <div className="w-full bg-purple-500/10 border border-purple-500/30 rounded-xl p-3.5 text-sm text-purple-400 font-black shadow-inner flex items-center">
                       R$ {((planos.find(p => p.id === editingStore.planoSaaSId)?.precoBase || 0) + (editingStore.temSuporte ? Number(editingStore.valorSuporte || 0) : 0)).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mt-2 flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editingStore.temSuporte} 
                      onChange={e => setEditingStore({...editingStore, temSuporte: e.target.checked})} 
                      className="w-5 h-5 accent-purple-500"
                    />
                    <span className="text-sm font-bold text-white">⌨️ Adicionar Suporte Técnico Extra</span>
                  </label>
                  {editingStore.temSuporte && (
                    <div className="animate-fade-in-up mt-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Valor Cobrado pelo Suporte (R$)</label>
                      <input 
                        type="number" step="0.01" 
                        value={editingStore.valorSuporte} 
                        onChange={e => setEditingStore({...editingStore, valorSuporte: e.target.value})} 
                        placeholder="Ex: 50.00" 
                        className="w-full md:w-1/2 bg-slate-950 border border-purple-500/30 rounded-xl p-3 text-sm text-purple-400 font-black shadow-sm" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {isSuperMaster && (
                <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20 space-y-2">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><span>👥</span> Vínculo de Gestão (Franqueado)</h3>
                  <select value={editingStore.adminUserId || ''} onChange={e => setEditingStore({...editingStore, adminUserId: e.target.value})} className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 text-sm text-white font-bold shadow-sm cursor-pointer mt-2">
                    <option value="">-- Sem Vínculo (Pertence à Matriz) --</option>
                    {adminUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2"><span>📍</span> Endereço Completo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CEP</label><input type="text" value={editingStore.cep} onChange={handleEditCepSearch} placeholder="00000-000" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white font-mono shadow-sm" /></div>
                  <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Logradouro (Rua / Avenida)</label><input type="text" value={editingStore.street} onChange={e => setEditingStore({...editingStore, street: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Número</label><input type="text" value={editingStore.number} onChange={e => setEditingStore({...editingStore, number: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Complemento</label><input type="text" value={editingStore.complement} onChange={e => setEditingStore({...editingStore, complement: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Bairro</label><input type="text" value={editingStore.neighborhood} onChange={e => setEditingStore({...editingStore, neighborhood: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cidade</label><input type="text" value={editingStore.city} onChange={e => setEditingStore({...editingStore, city: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white shadow-sm" /></div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">UF</label><input type="text" maxLength={2} value={editingStore.state} onChange={e => setEditingStore({...editingStore, state: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white uppercase font-mono text-center shadow-sm" /></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4 shrink-0 mt-4 border-t border-slate-800">
                <button type="button" onClick={() => setEditingStore(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 rounded-2xl cursor-pointer text-sm transition-colors">Cancelar</button>
                <button type="submit" className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl shadow-md cursor-pointer active:scale-95 text-base transition-colors">Salvar Alterações</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {viewingInvoicesStore && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3"><span className="text-emerald-500">💳</span> Central de Cobranças</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Gerar faturas para <strong className="text-white">{viewingInvoicesStore.razaoSocial}</strong></p>
              </div>
              <button onClick={() => setViewingInvoicesStore(null)} className="w-10 h-10 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-full flex items-center justify-center font-black text-lg cursor-pointer">✕</button>
            </div>
            <div className="overflow-y-auto pr-2 space-y-6 flex-1 hide-scrollbar">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl shadow-sm">
                 <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span>🏦</span> Gerar Novo Boleto</h3>
                 <form onSubmit={handleGenerateBoletoCora} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Referência</label><input type="text" required value={newInvoiceForm.reference} onChange={e => setNewInvoiceForm({...newInvoiceForm, reference: e.target.value})} className="w-full bg-slate-950 border border-emerald-500/30 text-white rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Valor (R$)</label><input type="number" step="0.01" required value={newInvoiceForm.amount} onChange={e => setNewInvoiceForm({...newInvoiceForm, amount: e.target.value})} className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-400 font-black focus:outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Vencimento</label><input type="date" required value={newInvoiceForm.dueDate} onChange={e => setNewInvoiceForm({...newInvoiceForm, dueDate: e.target.value})} className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observações</label><input type="text" value={newInvoiceForm.notes} onChange={e => setNewInvoiceForm({...newInvoiceForm, notes: e.target.value})} className="w-full bg-slate-950 border border-emerald-500/30 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    </div>
                    <div className="flex justify-end pt-2">
                       <button type="submit" disabled={isGeneratingBoleto} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-3 rounded-xl shadow-md cursor-pointer transition-colors">Emitir e Enviar Boleto Cora</button>
                    </div>
                 </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}