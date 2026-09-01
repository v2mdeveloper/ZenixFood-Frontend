'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterDashboard() {
  const router = useRouter();
  
  // Estados de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados do Dashboard
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState(null);

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  // Verifica se já tem o token master salvo no navegador
  useEffect(() => {
    if (localStorage.getItem('zenix_master_token') === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  // Busca as lojas apenas se estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchStores();
    }
  }, [isAuthenticated]);

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
      // Neste mock, como a rota é interna, passamos um token genérico ou o que seu backend exigir
      const res = await fetch(`${API_URL}/api/master/stores`, {
        headers: { 'Authorization': `Bearer zenix_master` }
      });
      const data = await res.json();
      if (res.ok) {
        setStores(data);
      }
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const payload = {
      ...editingStore,
      monthlyFee: parseFloat(editingStore.monthlyFee) || 0
    };

    try {
      const res = await fetch(`${API_URL}/api/master/stores/${editingStore.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer zenix_master`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Loja atualizada com sucesso!');
        setEditingStore(null);
        fetchStores();
      } else {
        alert(data.error || 'Erro ao atualizar loja.');
      }
    } catch (error) {
      alert('Erro de conexão ao salvar edições.');
    }
  };

  const toggleStoreStatus = async (store) => {
    if (!confirm(`Deseja ${store.status === 'ACTIVE' ? 'BLOQUEAR' : 'DESBLOQUEAR'} o acesso ao sistema para a loja ${store.name}?`)) return;
    
    const newStatus = store.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    
    try {
      await fetch(`${API_URL}/api/master/stores/${store.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer zenix_master`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchStores();
    } catch (error) {
      alert('Erro ao alterar status.');
    }
  };

  // --- CÁLCULOS DOS CARDS DE DASHBOARD ---
  const lojasAtivas = stores.filter(s => s.status === 'ACTIVE').length;
  
  const totalReceber = stores
    .filter(s => s.status === 'ACTIVE')
    .reduce((acc, s) => acc + (parseFloat(s.monthlyFee) || 0), 0);
    
  const totalAtrasado = stores
    .filter(s => s.subscriptionStatus === 'OVERDUE')
    .reduce((acc, s) => acc + (parseFloat(s.monthlyFee) || 0), 0);

  const getStatusLabel = (status) => {
    const labels = {
      'TRIAL': { text: 'Período de Teste', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      'ACTIVE': { text: 'Pagamento em Dia', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      'OVERDUE': { text: 'Inadimplente', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
      'BLOCKED': { text: 'Cancelado/Bloqueado', style: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
    };
    return labels[status] || labels['TRIAL'];
  };

  // ==========================================
  // TELA DE LOGIN DO MASTER
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black">
        <div className="bg-[#121212] border border-white/5 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          
          <div className="text-center mb-8">
            <span className="text-4xl mb-3 inline-block animate-pulse">⚡</span>
            <h1 className="text-2xl font-black text-white">Zenix Master</h1>
            <p className="text-slate-500 text-xs mt-1">Gestão Administrativa SaaS</p>
          </div>

          <form onSubmit={handleMasterLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                required 
                value={masterPassword} 
                onChange={(e) => setMasterPassword(e.target.value)} 
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm text-center text-white focus:outline-none focus:border-amber-500 tracking-widest placeholder:tracking-normal" 
                placeholder="Senha Master" 
              />
            </div>
            {loginError && <p className="text-red-500 text-xs text-center font-bold">{loginError}</p>}
            
            <button 
              type="submit" 
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20 mt-2 cursor-pointer active:scale-95"
            >
              Acessar Backoffice
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD MASTER (AUTENTICADO)
  // ==========================================
  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-amber-500 font-bold"><span className="text-4xl animate-spin mb-4">⚙️</span> Carregando Master...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans p-6 md:p-10">
      
      {/* CABEÇALHO DO MASTER */}
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span>⚡</span> Zenix Master
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gestão central de todos os inquilinos (restaurantes).</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleLogout} 
            className="bg-white/5 hover:bg-white/10 text-slate-400 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer text-sm"
          >
            Sair
          </button>
          <button 
            onClick={() => router.push('/master/stores/new')} 
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-black transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            + Cadastrar Loja
          </button>
        </div>
      </div>

      {/* CARDS DE INDICADORES FINANCEIROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lojas Ativas</p>
          <p className="text-4xl font-black text-white">{lojasAtivas} <span className="text-sm font-medium text-slate-600">/ {stores.length} total</span></p>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">💰</div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 relative z-10">Receita Mensal Recorrente</p>
          <p className="text-4xl font-black text-emerald-400 relative z-10">R$ {totalReceber.toFixed(2)}</p>
        </div>
        <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">⚠️</div>
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 relative z-10">Total Inadimplente (Atrasados)</p>
          <p className="text-4xl font-black text-red-400 relative z-10">R$ {totalAtrasado.toFixed(2)}</p>
        </div>
      </div>

      {/* LISTAGEM DAS LOJAS */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a0a0a] border-b border-white/5 text-slate-500 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="px-6 py-5">Loja / Slug</th>
                <th className="px-6 py-5">Plano & Valor</th>
                <th className="px-6 py-5">Status Pgto</th>
                <th className="px-6 py-5">Acesso Sistema</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stores.map(store => {
                const subStatus = getStatusLabel(store.subscriptionStatus);
                return (
                  <tr key={store.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-black text-white text-base">{store.name}</p>
                      <p className="text-amber-500 font-mono text-xs">/{store.slug}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-300">{store.plan}</p>
                      <p className="text-emerald-400 text-xs font-bold">R$ {parseFloat(store.monthlyFee || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${subStatus.style}`}>
                        {subStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => toggleStoreStatus(store)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-colors ${store.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40'}`}
                        title={store.status === 'ACTIVE' ? 'Clique para Bloquear Acesso' : 'Clique para Desbloquear Acesso'}
                      >
                        {store.status === 'ACTIVE' ? 'SISTEMA LIBERADO' : 'SISTEMA BLOQUEADO'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleEditClick(store)} 
                        className="bg-blue-500/10 opacity-0 group-hover:opacity-100 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Editar Dados
                      </button>
                    </td>
                  </tr>
                );
              })}
              {stores.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500">Nenhuma loja cadastrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO DA LOJA */}
      {editingStore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 p-8 rounded-[2rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
            
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="text-amber-500">🏢</span> Editar: {editingStore.name}
              </h2>
              <button onClick={() => setEditingStore(null)} className="w-10 h-10 bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-full flex items-center justify-center font-black text-lg transition-colors cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto pr-4 space-y-6 flex-1 hide-scrollbar">
              
              <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span>🏛️</span> Dados Jurídicos e Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Fantasia</label>
                    <input type="text" required value={editingStore.name} onChange={e => setEditingStore({...editingStore, name: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Slug (URL)</label>
                    <input type="text" required value={editingStore.slug} onChange={e => setEditingStore({...editingStore, slug: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-amber-500 font-mono focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Razão Social</label>
                    <input type="text" value={editingStore.corporateName} onChange={e => setEditingStore({...editingStore, corporateName: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CNPJ</label>
                    <input type="text" value={editingStore.cnpj} onChange={e => setEditingStore({...editingStore, cnpj: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insc. Estadual</label>
                    <input type="text" value={editingStore.stateRegistration} onChange={e => setEditingStore({...editingStore, stateRegistration: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insc. Municipal</label>
                    <input type="text" value={editingStore.municipalRegistration} onChange={e => setEditingStore({...editingStore, municipalRegistration: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email da Empresa</label>
                    <input type="email" value={editingStore.companyEmail} onChange={e => setEditingStore({...editingStore, companyEmail: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Telefone / WhatsApp</label>
                    <input type="text" value={editingStore.companyPhone} onChange={e => setEditingStore({...editingStore, companyPhone: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span>👤</span> Responsável Legal / Sócio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                    <input type="text" value={editingStore.ownerName} onChange={e => setEditingStore({...editingStore, ownerName: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPF</label>
                    <input type="text" value={editingStore.ownerCpf} onChange={e => setEditingStore({...editingStore, ownerCpf: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Pessoal</label>
                    <input type="email" value={editingStore.ownerEmail} onChange={e => setEditingStore({...editingStore, ownerEmail: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Celular Pessoal</label>
                    <input type="text" value={editingStore.ownerPhone} onChange={e => setEditingStore({...editingStore, ownerPhone: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* SEÇÃO FINANCEIRA */}
              <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-emerald-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span>💰</span> Assinatura e Cobrança (SaaS)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plano Ativo</label>
                    <select value={editingStore.plan} onChange={e => setEditingStore({...editingStore, plan: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer">
                      <option value="STANDARD">Padrão (Standard)</option>
                      <option value="PRO">Profissional (Pro)</option>
                      <option value="ENTERPRISE">Enterprise / Franquia</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mensalidade (R$)</label>
                    <input type="number" step="0.01" value={editingStore.monthlyFee} onChange={e => setEditingStore({...editingStore, monthlyFee: e.target.value})} placeholder="149.90" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-emerald-400 font-mono font-black focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Financeiro</label>
                    <select value={editingStore.subscriptionStatus} onChange={e => setEditingStore({...editingStore, subscriptionStatus: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer">
                      <option value="TRIAL">Período de Teste</option>
                      <option value="ACTIVE">Em Dia (Ativo)</option>
                      <option value="OVERDUE">Inadimplente (Atrasado)</option>
                      <option value="BLOCKED">Bloqueado Total</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span>📍</span> Endereço e Customização</h3>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Endereço Completo</label>
                    <input type="text" value={editingStore.address} onChange={e => setEditingStore({...editingStore, address: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">URL do Logotipo</label>
                    <input type="text" value={editingStore.logoUrl} onChange={e => setEditingStore({...editingStore, logoUrl: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4 shrink-0 mt-4 border-t border-white/10">
                <button type="button" onClick={() => setEditingStore(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl cursor-pointer transition-colors text-sm">
                  Cancelar
                </button>
                <button type="submit" className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer transition-all active:scale-95 text-base">
                  Salvar Todas as Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}