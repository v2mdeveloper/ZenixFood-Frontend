'use client';
import { useState, useEffect } from 'react';

export default function RhTab() {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [rhSubTab, setRhSubTab] = useState('equipe'); // 'equipe' ou 'contas'

  const [profiles, setProfiles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeAccounts, setEmployeeAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tipPercentage, setTipPercentage] = useState(10);
  const [isSavingTip, setIsSavingTip] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', permissions: [] });

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '', cpf: '', age: '', address: '', email: '', phone: '', password: '', profileId: '', isActive: true, receivesTips: false, creditLimit: '', discountPercent: ''
  });

  const [logs, setLogs] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Estados do Extrato e Pagamento (Fiado)
  const [showExtratoModal, setShowExtratoModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [extratoStartDate, setExtratoStartDate] = useState('');
  const [extratoEndDate, setExtratoEndDate] = useState('');
  const [managerAuth, setManagerAuth] = useState({ email: '', password: '' });

  //  Helper local para garantir o envio do x-store-id e Token JWT
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    //SE O BACKEND BARRAR POR FALTA DE PAGAMENTO:
    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; // Redireciona para a tela de aviso
      }
    }

    return response;
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.tipPercentage !== undefined) setTipPercentage(Number(data.tipPercentage));
      }
    } catch (e) {}
  };

  const handleSaveTipConfig = async (e) => {
    e.preventDefault();
    setIsSavingTip(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/settings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipPercentage })
      });
      if (res.ok) alert('Taxa de serviço global salva com sucesso!');
    } catch (e) { alert('Erro ao salvar taxa.'); }
    setIsSavingTip(false);
  };

  const fetchData = async () => {
    try {
      const [resP, resE, resA] = await Promise.all([ 
        fetchWithStore(`${API_URL}/api/rh/profiles`), 
        fetchWithStore(`${API_URL}/api/rh/employees`),
        fetchWithStore(`${API_URL}/api/rh/employee-accounts`)
      ]);
      if (resP.ok) setProfiles(await resP.json());
      if (resE.ok) setEmployees(await resE.json());
      if (resA.ok) setEmployeeAccounts(await resA.json());
    } catch (e) { console.error("Erro ao buscar RH"); }
    setLoading(false);
  };

  const fetchLogs = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/rh/logs`);
      if (res.ok) setLogs(await res.json());
      setShowLogsModal(true);
    } catch (e) { alert('Erro ao buscar logs'); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const method = editingProfileId ? 'PUT' : 'POST';
    const url = editingProfileId ? `${API_URL}/api/rh/profiles/${editingProfileId}` : `${API_URL}/api/rh/profiles`;
    
    try {
      const res = await fetchWithStore(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) { 
        setShowProfileModal(false); 
        setEditingProfileId(null);
        setProfileForm({ name: '', permissions: [] }); 
        fetchData(); 
      }
      else alert(data.error);
    } catch (e) { alert('Erro de comunicação.'); }
  };

  const openEditProfile = (p) => {
    setEditingProfileId(p.id);
    setProfileForm({ name: p.name, permissions: JSON.parse(p.permissions || '[]') });
    setShowProfileModal(true);
  };

  const handleDeleteProfile = async (id) => {
    if (!confirm('Deseja excluir este perfil?')) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/rh/profiles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData(); else alert(data.error);
    } catch (e) { alert('Erro de conexão.'); }
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    const payload = { 
      ...employeeForm, 
      creditLimit: Number(employeeForm.creditLimit || 0), 
      discountPercent: Number(employeeForm.discountPercent || 0) 
    };

    const method = editingEmployeeId ? 'PUT' : 'POST';
    const url = editingEmployeeId ? `${API_URL}/api/rh/employees/${editingEmployeeId}` : `${API_URL}/api/rh/employees`;
    try {
      const res = await fetchWithStore(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) { 
        setShowEmployeeModal(false); 
        setEditingEmployeeId(null); 
        setEmployeeForm({ name: '', cpf: '', age: '', address: '', email: '', phone: '', password: '', profileId: '', isActive: true, receivesTips: false, creditLimit: '', discountPercent: '' }); 
        fetchData(); 
      }
      else alert(data.error || 'Erro ao salvar funcionário');
    } catch (e) { alert('Erro ao salvar'); }
  };

  const openEditEmployee = (emp) => {
    setEditingEmployeeId(emp.id);
    setEmployeeForm({ 
      name: emp.name, cpf: emp.cpf, age: emp.age, address: emp.address, email: emp.email, phone: emp.phone, password: '', 
      profileId: emp.profileId, isActive: emp.isActive, receivesTips: emp.receivesTips,
      creditLimit: emp.creditLimit || '', discountPercent: emp.discountPercent || '' 
    });
    setShowEmployeeModal(true);
  };

  const handlePayAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/rh/employee-accounts/pay`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ employeeId: selectedAccount.id, authData: managerAuth }) 
      });
      const data = await res.json();
      if (data.success) { 
        alert('Conta paga e zerada com sucesso!'); 
        setShowPayModal(false); 
        setManagerAuth({ email: '', password: '' }); 
        fetchData(); 
      } else { alert(data.error); }
    } catch (e) { alert('Erro na comunicação com o servidor.'); }
  };

  const togglePermission = (perm) => {
    setProfileForm(prev => {
      if (prev.permissions.includes(perm)) return { ...prev, permissions: prev.permissions.filter(p => p !== perm) };
      return { ...prev, permissions: [...prev.permissions, perm] };
    });
  };

  const handleToggleAllPermissions = () => {
    const allPermIds = AVAILABLE_PERMISSIONS.map(p => p.id);
    if (profileForm.permissions.length === allPermIds.length) {
      setProfileForm({ ...profileForm, permissions: [] }); 
    } else {
      setProfileForm({ ...profileForm, permissions: allPermIds }); 
    }
  };

  // Filtro Dinâmico para o Extrato
  const filteredMovements = selectedAccount?.accountMovements?.filter(m => {
    if (extratoStartDate) {
       if (new Date(m.createdAt) < new Date(extratoStartDate + 'T00:00:00')) return false;
    }
    if (extratoEndDate) {
       if (new Date(m.createdAt) > new Date(extratoEndDate + 'T23:59:59')) return false;
    }
    return true;
  }) || [];

  const exportExtratoToExcel = () => {
    if (!selectedAccount) return;
    const rows = filteredMovements.map(m => [ 
       new Date(m.createdAt).toLocaleDateString('pt-BR'), 
       m.type === 'CHARGE' ? 'Compra' : 'Pagamento', 
       m.description, 
       `R$ ${m.amount.toFixed(2)}`, 
       m.isPaid ? 'Pago' : 'Pendente' 
    ]);
    const csvContent = ["Data;Tipo;Descrição;Valor;Status", ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); 
    link.href = URL.createObjectURL(blob); 
    link.download = `Extrato_${selectedAccount.name.replace(/\s/g,'_')}.csv`; 
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const AVAILABLE_PERMISSIONS = [
    { id: 'pdv', label: '💻 PDV / Frente de Caixa', desc: 'Abertura, fechamento e vendas no caixa.' },
    { id: 'salao', label: '🪑 Salão & Mesas', desc: 'Gerenciar mapa de mesas e comandas.' },
    { id: 'kds', label: '🖥️ Telas KDS (Produção)', desc: 'Acesso unificado às telas de Cozinha, Delivery e Bar.' },
    { id: 'expedicao', label: '🛵 Expedição & Rotas', desc: 'Gerenciar entregas e despachar motoboys.' },
    { id: 'historico', label: '📊 Relatórios Analíticos', desc: 'Histórico de vendas, top produtos, clientes e comissões.' },
    { id: 'turnos', label: '💰 Turnos & Faturamento', desc: 'Relatórios de fechamento de turnos diários.' },
    { id: 'analytics', label: '📈 Acessos (Analytics)', desc: 'Gráficos de visitas ao cardápio digital.' },
    { id: 'produtos', label: '🍟 Produtos', desc: 'Cadastrar, editar e excluir itens do catálogo.' },
    { id: 'categorias', label: '📑 Categorias', desc: 'Gerir seções do cardápio.' },
    { id: 'promocoes', label: '🎟️ Promoções & Cupons', desc: 'Criar cupons e organizar destaques.' },
    { id: 'upsell', label: '🧠 Upsell (IA)', desc: 'Criar regras de venda cruzada inteligente.' },
    { id: 'crm', label: '👥 Clientes', desc: 'Gerenciar base de dados dos clientes.' },
    { id: 'fornecedores', label: '🤝 Parceiros/Fornecedores', desc: 'Cadastro de distribuidores.' },
    { id: 'rh', label: '👔 RH & Funcionários', desc: 'Gerir a equipe, acessos e taxas de comissão.' },
    { id: 'estoque', label: '📦 Estoque & Fichas', desc: 'Insumos, notas XML, Chef IA e análise de CMV.' },
    { id: 'impressoes', label: '🖨️ Impressoras & Praças', desc: 'Configurar hardware de impressão e grupos de produção.' },
    { id: 'fiscal', label: '🧾 Fiscal (NFC-e)', desc: 'Configuração e emissão de notas fiscais.' },
    { id: 'config', label: '⚙️ Configurações', desc: 'Ajustar horários, informações da loja e integrações.' },
    { id: 'gestao', label: '🔒 Gerência Suprema', desc: 'Autorizar sangrias, estornos e acessos irrestritos.' }
  ];

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Carregando dados da equipe...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      
      <div className="flex flex-wrap gap-4 border-b border-slate-200 pb-4 mb-6">
        <button onClick={() => setRhSubTab('equipe')} className={`font-bold pb-2 transition-all cursor-pointer ${rhSubTab === 'equipe' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-amber-500'}`}>👔 Equipe e Permissões</button>
        <button onClick={() => setRhSubTab('contas')} className={`font-bold pb-2 transition-all cursor-pointer flex items-center gap-2 ${rhSubTab === 'contas' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-amber-500'}`}>
           💰 Contas e Fiado 
           {employeeAccounts.some(e => e.hasOverdue) && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA: EQUIPE E CADASTROS */}
      {/* ========================================================================= */}
      {rhSubTab === 'equipe' && (
        <>
          <div className="bg-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-600/20 text-white flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div>
              <h2 className="text-xl font-black mb-1 flex items-center gap-2"><span>💰</span> Política de Comissões (Taxa de Serviço)</h2>
              <p className="text-emerald-100 text-sm font-medium">Defina a porcentagem global que os garçons recebem sobre as vendas deles.</p>
            </div>
            <form onSubmit={handleSaveTipConfig} className="flex items-center gap-3 w-full md:w-auto bg-black/20 p-2 rounded-2xl">
              <input 
                type="number" step="0.1" min="0" max="100" required
                value={tipPercentage} onChange={e => setTipPercentage(e.target.value)}
                className="w-24 bg-white border-none rounded-xl p-3 text-lg font-black text-emerald-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
              />
              <span className="font-black text-xl">%</span>
              <button type="submit" disabled={isSavingTip} className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-xl transition-all cursor-pointer">
                {isSavingTip ? 'Salvando...' : 'Salvar Taxa'}
              </button>
            </form>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-800 mb-1">👔 Gestão de RH e Equipe</h2>
              <p className="text-slate-500 text-xs font-medium">Cadastre funcionários, defina comissões e controle o que eles podem aceder no sistema.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchLogs} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">📋 Ver Logs de Acesso</button>
              <button onClick={() => { setEditingEmployeeId(null); setEmployeeForm({ name: '', cpf: '', age: '', address: '', email: '', phone: '', password: '', profileId: '', isActive: true, receivesTips: false, creditLimit: '', discountPercent: '' }); setShowEmployeeModal(true); }} className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 cursor-pointer">➕ Novo Funcionário</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-lg">Perfis de Acesso</h3>
                <button onClick={() => { setEditingProfileId(null); setProfileForm({ name: '', permissions: [] }); setShowProfileModal(true); }} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer">Criar Perfil</button>
              </div>
              <div className="space-y-3">
                {profiles.map(p => {
                  const perms = JSON.parse(p.permissions || '[]');
                  return (
                    <div key={p.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-slate-800 text-sm">{p.name}</h4>
                        <div className="flex gap-3">
                          <button onClick={() => openEditProfile(p)} className="text-amber-500 hover:text-amber-600 text-xs font-bold cursor-pointer">Editar</button>
                          <button onClick={() => handleDeleteProfile(p.id)} className="text-red-400 hover:text-red-600 text-xs font-bold cursor-pointer">Excluir</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[10px] font-bold text-slate-500">{perms.length} permissões ativas</span>
                      </div>
                    </div>
                  )
                })}
                {profiles.length === 0 && <p className="text-center text-xs text-slate-400 italic py-4">Nenhum perfil cadastrado.</p>}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100"><h3 className="font-black text-slate-800 text-lg">Quadro de Funcionários</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50">
                    <tr><th className="px-6 py-4 font-black">Funcionário</th><th className="px-6 py-4 font-black">Acesso / Perfil</th><th className="px-6 py-4 font-black">Comissão</th><th className="px-6 py-4 font-black">Status</th><th className="px-6 py-4 font-black text-right">Ação</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-900 leading-tight">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">{emp.email} | {emp.cpf}</p>
                        </td>
                        <td className="px-6 py-4"><span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">{emp.profile?.name || 'Sem Perfil'}</span></td>
                        <td className="px-6 py-4">
                          {emp.receivesTips ? <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">Sim ({tipPercentage}%)</span> : <span className="text-slate-400 text-xs font-bold">—</span>}
                        </td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${emp.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{emp.isActive ? 'Ativo' : 'Inativo'}</span></td>
                        <td className="px-6 py-4 text-right"><button onClick={() => openEditEmployee(emp)} className="text-amber-600 hover:text-amber-700 font-bold text-xs cursor-pointer">Editar Cadastro</button></td>
                      </tr>
                    ))}
                    {employees.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-500">Nenhum funcionário cadastrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* ABA: CONTAS E FIADO */}
      {/* ========================================================================= */}
      {rhSubTab === 'contas' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg mb-6">Controle Financeiro de Consumo (Fiado)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {employeeAccounts.map(emp => (
               <div key={emp.id} className={`p-5 rounded-2xl border-2 transition-all shadow-sm flex flex-col ${emp.hasOverdue ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-amber-400'}`}>
                  {emp.hasOverdue && <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm mb-3 self-start">Bloqueado (Dívida Antiga)</span>}
                  
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 text-xl leading-none mb-1">{emp.name}</h4>
                    <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-wider">{emp.profile?.name}</p>
                    
                    <div className="space-y-1.5 text-sm font-medium text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                       <div className="flex justify-between"><span>Dívida Atual:</span><span className="font-black text-red-500">R$ {(emp.currentDebt || 0).toFixed(2)}</span></div>
                       <div className="flex justify-between"><span>Limite Total:</span><span className="font-black text-slate-800">R$ {(emp.creditLimit || 0).toFixed(2)}</span></div>
                       <div className="flex justify-between"><span>Desconto Aplicado:</span><span className="font-black text-emerald-600">{emp.discountPercent || 0}%</span></div>
                       
                       <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
                          <div className={`h-full ${emp.hasOverdue ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, ((emp.currentDebt || 0) / (emp.creditLimit || 1)) * 100)}%`}}></div>
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200/50 shrink-0">
                     <button onClick={() => { setSelectedAccount(emp); setShowExtratoModal(true); setExtratoStartDate(''); setExtratoEndDate(''); }} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer shadow-sm transition-all">Ver Extrato</button>
                     <button onClick={() => { setSelectedAccount(emp); setShowPayModal(true); }} disabled={!emp.currentDebt || emp.currentDebt <= 0} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer shadow-sm transition-all disabled:cursor-not-allowed">Receber Pagto</button>
                  </div>
               </div>
             ))}
             {employeeAccounts.length === 0 && <p className="col-span-full text-center text-slate-500 text-sm py-10">Nenhuma conta de funcionário encontrada.</p>}
          </div>
        </div>
      )}

      {/* MODAL: CRIAR/EDITAR PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <h3 className="text-xl font-black text-slate-800">{editingProfileId ? 'Editar Perfil de Acesso' : 'Criar Novo Perfil'}</h3>
               <button onClick={() => { setShowProfileModal(false); setEditingProfileId(null); }} className="text-slate-400 font-bold cursor-pointer hover:text-red-500 text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="flex flex-col flex-1 overflow-hidden">
              <div className="mb-6 shrink-0">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome do Perfil</label>
                <input type="text" required placeholder="Ex: Garçom Chefe, Gerente..." value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
              </div>
              
              <div className="flex justify-between items-end mb-3 shrink-0">
                 <label className="text-xs font-bold text-slate-500 uppercase block">Liberar Acesso Aos Módulos:</label>
                 <button type="button" onClick={handleToggleAllPermissions} className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer bg-blue-50 px-2 py-1 rounded">
                   Marcar/Desmarcar Todos
                 </button>
              </div>

              <div className="overflow-y-auto pr-2 pb-4 space-y-3 hide-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${profileForm.permissions.includes(perm.id) ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <input type="checkbox" checked={profileForm.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} className="w-4 h-4 accent-blue-600 cursor-pointer mt-0.5 shrink-0" />
                      <div>
                         <p className="text-xs font-black text-slate-800 leading-none mb-1">{perm.label}</p>
                         <p className="text-[10px] text-slate-500 font-medium leading-tight">{perm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 shrink-0 mt-2">
                 <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-all cursor-pointer">
                    {editingProfileId ? 'Salvar Alterações do Perfil' : 'Criar Perfil de Acesso'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR/EDITAR FUNCIONÁRIO COM LIMITES E DESCONTOS */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0"><h3 className="text-xl font-black text-slate-800">{editingEmployeeId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3><button onClick={() => setShowEmployeeModal(false)} className="text-slate-400 font-bold cursor-pointer hover:text-red-500 text-xl">✕</button></div>
            <form onSubmit={handleSaveEmployee} className="space-y-4 overflow-y-auto pr-2 hide-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nome Completo</label><input type="text" required value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">CPF (Usa p/ Login)</label><input type="text" required value={employeeForm.cpf} onChange={e => setEmployeeForm({...employeeForm, cpf: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">E-mail Corporativo</label><input type="email" required value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Telefone</label><input type="text" required value={employeeForm.phone} onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Endereço Completo</label><input type="text" required value={employeeForm.address} onChange={e => setEmployeeForm({...employeeForm, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
              </div>

              {/* BLOCO FINANCEIRO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <div><label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">Limite de Compra Fiado (R$)</label><input type="number" step="0.01" required value={employeeForm.creditLimit} onChange={e => setEmployeeForm({...employeeForm, creditLimit: e.target.value})} className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500" placeholder="0.00" /></div>
                <div><label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">Desconto Fixo no Consumo (%)</label><input type="number" step="1" max="100" required value={employeeForm.discountPercent} onChange={e => setEmployeeForm({...employeeForm, discountPercent: e.target.value})} className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500" placeholder="Ex: 50" /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">Perfil de Acesso</label>
                  <select required value={employeeForm.profileId} onChange={e => setEmployeeForm({...employeeForm, profileId: e.target.value})} className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-blue-500 cursor-pointer text-blue-800">
                    <option value="">Selecione o cargo...</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">{editingEmployeeId ? 'Nova Senha (Opcional)' : 'Senha de Acesso'}</label>
                  <input type="password" required={!editingEmployeeId} value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 text-amber-900" placeholder="••••••••" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                 <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${employeeForm.receivesTips ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'}`}>
                    <input type="checkbox" checked={employeeForm.receivesTips} onChange={e => setEmployeeForm({...employeeForm, receivesTips: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                    <div><span className="block text-sm font-black text-emerald-800 mb-0.5">Participa da Comissão?</span><span className="block text-[10px] text-slate-500">Ganha {tipPercentage}% sobre os pedidos lançados.</span></div>
                 </label>
                 
                 {editingEmployeeId && (
                   <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${employeeForm.isActive ? 'bg-blue-50 border-blue-400' : 'bg-red-50 border-red-400'}`}>
                      <input type="checkbox" checked={employeeForm.isActive} onChange={e => setEmployeeForm({...employeeForm, isActive: e.target.checked})} className="w-5 h-5" />
                      <div><span className={`block text-sm font-black mb-0.5 ${employeeForm.isActive ? 'text-blue-800' : 'text-red-800'}`}>Conta Ativa?</span><span className="block text-[10px] text-slate-500">Se desmarcar, perde acesso.</span></div>
                   </label>
                 )}
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-all mt-6 cursor-pointer">Salvar Funcionário</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER EXTRATO ANALÍTICO */}
      {showExtratoModal && selectedAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <div>
                  <h3 className="text-xl font-black text-slate-800">Extrato Analítico</h3>
                  <p className="text-sm text-slate-500 font-medium">Conta de {selectedAccount.name}</p>
               </div>
               <button onClick={() => setShowExtratoModal(false)} className="text-slate-400 font-bold cursor-pointer hover:text-red-500 text-xl">✕</button>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data Início</label>
                 <input type="date" value={extratoStartDate} onChange={e => setExtratoStartDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold focus:outline-none focus:border-amber-500" />
               </div>
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data Fim</label>
                 <input type="date" value={extratoEndDate} onChange={e => setExtratoEndDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold focus:outline-none focus:border-amber-500" />
               </div>
               <div className="flex items-end">
                 <button onClick={exportExtratoToExcel} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-5 py-2 rounded-lg shadow-sm transition-all text-xs cursor-pointer flex items-center gap-2">
                   📥 Exportar Excel
                 </button>
               </div>
            </div>

            <div className="overflow-y-auto pr-2 pb-4 flex-1 hide-scrollbar border border-slate-100 rounded-2xl">
               <table className="w-full text-left text-sm text-slate-700">
                 <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50 sticky top-0">
                   <tr>
                      <th className="px-4 py-3 font-black">Data</th>
                      <th className="px-4 py-3 font-black">Descrição</th>
                      <th className="px-4 py-3 font-black text-right">Valor</th>
                      <th className="px-4 py-3 font-black text-center">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredMovements.length === 0 ? (
                     <tr><td colSpan="4" className="text-center py-8 text-slate-500 font-medium">Nenhum movimento neste período.</td></tr>
                   ) : (
                     filteredMovements.map(m => (
                       <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3">
                             <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mr-2 ${m.type === 'CHARGE' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{m.type === 'CHARGE' ? 'Compra' : 'Pagto'}</span>
                             {m.description}
                          </td>
                          <td className={`px-4 py-3 text-right font-black ${m.type === 'CHARGE' ? 'text-red-500' : 'text-emerald-500'}`}>
                             {m.type === 'CHARGE' ? '-' : '+'}R$ {m.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                             {m.isPaid ? <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">PAGO</span> : <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">PENDENTE</span>}
                          </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GERAR PAGAMENTO (ACERTO DE CONTAS) */}
      {showPayModal && selectedAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Acerto de Contas</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Você está a fechar e zerar a conta de <strong>{selectedAccount.name}</strong> no valor de <strong className="text-red-500">R$ {selectedAccount.currentDebt.toFixed(2)}</strong>.</p>

            <form onSubmit={handlePayAccount} className="space-y-4 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Autenticação do Gerente</p>
                <input type="text" required value={managerAuth.email} onChange={e => setManagerAuth({...managerAuth, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 mb-2" placeholder="Seu E-mail ou CPF" />
                <input type="password" required value={managerAuth.password} onChange={e => setManagerAuth({...managerAuth, password: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="Sua Senha" />
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold text-slate-700 cursor-pointer">Cancelar</button>
                 <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Pagar Agora</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 shrink-0"><h3 className="text-lg font-black text-slate-800">📋 Logs e Auditoria do Sistema</h3><button onClick={() => setShowLogsModal(false)} className="text-slate-400 font-bold cursor-pointer">✕</button></div>
            <div className="overflow-y-auto space-y-3 flex-1 hide-scrollbar pr-2">
              {logs.map(log => (
                <div key={log.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-2">
                  <div>
                     <p className="text-xs font-black text-slate-800 uppercase">{log.action}</p>
                     <p className="text-[10px] font-bold text-slate-500">{log.employee?.name} ({log.employee?.role}) - {new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                     {log.details && <p className="text-[9px] text-slate-400 mt-1">{log.details}</p>}
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-center text-slate-400 text-sm py-10">Nenhum log registrado ainda.</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}