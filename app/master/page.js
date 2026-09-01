'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterDashboard() {
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState(null);

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const fetchStores = async () => {
    try {
      const masterToken = localStorage.getItem('zenix_master_token');
      const res = await fetch(`${API_URL}/api/master/stores`, {
        headers: { 'Authorization': `Bearer ${masterToken}` }
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

  useEffect(() => {
    fetchStores();
  }, []);

  const handleEditClick = (store) => {
    setEditingStore({
      ...store,
      corporateName: store.corporateName || '',
      cnpj: store.cnpj || '',
      stateRegistration: store.stateRegistration || '',
      municipalRegistration: store.municipalRegistration || '',
      companyEmail: store.companyEmail || '',
      companyPhone: store.companyPhone || '',
      ownerName: store.ownerName || '',
      ownerCpf: store.ownerCpf || '',
      ownerEmail: store.ownerEmail || '',
      ownerPhone: store.ownerPhone || '',
      address: store.address || '',
      logoUrl: store.logoUrl || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const masterToken = localStorage.getItem('zenix_master_token');
    
    try {
      const res = await fetch(`${API_URL}/api/master/stores/${editingStore.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${masterToken}`
        },
        body: JSON.stringify(editingStore)
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
    if (!confirm(`Deseja ${store.status === 'ACTIVE' ? 'BLOQUEAR' : 'DESBLOQUEAR'} a loja ${store.name}?`)) return;
    
    const masterToken = localStorage.getItem('zenix_master_token');
    const newStatus = store.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    
    try {
      await fetch(`${API_URL}/api/master/stores/${store.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${masterToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchStores();
    } catch (error) {
      alert('Erro ao alterar status.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 font-bold">Carregando Master...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-6 md:p-10">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span>⚡</span> Zenix Master
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gestão central de todos os inquilinos (restaurantes).</p>
        </div>
        <button 
          onClick={() => router.push('/master/stores/new')} 
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-black transition-colors shadow-lg cursor-pointer"
        >
          + Cadastrar Loja
        </button>
      </div>

      {/* LISTAGEM DAS LOJAS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="px-6 py-4">Loja / Slug</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-white text-base">{store.name}</p>
                    <p className="text-amber-500 font-mono text-xs">/{store.slug}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-300">{store.plan}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStoreStatus(store)}
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest cursor-pointer ${store.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                    >
                      {store.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(store.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEditClick(store)} 
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Editar Dados
                    </button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500">Nenhuma loja cadastrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO DA LOJA (Contém todos os campos do cadastro) */}
      {editingStore && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white">Editar Loja: {editingStore.name}</h2>
              <button onClick={() => setEditingStore(null)} className="text-slate-500 hover:text-red-500 font-black text-xl cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto pr-2 space-y-6 flex-1 hide-scrollbar">
              
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Dados Jurídicos e Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nome Fantasia</label>
                    <input type="text" required value={editingStore.name} onChange={e => setEditingStore({...editingStore, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Slug na URL (Não altere se não tiver certeza)</label>
                    <input type="text" required value={editingStore.slug} onChange={e => setEditingStore({...editingStore, slug: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-amber-500 font-mono focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Razão Social</label>
                    <input type="text" value={editingStore.corporateName} onChange={e => setEditingStore({...editingStore, corporateName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">CNPJ</label>
                    <input type="text" value={editingStore.cnpj} onChange={e => setEditingStore({...editingStore, cnpj: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Insc. Estadual</label>
                    <input type="text" value={editingStore.stateRegistration} onChange={e => setEditingStore({...editingStore, stateRegistration: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Insc. Municipal</label>
                    <input type="text" value={editingStore.municipalRegistration} onChange={e => setEditingStore({...editingStore, municipalRegistration: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Email da Empresa</label>
                    <input type="email" value={editingStore.companyEmail} onChange={e => setEditingStore({...editingStore, companyEmail: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Telefone / WhatsApp Comercial</label>
                    <input type="text" value={editingStore.companyPhone} onChange={e => setEditingStore({...editingStore, companyPhone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">Responsável Legal / Sócio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nome Completo</label>
                    <input type="text" value={editingStore.ownerName} onChange={e => setEditingStore({...editingStore, ownerName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">CPF</label>
                    <input type="text" value={editingStore.ownerCpf} onChange={e => setEditingStore({...editingStore, ownerCpf: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Email do Responsável</label>
                    <input type="email" value={editingStore.ownerEmail} onChange={e => setEditingStore({...editingStore, ownerEmail: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Celular do Responsável</label>
                    <input type="text" value={editingStore.ownerPhone} onChange={e => setEditingStore({...editingStore, ownerPhone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Endereço & Plano</h3>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Endereço Completo</label>
                    <input type="text" value={editingStore.address} onChange={e => setEditingStore({...editingStore, address: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">URL do Logotipo</label>
                    <input type="text" value={editingStore.logoUrl} onChange={e => setEditingStore({...editingStore, logoUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Plano da Loja</label>
                    <select value={editingStore.plan} onChange={e => setEditingStore({...editingStore, plan: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500">
                      <option value="STANDARD">Padrão (Standard)</option>
                      <option value="PRO">Profissional (Pro)</option>
                      <option value="ENTERPRISE">Enterprise / Franquia</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-4 shrink-0 mt-4">
                <button type="button" onClick={() => setEditingStore(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-xl shadow-lg cursor-pointer">
                  Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}