'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterNewStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    // Identificação e Domínio
    name: '',
    slug: '',
    corporateName: '', // Razão Social
    
    // Documentos da Empresa
    cnpj: '',
    stateRegistration: '', // Inscrição Estadual
    municipalRegistration: '', // Inscrição Municipal

    // Contatos da Empresa
    companyEmail: '',
    companyPhone: '',

    // Dados do Responsável / Sócio
    ownerName: '',
    ownerCpf: '',
    ownerEmail: '',
    ownerPhone: '',

    // Endereço Completo
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',

    // Configurações e Plano
    logoUrl: '',
    plan: 'STANDARD'
  });

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    setForm(prev => ({ ...prev, name: val, slug: generatedSlug }));
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
    setForm(prev => ({ ...prev, ownerCpf: val }));
  };

  const handleCepSearch = async (e) => {
    const cepVal = e.target.value.replace(/\D/g, '');
    setForm(prev => ({ ...prev, cep: cepVal }));
    if (cepVal.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }));
        }
      } catch (err) {}
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const masterToken = localStorage.getItem('zenix_master_token') || localStorage.getItem('zenix_token');

    try {
      const fullAddress = `${form.street}, ${form.number} ${form.complement ? `- ${form.complement}` : ''} - ${form.neighborhood}, ${form.city}/${form.state} (CEP: ${form.cep})`;
      
      const payload = {
        ...form,
        address: fullAddress
      };

      const res = await fetch(`${API_URL}/api/master/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(masterToken && { 'Authorization': `Bearer ${masterToken}` })
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`✅ Empresa "${form.name}" cadastrada com sucesso! Slug: /${form.slug}`);
        router.push('/master/stores');
      } else {
        alert(`❌ Erro: ${data.error || 'Não foi possível cadastrar a empresa.'}`);
      }
    } catch (error) {
      alert('Erro de conexão com o servidor master.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>

        <div className="text-center mb-10">
          <span className="text-5xl mb-3 inline-block">🏢</span>
          <h1 className="text-3xl font-black">Cadastro Completo da Empresa</h1>
          <p className="text-slate-400 text-xs mt-1">Insira os dados jurídicos, fiscais, de contato e do responsável legal pelo estabelecimento.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SEÇÃO 1: DADOS DA EMPRESA (JURÍDICO) */}
          <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <span>🏛️</span> Dados Jurídicos e Fiscais da Empresa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nome Fantasia (Estabelecimento)</label>
                <input 
                  type="text" 
                  required 
                  value={form.name} 
                  onChange={handleNameChange} 
                  placeholder="Ex: Canone Burger" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500 font-bold" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Razão Social (Nome Jurídico)</label>
                <input 
                  type="text" 
                  required 
                  value={form.corporateName} 
                  onChange={e => setForm({...form, corporateName: e.target.value})} 
                  placeholder="Ex: Canone Alimentos LTDA" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">CNPJ</label>
                <input 
                  type="text" 
                  required 
                  maxLength={18}
                  value={form.cnpj} 
                  onChange={handleCnpjChange} 
                  placeholder="00.000.000/0001-00" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Inscrição Estadual (Opcional)</label>
                <input 
                  type="text" 
                  value={form.stateRegistration} 
                  onChange={e => setForm({...form, stateRegistration: e.target.value})} 
                  placeholder="Isento ou Nº" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Inscrição Municipal (Opcional)</label>
                <input 
                  type="text" 
                  value={form.municipalRegistration} 
                  onChange={e => setForm({...form, municipalRegistration: e.target.value})} 
                  placeholder="Nº da Inscrição" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Slug na URL (Sistema)</label>
                <input 
                  type="text" 
                  required 
                  value={form.slug} 
                  onChange={e => setForm({...form, slug: e.target.value})} 
                  placeholder="canone-burger" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-amber-500 font-mono focus:outline-none focus:border-amber-500 font-bold" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">E-mail da Empresa</label>
                <input 
                  type="email" 
                  required 
                  value={form.companyEmail} 
                  onChange={e => setForm({...form, companyEmail: e.target.value})} 
                  placeholder="contato@empresa.com" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Telefone da Empresa</label>
                <input 
                  type="tel" 
                  required 
                  value={form.companyPhone} 
                  onChange={e => setForm({...form, companyPhone: e.target.value})} 
                  placeholder="(11) 3333-4444" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DO RESPONSÁVEL / SÓCIO */}
          <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
              <span>👤</span> Dados do Responsável Legal / Sócio
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nome Completo do Responsável</label>
                <input 
                  type="text" 
                  required 
                  value={form.ownerName} 
                  onChange={e => setForm({...form, ownerName: e.target.value})} 
                  placeholder="Ex: Carlos Eduardo Silva" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500 font-bold" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">CPF do Responsável</label>
                <input 
                  type="text" 
                  required 
                  maxLength={14}
                  value={form.ownerCpf} 
                  onChange={handleCpfChange} 
                  placeholder="000.000.000-00" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">E-mail do Responsável</label>
                <input 
                  type="email" 
                  required 
                  value={form.ownerEmail} 
                  onChange={e => setForm({...form, ownerEmail: e.target.value})} 
                  placeholder="carlos@empresa.com" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Celular / WhatsApp do Responsável</label>
                <input 
                  type="tel" 
                  required 
                  value={form.ownerPhone} 
                  onChange={e => setForm({...form, ownerPhone: e.target.value})} 
                  placeholder="(11) 99999-9999" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: ENDEREÇO DA EMPRESA */}
          <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <span>📍</span> Endereço Completo do Estabelecimento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">CEP</label>
                <input 
                  type="text" 
                  required 
                  maxLength={9}
                  value={form.cep} 
                  onChange={handleCepSearch} 
                  placeholder="00000-000" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Logradouro (Rua / Avenida)</label>
                <input 
                  type="text" 
                  required 
                  value={form.street} 
                  onChange={e => setForm({...form, street: e.target.value})} 
                  placeholder="Rua Exemplo" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Número</label>
                <input 
                  type="text" 
                  required 
                  value={form.number} 
                  onChange={e => setForm({...form, number: e.target.value})} 
                  placeholder="123" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Complemento</label>
                <input 
                  type="text" 
                  value={form.complement} 
                  onChange={e => setForm({...form, complement: e.target.value})} 
                  placeholder="Sala 2, Loja..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Bairro</label>
                <input 
                  type="text" 
                  required 
                  value={form.neighborhood} 
                  onChange={e => setForm({...form, neighborhood: e.target.value})} 
                  placeholder="Centro" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cidade</label>
                  <input 
                    type="text" 
                    required 
                    value={form.city} 
                    onChange={e => setForm({...form, city: e.target.value})} 
                    placeholder="São Paulo" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">UF</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={2}
                    value={form.state} 
                    onChange={e => setForm({...form, state: e.target.value})} 
                    placeholder="SP" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 uppercase font-mono text-center" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: PLANO E LOGOTIPO */}
          <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-xs font-black text-purple-500 uppercase tracking-widest flex items-center gap-2">
              <span>⚙️</span> Configurações de Assinatura e Logotipo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">URL do Logotipo</label>
                <input 
                  type="url" 
                  value={form.logoUrl} 
                  onChange={e => setForm({...form, logoUrl: e.target.value})} 
                  placeholder="https://exemplo.com/logo.png" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-purple-500" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Plano Contratado</label>
                <select 
                  value={form.plan} 
                  onChange={e => setForm({...form, plan: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
                >
                  <option value="STANDARD">Padrão (Standard)</option>
                  <option value="PRO">Profissional (Pro)</option>
                  <option value="ENTERPRISE">Enterprise / Franquia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl cursor-pointer transition-colors text-sm"
            >
              Voltar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl shadow-xl cursor-pointer transition-all active:scale-95 text-base"
            >
              {loading ? 'Cadastrando Empresa...' : 'Cadastrar e Provisionar Empresa 🚀'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
