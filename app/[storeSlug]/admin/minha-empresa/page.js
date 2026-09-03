'use client';
import { useState, useEffect } from 'react';

export default function MinhaEmpresaTab() {
  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_adminToken') || localStorage.getItem('zenix_employeeToken');
    const storeId = localStorage.getItem('zenix_store_id');
    const headers = { ...(token && { 'Authorization': `Bearer ${token}` }), ...(storeId && { 'x-store-id': storeId }), ...options.headers };
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const resStore = await fetchWithStore(`${API_URL}/api/admin/store-info`);
        const data = await resStore.json();
        if (resStore.ok && data.success !== false) {
          setStoreData(data.store || data); 
          setInvoices(data.invoices || []);
        } else {
          setError(data.error || 'Não foi possível carregar os dados reais da loja.');
        }
      } catch (error) {
        setError('Erro de conexão ao buscar dados do banco.');
      } finally {
        setLoading(false);
      }
    };
    loadCompanyData();
  }, []);

  const handleDownloadInvoice = (invoiceId) => {
    alert(`Iniciando download da fatura ${invoiceId}...`);
  };

  if (loading) return <div className="flex items-center justify-center py-20 animate-pulse text-amber-500 font-black text-xl gap-4"><span className="text-4xl">🏢</span> Buscando dados oficiais da loja...</div>;
  if (error || !storeData) return <div className="flex flex-col items-center justify-center text-center py-20"><span className="text-6xl mb-4 text-red-500">⚠️</span><h1 className="text-2xl font-black text-slate-800 mb-2">Ops! Tivemos um problema.</h1><p className="text-slate-500">{error || 'Dados da loja não encontrados no banco.'}</p></div>;

  const getSubscriptionStatus = (status) => {
    switch(status) {
      case 'ACTIVE': return { label: 'Assinatura Ativa', color: 'bg-emerald-400', shadow: 'shadow-[0_0_10px_rgba(52,211,153,0.8)]' };
      case 'TRIAL': return { label: 'Período de Teste', color: 'bg-blue-400', shadow: 'shadow-[0_0_10px_rgba(96,165,250,0.8)]' };
      case 'OVERDUE': return { label: 'Inadimplente (Atrasado)', color: 'bg-red-500', shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.8)]' };
      case 'BLOCKED': return { label: 'Acesso Bloqueado', color: 'bg-slate-800', shadow: '' };
      default: return { label: 'Status Desconhecido', color: 'bg-slate-400', shadow: '' };
    }
  };

  const subStatus = getSubscriptionStatus(storeData.subscriptionStatus);

  return (
    <div className="animate-fade-in-up space-y-6 pb-10">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800">Dados da Empresa e Assinatura</h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie as informações fiscais, contatos e o plano da sua loja.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6"><span>🏛️</span> Informações Fiscais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Fantasia</p><p className="text-lg font-black text-slate-900">{storeData.name}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razão Social</p><p className="text-base font-bold text-slate-700">{storeData.corporateName || '-'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</p><p className="text-base font-mono font-bold text-slate-700">{storeData.documentCnpj || '-'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscrição Estadual</p><p className="text-base font-mono font-bold text-slate-700">{storeData.stateRegistration || 'Não informada'}</p></div>
              <div className="md:col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Completo</p><p className="text-sm font-bold text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">{storeData.address || '-'}</p></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6"><span>👤</span> Responsável Legal & Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Sócio</p><p className="text-base font-bold text-slate-900">{storeData.ownerName || '-'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF</p><p className="text-base font-mono font-bold text-slate-700">{storeData.ownerCpf || '-'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Comercial</p><p className="text-sm font-bold text-slate-700">{storeData.email || '-'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</p><p className="text-sm font-bold text-slate-700">{storeData.phone || '-'}</p></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 shadow-xl text-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><span className="text-8xl">🚀</span></div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-80">Seu Plano Atual</h3>
            <div className="flex items-end gap-3 mb-2 relative z-10"><span className="text-4xl font-black">{storeData.plan || 'STANDARD'}</span></div>
            <div className="flex items-center gap-2 mt-4 relative z-10">
              <span className={`w-3 h-3 rounded-full ${subStatus.color} ${subStatus.shadow}`}></span>
              <span className="text-sm font-black uppercase tracking-widest text-white">{subStatus.label}</span>
            </div>
            <p className="text-xs font-bold mt-6 bg-black/10 p-3 rounded-xl relative z-10">
              Mensalidade: <span className="font-black text-white ml-1">R$ {parseFloat(storeData.monthlyFee || 0).toFixed(2)}</span>
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6"><span>💳</span> Faturas</h3>
            {invoices.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <span className="text-4xl mb-2 block">📄</span>
                <p className="text-sm font-bold text-slate-500">Nenhuma fatura gerada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between gap-2 transition-colors hover:border-amber-500/50">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black text-slate-800">{invoice.reference}</span>
                      {invoice.status === 'PAID' ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Pago</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Aberto</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="text-lg font-black text-slate-900">R$ {parseFloat(invoice.amount).toFixed(2)}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Venc: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <button onClick={() => handleDownloadInvoice(invoice.id)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer shadow-sm">⬇️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}