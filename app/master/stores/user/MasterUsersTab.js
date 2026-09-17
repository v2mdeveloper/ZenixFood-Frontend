import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Shield, ShieldAlert, Store } from 'lucide-react';

export default function MasterUsersTab({ API_URL }) {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]); // Lista de todos os restaurantes para vincular
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '', cpf: '', email: '', password: '',
    cep: '', address: '', neighborhood: '', city: '', uf: '',
    role: 'MASTER',
    managedStoreIds: [] // Array com os IDs das lojas que ele gerencia
  });

  const fetchWithToken = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_token');
    const headers = { 'Authorization': `Bearer ${token}`, ...options.headers };
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Busca todos os usuários do painel master
      const resUsers = await fetchWithToken(`${API_URL}/api/super/users`);
      if (resUsers.ok) setUsers(await resUsers.json());

      // Busca todos os restaurantes/lojas cadastradas para popular o checkbox de vínculo
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
        name: user.name || '', cpf: user.cpf || '', email: user.email || '', password: '', // Senha vazia na edição significa não alterar
        cep: user.cep || '', address: user.address || '', neighborhood: user.neighborhood || '', 
        city: user.city || '', uf: user.uf || '', role: user.role || 'MASTER',
        managedStoreIds: user.managedStores ? user.managedStores.map(s => s.id) : []
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '', cpf: '', email: '', password: '', cep: '', address: '', neighborhood: '', city: '', uf: '', role: 'MASTER', managedStoreIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" /> Gestão de Usuários Master
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gerencie quem tem acesso aos restaurantes. Desative ou edite contas.</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black transition-all shadow-md flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px] relative">
          {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">Carregando...</div>}
          
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-black">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Nível</th>
                <th className="px-6 py-4">Lojas Vinculadas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${!u.isActive ? 'opacity-60 bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">CPF: {u.cpf || 'Não informado'}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${u.role === 'SUPER_MASTER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'SUPER_MASTER' ? 'SUPER MASTER' : 'MASTER (REVENDEDOR)'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'SUPER_MASTER' ? (
                      <span className="text-xs font-bold text-slate-400">Acesso Global</span>
                    ) : (
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Store className="w-4 h-4 text-amber-500" /> 
                        {u.managedStores?.length || 0} Restaurante(s)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleUserStatus(u)} className={`text-[10px] font-black px-3 py-1.5 rounded transition-colors ${u.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                      {u.isActive ? '🟢 ATIVO' : '🔴 BLOQUEADO'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(u)} className="bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 p-2 rounded-lg transition-colors inline-flex items-center gap-2 text-xs font-bold">
                      <Edit2 className="w-4 h-4" /> Editar
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="text-center p-8 text-slate-500">Nenhum usuário cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center items-start p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 relative flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                {editingUser ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                {editingUser ? 'Editar Usuário Master' : 'Cadastrar Novo Usuário Master'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* DADOS PESSOAIS */}
              <div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Dados de Acesso e Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome Completo</label><input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 font-bold" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CPF</label><input type="text" value={formData.cpf} onChange={e=>setFormData({...formData, cpf: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Apenas números" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">E-mail (Login)</label><input type="email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso'}</label><input type="password" required={!editingUser} value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" /></div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nível de Permissão</label>
                    <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 font-bold text-slate-700">
                      <option value="MASTER">Master (Apenas gerencia lojas vinculadas a ele)</option>
                      <option value="SUPER_MASTER">Super Master (Acesso total a TUDO no sistema)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ENDEREÇO */}
              <div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CEP</label><input type="text" value={formData.cep} onChange={e=>setFormData({...formData, cep: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" /></div>
                  <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Rua / Endereço</label><input type="text" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bairro</label><input type="text" value={formData.neighborhood} onChange={e=>setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cidade</label><input type="text" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">UF</label><input type="text" maxLength="2" value={formData.uf} onChange={e=>setFormData({...formData, uf: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 uppercase" /></div>
                </div>
              </div>

              {/* VÍNCULO DE RESTAURANTES (CLIENTES) */}
              {formData.role === 'MASTER' && (
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <h4 className="text-sm font-black text-blue-800 flex items-center gap-2 mb-2">
                    <Store className="w-5 h-5" /> Quais restaurantes este usuário irá gerenciar?
                  </h4>
                  <p className="text-xs text-blue-600 mb-4">Ao logar, ele terá acesso apenas aos painéis das lojas selecionadas abaixo.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                    {stores.map(store => (
                      <label key={store.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.managedStoreIds.includes(store.id) ? 'bg-white border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}>
                        <input 
                          type="checkbox" 
                          checked={formData.managedStoreIds.includes(store.id)} 
                          onChange={() => toggleStoreAssociation(store.id)}
                          className="w-5 h-5 accent-blue-600"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{store.razaoSocial || store.name || 'Loja Sem Nome'}</p>
                          <p className="text-[10px] text-slate-500">{store.slug}</p>
                        </div>
                      </label>
                    ))}
                    {stores.length === 0 && <p className="text-sm text-slate-500 italic">Nenhum restaurante cadastrado no sistema ainda.</p>}
                  </div>
                </div>
              )}
              {formData.role === 'SUPER_MASTER' && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-800 font-bold">Usuários com nível Super Master têm acesso irrestrito a todos os restaurantes e configurações globais da plataforma. Não é necessário vincular lojas específicas.</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold transition-all hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black transition-all shadow-md">Salvar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}