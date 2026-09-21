'use client';
import { useState, useEffect } from 'react';

export default function IntegracoesTab() {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [integrations, setIntegrations] = useState({
    ifood: { active: false, clientId: '', clientSecret: '', merchantId: '' },
    food99: { active: false, appId: '', appSecret: '', shopId: '' },
    keeta: { active: false, developerId: '', developerSecret: '', storeId: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'ifood', 'food99' ou 'keeta'

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');
    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-loja-slug': storeId }),
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const res = await fetchWithStore(`${API_URL}/api/integrations`);
        if (res.ok) {
          const data = await res.json();
          setIntegrations(data);
        }
      } catch (e) { console.error("Erro ao carregar integrações"); }
      setLoading(false);
    };
    loadIntegrations();
  }, [API_URL]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(integrations)
      });
      const data = await res.json();
      if (data.success) {
        alert("Configurações salvas com sucesso!");
        setActiveModal(null);
      } else {
        alert(data.error || "Erro ao salvar.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
    setSaving(false);
  };

  const toggleStatus = async (platform) => {
    const updated = {
      ...integrations,
      [platform]: { ...integrations[platform], active: !integrations[platform].active }
    };
    setIntegrations(updated);
    
    // Salva automaticamente ao ligar/desligar a chave
    try {
      await fetchWithStore(`${API_URL}/api/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {}
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Carregando integrações...</div>;

  return (
    <>
      {/* CORPO DA ABA COM ANIMAÇÃO */}
      <div className="space-y-6 animate-fade-in-up">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Hub de Integrações</h2>
            <p className="text-sm text-slate-500 mt-1">Conecte sua loja aos maiores aplicativos de delivery do mercado e receba os pedidos diretamente no seu KDS e PDV.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* CARD IFOOD */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${integrations.ifood.active ? 'border-red-500 shadow-red-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md">iFood</div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{integrations.ifood.active ? 'Ativo' : 'Inativo'}</span>
                  <button onClick={() => toggleStatus('ifood')} className={`w-12 h-6 rounded-full relative transition-colors ${integrations.ifood.active ? 'bg-red-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${integrations.ifood.active ? 'translate-x-6' : ''}`}></span>
                  </button>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">iFood Delivery</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Integração oficial para importação de pedidos, cardápio e status.</p>
            <button onClick={() => setActiveModal('ifood')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors ${integrations.ifood.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Credenciais
            </button>
          </div>

          {/* CARD 99FOOD */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${integrations.food99.active ? 'border-amber-500 shadow-amber-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md">99Food</div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{integrations.food99.active ? 'Ativo' : 'Inativo'}</span>
                  <button onClick={() => toggleStatus('food99')} className={`w-12 h-6 rounded-full relative transition-colors ${integrations.food99.active ? 'bg-amber-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${integrations.food99.active ? 'translate-x-6' : ''}`}></span>
                  </button>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">99Food</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Receba pedidos do 99Food diretamente na sua tela de produção.</p>
            <button onClick={() => setActiveModal('food99')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors ${integrations.food99.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Credenciais
            </button>
          </div>

          {/* CARD KEETA */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${integrations.keeta.active ? 'border-yellow-400 shadow-yellow-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-yellow-400 text-black rounded-2xl flex items-center justify-center text-xl font-black shadow-md">Keeta</div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{integrations.keeta.active ? 'Ativo' : 'Inativo'}</span>
                  <button onClick={() => toggleStatus('keeta')} className={`w-12 h-6 rounded-full relative transition-colors ${integrations.keeta.active ? 'bg-yellow-400' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${integrations.keeta.active ? 'translate-x-6' : ''}`}></span>
                  </button>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Keeta Delivery</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Conecte sua loja à nova plataforma de delivery Keeta.</p>
            <button onClick={() => setActiveModal('keeta')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors ${integrations.keeta.active ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Credenciais
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAIS (DO LADO DE FORA DA ANIMAÇÃO PARA O FIXED FUNCIONAR)  */}
      {/* ============================================================== */}

      {/* MODAL IFOOD */}
      {activeModal === 'ifood' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-red-600">Configuração iFood</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-800 font-bold text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Merchant ID (ID da Loja)</label><input type="text" value={integrations.ifood.merchantId} onChange={(e) => setIntegrations({...integrations, ifood: {...integrations.ifood, merchantId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-red-500" placeholder="Ex: 12345678-abcd-1234..." /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Client ID</label><input type="text" value={integrations.ifood.clientId} onChange={(e) => setIntegrations({...integrations, ifood: {...integrations.ifood, clientId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-red-500" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Client Secret</label><input type="password" value={integrations.ifood.clientSecret} onChange={(e) => setIntegrations({...integrations, ifood: {...integrations.ifood, clientSecret: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-red-500" /></div>
                
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                  <p className="text-[10px] font-black uppercase text-red-700 tracking-widest mb-1">URL de Webhook (Copie e cole no Portal do iFood):</p>
                  <code className="text-xs text-red-800 break-all bg-white px-2 py-1 rounded block border border-red-200">{API_URL}/api/webhooks/ifood</code>
                </div>

                <button type="submit" disabled={saving} className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar iFood'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 99FOOD */}
      {activeModal === 'food99' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-amber-500">Configuração 99Food</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-800 font-bold text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Shop ID (ID da Loja)</label><input type="text" value={integrations.food99.shopId} onChange={(e) => setIntegrations({...integrations, food99: {...integrations.food99, shopId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-amber-500" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">App ID</label><input type="text" value={integrations.food99.appId} onChange={(e) => setIntegrations({...integrations, food99: {...integrations.food99, appId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-amber-500" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">App Secret</label><input type="password" value={integrations.food99.appSecret} onChange={(e) => setIntegrations({...integrations, food99: {...integrations.food99, appSecret: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-amber-500" /></div>
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-4">
                  <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-1">URL de Webhook:</p>
                  <code className="text-xs text-amber-800 break-all bg-white px-2 py-1 rounded block border border-amber-200">{API_URL}/api/webhooks/99food</code>
                </div>

                <button type="submit" disabled={saving} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar 99Food'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KEETA */}
      {activeModal === 'keeta' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-yellow-500">Configuração Keeta</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-800 font-bold text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Store ID</label><input type="text" value={integrations.keeta.storeId} onChange={(e) => setIntegrations({...integrations, keeta: {...integrations.keeta, storeId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-yellow-400" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Developer ID</label><input type="text" value={integrations.keeta.developerId} onChange={(e) => setIntegrations({...integrations, keeta: {...integrations.keeta, developerId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-yellow-400" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Developer Secret</label><input type="password" value={integrations.keeta.developerSecret} onChange={(e) => setIntegrations({...integrations, keeta: {...integrations.keeta, developerSecret: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-yellow-400" /></div>
                
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mt-4">
                  <p className="text-[10px] font-black uppercase text-yellow-700 tracking-widest mb-1">URL de Webhook:</p>
                  <code className="text-xs text-yellow-800 break-all bg-white px-2 py-1 rounded block border border-yellow-200">{API_URL}/api/webhooks/keeta</code>
                </div>

                <button type="submit" disabled={saving} className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar Keeta'}
                </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
}