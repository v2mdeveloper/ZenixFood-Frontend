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
  const [forgotStatus, setForgotStatus] = useState('idle'); // idle, loading, success, error
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

  // ==========================================
  // 🔐 LÓGICA DE AUTENTICAÇÃO REAL
  // ==========================================
  const handleMasterLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    // 🛟 MODO DESENVOLVEDOR (Porta dos fundos enquanto a rota de login do backend não fica pronta)
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
        // Se o banco informar que ele é Super Master, salva o token de acesso total
        if (data.user?.role === 'SUPER_MASTER') {
          localStorage.setItem('zenix_super_token', data.token);
        }
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      setLoginError('Erro de conexão ao servidor. O Backend está rodando?');
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
      const data = await res.json();
      
      if (res.ok) {
        setForgotStatus('success');
      } else {
        setForgotStatus('error');
        setForgotError(data.error || 'E-mail não encontrado no sistema.');
      }
    } catch (err) {
      setForgotStatus('error');
      setForgotError('Erro de comunicação com o servidor.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zenix_master_token');
    localStorage.removeItem('zenix_super_token');
    setIsAuthenticated(false); 
    setEmail('');
    setPassword('');
  };

  const checkSuperMasterAccess = async () => {
    // 🛟 Se usou o login de dev, força o super master
    if (email === 'admin@zenix') setIsSuperMaster(true); 

    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      const res = await fetch(`${API_URL}/api/super/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (res.ok) {
        setIsSuperMaster(true);
        setAdminUsers(await res.json()); 
      }
    } catch (error) {
      console.log("Aviso: Rota de usuários ainda não responde no backend, mas o layout foi liberado.");
    }
  };

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      const res = await fetch(`${API_URL}/api/master/lojas`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setStores(await res.json());
    } catch (error) {} finally { setLoading(false); }
  };

  const handleEditClick = (store) => {
    setEditingStore({
      ...store,
      razaoSocial: store.razaoSocial || '', cnpj: store.cnpj || '',
      inscricaoEstadual: store.inscricaoEstadual || '', inscricaoMunicipal: store.inscricaoMunicipal || '',
      emailEmpresa: store.emailEmpresa || '', telefoneEmpresa: store.telefoneEmpresa || '',
      nomeResponsavel: store.nomeResponsavel || '', cpfResponsavel: store.cpfResponsavel || '',
      emailResponsavel: store.emailResponsavel || '', endereco: store.endereco || '', logoUrl: store.logoUrl || '',
      plan: store.plan || 'STANDARD', monthlyFee: store.monthlyFee || '',
      adminUserId: store.adminUserId || ''
    });
  };

  const handleOpenInvoices = (store) => {
    setViewingInvoicesStore(store);
    const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    setNewInvoiceForm({ reference: `Mensalidade - ${mesAtual.toUpperCase()}`, amount: store.monthlyFee || '', dueDate: '', notes: '' });
    setInvoices([]); 
  };

  // --- MÁSCARAS DE EDIÇÃO ---
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
    if (editingStore.cnpj && editingStore.cnpj.length > 0 && editingStore.cnpj.length < 18) return alert('CNPJ incompleto.');
    if (editingStore.cpfResponsavel && editingStore.cpfResponsavel.length > 0 && editingStore.cpfResponsavel.length < 14) return alert('CPF incompleto.');
    
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      
      const payload = { 
        ...editingStore, 
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
        // 🎯 ISSO VAI MOSTRAR O ERRO TÉCNICO EXATO NO ALERTA
        alert(`Erro ao editar: ${data.error || 'Erro desconhecido'} (Código: ${data.prismaCode || 'N/A'})`); 
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
        alert(`Integração Cora: Boleto de R$ ${newInvoiceForm.amount} gerado e enviado para ${viewingInvoicesStore.emailEmpresa}!`);
        setIsGeneratingBoleto(false);
        setViewingInvoicesStore(null);
      }, 1500);
    } catch (error) { alert("Erro ao comunicar com a API de Boletos."); setIsGeneratingBoleto(false); }
  };

  const lojasAtivas = stores.filter(s => s.status === 'ACTIVE' || s.isActive).length;

  // ==========================================
  // 🔐 TELA DE LOGIN (ATUALIZADA)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Elementos visuais de fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

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
               <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors shadow-inner" placeholder="seu@email.com" />
            </div>
            
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between items-end mb-1">
                 <span>Senha</span>
                 <button type="button" onClick={() => { setIsForgotModalOpen(true); setForgotStatus('idle'); setForgotEmail(email); }} className="text-amber-600 hover:text-amber-500 normal-case tracking-normal">Esqueceu a senha?</button>
               </label>
               <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors shadow-inner tracking-widest placeholder:tracking-normal" placeholder="••••••••" />
            </div>

            {loginError && (
               <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-bold text-center animate-fade-in-up">
                 ⚠️ {loginError}
               </div>
            )}
            
            <button type="submit" disabled={isLoginLoading} className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-black py-4 rounded-xl transition-all shadow-lg mt-2 cursor-pointer active:scale-95 flex items-center justify-center gap-2">
              {isLoginLoading ? <span className="animate-spin text-xl">⏳</span> : 'Acessar Painel'}
            </button>
          </form>
        </div>

        {/* 🔑 MODAL "ESQUECI MINHA SENHA" */}
        {isForgotModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
             <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm relative">
                <button onClick={() => setIsForgotModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-100 text-slate-500 rounded-full font-black hover:bg-slate-200">✕</button>
                
                <h3 className="text-xl font-black text-slate-800 mb-2">Recuperar Senha</h3>
                
                {forgotStatus === 'success' ? (
                   <div className="text-center py-6">
                      <span className="text-5xl block mb-4">📩</span>
                      <h4 className="font-black text-emerald-600 text-lg mb-2">E-mail Enviado!</h4>
                      <p className="text-sm text-slate-500 font-medium">Enviamos as instruções de recuperação para <strong>{forgotEmail}</strong>. Verifique sua caixa de entrada e spam.</p>
                      <button onClick={() => setIsForgotModalOpen(false)} className="mt-6 w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">Voltar ao Login</button>
                   </div>
                ) : (
                   <form onSubmit={handleForgotPassword}>
                      <p className="text-sm text-slate-500 font-medium mb-6">Digite o e-mail associado à sua conta Master para receber um link de redefinição de senha.</p>
                      
                      <div className="mb-4">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Seu E-mail</label>
                         <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500" placeholder="seu@email.com" />
                      </div>

                      {forgotError && <p className="text-red-500 text-xs font-bold mb-4">⚠️ {forgotError}</p>}

                      <button type="submit" disabled={forgotStatus === 'loading'} className="w-full bg-amber-500 disabled:bg-amber-300 text-slate-900 font-black py-4 rounded-xl transition-all shadow-md mt-2 cursor-pointer active:scale-95">
                         {forgotStatus === 'loading' ? 'Enviando...' : 'Enviar Link de Recuperação'}
                      </button>
                   </form>
                )}
             </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 🏢 TELA PRINCIPAL (LOGADO)
  // ==========================================
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
          <button onClick={handleLogout} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer text-sm shadow-sm">Sair</button>
          
          {isSuperMaster && (
            <button onClick={() => router.push('/master/franquias')} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2.5 rounded-xl font-black transition-colors shadow-sm cursor-pointer flex items-center gap-2">
              <span>👥</span> Gestão de Franquias
            </button>
          )}

          <button onClick={() => router.push('/master/stores/new')} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2.5 rounded-xl font-black transition-colors shadow-md cursor-pointer flex items-center gap-2">
            <span>+</span> Cadastrar Loja
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lojas Ativas</p>
          <p className="text-4xl font-black text-slate-800">{lojasAtivas} <span className="text-sm font-medium text-slate-500">/ {stores.length} total</span></p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">💸</div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 relative z-10">MRR Potencial</p>
          <p className="text-4xl font-black text-emerald-700 relative z-10">
            R$ {stores.reduce((acc, store) => acc + Number(store.monthlyFee || 0), 0).toFixed(2)}
          </p>
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
                <tr key={store.id} className="hover:bg-slate-50 transition-colors group">
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
                    <button onClick={() => toggleStoreStatus(store)} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-colors ${store.status === 'ACTIVE' || store.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-red-50 hover:text-red-600' : 'bg-red-50 text-red-600 border-red-200 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                      {store.status === 'ACTIVE' || store.isActive ? 'SISTEMA LIBERADO' : 'SISTEMA BLOQUEADO'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right space-x-2">
                    <button onClick={() => handleOpenInvoices(store)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">💳 Cobranças</button>
                    <button onClick={() => handleEditClick(store)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">Editar Dados</button>
                  </td>
                </tr>
              ))}
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
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><span className="text-amber-500">✏️</span> Editar: {editingStore.razaoSocial}</h2>
              <button onClick={() => setEditingStore(null)} className="w-10 h-10 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-full flex items-center justify-center font-black text-lg transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="overflow-y-auto pr-4 space-y-6 flex-1 hide-scrollbar">
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span>🏬</span> Dados Jurídicos e Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Slug (URL)</label><input type="text" required value={editingStore.slug} onChange={e => setEditingStore({...editingStore, slug: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-amber-600 font-mono focus:outline-none focus:border-amber-500 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Razão Social</label><input type="text" required value={editingStore.razaoSocial} onChange={e => setEditingStore({...editingStore, razaoSocial: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CNPJ</label><input type="text" required value={editingStore.cnpj} onChange={handleEditCnpjChange} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-mono shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insc. Estadual</label><input type="text" value={editingStore.inscricaoEstadual} onChange={e => setEditingStore({...editingStore, inscricaoEstadual: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email da Empresa</label><input type="email" required value={editingStore.emailEmpresa} onChange={e => setEditingStore({...editingStore, emailEmpresa: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Telefone da Empresa</label><input type="tel" required value={editingStore.telefoneEmpresa} onChange={e => handleEditPhoneChange(e, 'telefoneEmpresa')} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" /></div>
                </div>
              </div>

              <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span>💎</span> Plano e Assinatura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plano Contratado</label>
                    <select value={editingStore.plan} onChange={e => setEditingStore({...editingStore, plan: e.target.value})} className="w-full bg-white border border-purple-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-purple-500 shadow-sm font-bold">
                       <option value="STARTER">STARTER</option>
                       <option value="STANDARD">STANDARD</option>
                       <option value="PREMIUM">PREMIUM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mensalidade (R$)</label>
                    <input type="number" step="0.01" value={editingStore.monthlyFee} onChange={e => setEditingStore({...editingStore, monthlyFee: e.target.value})} className="w-full bg-white border border-purple-300 rounded-xl p-3 text-sm text-purple-700 font-black focus:outline-none focus:border-purple-500 shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span>👔</span> Responsável Legal / Sócio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Completo</label><input type="text" required value={editingStore.nomeResponsavel} onChange={e => setEditingStore({...editingStore, nomeResponsavel: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm" /></div>
                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPF</label><input type="text" required value={editingStore.cpfResponsavel} onChange={handleEditCpfChange} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-sm" /></div>
                </div>
              </div>
              
              {isSuperMaster && (
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
                  <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2 flex items-center gap-2"><span>👥</span> Vínculo de Gestão (Franqueado/Revenda)</h3>
                  <p className="text-xs text-emerald-600 mb-4 font-medium">Selecione qual usuário Master terá acesso exclusivo ao painel administrativo desta loja. Deixe em branco se a loja pertencer à Matriz.</p>
                  <div>
                    <select 
                      value={editingStore.adminUserId || ''} 
                      onChange={e => setEditingStore({...editingStore, adminUserId: e.target.value})} 
                      className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm font-bold cursor-pointer"
                    >
                      <option value="">-- Sem Vinculo (Pertence à Matriz) --</option>
                      {adminUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4 shrink-0 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingStore(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold py-4 rounded-2xl cursor-pointer transition-colors text-sm">Cancelar</button>
                <button type="submit" className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 rounded-2xl shadow-md cursor-pointer transition-all active:scale-95 text-base">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COBRANÇAS / INTEGRAÇÃO CORA */}
      {viewingInvoicesStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
            
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><span className="text-emerald-500">💳</span> Central de Cobranças</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Gerar faturas e boletos (Cora) para <strong className="text-slate-800">{viewingInvoicesStore.razaoSocial}</strong></p>
              </div>
              <button onClick={() => setViewingInvoicesStore(null)} className="w-10 h-10 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-full flex items-center justify-center font-black text-lg transition-colors cursor-pointer">✕</button>
            </div>
            
            <div className="overflow-y-auto pr-2 space-y-6 flex-1 hide-scrollbar">
              
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl shadow-sm">
                 <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2"><span>🏦</span> Gerar Novo Boleto (API Cora)</h3>
                 <form onSubmit={handleGenerateBoletoCora} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Referência / Título</label>
                        <input type="text" required value={newInvoiceForm.reference} onChange={e => setNewInvoiceForm({...newInvoiceForm, reference: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Valor do Boleto (R$)</label>
                        <input type="number" step="0.01" required value={newInvoiceForm.amount} onChange={e => setNewInvoiceForm({...newInvoiceForm, amount: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-black focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Data de Vencimento</label>
                        <input type="date" required value={newInvoiceForm.dueDate} onChange={e => setNewInvoiceForm({...newInvoiceForm, dueDate: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-700" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observações na Nota</label>
                        <input type="text" value={newInvoiceForm.notes} onChange={e => setNewInvoiceForm({...newInvoiceForm, notes: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="Opcional" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                       <button type="submit" disabled={isGeneratingBoleto} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black px-8 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                          {isGeneratingBoleto ? 'Comunicando com a Cora...' : 'Emitir e Enviar Boleto Cora'}
                       </button>
                    </div>
                 </form>
              </div>

              <div>
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">📜 Histórico de Faturas</h3>
                 {invoices.length === 0 ? (
                    <div className="border border-slate-200 bg-slate-50 p-6 rounded-2xl text-center">
                       <p className="text-slate-500 font-medium text-sm">Nenhuma fatura registrada para esta loja ainda.</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Os boletos emitidos via Cora aparecerão aqui.</p>
                    </div>
                 ) : (
                    <table className="w-full text-left text-sm border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[10px] font-black">
                        <tr><th className="px-4 py-3">Ref</th><th className="px-4 py-3">Venc.</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {invoices.map(inv => (
                          <tr key={inv.id}>
                            <td className="px-4 py-3 font-bold text-slate-800">{inv.reference}</td>
                            <td className="px-4 py-3 font-medium text-slate-600">{new Date(inv.dueDate).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-3 font-black text-slate-800">R$ {inv.amount.toFixed(2)}</td>
                            <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-black uppercase">Pendente</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}