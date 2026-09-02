'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterNewStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', corporateName: '', cnpj: '', stateRegistration: '', municipalRegistration: '',
    companyEmail: '', companyPhone: '', ownerName: '', ownerCpf: '', ownerEmail: '', ownerPhone: '',
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    logoUrl: '', plan: 'STANDARD'
  });

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  // --- MÁSCARAS DE VALIDAÇÃO ---
  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
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
    if (form.cnpj.length < 18) return alert('Por favor, preencha o CNPJ completo.');
    if (form.ownerCpf.length < 14) return alert('Por favor, preencha o CPF completo.');
    
    setLoading(true);
    const masterToken = localStorage.getItem('zenix_master_token') || localStorage.getItem('zenix_token');

    try {
      const fullAddress = `${form.street}, ${form.number} ${form.complement ? `- ${form.complement}` : ''} - ${form.neighborhood}, ${form.city}/${form.state} (CEP: ${form.cep})`;
      const payload = { ...form, address: fullAddress };

      const res = await fetch(`${API_URL}/api/master/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(masterToken && { 'Authorization': `Bearer ${masterToken}` }) },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ Empresa "${form.name}" cadastrada com sucesso!`);
        router.push('/master');
      } else {
        alert(`❌ Erro: ${data.error || 'Não foi possível cadastrar a empresa.'}`);
      }
    } catch (error) { alert('Erro de conexão com o servidor master.'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] w-full max-w-4xl shadow-xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>

        <div className="text-center mb-10">
          <span className="text-5xl mb-3 inline-block">🏢</span>
          <h1 className="text-3xl font-black text-slate-800">Cadastro Completo de Inquilino</h1>
          <p className="text-slate-500 text-xs mt-1">Insira os dados jurídicos, fiscais, de contato e do responsável legal pelo estabelecimento.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SEÇÃO 1: DADOS DA EMPRESA */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"><span>🏛️</span> Dados Jurídicos e Fiscais da Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Fantasia (Estabelecimento)</label>
                <input type="text" required value={form.name} onChange={handleNameChange} placeholder="Ex: Canone Burger" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-bold shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Razão Social</label>
                <input type="text" required value={form.corporateName} onChange={e => setForm({...form, corporateName: e.target.value})} placeholder="Ex: Canone Alimentos LTDA" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CNPJ</label>
                <input type="text" required value={form.cnpj} onChange={handleCnpjChange} placeholder="00.000.000/0001-00" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-mono shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inscrição Estadual</label>
                <input type="text" value={form.stateRegistration} onChange={e => setForm({...form, stateRegistration: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})} placeholder="Apenas Números ou ISENTO" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inscrição Municipal</label>
                <input type="text" value={form.municipalRegistration} onChange={e => setForm({...form, municipalRegistration: e.target.value.replace(/\D/g, '')})} placeholder="Apenas Números" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Slug na URL (Sistema)</label>
                <input type="text" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="canone-burger" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-amber-600 font-mono focus:outline-none focus:border-amber-500 font-bold shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail da Empresa</label>
                <input type="email" required value={form.companyEmail} onChange={e => setForm({...form, companyEmail: e.target.value})} placeholder="contato@empresa.com" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Telefone / WhatsApp da Loja</label>
                <input type="tel" required value={form.companyPhone} onChange={e => handlePhoneChange(e, 'companyPhone')} placeholder="(11) 99999-9999" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm" />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DO RESPONSÁVEL */}
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><span>👤</span> Dados do Responsável Legal / Sócio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo</label>
                <input type="text" required value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} placeholder="Ex: Carlos Eduardo Silva" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-bold shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CPF</label>
                <input type="text" required value={form.ownerCpf} onChange={handleCpfChange} placeholder="000.000.000-00" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail Pessoal</label>
                <input type="email" required value={form.ownerEmail} onChange={e => setForm({...form, ownerEmail: e.target.value})} placeholder="carlos@exemplo.com" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Celular Pessoal</label>
                <input type="tel" required value={form.ownerPhone} onChange={e => handlePhoneChange(e, 'ownerPhone')} placeholder="(11) 99999-9999" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm" />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: ENDEREÇO DA EMPRESA */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><span>📍</span> Endereço Completo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CEP</label>
                <input type="text" required value={form.cep} onChange={handleCepSearch} placeholder="00000-000" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-mono shadow-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Logradouro (Rua / Avenida)</label>
                <input type="text" required value={form.street} onChange={e => setForm({...form, street: e.target.value})} placeholder="Rua Exemplo" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Número</label>
                <input type="text" required value={form.number} onChange={e => setForm({...form, number: e.target.value})} placeholder="123" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Complemento</label>
                <input type="text" value={form.complement} onChange={e => setForm({...form, complement: e.target.value})} placeholder="Sala 2" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Bairro</label>
                <input type="text" required value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} placeholder="Centro" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cidade</label>
                  <input type="text" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="São Paulo" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">UF</label>
                  <input type="text" required maxLength={2} value={form.state} onChange={e => setForm({...form, state: e.target.value.toUpperCase()})} placeholder="SP" className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 uppercase font-mono text-center shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={() => router.back()} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl cursor-pointer transition-colors border border-slate-300">
              Voltar
            </button>
            <button type="submit" disabled={loading} className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95 text-base">
              {loading ? 'Cadastrando...' : 'Cadastrar Empresa 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}