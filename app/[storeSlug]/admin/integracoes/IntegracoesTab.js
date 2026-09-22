'use client';
import { useState, useEffect } from 'react';

export default function IntegracoesTab() {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  // Estados do Delivery (iFood, 99Food, Keeta)
  const [integrations, setIntegrations] = useState({
    ifood: { active: false, clientId: '', clientSecret: '', merchantId: '' },
    food99: { active: false, appId: '', appSecret: '', shopId: '' },
    keeta: { active: false, developerId: '', developerSecret: '', storeId: '' }
  });

  // Estados Gerais (Mercado Pago, Focus NFe, Smart POS)
  const [fullSettings, setFullSettings] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'ifood', 'food99', 'keeta', 'mercadopago', 'focus', 'smartpos'

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
    const loadAllIntegrations = async () => {
      try {
        const resDel = await fetchWithStore(`${API_URL}/api/integrations`);
        if (resDel.ok) {
          const dataDel = await resDel.json();
          setIntegrations(dataDel);
        }

        const resSet = await fetchWithStore(`${API_URL}/api/settings`);
        if (resSet.ok) {
          const dataSet = await resSet.json();
          setFullSettings(dataSet);
        }
      } catch (e) { console.error("Erro ao carregar integrações"); }
      setLoading(false);
    };
    loadAllIntegrations();
  }, [API_URL]);

  const handleSaveDelivery = async (e) => {
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
        alert("Configurações de Delivery salvas com sucesso!");
        setActiveModal(null);
      } else { alert(data.error || "Erro ao salvar."); }
    } catch (e) { alert("Erro de conexão."); }
    setSaving(false);
  };

  const handleSaveGeneralSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullSettings)
      });
      const data = await res.json();
      if (data.success) {
        alert("Integração salva com sucesso!");
        setActiveModal(null);
      } else { alert("Erro ao salvar."); }
    } catch (e) { alert("Erro de conexão."); }
    setSaving(false);
  };

  const toggleStatusDelivery = async (platform) => {
    const updated = {
      ...integrations,
      [platform]: { ...integrations[platform], active: !integrations[platform].active }
    };
    setIntegrations(updated);
    try {
      await fetchWithStore(`${API_URL}/api/integrations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated)
      });
    } catch (e) {}
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">A carregar integrações...</div>;

  const isMpActive = !!fullSettings.mercadoPagoAccessToken;
  const isFocusActive = !!fullSettings.focusToken;
  const isSmartPosActive = !!fullSettings.smartPosProvider && fullSettings.smartPosProvider !== 'none';

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Hub de Integrações Geral</h2>
            <p className="text-sm text-slate-500 mt-1">Ligue a sua loja às aplicações de delivery, meios de pagamento, máquinas físicas e emissão fiscal num único lugar.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* CARD SMART POS (NOVO) */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${isSmartPosActive ? 'border-emerald-500 shadow-emerald-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-md">📱</div>
              <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isSmartPosActive ? 'text-emerald-600' : 'text-slate-400'}`}>{isSmartPosActive ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Smart POS (Maquininhas)</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Ative o App Lançamentos para cobrar diretamente nas máquinas Stone, PagSeguro, etc.</p>
            <button onClick={() => setActiveModal('smartpos')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors cursor-pointer ${isSmartPosActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Terminal
            </button>
          </div>

          {/* CARD MERCADO PAGO */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${isMpActive ? 'border-blue-500 shadow-blue-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-md">💳</div>
              <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isMpActive ? 'text-blue-600' : 'text-slate-400'}`}>{isMpActive ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Mercado Pago (Online)</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Recebimentos via Pix, Cartão de Crédito e Débito no Totem e Delivery.</p>
            <button onClick={() => setActiveModal('mercadopago')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors cursor-pointer ${isMpActive ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Credenciais
            </button>
          </div>

          {/* CARD FOCUS NFE */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${isFocusActive ? 'border-teal-500 shadow-teal-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-teal-500 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-md">🧾</div>
              <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isFocusActive ? 'text-teal-600' : 'text-slate-400'}`}>{isFocusActive ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Focus NFC-e (Legado)</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Emissão terceirizada de Cupons Fiscais Eletrónicos (Plano de Contingência).</p>
            <button onClick={() => setActiveModal('focus')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors cursor-pointer ${isFocusActive ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Credenciais
            </button>
          </div>

          {/* CARD IFOOD */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${integrations.ifood.active ? 'border-red-500 shadow-red-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md">iFood</div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{integrations.ifood.active ? 'Ativo' : 'Inativo'}</span>
                  <button onClick={() => toggleStatusDelivery('ifood')} className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${integrations.ifood.active ? 'bg-red-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${integrations.ifood.active ? 'translate-x-6' : ''}`}></span>
                  </button>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">iFood Delivery</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Integração oficial para importação de pedidos, ementa e status.</p>
            <button onClick={() => setActiveModal('ifood')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors cursor-pointer ${integrations.ifood.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Credenciais
            </button>
          </div>

          {/* CARD 99FOOD */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${integrations.food99.active ? 'border-amber-500 shadow-amber-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md">99Food</div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{integrations.food99.active ? 'Ativo' : 'Inativo'}</span>
                  <button onClick={() => toggleStatusDelivery('food99')} className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${integrations.food99.active ? 'bg-amber-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${integrations.food99.active ? 'translate-x-6' : ''}`}></span>
                  </button>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">99Food</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Receba pedidos do 99Food diretamente no seu ecrã de produção.</p>
            <button onClick={() => setActiveModal('food99')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors cursor-pointer ${integrations.food99.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Credenciais
            </button>
          </div>

          {/* CARD KEETA */}
          <div className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all ${integrations.keeta.active ? 'border-yellow-400 shadow-yellow-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-yellow-400 text-black rounded-2xl flex items-center justify-center text-xl font-black shadow-md">Keeta</div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{integrations.keeta.active ? 'Ativo' : 'Inativo'}</span>
                  <button onClick={() => toggleStatusDelivery('keeta')} className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${integrations.keeta.active ? 'bg-yellow-400' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${integrations.keeta.active ? 'translate-x-6' : ''}`}></span>
                  </button>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Keeta Delivery</h3>
            <p className="text-xs text-slate-500 mb-6 h-8">Ligue a sua loja à nova plataforma de delivery Keeta.</p>
            <button onClick={() => setActiveModal('keeta')} className={`w-full py-3 rounded-xl font-black text-sm transition-colors cursor-pointer ${integrations.keeta.active ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              ⚙️ Configurar Credenciais
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAIS DE CONFIGURAÇÃO */}
      {/* ============================================================== */}

      {/* MODAL SMART POS (MÁQUINAS) */}
      {activeModal === 'smartpos' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up border-t-8 border-emerald-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Terminais Smart POS</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer">✕</button>
            </div>
            
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
               <p className="text-xs text-slate-600 font-medium leading-relaxed">
                 Configure qual a marca da máquina de cartões (Android) que os seus empregados utilizam no salão. Isto ativará a integração <strong>App-to-App</strong>.
               </p>
            </div>

            <form onSubmit={handleSaveGeneralSettings} className="space-y-5">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2 tracking-widest">Adquirente / Fornecedor</label>
                  <select 
                    value={fullSettings.smartPosProvider || 'none'} 
                    onChange={e => setFullSettings({...fullSettings, smartPosProvider: e.target.value})} 
                    className="w-full bg-white border-2 border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="none">Nenhuma (Desativado)</option>
                    <option value="stone">🟢 Stone (Smart POS)</option>
                    <option value="pagseguro">🟡 PagSeguro / PagBank (PlugPag)</option>
                    <option value="mercado_pago">🔵 Mercado Pago (Point Smart)</option>
                  </select>
                </div>
                
                {fullSettings.smartPosProvider === 'stone' && (
                   <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 animate-fade-in-up">
                      <p className="text-xs text-emerald-800 font-bold mb-2">Integração Stone Code / Deep Link</p>
                      <input type="text" value={fullSettings.smartPosStoneCode || ''} onChange={e => setFullSettings({...fullSettings, smartPosStoneCode: e.target.value})} placeholder="Stone Code (Opcional)" className="w-full bg-white border border-emerald-300 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-600" />
                   </div>
                )}

                {fullSettings.smartPosProvider === 'pagseguro' && (
                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 animate-fade-in-up">
                      <p className="text-xs text-amber-800 font-bold mb-2">App-to-App PagBank</p>
                      <input type="text" value={fullSettings.smartPosPagSeguroCode || ''} onChange={e => setFullSettings({...fullSettings, smartPosPagSeguroCode: e.target.value})} placeholder="Código de Ativação (Opcional)" className="w-full bg-white border border-amber-300 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-600" />
                   </div>
                )}

                <button type="submit" disabled={saving} className="w-full mt-2 bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50 cursor-pointer">
                  {saving ? 'A Guardar...' : '💾 Confirmar Dispositivo'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MERCADO PAGO */}
      {activeModal === 'mercadopago' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up border-t-8 border-blue-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-blue-600">Mercado Pago</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Public Key (Frontend)</label>
                  <input type="text" value={fullSettings.mercadoPagoPublicKey || ''} onChange={e => setFullSettings({...fullSettings, mercadoPagoPublicKey: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 font-mono" placeholder="APP_USR-..." />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Access Token (Backend)</label>
                  <input type="password" value={fullSettings.mercadoPagoAccessToken || ''} onChange={e => setFullSettings({...fullSettings, mercadoPagoAccessToken: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 font-mono" placeholder="APP_USR-..." />
                </div>
                <button type="submit" disabled={saving} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50 cursor-pointer">
                  {saving ? 'A Guardar...' : 'Salvar Credenciais'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOCUS NFE */}
      {activeModal === 'focus' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up border-t-8 border-teal-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-teal-600">Focus NFC-e</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ambiente</label>
                  <select value={fullSettings.focusEnv || 'homologacao'} onChange={e => setFullSettings({...fullSettings, focusEnv: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm font-bold focus:outline-none focus:border-teal-500 cursor-pointer">
                    <option value="homologacao">Homologação (Testes)</option>
                    <option value="producao">Produção (Validade Fiscal)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Token de Integração</label>
                  <input type="password" value={fullSettings.focusToken || ''} onChange={e => setFullSettings({...fullSettings, focusToken: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 font-mono" placeholder="Código de autorização..." />
                </div>
                <button type="submit" disabled={saving} className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50 cursor-pointer">
                  {saving ? 'A Guardar...' : 'Salvar Credenciais'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IFOOD */}
      {activeModal === 'ifood' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up border-t-8 border-red-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-red-600">Configuração iFood</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveDelivery} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Merchant ID (ID da Loja)</label><input type="text" value={integrations.ifood.merchantId} onChange={(e) => setIntegrations({...integrations, ifood: {...integrations.ifood, merchantId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500" placeholder="Ex: 12345678-abcd-1234..." /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Client ID</label><input type="text" value={integrations.ifood.clientId} onChange={(e) => setIntegrations({...integrations, ifood: {...integrations.ifood, clientId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Client Secret</label><input type="password" value={integrations.ifood.clientSecret} onChange={(e) => setIntegrations({...integrations, ifood: {...integrations.ifood, clientSecret: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500" /></div>
                
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                  <p className="text-[10px] font-black uppercase text-red-700 tracking-widest mb-1">URL de Webhook (Copie no Portal iFood):</p>
                  <code className="text-xs text-red-800 break-all bg-white px-2 py-1 rounded block border border-red-200">{API_URL}/api/webhooks/ifood</code>
                </div>

                <button type="submit" disabled={saving} className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50 cursor-pointer">
                  {saving ? 'A Guardar...' : 'Salvar iFood'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 99FOOD */}
      {activeModal === 'food99' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up border-t-8 border-amber-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-amber-500">Configuração 99Food</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveDelivery} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Shop ID (ID da Loja)</label><input type="text" value={integrations.food99.shopId} onChange={(e) => setIntegrations({...integrations, food99: {...integrations.food99, shopId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">App ID</label><input type="text" value={integrations.food99.appId} onChange={(e) => setIntegrations({...integrations, food99: {...integrations.food99, appId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">App Secret</label><input type="password" value={integrations.food99.appSecret} onChange={(e) => setIntegrations({...integrations, food99: {...integrations.food99, appSecret: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-4">
                  <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-1">URL de Webhook:</p>
                  <code className="text-xs text-amber-800 break-all bg-white px-2 py-1 rounded block border border-amber-200">{API_URL}/api/webhooks/99food</code>
                </div>

                <button type="submit" disabled={saving} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50 cursor-pointer">
                  {saving ? 'A Guardar...' : 'Salvar 99Food'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KEETA */}
      {activeModal === 'keeta' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up border-t-8 border-yellow-400">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-yellow-500">Configuração Keeta</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveDelivery} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Store ID</label><input type="text" value={integrations.keeta.storeId} onChange={(e) => setIntegrations({...integrations, keeta: {...integrations.keeta, storeId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-yellow-400" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Developer ID</label><input type="text" value={integrations.keeta.developerId} onChange={(e) => setIntegrations({...integrations, keeta: {...integrations.keeta, developerId: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-yellow-400" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Developer Secret</label><input type="password" value={integrations.keeta.developerSecret} onChange={(e) => setIntegrations({...integrations, keeta: {...integrations.keeta, developerSecret: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-yellow-400" /></div>
                
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mt-4">
                  <p className="text-[10px] font-black uppercase text-yellow-700 tracking-widest mb-1">URL de Webhook:</p>
                  <code className="text-xs text-yellow-800 break-all bg-white px-2 py-1 rounded block border border-yellow-200">{API_URL}/api/webhooks/keeta</code>
                </div>

                <button type="submit" disabled={saving} className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm disabled:opacity-50 cursor-pointer">
                  {saving ? 'A Guardar...' : 'Salvar Keeta'}
                </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
}