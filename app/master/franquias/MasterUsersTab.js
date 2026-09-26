'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Shield, ShieldAlert, Store, Search, Download, Filter, Calendar, ArrowLeft } from 'lucide-react';

export default function MasterUsersTab({ API_URL }) {
  const router = useRouter();
  
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', cpf: '', email: '', password: '',
    cep: '', address: '', neighborhood: '', city: '', uf: '',
    role: 'MASTER',
    managedStoreIds: [] 
  });

  const fetchWithToken = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
    const headers = { 'Authorization': `Bearer ${token}`, ...options.headers };
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resUsers = await fetchWithToken(`${API_URL}/api/super/users`);
      if (resUsers.ok) setUsers(await resUsers.json());

      const resStores = await fetchWithToken(`${API_URL}/api/super/stores`);
      if (resStores.ok) setStores(await resStores.json());
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '', cpf: user.cpf || '', email: user.email || '', password: '', 
        cep: user.cep || '', address: user.address || '', neighborhood: user.neighborhood || '', 
        city: user.city || '', uf: user.uf || '', role: user.role || 'MASTER',
        managedStoreIds: user.managedStores ? user.managedStores.map(st => st.id) : []
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '', cpf: '', email: '', password: '', cep: '', address: '', neighborhood: '', city: '', uf: '', role: 'MASTER', managedStoreIds: []
      });
    }
    setIsModalOpen(true);
  };

  // 🎯 MÁSCARAS E BUSCA DE CEP
  const handleCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData(prev => ({ ...prev, cpf: val }));
  };

  const handleCepSearch = async (e) => {
    let cepVal = e.target.value.replace(/\D/g, '');
    if (cepVal.length > 8) cepVal = cepVal.slice(0, 8);
    const maskedCep = cepVal.replace(/^(\d{5})(\d)/, '$1-$2');
    setFormData(prev => ({ ...prev, cep: maskedCep }));
    
    if (cepVal.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev, 
            address: data.logradouro || prev.address, 
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city, 
            uf: data.uf || prev.uf
          }));
        }
      } catch (err) {}
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (formData.cpf && formData.cpf.length > 0 && formData.cpf.length < 14) {
      return alert('Por favor, preencha o CPF completo.');
    }

    const url = editingUser ? `${API_URL}/api/super/users/${editingUser.id}` : `${API_URL}/api/super/users`;
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const res = await fetchWithToken(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      alert("Erro de conexão ao salvar usuário.");
    }
  };

  const toggleUserStatus = async (user) => {
    if (!confirm(`Deseja realmente ${user.isActive ? 'DESATIVAR' : 'ATIVAR'} o acesso deste usuário?`)) return;
    
    try {
      const res = await fetchWithToken(`${API_URL}/api/super/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      });
      if (res.ok) fetchData();
      else alert("Erro ao alterar status.");
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  const toggleStoreAssociation = (storeId) => {
    setFormData(prev => {
      const isLinked = prev.managedStoreIds.includes(storeId);
      if (isLinked) {
        return { ...prev, managedStoreIds: prev.managedStoreIds.filter(id => id !== storeId) };
      } else {
        return { ...prev, managedStoreIds: [...prev.managedStoreIds, storeId] };
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchLower)) ||
      (u.cpf && u.cpf.toLowerCase().includes(searchLower)) ||
      (u.email && u.email.toLowerCase().includes(searchLower)) ||
      (u.managedStores && u.managedStores.some(st => (st.razaoSocial || st.name || '').toLowerCase().includes(searchLower)));

    const matchesRole = filterRole === 'ALL' || u.role === filterRole;

    let matchesDate = true;
    if (filterDate && u.createdAt) {
      const userDate = new Date(u.createdAt).toISOString().split('T')[0];
      matchesDate = userDate === filterDate;
    }

    return matchesSearch && matchesRole && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ['Nome Completo', 'CPF', 'E-mail', 'Nível de Acesso', 'Status', 'Data de Cadastro', 'Lojas Vinculadas'];
    const csvRows = [headers.join(',')];

    filteredUsers.forEach(u => {
      const lojas = u.managedStores ? u.managedStores.map(st => st.razaoSocial || st.name || st.slug).join(' / ') : '';
      const status = u.isActive ? 'Ativo' : 'Bloqueado';
      const dataCadastro = u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-';
      const role = u.role === 'SUPER_MASTER' ? 'Super Master' : 'Master (Franqueado)';
      
      const row = [u.name, u.cpf, u.email, role, status, dataCadastro, lojas];
      csvRows.push(row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','));
    });

    const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Franqueados_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/master')} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 p-3 rounded-xl transition-all shadow-sm cursor-pointer" title="Voltar ao Dashboard">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" /> Gestão de Franqueados
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Gerencie o acesso dos seus revendedores e as lojas vinculadas a eles.</p>
              </div>
            </div>
            <button onClick={() => openModal()} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
              <Plus className="w-5 h-5" /> Adicionar Franqueado
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, CPF, e-mail ou loja..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="relative flex-1 max-w-[200px]">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="relative flex-1 max-w-[200px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-bold appearance-none cursor-pointer"
                >
                  <option value="ALL">Todos os Níveis</option>
                  <option value="MASTER">Franqueados (Master)</option>
                  <option value="SUPER_MASTER">Acesso Global (Super)</option>
                </select>
              </div>
            </div>

            <button onClick={handleExportCSV} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer">
              <Download className="w-4 h-4" /> Exportar Planilha
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <span className="text-4xl animate-spin mb-4">⚙️</span>
                <p className="text-blue-600 font-bold">Carregando usuários...</p>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-5">Usuário & Contato</th>
                    <th className="px-6 py-5">Nível de Acesso</th>
                    <th className="px-6 py-5">Carteira de Clientes (Lojas)</th>
                    <th className="px-6 py-5">Data de Cadastro</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${!u.isActive ? 'opacity-70 bg-red-50/20' : ''}`}>
                      
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-900 text-base">{u.name}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">{u.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">CPF: {u.cpf || 'Não informado'}</p>
                      </td>
                      
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${u.role === 'SUPER_MASTER' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {u.role === 'SUPER_MASTER' ? '👑 SUPER MASTER' : '💼 FRANQUEADO'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-5">
                        {u.role === 'SUPER_MASTER' ? (
                          <span className="text-xs font-bold text-slate-400 italic">Acesso total a todas as lojas</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                              <Store className="w-4 h-4 text-amber-500" /> 
                              {u.managedStores?.length || 0} Restaurante(s)
                            </span>
                            {u.managedStores && u.managedStores.length > 0 && (
                              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] inline-block" title={u.managedStores.map(st => st.razaoSocial).join(', ')}>
                                {u.managedStores.map(st => st.razaoSocial || st.name).join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5 text-xs font-bold text-slate-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-'}
                      </td>

                      <td className="px-6 py-5">
                        <button onClick={() => toggleUserStatus(u)} className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest transition-colors cursor-pointer ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-red-50 text-red-600 border-red-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}>
                          {u.isActive ? 'Permitido' : 'Bloqueado'}
                        </button>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button onClick={() => openModal(u)} className="bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-300 px-4 py-2 rounded-xl transition-all inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <Edit2 className="w-4 h-4" /> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredUsers.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <span className="text-5xl block mb-4">🕵️‍♂️</span>
                        <p className="text-slate-500 font-bold text-lg">Nenhum usuário encontrado.</p>
                        <p className="text-slate-400 text-sm mt-1">Tente limpar os filtros ou adicionar um novo franqueado.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in-up">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl flex flex-col max-h-full overflow-hidden border border-slate-200">
            
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                {editingUser ? <span className="text-amber-500">✏️</span> : <span className="text-blue-500">✨</span>}
                {editingUser ? 'Editar Franqueado' : 'Cadastrar Novo Franqueado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors font-black text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/30 hide-scrollbar">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span>👤</span> Dados Pessoais e Acesso</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nome Completo</label>
                    <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-bold" placeholder="Nome completo" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">CPF</label>
                    <input type="text" value={formData.cpf} onChange={handleCpfChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono" placeholder="Apenas números" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">E-mail (Usado para Login)</label>
                    <input type="email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-bold" placeholder="email@exemplo.com" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{editingUser ? 'Nova Senha (opcional)' : 'Senha Inicial de Acesso'}</label>
                    <input type="password" required={!editingUser} value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500" placeholder={editingUser ? 'Deixe em branco para não alterar' : '••••••••'} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nível de Permissão na Plataforma</label>
                    <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-black cursor-pointer">
                      <option value="MASTER">💼 Franqueado / Revendedor (Gerencia apenas suas lojas)</option>
                      <option value="SUPER_MASTER">👑 Super Master (Dono - Acesso irrestrito a todo o sistema)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span>📍</span> Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">CEP</label>
                    <input type="text" value={formData.cep} onChange={handleCepSearch} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono" placeholder="00000-000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Rua / Logradouro</label>
                    <input type="text" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500" placeholder="Nome da rua" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Bairro</label>
                    <input type="text" value={formData.neighborhood} onChange={e=>setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500" placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cidade</label>
                    <input type="text" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500" placeholder="Cidade" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">UF</label>
                    <input type="text" maxLength="2" value={formData.uf} onChange={e=>setFormData({...formData, uf: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 uppercase font-mono text-center" placeholder="SP" />
                  </div>
                </div>
              </div>

              {formData.role === 'MASTER' && (
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-200 shadow-sm">
                  <h4 className="text-sm font-black text-blue-800 flex items-center gap-2 mb-2">
                    <Store className="w-5 h-5" /> Quais restaurantes este usuário irá gerenciar?
                  </h4>
                  <p className="text-xs text-blue-600 mb-4 font-medium">Ao logar, o Franqueado terá acesso administrativo exclusivo apenas às lojas selecionadas abaixo.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
                    {stores.map(store => (
                      <label key={store.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.managedStoreIds.includes(store.id) ? 'bg-white border-blue-500 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                        <input 
                          type="checkbox" 
                          checked={formData.managedStoreIds.includes(store.id)} 
                          onChange={() => toggleStoreAssociation(store.id)}
                          className="w-5 h-5 accent-blue-600"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{store.razaoSocial || store.name || 'Loja Sem Nome'}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">/{store.slug}</p>
                        </div>
                      </label>
                    ))}
                    {stores.length === 0 && <p className="text-sm text-slate-500 italic">Nenhum restaurante cadastrado no sistema ainda.</p>}
                  </div>
                </div>
              )}
              
              {formData.role === 'SUPER_MASTER' && (
                <div className="bg-purple-50 p-5 rounded-3xl border border-purple-200 flex items-start gap-4 shadow-sm">
                  <span className="text-3xl drop-shadow-sm">👑</span>
                  <div>
                    <h4 className="font-black text-purple-800 mb-1">Acesso Global Liberado</h4>
                    <p className="text-xs text-purple-700 font-medium">Usuários com nível Super Master têm acesso irrestrito a todos os restaurantes e configurações globais da plataforma. Não é necessário vincular lojas específicas.</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 flex gap-4 shrink-0 pb-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-4 rounded-2xl font-bold transition-all hover:bg-slate-100 cursor-pointer shadow-sm">Cancelar</button>
                <button type="submit" className="flex-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 cursor-pointer">
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar Franqueado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}