'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function MinhaEmpresaPage() {
  const params = useParams();
  const storeSlug = params.storeSlug;

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);

  // Helper local para garantir o envio do x-store-id e Token JWT
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_adminToken') || localStorage.getItem('zenix_employeeToken');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        // Busca os dados REAIS da loja atual no banco de dados
        const resStore = await fetchWithStore(`${API_URL}/api/admin/store-info`);
        const data = await resStore.json();

        if (resStore.ok && data.success !== false) {
          // data.store se o backend enviar { store: {...} } ou apenas data se enviar direto
          setStoreData(data.store || data); 
          setInvoices(data.invoices || []); // Faturas agora vêm do banco (vazio por enquanto)
        } else {
          setError(data.error || 'Não foi possível carregar os dados reais da loja.');
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-amber-500 font-black text-xl flex flex-col items-center gap-4">
          <span className="text-4xl">🏢</span>
          Buscando dados oficiais da loja...
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
        <span className="text-6xl mb-4 text-red-500">⚠️</span>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Ops! Tivemos um problema.</h1>
        <p className="text-slate-500">{error || 'Dados da loja não encontrados no banco.'}</p>
      </div>
    );
  }

  // Define visualmente o status da assinatura baseada no banco (TRIAL, ACTIVE, OVERDUE, BLOCKED)
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <span>🏢</span> Dados da Empresa e Assinatura
        </h1>
        <p className="text-slate-500 mt-1">
          Gerencie as informações fiscais, contatos e o plano da sua loja.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: DADOS CADASTRAIS (Ocupa 2 colunas no desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Jurídico */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <span>🏛️</span> Informações Fiscais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Fantasia</p>
                <p className="text-lg font-black text-slate-900">{storeData.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razão Social</p>
                <p className="text-base font-bold text-slate-700">{storeData.corporateName || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</p>
                <p className="text-base font-mono font-bold text-slate-700">{storeData.documentCnpj || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscrição Estadual</p>
                <p className="text-base font-mono font-bold text-slate-700">{storeData.stateRegistration || 'Não informada'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Completo</p>
                <p className="text-sm font-bold text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {storeData.address || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Responsável e Contatos */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <span>👤</span> Responsável Legal & Contato
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Sócio/Responsável</p>
                <p className="text-base font-bold text-slate-900">{storeData.ownerName || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF do Responsável</p>
                <p className="text-base font-mono font-bold text-slate-700">{storeData.ownerCpf || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Comercial</p>
                <p className="text-sm font-bold text-slate-700">{storeData.email || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</p>
                <p className="text-sm font-bold text-slate-700">{storeData.phone || '-'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: PLANO E FATURAS */}
        <div className="space-y-6">
          
          {/* Card: Status do Plano */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 shadow-xl text-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="text-8xl">🚀</span>
            </div>
            
            <h2 className="text-xs font-black uppercase tracking-widest mb-4 opacity-80">
              Seu Plano Atual
            </h2>
            
            <div className="flex items-end gap-3 mb-2 relative z-10">
              <span className="text-4xl font-black">{storeData.plan || 'STANDARD'}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-4 relative z-10">
              <span className={`w-3 h-3 rounded-full ${subStatus.color} ${subStatus.shadow}`}></span>
              <span className="text-sm font-black uppercase tracking-widest text-white">
                {subStatus.label}
              </span>
            </div>
            
            <p className="text-xs font-bold mt-6 bg-black/10 p-3 rounded-xl relative z-10">
              Valor da Mensalidade: <span className="font-black text-white ml-1">R$ {parseFloat(storeData.monthlyFee || 0).toFixed(2)}</span>
            </p>
          </div>

          {/* Card: Histórico de Faturas */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <span>💳</span> Mensalidades e Faturas
            </h2>

            {invoices.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <span className="text-4xl mb-2 block">📄</span>
                <p className="text-sm font-bold text-slate-500">Nenhuma fatura gerada ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:border-amber-500/50">
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-800">{invoice.reference}</span>
                        {invoice.status === 'PAID' ? (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Pago</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Em Aberto</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Venc: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-lg font-black text-slate-900">
                        R$ {parseFloat(invoice.amount).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-colors shadow-sm ${invoice.status === 'PAID' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}`}
                        title="Baixar Fatura"
                      >
                        ⬇️
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