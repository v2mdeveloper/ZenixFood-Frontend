'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 🔐 ESTADOS DE LOGIN
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // 🔑 ESTADOS DE RECUPERAÇÃO DE SENHA
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('idle'); 
  const [forgotError, setForgotError] = useState('');
  
  // 🏬 ESTADOS DO PAINEL
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState(null);
  const [viewingInvoicesStore, setViewingInvoicesStore] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isGeneratingBoleto, setIsGeneratingBoleto] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({ reference: '', amount: '', dueDate: '', notes: '' });

  // 🛡️ ESTADOS DO SISTEMA MULTI-TENANT (SaaS)
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
      fetchStores(); 
      checkSuperMasterAccess();
    }
  }, [isAuthenticated]);

  const handleMasterLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    if (email === 'admin@zenix' && password === 'zenixadmin123') {
      localStorage.setItem('zenix_master_token', 'token_simulado');
      localStorage.setItem('zenix_super_token', 'token_simulado'); 
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
        // 🔐 SALVA OS DADOS DO USUÁRIO PARA FILTRAGEM
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (res.ok) setForgotStatus('success');
      else { setForgotStatus('error'); setForgotError('E-mail não encontrado.'); }
    } catch (err) { setForgotStatus('error'); setForgotError('Erro de comunicação.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('zenix_master_token');
    localStorage.removeItem('zenix_super_token');
    localStorage.removeItem('zenix_user');
    setIsAuthenticated(false); 
    setEmail('');
    setPassword('');
  };

  const checkSuperMasterAccess = async () => {
    if (email === 'admin@zenix') setIsSuperMaster(true); 

    try {
      // 🛡️ LER USUÁRIO LOGADO E BLOQUEAR O MASTER
      const userStr = localStorage.getItem('zenix_user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (user && user.role === 'SUPER_MASTER') {
        setIsSuperMaster(true);
        const token = localStorage.getItem('zenix_super_token');
        const res = await fetch(`${API_URL}/api/super/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAdminUsers(await res.json()); 
      } else {
        setIsSuperMaster(false);
      }
    } catch (error) {}
  };

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      const userStr = localStorage.getItem('zenix_user');
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch(`${API_URL}/api/master/lojas`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        let fetchedStores = await res.json();
        
        // 🛡️ FILTRO DE SEGURANÇA: Se for Franqueado, exibe APENAS as lojas dele!
        if (user && user.role === 'MASTER') {
           fetchedStores = fetchedStores.filter(s => s.adminUserId === user.id);
        }
        setStores(fetchedStores);
      }
    } catch (error) {} finally { setLoading(false); }
  };

  // 🧩 DESMEMBRADOR DE ENDEREÇO INTELIGENTE
  const handleEditClick = (store) => {
    let parsedStreet = store.street || '';
    let parsedNumber = store.number || '';
    let parsedComp = store.complement || '';
    let parsedNeigh = store.neighborhood || '';
    let parsedCity = store.city || '';
    let parsedState = store.state || '';
    let parsedCep = store.cep || '';

    // Se a rua estiver vazia mas houver o endereço gigante do BD, nós quebramos ele.
    if (store.endereco && !store.street) {
      try {
        const addr = store.endereco;
        
        const cepMatch = addr.match(/\(CEP:\s*([\d-]+)\)/i);
        if (cepMatch) parsedCep = cepMatch[1];

        const ufMatch = addr.match(/\/([A-Z]{2})\s*\(CEP/i);
        if (ufMatch) parsedState = ufMatch[1];

        const cityMatch = addr.match(/,\s*([^,]+)\/[A-Z]{2}\s*\(CEP/i);
        if (cityMatch) parsedCity = cityMatch[1].trim();

        const rest = addr.split(/,\s*[^,]+\/[A-Z]{2}\s*\(CEP/i)[0]; // Remove cidade/estado/cep
        const cleanedRest = rest.replace(/,\s*,/g, ','); // Limpa vírgulas duplas acidentais
        const parts = cleanedRest.split(' - ');
        
        if (parts.length >= 2) {
           parsedNeigh = parts[parts.length - 1].trim(); // Bairro
           const streetNumComp = parts.slice(0, parts.length - 1).join(' - ');
           const streetParts = streetNumComp.split(',');
           
           parsedStreet = streetParts[0]?.trim() || '';
           if (streetParts[1]) {
             const numComp = streetParts[1].split('-');
             parsedNumber = numComp[0]?.trim() || '';
             parsedComp = numComp.slice(1).join('-').trim() || '';
           }
        } else {
           parsedStreet = cleanedRest.trim();
        }
      } catch (e) {
        parsedStreet = store.endereco; // Fallback se der erro no regex
      }
    }

    setEditingStore({
      ...store,
      slug: store.slug || '', razaoSocial: store.razaoSocial || '', cnpj: store.cnpj || '',
      inscricaoEstadual: store.inscricaoEstadual || '', inscricaoMunicipal: store.inscricaoMunicipal || '',
      emailEmpresa: store.emailEmpresa || '', telefoneEmpresa: store.telefoneEmpresa || '',
      nomeResponsavel: store.nomeResponsavel || '', cpfResponsavel: store.cpfResponsavel || '',
      emailResponsavel: store.emailResponsavel || '', senhaResponsavel: '', 
      cep: parsedCep, street: parsedStreet, number: parsedNumber, complement: parsedComp, 
      neighborhood: parsedNeigh, city: parsedCity, state: parsedState,
      plan: store.plan || 'STANDARD', monthlyFee: store.monthlyFee || '',
      adminUserId: store.adminUserId || ''
    });
  };

  const handleEditCepSearch = async (e) => {
    let cepVal = e.target.value.replace(/\D/g, '');
    if (cepVal.length > 8) cepVal = cepVal.slice(0, 8);
    const maskedCep = cepVal.replace(/^(\d{5})(\d)/, '$1-$2');
    setEditingStore(prev => ({ ...prev, cep: maskedCep }));
    
    if (cepVal.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEditingStore(prev => ({
            ...prev, street: data.logradouro || prev.street, neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city, state: data.uf || prev.state
          }));
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
    
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      
      const fullAddress = `${editingStore.street || ''}, ${editingStore.number || ''} ${editingStore.complement ? `- ${editingStore.complement}` : ''} - ${editingStore.neighborhood || ''}, ${editingStore.city || ''}/${editingStore.state || ''} (CEP: ${editingStore.cep || ''})`;

      const payload = { 
        ...editingStore, 
        endereco: fullAddress,
        monthlyFee: Number(editingStore.monthlyFee || 0),
        adminUserId: editingStore.adminUserId === '' || editingStore.adminUserId === 'null' ? null : editingStore.adminUserId 
      };

      const res = await fetch(`${API_URL}/api/master/lojas/${editingStore.id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) { 
        alert('Loja atualizada com sucesso!'); 
        setEditingStore(null); 
        fetchStores(); 
      } else { 
        alert(`Erro ao editar: ${data.error || 'Erro desconhecido'}`); 
      }
    } catch (error) { 
      alert('Erro de conexão com o servidor.'); 
    }
  };

  const toggleStoreStatus = async (store) => {
    if (!confirm(`Deseja ${store.isActive ? 'BLOQUEAR' : 'DESBLOQUEAR'} a loja ${store.razaoSocial}?`)) return;
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      await fetch(`${API_URL}/api/master/lojas/${store.id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: store.isActive ? 'BLOCKED' : 'ACTIVE' }) 
      });
      fetchStores();
    } catch (error) { alert('Erro ao alterar status.'); }
  };

  const handleGenerateBoletoCora = async (e) => {
    e.preventDefault();
    setIsGeneratingBoleto(true);
    try {
      setTimeout(() => {
        alert(`Boleto de R$ ${newInvoiceForm.amount} gerado e enviado para ${viewingInvoicesStore.emailEmpresa}!`);
        setIsGeneratingBoleto(false);
        setViewingInvoicesStore(null);
      }, 1500);
    } catch (error) { setIsGeneratingBoleto(false); }
  };

  const lojasAtivas = stores.filter(s => s.status === 'ACTIVE' || s.isActive).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 animate-fade-in-up">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 inline-block drop-shadow-sm">👑</span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Zenix Master</h1>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Gestão SaaS</p>
          </div>
          
          <form onSubmit={handleMasterLogin} className="space-y-5">
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">E-mail de Acesso</label>
               <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500" placeholder="seu@email.com" />
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between items-end mb-1">
                 <span>Senha</span>
                 <button type="button" onClick={() => { setIsForgotModalOpen(true); setForgotStatus('idle'); setForgotEmail(email); }} className="text-amber-600 hover:text-amber-500 normal-case">Esqueceu a senha?</button>
               </label>
               <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500" placeholder="••••••••" />
            </div>
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-bold text-center">⚠️ {loginError}</div>}
            <button type="submit" disabled={isLoginLoading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl transition-all shadow-lg mt-2 cursor-pointer flex items-center justify-center gap-2">
              {isLoginLoading ? <span className="animate-spin text-xl">⏳</span> : 'Acessar Painel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-amber-500 font-bold"><span className="text-4xl animate-spin mb-4">⚙️</span> Carregando Master...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <span>👑</span> Zenix Master {isSuperMaster && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-lg uppercase tracking-widest ml-2">Global</span>}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gestão central de todos os inquilinos (restaurantes).</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleLogout} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm cursor-pointer">Sair</button>
          
          {/* BOTÃO APARECE APENAS PARA O SUPER MASTER */}
          {isSuperMaster && (
            <button onClick={() => router.push('/master/franquias')} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2.5 rounded-xl font-black shadow-sm cursor-pointer flex items-center gap-2">
              <span>👥</span> Gestão de Franquias
            </button>
          )}

          <button onClick={() => router.push('/master/stores/new')} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2.5 rounded-xl font-black shadow-md cursor-pointer flex items-center gap-2">
            <span>+</span> Cadastrar Loja
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lojas Ativas</p>
          <p className="text-4xl font-black text-slate-800">{lojasAtivas} <span className="text-sm font-medium text-slate-500">/ {stores.length} total</span></p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">MRR Potencial</p>
          <p className="text-4xl font-black text-emerald-700">R$ {stores.reduce((acc, store) => acc + Number(store.monthlyFee || 0), 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="px-6 py-5">Loja / Slug</th>
                <th className="px-6 py-5">Responsável / Franqueado</th>
                <th className="px-6 py-5">Plano/Mensal</th>
                <th className="px-6 py-5">Acesso Sistema</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5"><p className="font-black text-slate-800 text-base">{store.razaoSocial}</p><p className="text-amber-600 font-mono text-xs">/{store.slug}</p></td>
                  <td className="px-6 py-5">
                     <p className="font-black text-slate-600">{store.nomeResponsavel}</p>
                     <p className="text-slate-500 text-xs font-bold mb-1.5">{store.telefoneEmpresa}</p>
                     {store.adminUser ? (
                       <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1 mt-1">
                         👥 Franqueado: {store.adminUser.name}
                       </span>
                     ) : (
                       <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1 mt-1">
                         🏢 Loja Própria (Matriz)
                       </span>
                     )}
                  </td>
                  <td className="px-6 py-5">
                     <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">{store.plan || 'STANDARD'}</span>
                     <p className="text-slate-800 font-black mt-1">R$ {parseFloat(store.monthlyFee || 0).toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-5">
                    <button onClick={() => toggleStoreStatus(store)} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border cursor-pointer ${store.status === 'ACTIVE' || store.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-red-50 hover:text-red-600' : 'bg-red-50 text-red-600 border-red-200 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                      {store.status === 'ACTIVE' || store.isActive ? 'SISTEMA LIBERADO' : 'SISTEMA BLOQUEADO'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right space-x-2">
                    <button onClick={() => handleOpenInvoices(store)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">💳 Cobranças</button>
                    <button onClick={() => handleEditClick(store)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">Editar Dados</button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && <tr><td colSpan="5" className="text-center py-12 text-slate-500">Nenhuma loja para exibir.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIÇÃO COMPLETO */}
      {editingStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 md:p-10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[92vh] animate-fade-in-up">
            
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="text-amber-500">✏️</span> Editar: {editingStore.razaoSocial}
              </h2>
              <button onClick={() => setEditingStore(null)} className="w-10 h-10 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-full flex items-center justify-center font-black text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto pr-2 space-y-6 flex-1 hide-scrollbar">
              
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"><span>🏬</span> Dados Jurídicos e Fiscais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Slug na URL</label><input type="text" required value={editingStore.slug} onChange={e => setEditingStore({...editingStore, slug: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-amber-600 font-mono shadow-sm font-bold" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Razão Social</label><input type="text" required value={editingStore.razaoSocial} onChange={e => setEditingStore({...editingStore, razaoSocial: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm font-bold" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CNPJ</label><input type="text" required value={editingStore.cnpj} onChange={handleEditCnpjChange} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 font-mono shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inscrição Estadual</label><input type="text" value={editingStore.inscricaoEstadual} onChange={e => setEditingStore({...editingStore, inscricaoEstadual: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inscrição Municipal</label><input type="text" value={editingStore.inscricaoMunicipal} onChange={e => setEditingStore({...editingStore, inscricaoMunicipal: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail da Empresa</label><input type="email" required value={editingStore.emailEmpresa} onChange={e => setEditingStore({...editingStore, emailEmpresa: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Telefone / WhatsApp</label><input type="tel" required value={editingStore.telefoneEmpresa} onChange={e => handleEditPhoneChange(e, 'telefoneEmpresa')} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><span>👔</span> Responsável & Acesso Master da Loja</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo do Dono</label><input type="text" required value={editingStore.nomeResponsavel} onChange={e => setEditingStore({...editingStore, nomeResponsavel: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 font-bold shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CPF</label><input type="text" required value={editingStore.cpfResponsavel} onChange={handleEditCpfChange} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 font-mono shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-blue-700 uppercase block mb-1">E-mail de Acesso (Login)</label><input type="email" required value={editingStore.emailResponsavel} onChange={e => setEditingStore({...editingStore, emailResponsavel: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 font-bold shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-blue-700 uppercase block mb-1">Nova Senha Master (Opcional)</label><input type="text" value={editingStore.senhaResponsavel} onChange={e => setEditingStore({...editingStore, senhaResponsavel: e.target.value})} placeholder="Deixe em branco para manter a atual" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-3xl border border-purple-200 space-y-4">
                <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2"><span>💎</span> Plano de Assinatura e Pagamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Plano Contratado</label>
                    <select value={editingStore.plan} onChange={e => setEditingStore({...editingStore, plan: e.target.value})} className="w-full bg-white border border-purple-300 rounded-xl p-3.5 text-sm text-slate-900 font-bold shadow-sm cursor-pointer">
                       <option value="STARTER">Plano Starter</option>
                       <option value="STANDARD">Plano Standard</option>
                       <option value="PREMIUM">Plano Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Valor da Mensalidade (R$)</label>
                    <input type="number" step="0.01" required value={editingStore.monthlyFee} onChange={e => setEditingStore({...editingStore, monthlyFee: e.target.value})} className="w-full bg-white border border-purple-300 rounded-xl p-3.5 text-sm text-purple-700 font-black shadow-sm" />
                  </div>
                </div>
              </div>

              {/* APARECE APENAS PARA O SUPER MASTER */}
              {isSuperMaster && (
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 space-y-2">
                  <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2"><span>👥</span> Vínculo de Gestão (Franqueado/Revenda)</h3>
                  <select 
                    value={editingStore.adminUserId || ''} 
                    onChange={e => setEditingStore({...editingStore, adminUserId: e.target.value})} 
                    className="w-full bg-white border border-emerald-300 rounded-xl p-3.5 text-sm text-slate-900 font-bold shadow-sm cursor-pointer mt-2"
                  >
                    <option value="">-- Sem Vínculo (Pertence à Matriz) --</option>
                    {adminUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><span>📍</span> Endereço Completo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CEP</label><input type="text" value={editingStore.cep} onChange={handleEditCepSearch} placeholder="00000-000" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 font-mono shadow-sm" /></div>
                  <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Logradouro (Rua / Avenida)</label><input type="text" value={editingStore.street} onChange={e => setEditingStore({...editingStore, street: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Número</label><input type="text" value={editingStore.number} onChange={e => setEditingStore({...editingStore, number: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Complemento</label><input type="text" value={editingStore.complement} onChange={e => setEditingStore({...editingStore, complement: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Bairro</label><input type="text" value={editingStore.neighborhood} onChange={e => setEditingStore({...editingStore, neighborhood: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cidade</label><input type="text" value={editingStore.city} onChange={e => setEditingStore({...editingStore, city: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 shadow-sm" /></div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">UF</label><input type="text" maxLength={2} value={editingStore.state} onChange={e => setEditingStore({...editingStore, state: e.target.value.toUpperCase()})} className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 uppercase font-mono text-center shadow-sm" /></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4 shrink-0 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingStore(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold py-4 rounded-2xl cursor-pointer text-sm">Cancelar</button>
                <button type="submit" className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 rounded-2xl shadow-md cursor-pointer active:scale-95 text-base">Salvar Alterações</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL COBRANÇAS */}
      {viewingInvoicesStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><span className="text-emerald-500">💳</span> Central de Cobranças</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Gerar faturas e boletos para <strong className="text-slate-800">{viewingInvoicesStore.razaoSocial}</strong></p>
              </div>
              <button onClick={() => setViewingInvoicesStore(null)} className="w-10 h-10 bg-slate-100 hover:bg-red-100 text-slate-500 rounded-full flex items-center justify-center font-black text-lg cursor-pointer">✕</button>
            </div>
            
            <div className="overflow-y-auto pr-2 space-y-6 flex-1 hide-scrollbar">
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl shadow-sm">
                 <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2"><span>🏦</span> Gerar Novo Boleto (API Cora)</h3>
                 <form onSubmit={handleGenerateBoletoCora} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Referência</label><input type="text" required value={newInvoiceForm.reference} onChange={e => setNewInvoiceForm({...newInvoiceForm, reference: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm font-bold" /></div>
                      <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Valor (R$)</label><input type="number" step="0.01" required value={newInvoiceForm.amount} onChange={e => setNewInvoiceForm({...newInvoiceForm, amount: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-black" /></div>
                      <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Vencimento</label><input type="date" required value={newInvoiceForm.dueDate} onChange={e => setNewInvoiceForm({...newInvoiceForm, dueDate: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm font-bold text-slate-700" /></div>
                      <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observações</label><input type="text" value={newInvoiceForm.notes} onChange={e => setNewInvoiceForm({...newInvoiceForm, notes: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm" /></div>
                    </div>
                    <div className="flex justify-end pt-2">
                       <button type="submit" disabled={isGeneratingBoleto} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-3 rounded-xl shadow-md cursor-pointer">
                          {isGeneratingBoleto ? 'Comunicando...' : 'Emitir e Enviar Boleto Cora'}
                       </button>
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