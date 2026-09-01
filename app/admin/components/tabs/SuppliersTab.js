'use client';
import { useState, useEffect } from 'react';

export default function SuppliersTab() {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';
  
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', logoUrl: '', contact: '' });
  const [editingId, setEditingId] = useState(null);

  // Helper local para garantir o envio do x-store-id e Token JWT
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
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/suppliers`);
      if (res.ok) setSuppliers(await res.json());
    } catch (e) { console.error('Erro ao buscar fornecedores'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/api/admin/suppliers/${editingId}` : `${API_URL}/api/admin/suppliers`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetchWithStore(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        setForm({ name: '', description: '', logoUrl: '', contact: '' });
        setEditingId(null);
        fetchSuppliers();
      } else alert("Erro ao salvar.");
    } catch (e) { alert("Erro de conexão."); }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, description: s.description, logoUrl: s.logoUrl, contact: s.contact });
    setEditingId(s.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este parceiro/fornecedor?')) return;
    try {
      await fetchWithStore(`${API_URL}/api/admin/suppliers/${id}`, { method: 'DELETE' });
      fetchSuppliers();
    } catch (e) { alert("Erro ao excluir."); }
  };

  const toggleStatus = async (s) => {
    try {
      await fetchWithStore(`${API_URL}/api/admin/suppliers/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !s.active }) });
      fetchSuppliers();
    } catch (e) { alert("Erro ao alterar status."); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-2">🤝 Nossos Parceiros & Fornecedores</h2>
        <p className="text-slate-500 text-sm mb-6">Cadastre as marcas que fornecem os ingredientes oficiais da sua loja. Eles aparecerão em formato de carrossel no cardápio dos clientes.</p>

        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome do Fornecedor</label><input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Ex: Wessel, Heinz, Catupiry..." /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">URL do Logotipo (PNG/JPG)</label><input required type="url" value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="https://imgur.com/logo.png" /></div>
          </div>
          <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Breve Descrição / O que eles fornecem?</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Ex: Fornecedor oficial dos nossos produtos." /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Contato (Opcional)</label><input type="text" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Telefone ou Instagram" /></div>
          <div className="flex gap-3 pt-2">
             {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({ name: '', description: '', logoUrl: '', contact: '' })}} className="px-6 py-3 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">Cancelar</button>}
             <button type="submit" className="flex-1 px-6 py-3 rounded-xl font-black bg-amber-500 hover:bg-amber-600 text-black transition-colors shadow-md">{editingId ? 'Salvar Alterações' : '+ Adicionar Parceiro'}</button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className={`p-4 border rounded-2xl flex flex-col gap-4 relative transition-all ${s.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
               <button onClick={() => toggleStatus(s)} className={`absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-lg ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{s.active ? 'Visível no Site' : 'Oculto'}</button>
               <div className="w-16 h-16 bg-slate-100 rounded-xl p-2 flex items-center justify-center overflow-hidden shrink-0"><img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain" /></div>
               <div>
                  <h4 className="font-black text-slate-800 text-lg leading-tight mb-1">{s.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{s.description || 'Sem descrição'}</p>
               </div>
               <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button onClick={() => handleEdit(s)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 rounded-lg text-xs transition-colors">Editar</button>
                  <button onClick={() => handleDelete(s.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg text-xs transition-colors">Excluir</button>
               </div>
            </div>
          ))}
          {suppliers.length === 0 && <p className="text-slate-500 text-sm col-span-full text-center py-6">Nenhum parceiro cadastrado ainda.</p>}
        </div>
      </div>
    </div>
  );
}