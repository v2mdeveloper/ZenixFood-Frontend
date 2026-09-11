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
  const [nextPaymentDate, setNextPaymentDate] = useState(null); // NOVO STATE

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_adminToken') || localStorage.getItem('zenix_employeeToken');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');
    const headers = { ...(token && { 'Authorization': `Bearer ${token}` }), ...(storeId && { 'x-loja-slug': storeId }), ...options.headers };
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
          setNextPaymentDate(data.nextPaymentDate || null);
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

  // INTEGRAÇÃO DE DOWNLOAD DO BOLETO
  const handleDownloadInvoice = (invoice) => {
    if (invoice.pdfUrl) {
      // Abre o PDF do boleto em uma nova aba
      window.open(invoice.pdfUrl, '_blank');
    } else {
      alert(`⚠️ Solicitando 2ª Via do boleto ${invoice.reference} via Banco Cora...`);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 animate-pulse text-amber-500 font-black text-xl gap-4"><span className="text-4xl">🏢</span> Buscando dados oficiais da loja...</div>;
  if (error || !storeData) return <div className="flex flex-col items-center justify-center text-center py-20"><span className="text-6xl mb-4 text-red-500">⚠️</span><h1 className="text-2xl font-black text-slate-800 mb-2">Ops! Tivemos um problema.</h1><p className="text-slate-500">{error || 'Dados da loja não encontrados no banco.'}</p></div>;

  const getSubscriptionStatus = (status) => {
    if (storeData.isActive === false || status === 'OVERDUE') return { label: 'Inadimplente (Bloqueado)', color: 'bg-red-500', shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.8)]' };
    if (status === 'TRIAL') return { label: 'Período de Teste', color: 'bg-blue-400', shadow: 'shadow-[0_0_10px_rgba(96,165,250,0.8)]' };
    return { label: 'Assinatura Ativa', color: 'bg-emerald-400', shadow: 'shadow-[0_0_10px_rgba(52,211,153,0.8)]' };
  };

  const subStatus = getSubscriptionStatus(storeData.status);

  return (
    <div className="animate-fade-in-up space-y-6 pb-10">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800">Dados da Empresa e Assinatura</h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie as informações fiscais, contatos e faturas do sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6"><span>🏛️</span> Informações Fiscais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Fantasia</p><p className="text-lg font-black text-slate-900">{storeData.name || storeData.razaoSocial}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razão Social</p><p className="text-base font-bold text-slate-700">{storeData.corporateName || storeData.razaoSocial || '-'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</p><p className="text-base font-mono font-bold text-slate-700">{storeData.cnpj || storeData.documentCnpj || '-'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Comercial</p><p className="text-sm font-bold text-slate-700">{storeData.emailEmpresa || '-'}</p></div>
              <div className="md:col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Completo</p><p className="text-sm font-bold text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">{storeData.endereco || storeData.address || '-'}</p></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* PAINEL DE ASSINATURA */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-80 text-emerald-400">Status do Plano</h3>
            <div className="flex items-end gap-3 mb-2 relative z-10">
               <span className="text-3xl font-black">{storeData.plan || 'STANDARD'}</span>
            </div>
            <div className="flex items-center gap-2 mt-4 relative z-10">
              <span className={`w-3 h-3 rounded-full ${subStatus.color} ${subStatus.shadow} animate-pulse`}></span>
              <span className="text-sm font-black uppercase tracking-widest text-slate-300">{subStatus.label}</span>
            </div>
            
            {/* PRÓXIMO VENCIMENTO */}
            <div className="mt-6 bg-white/10 border border-white/20 p-4 rounded-2xl relative z-10 flex flex-col gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo Vencimento</p>
              <p className="text-xl font-black text-white">{nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString('pt-BR') : '--/--/----'}</p>
              <p className="text-sm font-bold text-emerald-400 mt-1">R$ {parseFloat(storeData.monthlyFee || 149.90).toFixed(2)}</p>
            </div>
          </div>

          {/* LISTAGEM DE FATURAS (CORA) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6"><span>📄</span> Histórico de Faturas</h3>
            {invoices.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <span className="text-4xl mb-2 block">🧾</span>
                <p className="text-sm font-bold text-slate-500">Nenhuma fatura encontrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between gap-3 transition-colors hover:border-blue-300">
                    <div className="flex items-start justify-between w-full">
                      <div>
                        <span className="text-xs font-black text-slate-800 block mb-1">{invoice.reference}</span>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Vence em: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      {invoice.status === 'PAID' ? (
                        <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase px-2 py-1 rounded-md">Pago</span>
                      ) : invoice.status === 'OVERDUE' ? (
                        <span className="bg-red-100 text-red-700 border border-red-200 text-[9px] font-black uppercase px-2 py-1 rounded-md">Vencido</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-black uppercase px-2 py-1 rounded-md">Aberto</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between w-full pt-2 border-t border-slate-200/50">
                      <p className="text-lg font-black text-slate-900">R$ {parseFloat(invoice.amount).toFixed(2)}</p>
                      
                      {/* BOTÃO PARA BAIXAR/GERAR BOLETO (PDF) */}
                      <button 
                        onClick={() => handleDownloadInvoice(invoice)} 
                        className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-xl font-bold cursor-pointer transition-all shadow-sm active:scale-95"
                      >
                        <span className="text-base">📄</span> {invoice.status === 'PAID' ? 'Ver Recibo' : 'Gerar Boleto'}
                      </button>
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