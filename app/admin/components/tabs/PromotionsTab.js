import { useState, useEffect } from 'react';

export default function PromotionsTab({
  promoSubTab,
  setPromoSubTab,
  allProducts,
  toggleFeatureProduct,
  coupons,
  couponForm,
  setCouponForm,
  handleAddCoupon,
  toggleCouponStatus
}) {

  // =====================================
  // LÓGICA DO UPSELL EMBUTIDA AQUI
  // =====================================
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://canone-backend.onrender.com';
  const [upsells, setUpsells] = useState([]);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [upsellForm, setUpsellForm] = useState({
    name: '', triggerProductIds: [], offerProductId: '', offerPrice: '', channels: []
  });

  useEffect(() => {
    if (promoSubTab === 'upsell') {
      fetchUpsells();
    }
  }, [promoSubTab]);

  const fetchUpsells = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/upsells`);
      if (res.ok) setUpsells(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleToggleChannel = (channel) => {
    setUpsellForm(prev => {
      if (prev.channels.includes(channel)) return { ...prev, channels: prev.channels.filter(c => c !== channel) };
      return { ...prev, channels: [...prev.channels, channel] };
    });
  };

  const handleToggleTrigger = (productId) => {
    setUpsellForm(prev => {
      if (prev.triggerProductIds.includes(productId)) return { ...prev, triggerProductIds: prev.triggerProductIds.filter(id => id !== productId) };
      return { ...prev, triggerProductIds: [...prev.triggerProductIds, productId] };
    });
  };

  const handleSaveUpsell = async (e) => {
    e.preventDefault();
    if (upsellForm.triggerProductIds.length === 0 || !upsellForm.offerProductId || upsellForm.channels.length === 0) {
      return alert("Preencha todos os campos obrigatórios.");
    }
    const offerProductData = allProducts.find(p => p.id === upsellForm.offerProductId);
    const payload = { ...upsellForm, offerProductName: offerProductData?.name };
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/api/admin/upsells/${editingId}` : `${API_URL}/api/admin/upsells`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        alert('Regra salva!'); setShowUpsellModal(false); fetchUpsells();
      }
    } catch (e) { alert("Erro ao salvar."); }
  };

  const handleDeleteUpsell = async (id) => {
    if(!confirm("Excluir esta regra?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/upsells/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUpsells();
    } catch (e) { alert("Erro."); }
  };

  const toggleUpsellActive = async (upsell) => {
    try {
      await fetch(`${API_URL}/api/admin/upsells/${upsell.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !upsell.active })
      });
      fetchUpsells();
    } catch (e) {}
  };

  const getProductName = (id) => {
    const p = allProducts.find(x => x.id === id);
    return p ? p.name : 'Produto Removido';
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap gap-4 border-b border-slate-200 pb-4">
        <button onClick={() => setPromoSubTab('destaques')} className={`font-bold pb-2 transition-colors ${promoSubTab === 'destaques' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-amber-500'}`}>Produtos em Destaque</button>
        <button onClick={() => setPromoSubTab('cupons')} className={`font-bold pb-2 transition-colors ${promoSubTab === 'cupons' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-amber-500'}`}>Cupons de Desconto</button>
        <button onClick={() => setPromoSubTab('upsell')} className={`font-bold pb-2 transition-colors ${promoSubTab === 'upsell' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-amber-500'}`}>✨ Upsell (IA)</button>
      </div>

      {promoSubTab === 'destaques' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">Gestão de Destaques</h2>
            <p className="text-slate-500 text-sm mt-1">Selecione até 5 produtos para aparecerem no carrossel de promoções do cliente.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProducts.map(product => (
              <div key={product.id} className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${product.isFeatured ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-200'}`}>
                <div className="flex items-center gap-4 mb-4">
                  {product.imageUrl ? <img src={product.imageUrl} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-slate-100" />}
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                    <p className="text-emerald-600 font-bold text-sm">R$ {Number(product.price).toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={() => toggleFeatureProduct(product)} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${product.isFeatured ? 'bg-amber-500 text-black shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  {product.isFeatured ? '⭐ Remover Destaque' : 'Adicionar ao Carrossel'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {promoSubTab === 'cupons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fade-in-up">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 md:col-span-1">
            <h3 className="font-black text-amber-600 mb-2">Criar Cupom</h3>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Código do Cupom</label>
                <input type="text" required placeholder="Ex: CANONE10" value={couponForm.code} onChange={e=>setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm uppercase focus:outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Tipo de Desconto</label>
                  <select value={couponForm.type} onChange={e=>setCouponForm({...couponForm, type: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500">
                    <option value="FIXED">Fixo (R$)</option>
                    <option value="PERCENTAGE">Porcentagem (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Valor</label>
                  <input type="number" step="0.01" placeholder="Ex: 5.00" required value={couponForm.value} onChange={e=>setCouponForm({...couponForm, value: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Pedido Mínimo (R$)</label>
                  <input type="number" step="0.01" required placeholder="0.00" value={couponForm.minOrderValue} onChange={e=>setCouponForm({...couponForm, minOrderValue: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Limite de Usos Globais</label>
                  <input type="number" step="1" required placeholder="0 = Infinito" value={couponForm.maxUses} onChange={e=>setCouponForm({...couponForm, maxUses: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl text-sm transition-all shadow-md">Adicionar Cupom</button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto md:col-span-2">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-200 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-4 font-bold">Código</th>
                  <th className="px-4 py-4 font-bold">Desconto</th>
                  <th className="px-4 py-4 font-bold">Pedido Mín.</th>
                  <th className="px-4 py-4 font-bold">Usos (Global)</th>
                  <th className="px-4 py-4 font-bold text-right">Status/Ação</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-slate-500">Nenhum cupom cadastrado no sistema.</td></tr>}
                {coupons.map(c => (
                  <tr key={c.code} className={`border-b border-slate-100 hover:bg-slate-50 ${!c.active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-4 font-black text-slate-900 tracking-wider">{c.code}</td>
                    <td className="px-4 py-4 font-bold text-emerald-600">{c.type === 'FIXED' ? `R$ ${Number(c.value).toFixed(2)}` : `${c.value}%`}</td>
                    <td className="px-4 py-4 text-slate-500">R$ {Number(c.minOrderValue).toFixed(2)}</td>
                    <td className="px-4 py-4 font-mono font-bold text-amber-600">
                      {c.usedCount || 0} / {c.maxUses > 0 ? c.maxUses : '∞'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => toggleCouponStatus(c)} className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {c.active ? '🟢 ATIVO' : '🔴 INATIVO'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NOVA ABA: UPSELL (Inteligência de Venda Cruzada) */}
      {/* ========================================================================= */}
      {promoSubTab === 'upsell' && (
        <div className="animate-fade-in-up">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-800 mb-1">🧠 Upsell Dinâmico</h2>
              <p className="text-slate-500 text-xs font-medium">Crie regras para oferecer combos e adicionais automaticamente.</p>
            </div>
            <button 
              onClick={() => { setEditingId(null); setUpsellForm({ name: '', triggerProductIds: [], offerProductId: '', offerPrice: '', channels: [] }); setShowUpsellModal(true); }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md cursor-pointer"
            >
              ➕ Criar Oferta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upsells.map(rule => (
              <div key={rule.id} className={`border rounded-3xl p-5 shadow-sm transition-all ${rule.active ? 'bg-white border-amber-300' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-lg text-slate-800">{rule.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => toggleUpsellActive(rule)} className="text-xl cursor-pointer" title={rule.active ? "Desativar" : "Ativar"}>{rule.active ? '🟢' : '🔴'}</button>
                    <button onClick={() => handleDeleteUpsell(rule.id)} className="text-red-400 hover:text-red-600 font-bold text-sm cursor-pointer">🗑️</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Canais Ativos</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {rule.channels.includes('SALAO') && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">App Garçom</span>}
                      {rule.channels.includes('TOTEM') && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Totem</span>}
                      {rule.channels.includes('APP') && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Cardápio Digital</span>}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] uppercase font-black text-amber-600 mb-1">Se o cliente comprar:</p>
                    <p className="text-xs font-bold text-slate-600 line-clamp-2">{rule.triggerProductIds.map(id => getProductName(id)).join(', ')}</p>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <p className="text-[10px] uppercase font-black text-emerald-600 mb-1">Ofereça automaticamente:</p>
                    <p className="text-sm font-black text-slate-800">{rule.offerProductName}</p>
                    <p className="text-xs font-black text-emerald-600 mt-1">Por: R$ {Number(rule.offerPrice).toFixed(2)}</p>
                  </div>
                </div>

                <button onClick={() => { setEditingId(rule.id); setUpsellForm(rule); setShowUpsellModal(true); }} className="w-full mt-4 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-700 font-black py-2.5 rounded-xl transition-colors text-xs uppercase cursor-pointer">
                  Editar Oferta
                </button>
              </div>
            ))}
            {upsells.length === 0 && <p className="col-span-full text-center text-slate-500 font-bold py-10">Nenhuma oferta de Upsell cadastrada.</p>}
          </div>

          {showUpsellModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="text-xl font-black text-slate-800">{editingId ? 'Editar Oferta' : 'Nova Oferta de Upsell'}</h3>
                  <button onClick={() => setShowUpsellModal(false)} className="text-slate-400 font-bold cursor-pointer text-xl">✕</button>
                </div>

                <form onSubmit={handleSaveUpsell} className="space-y-6 overflow-y-auto pr-2 flex-1 hide-scrollbar">
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome da Regra (Interno)</label>
                    <input type="text" required value={upsellForm.name} onChange={e => setUpsellForm({...upsellForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500" placeholder="Ex: Combos de Burger" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Quais Canais devem exibir esta oferta?</label>
                    <div className="flex gap-3">
                      <label className={`flex-1 border p-3 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${upsellForm.channels.includes('SALAO') ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" checked={upsellForm.channels.includes('SALAO')} onChange={() => handleToggleChannel('SALAO')} className="accent-blue-500 w-4 h-4" /> <span className="text-xs font-black">App Garçom</span>
                      </label>
                      <label className={`flex-1 border p-3 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${upsellForm.channels.includes('TOTEM') ? 'bg-purple-50 border-purple-400' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" checked={upsellForm.channels.includes('TOTEM')} onChange={() => handleToggleChannel('TOTEM')} className="accent-purple-500 w-4 h-4" /> <span className="text-xs font-black">Totem Auto.</span>
                      </label>
                      <label className={`flex-1 border p-3 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${upsellForm.channels.includes('APP') ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" checked={upsellForm.channels.includes('APP')} onChange={() => handleToggleChannel('APP')} className="accent-emerald-500 w-4 h-4" /> <span className="text-xs font-black">Site/Delivery</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <label className="text-xs font-bold text-amber-600 uppercase block mb-3">🍔 PRODUTOS GATILHO (Se o cliente adicionar...)</label>
                    <div className="max-h-40 overflow-y-auto space-y-1 bg-white border border-slate-200 p-2 rounded-xl">
                      {allProducts.map(p => (
                        <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                          <input type="checkbox" checked={upsellForm.triggerProductIds.includes(p.id)} onChange={() => handleToggleTrigger(p.id)} className="accent-amber-500 w-4 h-4" />
                          <span className="text-xs font-bold text-slate-700">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <label className="text-xs font-bold text-emerald-600 uppercase block mb-3">🎁 A OFERTA (Surgirá na tela oferecendo:)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <select required value={upsellForm.offerProductId} onChange={e => setUpsellForm({...upsellForm, offerProductId: e.target.value})} className="w-full bg-white border border-amber-300 rounded-xl p-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500">
                          <option value="">Selecione o produto...</option>
                          {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <input type="number" step="0.01" required value={upsellForm.offerPrice} onChange={e => setUpsellForm({...upsellForm, offerPrice: e.target.value})} className="w-full bg-white border border-amber-300 rounded-xl p-3 text-sm font-black text-emerald-600 focus:outline-none focus:border-emerald-500" placeholder="Preço Promo (R$)" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg mt-4 cursor-pointer text-base">
                    Salvar Oferta
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}