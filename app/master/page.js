'use client';
import { useState, useEffect } from 'react';

export default function ZenixMasterPage() {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingStore, setEditingStore] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStores();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Senha master simples para proteger a rota no front (O ideal é ter uma validação no back)
    if (masterPassword === 'zenixadmin123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/master/stores`);
      if (res.ok) {
        const data = await res.json();
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
      subscriptionDueDate: store.subscriptionDueDate ? new Date(store.subscriptionDueDate).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch(`${API_URL}/api/master/stores/${editingStore.id}/modules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeDelivery: editingStore.activeDelivery,
          activeTotem: editingStore.activeTotem,
          activeKds: editingStore.activeKds,
          activeFiscal: editingStore.activeFiscal,
          monthlyFee: Number(editingStore.monthlyFee),
          subscriptionStatus: editingStore.subscriptionStatus,
          subscriptionDueDate: editingStore.subscriptionDueDate || null
        })
      });

      if (res.ok) {
        alert('Loja atualizada com sucesso!');
        setEditingStore(null);
        fetchStores();
      } else {
        alert('Erro ao atualizar a loja.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'TRIAL': 'bg-blue-100 text-blue-700 border-blue-200',
      'ACTIVE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'OVERDUE': 'bg-amber-100 text-amber-700 border-amber-200',
      'BLOCKED': 'bg-red-100 text-red-700 border-red-200'
    };
    const labels = {
      'TRIAL': 'Período de Teste',
      'ACTIVE': 'Ativo',
      'OVERDUE': 'Atrasado',
      'BLOCKED': 'Bloqueado'
    };
    return <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${badges[status] || 'bg-slate-100 text-slate-700'}`}>{labels[status] || status}</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black">
        <div className="bg-[#121212] border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
          <div className="text-center mb-8">
            <span className="text-4xl mb-3 inline-block">⚡</span>
            <h1 className="text-2xl font-black text-white tracking-tight">Zenix Master</h1>
            <p className="text-zinc-500 text-xs mt-1 font-medium">Gestão Administrativa SaaS</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input type="password" required value={masterPassword} onChange={e => setMasterPassword(e.target.value)} placeholder="Senha Master" className="w-full bg-black/50 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 text-center tracking-widest" />
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl shadow-lg mt-2 transition-colors">Acessar Backoffice</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-500 selection:text-white pb-20">
      
      <header className="bg-slate-950 text-white p-6 sticky top-0 z-40 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚡</span>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Zenix Master</h1>
              <span className="text-purple-400 font-bold text-[10px] tracking-widest uppercase">Super Admin</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 flex flex-col items-end">
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Lojas Ativas</span>
              <span className="text-lg font-black text-emerald-400 leading-none">{stores.filter(s => s.subscriptionStatus === 'ACTIVE').length}</span>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 flex flex-col items-end">
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">MRR (Mensalidade)</span>
              <span className="text-lg font-black text-purple-400 leading-none">R$ {stores.filter(s => s.subscriptionStatus === 'ACTIVE' || s.subscriptionStatus === 'OVERDUE').reduce((acc, curr) => acc + curr.monthlyFee, 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-800">🏢 Lojas Cadastradas</h2>
          <button onClick={fetchStores} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">🔄 Atualizar Lista</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-purple-500 font-black animate-pulse">Carregando carteira de clientes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => (
              <div key={store.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden flex flex-col">
                {store.subscriptionStatus === 'OVERDUE' && <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>}
                {store.subscriptionStatus === 'BLOCKED' && <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>}
                {store.subscriptionStatus === 'ACTIVE' && <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>}
                {store.subscriptionStatus === 'TRIAL' && <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{store.name}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">{store.documentCnpj || 'CNPJ não informado'}</p>
                  </div>
                  {getStatusBadge(store.subscriptionStatus)}
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mensalidade</span>
                    <span className="text-sm font-black text-slate-800">R$ {Number(store.monthlyFee).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vencimento</span>
                    <span className={`text-sm font-bold ${store.subscriptionStatus === 'OVERDUE' ? 'text-red-500' : 'text-slate-800'}`}>
                      {store.subscriptionDueDate ? new Date(store.subscriptionDueDate).toLocaleDateString('pt-BR') : '--/--/----'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                  {store.activeDelivery && <span className="bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-1 rounded">🛵 Delivery/PDV</span>}
                  {store.activeKds && <span className="bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-1 rounded">📺 KDS</span>}
                  {store.activeTotem && <span className="bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-1 rounded">⚡ Totem</span>}
                  {store.activeFiscal && <span className="bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-1 rounded">🧾 NFC-e</span>}
                </div>

                <button onClick={() => handleEditClick(store)} className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-black py-3 rounded-xl text-xs transition-colors">
                  Gerenciar Loja
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🚨 MODAL DE EDIÇÃO DA LOJA (SAAS) 🚨 */}
      {editingStore && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-black text-white">{editingStore.name}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">ID: {editingStore.id}</p>
              </div>
              <button onClick={() => setEditingStore(null)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500 transition-colors font-bold">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <form id="editStoreForm" onSubmit={handleSaveStore} className="space-y-8">
                
                <section>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">Status e Faturamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Status da Conta</label>
                      <select value={editingStore.subscriptionStatus} onChange={e => setEditingStore({...editingStore, subscriptionStatus: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-purple-500 outline-none">
                        <option value="TRIAL">Período de Teste</option>
                        <option value="ACTIVE">Ativo (Pagamento OK)</option>
                        <option value="OVERDUE">Atrasado (Aviso)</option>
                        <option value="BLOCKED">Bloqueado (Inadimplente)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Mensalidade (R$)</label>
                      <input type="number" step="0.01" value={editingStore.monthlyFee} onChange={e => setEditingStore({...editingStore, monthlyFee: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Vencimento da Fatura</label>
                      <input type="date" value={editingStore.subscriptionDueDate} onChange={e => setEditingStore({...editingStore, subscriptionDueDate: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-purple-500 outline-none" />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Módulos Contratados</h4>
                    <span className="text-[9px] text-slate-400 font-bold">Marque o que o cliente pagou</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${editingStore.activeDelivery ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">Delivery & PDV</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5">Módulo base obrigatório</span>
                      </div>
                      <input type="checkbox" checked={editingStore.activeDelivery} onChange={e => setEditingStore({...editingStore, activeDelivery: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    </label>

                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${editingStore.activeKds ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">Sistema KDS (Cozinha)</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5">Telas de preparo e expedição</span>
                      </div>
                      <input type="checkbox" checked={editingStore.activeKds} onChange={e => setEditingStore({...editingStore, activeKds: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    </label>

                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${editingStore.activeTotem ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">Totem de Autoatendimento</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5">Pedidos autônomos no salão</span>
                      </div>
                      <input type="checkbox" checked={editingStore.activeTotem} onChange={e => setEditingStore({...editingStore, activeTotem: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    </label>

                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${editingStore.activeFiscal ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">Módulo Fiscal (NFC-e)</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5">Emissão de notas via Focus NFe</span>
                      </div>
                      <input type="checkbox" checked={editingStore.activeFiscal} onChange={e => setEditingStore({...editingStore, activeFiscal: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    </label>

                  </div>
                </section>
              </form>
            </div>

            <div className="p-6 bg-white border-t border-slate-200 shrink-0 flex justify-end gap-3">
              <button onClick={() => setEditingStore(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
              <button form="editStoreForm" type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-black transition-all shadow-md">
                {isSaving ? 'Salvando...' : 'Salvar Alteraçoes'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}