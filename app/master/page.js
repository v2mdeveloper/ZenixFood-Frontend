'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingStore, setEditingStore] = useState(null);
  const [viewingInvoicesStore, setViewingInvoicesStore] = useState(null);
  
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [isGeneratingBoleto, setIsGeneratingBoleto] = useState(false);

  const [newInvoiceForm, setNewInvoiceForm] = useState({ reference: '', amount: '', dueDate: '', notes: '' });

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  useEffect(() => {
    if (localStorage.getItem('zenix_master_token') === 'authenticated') setIsAuthenticated(true);
    else setLoading(false);
  }, []);

  useEffect(() => { if (isAuthenticated) fetchStores(); }, [isAuthenticated]);

  const handleMasterLogin = (e) => {
    e.preventDefault();
    if (masterPassword === 'zenixadmin123') {
      localStorage.setItem('zenix_master_token', 'authenticated');
      setIsAuthenticated(true); setLoginError('');
    } else { setLoginError('Senha incorreta! Acesso negado.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('zenix_master_token');
    setIsAuthenticated(false); setMasterPassword('');
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/master/lojas`, { headers: { 'Authorization': `Bearer zenix_master` } });
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
      plan: store.plan || 'STANDARD', monthlyFee: store.monthlyFee || ''
    });
  };

  const handleOpenInvoices = (store) => {
    setViewingInvoicesStore(store);
    // Sugere valores padrão baseados na loja
    const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    setNewInvoiceForm({ reference: `Mensalidade - ${mesAtual.toUpperCase()}`, amount: store.monthlyFee || '', dueDate: '', notes: '' });
    // fetchInvoices(store.id); // Futura rota para buscar os boletos emitidos
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
      // Garantindo que a mensalidade seja enviada como número
      const payload = { ...editingStore, monthlyFee: Number(editingStore.monthlyFee || 0) };

      const res = await fetch(`${API_URL}/api/master/lojas/${editingStore.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer zenix_master` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) { alert('Loja atualizada!'); setEditingStore(null); fetchStores(); } else alert(data.error);
    } catch (error) { alert('Erro de conexão.'); }
  };

  const toggleStoreStatus = async (store) => {
    if (!confirm(`Deseja ${store.isActive ? 'BLOQUEAR' : 'DESBLOQUEAR'} a loja ${store.razaoSocial}?`)) return;
    try {
      await fetch(`${API_URL}/api/master/lojas/${store.id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer zenix_master` },
        body: JSON.stringify({ status: store.isActive ? 'BLOCKED' : 'ACTIVE' }) // Usa os status novos
      });
      fetchStores();
    } catch (error) { alert('Erro ao alterar status.'); }
  };

  // 🎯 PREPARADO PARA A INTEGRAÇÃO COM O BANCO CORA
  const handleGenerateBoletoCora = async (e) => {
    e.preventDefault();
    setIsGeneratingBoleto(true);
    
    try {
      // Aqui nós enviaremos os dados para a sua API Backend que vai conversar com a API da Cora
      /*
      const res = await fetch(`${API_URL}/api/master/stores/${viewingInvoicesStore.id}/invoices/cora`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer zenix_master` },
         body: JSON.stringify(newInvoiceForm)
      });
      const data = await res.json();
      if(data.success) {
        alert('Boleto Gerado no Banco Cora com sucesso!');
        fetchInvoices(viewingInvoicesStore.id);
        setNewInvoiceForm({ reference: '', amount: viewingInvoicesStore.monthlyFee || '', dueDate: '', notes: '' });
      }
      */
      
      // Simulação para testes até a rota existir
      setTimeout(() => {
        alert(`Integração Cora: Boleto de R$ ${newInvoiceForm.amount} gerado e enviado para ${viewingInvoicesStore.emailEmpresa}!`);
        setIsGeneratingBoleto(false);
        setViewingInvoicesStore(null);
      }, 1500);

    } catch (error) {
      alert("Erro ao comunicar com a API de Boletos.");
      setIsGeneratingBoleto(false);
    }
  };

  const lojasAtivas = stores.filter(s => s.status === 'ACTIVE' || s.isActive).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="text-center mb-8"><span className="text-4xl mb-3 inline-block animate-pulse">👑</span><h1 className="text-2xl font-black text-slate-800">Zenix Master</h1><p className="text-slate-500 text-xs mt-1">Gestão Administrativa SaaS</p></div>
          <form onSubmit={handleMasterLogin} className="space-y-4">
            <input type="password" required value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-center text-slate-900 focus:outline-none focus:border-amber-500 tracking-widest placeholder:tracking-normal" placeholder="Senha Master" />
            {loginError && <p className="text-red-500 text-xs text-center font-bold">{loginError}</p>}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl transition-all shadow-md mt-2 cursor-pointer active:scale-95">Acessar Backoffice</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-amber-500 font-bold"><span className="text-4xl animate-spin mb-4">⚙️</span> Carregando Master...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans p-6 md:p-10">
      
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div><h1 className="text-3xl font-black text-slate-800 flex items-center gap-3"><span>👑</span> Zenix Master</h1><p className="text-slate-500 text-sm mt-1">Gestão central de todos os inquilinos (restaurantes).</p></div>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer text-sm shadow-sm">Sair</button>
          <button onClick={() => router.push('/master/stores/new')} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3 rounded-xl font-black transition-colors shadow-md cursor-pointer">+ Cadastrar Loja</button>
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
                <th className="px-6 py-5">Responsável</th>
                <th className="px-6 py-5">Plano/Mensal</th>
                <th className="px-6 py-5">Acesso Sistema</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5"><p className="font-black text-slate-800 text-base">{store.razaoSocial}</p><p className="text-amber-600 font-mono text-xs">/{store.slug}</p></td>
                  <td className="px-6 py-5"><p className="font-black text-slate-600">{store.nomeResponsavel}</p><p className="text-slate-500 text-xs font-bold">{store.telefoneEmpresa}</p></td>
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
                    <button onClick={() => handleOpenInvoices(store)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">💳 Cobranças (Cora)</button>
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
              
              {/* Formulário Geração Cora */}
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

              {/* Histórico de Faturas */}
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