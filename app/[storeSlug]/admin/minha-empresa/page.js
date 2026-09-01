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
  const [invoices, setInvoices] = useState([]);

  // Helper local para garantir o envio do x-store-id e Token JWT
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_adminToken');
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
        // 1. Busca os dados reais da loja no backend (adapte a rota conforme seu backend)
        const resStore = await fetchWithStore(`${API_URL}/api/admin/store-info`);
        if (resStore.ok) {
          const data = await resStore.json();
          setStoreData(data.store);
        } else {
          // Fallback visual para demonstração caso a rota ainda não exista
          setStoreData({
            name: 'Carregando...',
            corporateName: 'Razão Social Padrão LTDA',
            cnpj: '00.000.000/0001-00',
            stateRegistration: 'Isento',
            companyEmail: 'contato@loja.com',
            companyPhone: '(00) 0000-0000',
            ownerName: 'Administrador Responsável',
            ownerCpf: '000.000.000-00',
            address: 'Endereço Completo do Estabelecimento',
            plan: 'PRO',
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
          });
        }

        // 2. Busca as faturas (Mock demonstrativo. Substitua pela rota real da sua API de pagamentos/Asaas/Stripe)
        // const resInvoices = await fetchWithStore(`${API_URL}/api/admin/invoices`);
        setInvoices([
          { id: 'INV-2026-09', reference: 'Setembro 2026', dueDate: '2026-09-10', amount: 149.90, status: 'OPEN', link: '#' },
          { id: 'INV-2026-08', reference: 'Agosto 2026', dueDate: '2026-08-10', amount: 149.90, status: 'PAID', link: '#' },
          { id: 'INV-2026-07', reference: 'Julho 2026', dueDate: '2026-07-10', amount: 149.90, status: 'PAID', link: '#' },
        ]);

      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  const handleDownloadInvoice = (invoiceId) => {
    // Lógica para baixar o PDF da fatura via backend
    alert(`Iniciando download da fatura ${invoiceId}...`);
  };

  if (loading || !storeData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-amber-500 font-black text-xl flex flex-col items-center gap-4">
          <span className="text-4xl">🏢</span>
          Carregando dados da empresa...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans p-4 md:p-8">
      
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <span>🏢</span> Dados da Empresa e Assinatura
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">
          Gerencie as informações fiscais, contatos e o plano da sua loja.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: DADOS CADASTRAIS (Ocupa 2 colunas no desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Jurídico */}
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <span>🏛️</span> Informações Fiscais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Fantasia</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{storeData.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razão Social</p>
                <p className="text-base font-bold text-slate-700 dark:text-zinc-300">{storeData.corporateName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</p>
                <p className="text-base font-mono font-bold text-slate-700 dark:text-zinc-300">{storeData.cnpj}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscrição Estadual</p>
                <p className="text-base font-mono font-bold text-slate-700 dark:text-zinc-300">{storeData.stateRegistration || 'Não informada'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Completo</p>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-300 mt-1 bg-slate-50 dark:bg-black/30 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  {storeData.address}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Responsável e Contatos */}
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <span>👤</span> Responsável Legal & Contato
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Sócio/Responsável</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{storeData.ownerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF do Responsável</p>
                <p className="text-base font-mono font-bold text-slate-700 dark:text-zinc-300">{storeData.ownerCpf}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Comercial</p>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{storeData.companyEmail}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</p>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{storeData.companyPhone}</p>
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
            
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-black">{storeData.plan || 'STANDARD'}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <span className={`w-3 h-3 rounded-full ${storeData.status === 'ACTIVE' ? 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]' : 'bg-red-400'}`}></span>
              <span className="text-sm font-black uppercase tracking-widest">
                {storeData.status === 'ACTIVE' ? 'Assinatura Ativa' : 'Assinatura Bloqueada'}
              </span>
            </div>
            
            <p className="text-xs font-bold mt-6 bg-black/10 p-3 rounded-xl">
              Dúvidas sobre o plano ou deseja fazer um upgrade? Entre em contato com o suporte Zenix.
            </p>
          </div>

          {/* Card: Histórico de Faturas */}
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <span>💳</span> Mensalidades e Faturas
            </h2>

            {invoices.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <span className="text-4xl mb-2 block">📄</span>
                <p className="text-sm font-bold">Nenhuma fatura gerada ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:border-amber-500/50">
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-800 dark:text-white">{invoice.reference}</span>
                        {invoice.status === 'PAID' ? (
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Pago</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Em Aberto</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Venc: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        R$ {invoice.amount.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-colors shadow-sm ${invoice.status === 'PAID' ? 'bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}`}
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