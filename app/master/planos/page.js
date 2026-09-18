'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanosSaaSPage() {
  const router = useRouter();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    precoBase: '',
    modulosLiberados: [],
    isActive: true
  });

  const MODULOS_DISPONIVEIS = [
    { id: 'CARDAPIO', label: '📱 Cardápio Digital (QR Code)' },
    { id: 'PDV', label: '🖥️ PDV (Frente de Caixa)' },
    { id: 'IMPRESSORAS', label: '🖨️ Gestão de Impressoras' },
    { id: 'KDS', label: '📺 KDS (Tela de Pedidos na Cozinha)' },
    { id: 'SALAO', label: '🍽️ Mesas e Comandas (Salão)' },
    { id: 'ESTOQUE', label: '📦 Controle de Estoque e Fichas' },
    { id: 'FINANCEIRO', label: '💰 Módulo Financeiro' },
    { id: 'FISCAL', label: '📄 Emissão Fiscal (NFC-e / SAT)' }
  ];

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const token = localStorage.getItem('zenix_super_token');
      if (!token) {
        alert("Acesso negado. Apenas o Super Master pode gerenciar planos.");
        router.push('/master');
        return;
      }

      const res = await fetch(`${API_URL}/api/super/planos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setPlanos(await res.json());
      }
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (plano = null) => {
    if (plano) {
      setEditingPlano(plano);
      setFormData({
        nome: plano.nome,
        precoBase: plano.precoBase,
        modulosLiberados: typeof plano.modulosLiberados === 'string' ? JSON.parse(plano.modulosLiberados) : plano.modulosLiberados,
        isActive: plano.isActive
      });
    } else {
      setEditingPlano(null);
      setFormData({ nome: '', precoBase: '', modulosLiberados: [], isActive: true });
    }
    setIsModalOpen(true);
  };

  const toggleModulo = (moduloId) => {
    setFormData(prev => {
      const jaTem = prev.modulosLiberados.includes(moduloId);
      if (jaTem) {
        return { ...prev, modulosLiberados: prev.modulosLiberados.filter(id => id !== moduloId) };
      } else {
        return { ...prev, modulosLiberados: [...prev.modulosLiberados, moduloId] };
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('zenix_super_token');
    
    const url = editingPlano ? `${API_URL}/api/super/planos/${editingPlano.id}` : `${API_URL}/api/super/planos`;
    const method = editingPlano ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert(editingPlano ? 'Plano atualizado!' : 'Plano criado com sucesso!');
        setIsModalOpen(false);
        fetchPlanos();
      } else {
        alert("Erro ao salvar plano.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja DELETAR este plano? Lojas que usam este plano podem ser afetadas.")) return;
    
    const token = localStorage.getItem('zenix_super_token');
    try {
      const res = await fetch(`${API_URL}/api/super/planos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPlanos();
      } else {
        alert("Erro ao deletar. O plano pode estar em uso por alguma loja.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/master')} className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl transition-colors text-slate-600 font-bold">
              ← Voltar
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">💎 Planos SaaS (White-Label)</h1>
              <p className="text-sm text-slate-500 mt-1">Crie os pacotes que seus Franqueados poderão revender.</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-black transition-all shadow-md">
            + Criar Novo Plano
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-purple-500 font-bold animate-pulse">Carregando planos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planos.map(plano => {
              const modulosArray = typeof plano.modulosLiberados === 'string' ? JSON.parse(plano.modulosLiberados) : plano.modulosLiberados;
              
              return (
                <div key={plano.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                  {!plano.isActive && <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Inativo</div>}
                  
                  <h3 className="text-xl font-black text-purple-800 mb-1">{plano.nome}</h3>
                  <p className="text-3xl font-black text-slate-800 mb-4">
                    R$ {plano.precoBase.toFixed(2)} <span className="text-xs text-slate-400 font-medium">/mês (Base)</span>
                  </p>
                  
                  <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Módulos Inclusos:</p>
                    <ul className="space-y-2">
                      {modulosArray.map(modId => {
                        const modInfo = MODULOS_DISPONIVEIS.find(m => m.id === modId);
                        return (
                          <li key={modId} className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="text-emerald-500">✓</span> {modInfo ? modInfo.label : modId}
                          </li>
                        );
                      })}
                      {modulosArray.length === 0 && <li className="text-xs text-slate-400 italic">Nenhum módulo selecionado</li>}
                    </ul>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => openModal(plano)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2.5 rounded-xl font-bold text-sm transition-colors">Editar</button>
                    <button onClick={() => handleDelete(plano.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-xl font-bold text-sm transition-colors">Deletar</button>
                  </div>
                </div>
              );
            })}
            
            {planos.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200">
                <span className="text-5xl block mb-4">📦</span>
                <p className="text-slate-500 font-bold">Nenhum plano criado ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-black text-purple-800 flex items-center gap-3">
                {editingPlano ? '✏️ Editar Plano' : '✨ Novo Plano SaaS'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-100 hover:bg-red-100 text-slate-500 rounded-full font-black text-lg">✕</button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto pr-2 space-y-6 flex-1 hide-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome do Plano</label>
                  <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Plano Standard" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Preço Base (Custo Fixo)</label>
                  <input type="number" step="0.01" required value={formData.precoBase} onChange={e => setFormData({...formData, precoBase: e.target.value})} placeholder="99.90" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-purple-700 font-black focus:border-purple-500 focus:outline-none" />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 p-5 rounded-2xl">
                <h3 className="text-xs font-black text-purple-700 uppercase tracking-widest mb-3">Módulos Liberados neste Plano</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODULOS_DISPONIVEIS.map(mod => (
                    <label key={mod.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.modulosLiberados.includes(mod.id) ? 'bg-white border-purple-400 shadow-sm' : 'bg-slate-50/50 border-slate-200 hover:bg-white'}`}>
                      <input 
                        type="checkbox" 
                        checked={formData.modulosLiberados.includes(mod.id)} 
                        onChange={() => toggleModulo(mod.id)}
                        className="w-5 h-5 accent-purple-600"
                      />
                      <span className="text-xs font-bold text-slate-700">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-200">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-emerald-500" />
                <span className="text-sm font-bold text-slate-800">Plano Ativo (Disponível para venda)</span>
              </label>

              <div className="pt-4 flex gap-4 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-2 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-md transition-all active:scale-95">
                  Salvar Plano
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}