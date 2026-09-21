'use client';
import { useState, useEffect, useCallback } from 'react';

export default function SuppliersTab() {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';
  
  // Controle de Abas
  const [activeTab, setActiveTab] = useState('marketing'); // 'marketing' ou 'b2b'

  // ==========================================
  // ESTADOS: PARCEIROS DE MARKETING (EXISTENTE)
  // ==========================================
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', logoUrl: '', contact: '' });
  const [editingId, setEditingId] = useState(null);

  // ==========================================
  // ESTADOS: FORNECEDORES B2B (NOVO ERP)
  // ==========================================
  const [fornecedores, setFornecedores] = useState([]);
  const initialB2BForm = {
    tipoPessoa: 'JURIDICA', documento: '', razaoSocial: '', nomeFantasia: '', inscricaoEstadual: '', inscricaoMunicipal: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
    responsavel: '', email: '', telefoneFixo: '', celular: '',
    banco: '', agencia: '', tipoConta: 'CORRENTE', numeroConta: '', chavePix: '', condicaoPagamento: '30_DIAS', retencaoImpostos: '',
    categoria: '', observacoes: '', isActive: true
  };
  const [formB2B, setFormB2B] = useState(initialB2BForm);
  const [editingB2BId, setEditingB2BId] = useState(null);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const fetchWithStore = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');
    const headers = { ...(token && { 'Authorization': `Bearer ${token}` }), ...(storeId && { 'x-loja-slug': storeId }), ...options.headers };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 402 && typeof window !== 'undefined') window.location.href = '/bloqueado';
    return response;
  }, []);

  useEffect(() => {
    fetchSuppliers();
    fetchFornecedores();
  }, [fetchWithStore]);

  // ==========================================
  // FUNÇÕES: PARCEIROS MARKETING
  // ==========================================
  const fetchSuppliers = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/suppliers`);
      if (res.ok) setSuppliers(await res.json());
    } catch (e) {}
  };

  const handleSubmitMarketing = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/api/admin/suppliers/${editingId}` : `${API_URL}/api/admin/suppliers`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetchWithStore(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        setForm({ name: '', description: '', logoUrl: '', contact: '' });
        setEditingId(null);
        fetchSuppliers();
        alert("Salvo com sucesso!");
      } else alert("Erro ao salvar.");
    } catch (e) { alert("Erro de conexão."); }
  };

  const handleDeleteMarketing = async (id) => {
    if (!confirm('Deseja excluir este parceiro?')) return;
    try {
      await fetchWithStore(`${API_URL}/api/admin/suppliers/${id}`, { method: 'DELETE' });
      fetchSuppliers();
    } catch (e) {}
  };

  const toggleStatusMarketing = async (s) => {
    try {
      await fetchWithStore(`${API_URL}/api/admin/suppliers/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !s.active }) });
      fetchSuppliers();
    } catch (e) {}
  };

  // ==========================================
  // FUNÇÕES: FORNECEDORES B2B
  // ==========================================
  const fetchFornecedores = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/fornecedores`);
      if (res.ok) setFornecedores(await res.json());
    } catch (e) {}
  };

  const handleCEPBlur = async () => {
    const cepStr = formB2B.cep.replace(/\D/g, '');
    if (cepStr.length !== 8) return;
    setIsSearchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepStr}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormB2B(prev => ({ ...prev, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }));
      } else {
        alert("CEP não encontrado.");
      }
    } catch (e) { alert("Erro ao buscar CEP."); }
    setIsSearchingCep(false);
  };

  const handleSubmitB2B = async (e) => {
    e.preventDefault();
    const url = editingB2BId ? `${API_URL}/api/fornecedores/${editingB2BId}` : `${API_URL}/api/fornecedores`;
    const method = editingB2BId ? 'PUT' : 'POST';
    try {
      const res = await fetchWithStore(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formB2B) });
      const data = await res.json();
      if (data.success) {
        setFormB2B(initialB2BForm);
        setEditingB2BId(null);
        fetchFornecedores();
        alert("Fornecedor B2B salvo com sucesso!");
      } else alert(data.error || "Erro ao salvar fornecedor.");
    } catch (e) { alert("Erro de conexão."); }
  };

  const handleDeleteB2B = async (id) => {
    if (!confirm('Deseja excluir permanentemente este fornecedor do seu ERP?')) return;
    try {
      await fetchWithStore(`${API_URL}/api/fornecedores/${id}`, { method: 'DELETE' });
      fetchFornecedores();
    } catch (e) {}
  };

  const toggleStatusB2B = async (f) => {
    try {
      await fetchWithStore(`${API_URL}/api/fornecedores/${f.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !f.isActive }) });
      fetchFornecedores();
    } catch (e) {}
  };

  const handleEditB2B = (f) => {
    setFormB2B(f);
    setEditingB2BId(f.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* MENU DE ABAS SUPERIOR */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
         <button onClick={() => setActiveTab('b2b')} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none text-center flex items-center justify-center gap-2 ${activeTab === 'b2b' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            🏭 Fornecedores (Estoque & NFe)
         </button>
         <button onClick={() => setActiveTab('marketing')} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none text-center flex items-center justify-center gap-2 ${activeTab === 'marketing' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            📱 Parceiros (Cardápio / Site)
         </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA: FORNECEDORES B2B (CADASTRO COMPLETO DE ERP) */}
      {/* ========================================================================= */}
      {activeTab === 'b2b' && (
        <section className="space-y-6 animate-fade-in-up">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <div>
                 <h2 className="text-xl font-black text-slate-900">{editingB2BId ? '✏️ Editar Fornecedor' : '🏭 Cadastrar Novo Fornecedor'}</h2>
                 <p className="text-sm text-slate-500 mt-1">Cadastro completo para entrada de NFe e integração financeira.</p>
               </div>
               {editingB2BId && <button onClick={() => {setEditingB2BId(null); setFormB2B(initialB2BForm);}} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Cancelar Edição</button>}
            </div>

            <form onSubmit={handleSubmitB2B} className="space-y-8">
               
               {/* 1. DADOS BÁSICOS E IDENTIFICAÇÃO */}
               <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span>📋</span> Dados Básicos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                     <div className="md:col-span-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Tipo de Pessoa</label>
                        <select value={formB2B.tipoPessoa} onChange={e => setFormB2B({...formB2B, tipoPessoa: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 font-bold">
                           <option value="JURIDICA">Pessoa Jurídica (CNPJ)</option>
                           <option value="FISICA">Pessoa Física (CPF)</option>
                        </select>
                     </div>
                     <div className="md:col-span-1 xl:col-span-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">{formB2B.tipoPessoa === 'JURIDICA' ? 'CNPJ' : 'CPF'}</label>
                        <input required type="text" value={formB2B.documento} onChange={e => setFormB2B({...formB2B, documento: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Apenas números..." />
                     </div>
                     <div className="md:col-span-2 xl:col-span-2">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Razão Social / Nome Completo</label>
                        <input required type="text" value={formB2B.razaoSocial} onChange={e => setFormB2B({...formB2B, razaoSocial: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Nome oficial na Receita Federal" />
                     </div>
                     {formB2B.tipoPessoa === 'JURIDICA' && (
                        <>
                           <div className="md:col-span-2 xl:col-span-2">
                              <label className="text-xs font-bold text-slate-500 block mb-1">Nome Fantasia</label>
                              <input type="text" value={formB2B.nomeFantasia} onChange={e => setFormB2B({...formB2B, nomeFantasia: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Como a empresa é conhecida" />
                           </div>
                           <div className="md:col-span-1 xl:col-span-1">
                              <label className="text-xs font-bold text-slate-500 block mb-1">Insc. Estadual (IE)</label>
                              <input type="text" value={formB2B.inscricaoEstadual} onChange={e => setFormB2B({...formB2B, inscricaoEstadual: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="ISENTO ou Números" />
                           </div>
                           <div className="md:col-span-1 xl:col-span-1">
                              <label className="text-xs font-bold text-slate-500 block mb-1">Insc. Municipal (IM)</label>
                              <input type="text" value={formB2B.inscricaoMunicipal} onChange={e => setFormB2B({...formB2B, inscricaoMunicipal: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                           </div>
                        </>
                     )}
                  </div>
               </div>

               {/* 2. ENDEREÇO */}
               <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span>📍</span> Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-4">
                     <div className="md:col-span-1 xl:col-span-1 relative">
                        <label className="text-xs font-bold text-slate-500 block mb-1">CEP</label>
                        <input type="text" value={formB2B.cep} onChange={e => setFormB2B({...formB2B, cep: e.target.value})} onBlur={handleCEPBlur} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="00000-000" />
                        {isSearchingCep && <span className="absolute right-3 top-9 text-[10px] text-amber-500 font-bold animate-pulse">Buscando...</span>}
                     </div>
                     <div className="md:col-span-3 xl:col-span-3">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Logradouro (Rua, Av)</label>
                        <input type="text" value={formB2B.logradouro} onChange={e => setFormB2B({...formB2B, logradouro: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                     </div>
                     <div className="md:col-span-1 xl:col-span-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Número</label>
                        <input type="text" value={formB2B.numero} onChange={e => setFormB2B({...formB2B, numero: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                     </div>
                     <div className="md:col-span-3 xl:col-span-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Complemento</label>
                        <input type="text" value={formB2B.complemento} onChange={e => setFormB2B({...formB2B, complemento: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Sala, Galpão..." />
                     </div>
                     <div className="md:col-span-2 xl:col-span-2">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Bairro</label>
                        <input type="text" value={formB2B.bairro} onChange={e => setFormB2B({...formB2B, bairro: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                     </div>
                     <div className="md:col-span-2 xl:col-span-3">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Cidade</label>
                        <input type="text" value={formB2B.cidade} onChange={e => setFormB2B({...formB2B, cidade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                     </div>
                     <div className="md:col-span-1 xl:col-span-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">UF</label>
                        <input type="text" maxLength="2" value={formB2B.uf} onChange={e => setFormB2B({...formB2B, uf: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 text-center uppercase" />
                     </div>
                  </div>
               </div>

               {/* 3. CONTATO & FINANCEIRO (LADO A LADO) */}
               <div className="pt-6 border-t border-slate-100 grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div>
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span>📞</span> Contatos</h3>
                     <div className="space-y-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 block mb-1">Nome do Contato / Vendedor</label>
                           <input type="text" value={formB2B.responsavel} onChange={e => setFormB2B({...formB2B, responsavel: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Com quem falamos?" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 block mb-1">E-mail Principal</label>
                           <input type="email" value={formB2B.email} onChange={e => setFormB2B({...formB2B, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="usado para enviar pedidos NFe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 block mb-1">Telefone Fixo</label>
                              <input type="text" value={formB2B.telefoneFixo} onChange={e => setFormB2B({...formB2B, telefoneFixo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 block mb-1">Celular / WhatsApp</label>
                              <input type="text" value={formB2B.celular} onChange={e => setFormB2B({...formB2B, celular: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span>💸</span> Dados Financeiros & Fiscais</h3>
                     <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-emerald-800 block mb-1">Chave PIX</label>
                              <input type="text" value={formB2B.chavePix} onChange={e => setFormB2B({...formB2B, chavePix: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="Para pagamento..." />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-emerald-800 block mb-1">Prazo Padrão</label>
                              <select value={formB2B.condicaoPagamento} onChange={e => setFormB2B({...formB2B, condicaoPagamento: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500">
                                 <option value="A_VISTA">A Vista (Antecipado)</option>
                                 <option value="BOLETO_15">Boleto (15 dias)</option>
                                 <option value="BOLETO_30">Boleto (30 dias)</option>
                                 <option value="PRAZO_30_60_90">Prazo 30/60/90</option>
                              </select>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           <div>
                              <label className="text-[10px] font-black text-emerald-700 block mb-1 uppercase tracking-widest">Banco</label>
                              <input type="text" value={formB2B.banco} onChange={e => setFormB2B({...formB2B, banco: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs focus:outline-none" placeholder="Ex: Itaú, Bradesco" />
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-emerald-700 block mb-1 uppercase tracking-widest">Agência</label>
                              <input type="text" value={formB2B.agencia} onChange={e => setFormB2B({...formB2B, agencia: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs focus:outline-none" />
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-emerald-700 block mb-1 uppercase tracking-widest">Conta ({formB2B.tipoConta})</label>
                              <input type="text" value={formB2B.numeroConta} onChange={e => setFormB2B({...formB2B, numeroConta: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs focus:outline-none" />
                           </div>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-emerald-800 block mb-1">Retenções Fixas de Impostos (Opcional)</label>
                           <input type="text" value={formB2B.retencaoImpostos} onChange={e => setFormB2B({...formB2B, retencaoImpostos: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="Ex: IRRF 1.5%, PIS/COFINS/CSLL 4.65%" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* 4. CLASSIFICAÇÃO E OBSERVAÇÕES */}
               <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="text-xs font-bold text-slate-500 block mb-1">Categoria / Ramo de Atividade</label>
                     <input type="text" value={formB2B.categoria} onChange={e => setFormB2B({...formB2B, categoria: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Ex: Carnes, Embalagens, Bebidas, Limpeza..." />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 block mb-1">Observações Internas</label>
                     <textarea rows="2" value={formB2B.observacoes} onChange={e => setFormB2B({...formB2B, observacoes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 resize-none" placeholder="Anotações, regras de entrega, dias de visita..."></textarea>
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg tracking-widest uppercase">
                     {editingB2BId ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
                  </button>
               </div>

            </form>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-black text-slate-900 mb-6">Lista de Fornecedores Cadastrados</h3>
             <div className="overflow-x-auto hide-scrollbar">
               <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <tr>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Razão Social / Fantasia</th>
                        <th className="px-4 py-3">CNPJ/CPF</th>
                        <th className="px-4 py-3">Categoria</th>
                        <th className="px-4 py-3">Contato Principal</th>
                        <th className="px-4 py-3 text-center">Ações</th>
                     </tr>
                  </thead>
                  <tbody>
                     {fornecedores.length === 0 && (
                        <tr><td colSpan="6" className="text-center py-8 text-slate-400 font-bold">Nenhum fornecedor cadastrado.</td></tr>
                     )}
                     {fornecedores.map(f => (
                        <tr key={f.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!f.isActive && 'opacity-50 grayscale'}`}>
                           <td className="px-4 py-3">
                              <button onClick={() => toggleStatusB2B(f)} className={`w-10 h-5 rounded-full relative transition-colors ${f.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                 <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${f.isActive ? 'translate-x-5' : ''}`}></span>
                              </button>
                           </td>
                           <td className="px-4 py-3">
                              <p className="font-black text-slate-900">{f.razaoSocial}</p>
                              {f.nomeFantasia && <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{f.nomeFantasia}</p>}
                           </td>
                           <td className="px-4 py-3 font-mono text-xs">{f.documento}</td>
                           <td className="px-4 py-3 text-xs font-bold text-slate-500">{f.categoria || '-'}</td>
                           <td className="px-4 py-3">
                              {f.celular && <p className="text-xs font-bold text-slate-700">📞 {f.celular}</p>}
                              {f.email && <p className="text-[10px] text-blue-600 mt-0.5">{f.email}</p>}
                           </td>
                           <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                 <button onClick={() => handleEditB2B(f)} className="text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors">Editar</button>
                                 <button onClick={() => handleDeleteB2B(f.id)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors">Excluir</button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* ABA: PARCEIROS MARKETING (LEGADO INTOCÁVEL) */}
      {/* ========================================================================= */}
      {activeTab === 'marketing' && (
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fade-in-up">
          <h2 className="text-xl font-black text-slate-800 mb-2">🤝 Parceiros Oficiais</h2>
          <p className="text-slate-500 text-sm mb-6">Cadastre as marcas que fornecem os ingredientes oficiais da sua loja. Eles aparecerão em formato de carrossel no cardápio dos clientes.</p>

          <form onSubmit={handleSubmitMarketing} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome do Parceiro</label><input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Ex: Wessel, Heinz, Catupiry..." /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">URL do Logotipo (PNG/JPG)</label><input required type="url" value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="https://imgur.com/logo.png" /></div>
            </div>
            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Breve Descrição / O que eles fornecem?</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Ex: Fornecedor oficial dos nossos produtos." /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Contato (Opcional)</label><input type="text" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Telefone ou Instagram" /></div>
            <div className="flex gap-3 pt-2">
                {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({ name: '', description: '', logoUrl: '', contact: '' })}} className="px-6 py-3 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">Cancelar</button>}
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl font-black bg-amber-500 hover:bg-amber-600 text-black transition-colors shadow-md">{editingId ? 'Salvar Alterações' : '+ Adicionar Parceiro (Cardápio)'}</button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className={`p-4 border rounded-2xl flex flex-col gap-4 relative transition-all ${s.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <button onClick={() => toggleStatusMarketing(s)} className={`absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-lg ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{s.active ? 'Visível no Site' : 'Oculto'}</button>
                  <div className="w-16 h-16 bg-slate-100 rounded-xl p-2 flex items-center justify-center overflow-hidden shrink-0"><img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain" /></div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight mb-1">{s.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{s.description || 'Sem descrição'}</p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                    <button onClick={() => handleEdit(s)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 rounded-lg text-xs transition-colors">Editar</button>
                    <button onClick={() => handleDeleteMarketing(s.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg text-xs transition-colors">Excluir</button>
                  </div>
              </div>
            ))}
            {suppliers.length === 0 && <p className="text-slate-500 text-sm col-span-full text-center py-6">Nenhum parceiro cadastrado ainda.</p>}
          </div>
        </section>
      )}
      
    </div>
  );
}