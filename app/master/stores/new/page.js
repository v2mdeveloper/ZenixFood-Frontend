'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Store, MapPin, User, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

export default function MasterNewStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuperMaster, setIsSuperMaster] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [planos, setPlanos] = useState([]); // 🔥 Planos dinâmicos
  const [contractFile, setContractFile] = useState(null); 
  
  const [form, setForm] = useState({
    slug: '', razaoSocial: '', cnpj: '', inscricaoEstadual: '', municipalRegistration: '',
    emailEmpresa: '', telefoneEmpresa: '', regimeTributario: 'Simples Nacional',
    nomeResponsavel: '', cpfResponsavel: '', emailResponsavel: '', senhaResponsavel: '',
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    planoSaaSId: '', temSuporte: false, valorSuporte: '', 
    adminUserId: '',
    contratoAssinado: false
  });

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  useEffect(() => {
    checkSuperMasterAccess();
    fetchPlanos();
  }, []);

  const checkSuperMasterAccess = async () => {
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      if (localStorage.getItem('zenix_super_token')) setIsSuperMaster(true);

      const res = await fetch(`${API_URL}/api/super/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setIsSuperMaster(true);
        setAdminUsers(await res.json()); 
      }
    } catch (error) {
      console.log("Usuário logado é um Franqueado (não Super Master). O vínculo será automático.");
    }
  };

  const fetchPlanos = async () => {
    try {
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');
      const res = await fetch(`${API_URL}/api/super/planos`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setPlanos(await res.json());
    } catch (error) {}
  };

  // --- MÁSCARAS DE VALIDAÇÃO ---
  const handleRazaoSocialChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setForm(prev => ({ ...prev, razaoSocial: val, slug: generatedSlug }));
  };

  const handleCnpjChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 14) val = val.slice(0, 14);
    val = val.replace(/^(\d{2})(\d)/, '$1.$2');
    val = val.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    val = val.replace(/\.(\d{3})(\d)/, '.$1/$2');
    val = val.replace(/(\d{4})(\d)/, '$1-$2');
    setForm(prev => ({ ...prev, cnpj: val }));
  };

  const handleCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setForm(prev => ({ ...prev, cpfResponsavel: val }));
  };

  const handlePhoneChange = (e, field) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/^(\d{2})(\d)/g, '($1) $2');
    val = val.replace(/(\d)(\d{4})$/, '$1-$2');
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleCepSearch = async (e) => {
    let cepVal = e.target.value.replace(/\D/g, '');
    if (cepVal.length > 8) cepVal = cepVal.slice(0, 8);
    const maskedCep = cepVal.replace(/^(\d{5})(\d)/, '$1-$2');
    setForm(prev => ({ ...prev, cep: maskedCep }));
    if (cepVal.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(prev => ({
            ...prev, street: data.logradouro || '', neighborhood: data.bairro || '',
            city: data.localidade || '', state: data.uf || ''
          }));
        }
      } catch (err) {}
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.cnpj.length < 18) return alert('Por favor, preencha o CNPJ completo.');
    if (form.cpfResponsavel.length < 14) return alert('Por favor, preencha o CPF completo.');
    if (!form.planoSaaSId) return alert('Por favor, selecione um Plano SaaS para a loja.');
    
    setLoading(true);
    try {
      const fullAddress = `${form.street}, ${form.number} ${form.complement ? `- ${form.complement}` : ''} - ${form.neighborhood}, ${form.city}/${form.state} (CEP: ${form.cep})`;
      const token = localStorage.getItem('zenix_super_token') || localStorage.getItem('zenix_master_token');

      // Calcula o valor final da Fatura
      const planoSelecionado = planos.find(p => p.id === form.planoSaaSId);
      const precoPlano = planoSelecionado ? planoSelecionado.precoBase : 0;
      const valorSup = form.temSuporte ? Number(form.valorSuporte || 0) : 0;
      const totalFatura = precoPlano + valorSup;

      const payload = {
        slug: form.slug, razaoSocial: form.razaoSocial, cnpj: form.cnpj, inscricaoEstadual: form.inscricaoEstadual,
        inscricaoMunicipal: form.municipalRegistration, endereco: fullAddress, emailEmpresa: form.emailEmpresa,
        telefoneEmpresa: form.telefoneEmpresa, regimeTributario: form.regimeTributario,
        nomeResponsavel: form.nomeResponsavel, cpfResponsavel: form.cpfResponsavel, emailResponsavel: form.emailResponsavel,
        senhaResponsavel: form.senhaResponsavel, 
        
        plan: planoSelecionado ? planoSelecionado.nome : 'SEM PLANO', 
        planoSaaSId: form.planoSaaSId,
        monthlyFee: totalFatura, 
        temSuporte: form.temSuporte,
        valorSuporte: valorSup,
        contratoAssinado: form.contratoAssinado,

        modulosAtivos: JSON.stringify(["PDV", "KDS", "SALAO", "ESTOQUE", "FINANCEIRO", "FISCAL"]),
        adminUserId: form.adminUserId === '' ? null : form.adminUserId 
      };

      // 1. Cria a Loja
      const res = await fetch(`${API_URL}/api/master/lojas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        const novaLojaId = data.loja.id;

        // 2. Se o contrato estiver assinado e o PDF anexado, faz o upload
        if (form.contratoAssinado && contractFile && novaLojaId) {
            const fileData = new FormData();
            fileData.append('contrato_pdf', contractFile);
            
            await fetch(`${API_URL}/api/master/lojas/${novaLojaId}/contrato`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fileData
            });
        }

        alert(`✅ Empresa "${form.razaoSocial}" cadastrada com sucesso!`);
        router.push('/master');
      } else {
        alert(`⚠️ Erro: ${data.error || 'Não foi possível cadastrar a empresa.'}`);
      }
    } catch (error) { 
        alert('Erro de conexão com o servidor master.'); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12 flex flex-col items-center justify-center animate-fade-in-up">
      <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] w-full max-w-4xl shadow-xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0e4a56] to-[#f58220]"></div>
        
        <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6">
          <button onClick={() => router.back()} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 p-3 rounded-xl transition-all shadow-sm cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#0e4a56] flex items-center gap-3">
              <Store className="w-8 h-8 text-[#f58220]" /> Cadastro de Restaurante
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-bold">Configure o cliente, selecione o plano e valide o contrato de licenciamento.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SEÇÃO 1: DADOS DA EMPRESA */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-[#0e4a56] uppercase tracking-widest flex items-center gap-2"><span>🏬</span> Dados Jurídicos e Fiscais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Razão Social / Nome Fantasia</label>
                <input type="text" required value={form.razaoSocial} onChange={handleRazaoSocialChange} placeholder="Ex: Burger King LTDA" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#f58220] font-bold shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Slug na URL (Acesso do Cliente)</label>
                <input type="text" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="burger-king" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-[#f58220] font-mono focus:outline-none focus:border-[#f58220] font-bold shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">CNPJ</label><input type="text" required value={form.cnpj} onChange={handleCnpjChange} placeholder="00.000.000/0001-00" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] font-mono shadow-sm" /></div>
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Inscrição Estadual</label><input type="text" value={form.inscricaoEstadual} onChange={e => setForm({...form, inscricaoEstadual: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})} placeholder="ISENTO ou Números" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Inscrição Municipal</label><input type="text" value={form.municipalRegistration} onChange={e => setForm({...form, municipalRegistration: e.target.value.replace(/\D/g, '')})} placeholder="Apenas Números" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">E-mail da Empresa</label><input type="email" required value={form.emailEmpresa} onChange={e => setForm({...form, emailEmpresa: e.target.value})} placeholder="contato@empresa.com" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">WhatsApp da Loja</label><input type="tel" required value={form.telefoneEmpresa} onChange={e => handlePhoneChange(e, 'telefoneEmpresa')} placeholder="(11) 99999-9999" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DO RESPONSÁVEL */}
          <div className="bg-sky-50 p-6 rounded-3xl border border-sky-200 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-sky-700 uppercase tracking-widest flex items-center gap-2"><User className="w-4 h-4"/> Responsável & Login Master</h2>
            <p className="text-[10px] text-sky-600 font-bold">Este será o usuário Master que o dono da loja vai utilizar para gerenciar o restaurante.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nome Completo do Dono</label><input type="text" required value={form.nomeResponsavel} onChange={e => setForm({...form, nomeResponsavel: e.target.value})} placeholder="Ex: Carlos Eduardo Silva" className="w-full bg-white border border-sky-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-bold shadow-sm" /></div>
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">CPF do Dono</label><input type="text" required value={form.cpfResponsavel} onChange={handleCpfChange} placeholder="000.000.000-00" className="w-full bg-white border border-sky-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-mono shadow-sm" /></div>
              <div><label className="text-[10px] font-black text-sky-700 uppercase tracking-widest block mb-1">E-mail de Acesso (Login)</label><input type="email" required value={form.emailResponsavel} onChange={e => setForm({...form, emailResponsavel: e.target.value})} placeholder="carlos@exemplo.com" className="w-full bg-white border border-sky-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 font-bold shadow-sm" /></div>
              <div><label className="text-[10px] font-black text-sky-700 uppercase tracking-widest block mb-1">Senha Inicial</label><input type="text" required value={form.senhaResponsavel} onChange={e => setForm({...form, senhaResponsavel: e.target.value})} placeholder="Defina uma senha provisória" className="w-full bg-white border border-sky-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm" /></div>
            </div>
          </div>

          {/* SEÇÃO 3: PLANO E PAGAMENTO DINÂMICO */}
          <div className="bg-purple-50 p-6 rounded-3xl border border-purple-200 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2"><span>💎</span> Plano SaaS e Suporte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Selecione o Pacote Base</label>
                <select 
                  required
                  value={form.planoSaaSId || ''} 
                  onChange={e => setForm({...form, planoSaaSId: e.target.value})} 
                  className="w-full bg-white border border-purple-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-purple-500 font-bold shadow-sm cursor-pointer"
                >
                    <option value="">-- Escolha um Plano --</option>
                    {planos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} - R$ {p.precoBase.toFixed(2)}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Fatura Mensal Final (R$)</label>
                <div className="w-full bg-white border border-purple-300 rounded-xl p-3.5 text-sm text-purple-700 font-black shadow-inner flex items-center">
                    R$ {((planos.find(p => p.id === form.planoSaaSId)?.precoBase || 0) + (form.temSuporte ? Number(form.valorSuporte || 0) : 0)).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-200 mt-2 flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.temSuporte} 
                  onChange={e => setForm({...form, temSuporte: e.target.checked})} 
                  className="w-5 h-5 accent-purple-600"
                />
                <span className="text-sm font-bold text-slate-800">⌨️ Adicionar Mensalidade de Suporte Técnico Extra</span>
              </label>
              {form.temSuporte && (
                <div className="animate-fade-in-up mt-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Valor Cobrado pelo Suporte (R$)</label>
                  <input 
                    type="number" step="0.01" 
                    value={form.valorSuporte} 
                    onChange={e => setForm({...form, valorSuporte: e.target.value})} 
                    placeholder="Ex: 50.00" 
                    className="w-full md:w-1/2 bg-white border border-purple-300 rounded-xl p-3.5 text-sm text-purple-700 font-black shadow-sm focus:outline-none focus:border-purple-500" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* 🔥 NOVO: BLOCO JURÍDICO (DOCUMENTAÇÃO) */}
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-4">
             <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2"><FileText className="w-4 h-4"/> Documentação Jurídica</h4>
             <div className="flex flex-col gap-4">
               <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-sm">
                 <input type="checkbox" checked={form.contratoAssinado} onChange={e => setForm({...form, contratoAssinado: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                 <div>
                   <span className="text-sm font-black text-slate-800 block">Contrato de Licenciamento Assinado pelo Restaurante</span>
                   <span className="text-[10px] text-slate-500 font-bold">Se desmarcado, a loja será gerada mas o acesso ao painel ficará bloqueado.</span>
                 </div>
               </label>

               <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Anexar PDF do Contrato (Opcional)</label>
                 <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setContractFile(e.target.files[0])}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl p-2 text-sm font-bold text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer focus:outline-none"
                 />
               </div>
             </div>
          </div>

          {/* SEÇÃO EXTRA EXCLUSIVA PARA SUPER MASTER: DIRECIONAR FRANQUEADO */}
          {isSuperMaster && (
             <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 space-y-4 shadow-sm">
               <h2 className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-2"><span>👥</span> Vínculo de Gestão (Franqueado)</h2>
               <p className="text-[10px] text-amber-600 font-medium">Selecione qual revendedor receberá as comissões desta loja. Deixe em branco se a loja pertencer à Matriz.</p>
               <div>
                  <select 
                     value={form.adminUserId || ''} 
                     onChange={e => setForm({...form, adminUserId: e.target.value})} 
                     className="w-full bg-white border border-amber-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm font-bold cursor-pointer"
                  >
                     <option value="">-- Sem Vínculo (Pertence à Matriz) --</option>
                     {adminUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                     ))}
                  </select>
               </div>
             </div>
          )}

          {/* SEÇÃO 4: ENDEREÇO DA EMPRESA */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-[#0e4a56] uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4"/> Endereço Completo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">CEP</label><input type="text" required value={form.cep} onChange={handleCepSearch} placeholder="00000-000" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] font-mono shadow-sm" /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Logradouro (Rua / Avenida)</label><input type="text" required value={form.street} onChange={e => setForm({...form, street: e.target.value})} placeholder="Rua Exemplo" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Número</label><input type="text" required value={form.number} onChange={e => setForm({...form, number: e.target.value})} placeholder="123" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Complemento</label><input type="text" value={form.complement} onChange={e => setForm({...form, complement: e.target.value})} placeholder="Sala 2" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Bairro</label><input type="text" required value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} placeholder="Centro" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cidade</label><input type="text" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="São Paulo" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] shadow-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">UF</label><input type="text" required maxLength={2} value={form.state} onChange={e => setForm({...form, state: e.target.value.toUpperCase()})} placeholder="SP" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0e4a56] uppercase font-mono text-center shadow-sm" /></div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row gap-4 border-t border-slate-200">
            <button type="button" onClick={() => router.back()} className="w-full md:w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl cursor-pointer transition-colors border border-slate-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="w-full md:w-2/3 bg-[#0e4a56] hover:bg-[#0a3842] text-white font-black py-4 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95 text-base flex items-center justify-center gap-2">
              {loading ? (
                <><span className="animate-spin text-xl">⏳</span> Processando e Gerando Banco...</>
              ) : (
                <><CheckCircle className="w-5 h-5"/> Cadastrar Restaurante e Liberar Acesso</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}