'use client';
import { useState, useEffect } from 'react';

// ============================================================================
// FUNÇÕES DE MÁSCARA (Helpers)
// ============================================================================
const maskCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCEP = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

const maskDate = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+?$/, '$1');
};


export default function CrmTab({
  customers,
  searchCustomer,
  setSearchCustomer,
  filteredCustomers,
  setEditingCustomer,
  // Precisamos da função fetchCustomers do Admin para recarregar a lista quando adicionarmos um novo
  fetchCustomers = () => { window.location.reload(); } 
}) {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [crmSubTab, setCrmSubTab] = useState('clientes'); // 'clientes' | 'pendentes'
  const [customerAccounts, setCustomerAccounts] = useState([]);
  
  const [showExtratoModal, setShowExtratoModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [extratoStartDate, setExtratoStartDate] = useState('');
  const [extratoEndDate, setExtratoEndDate] = useState('');

  // 🛡️ Helper local para garantir o envio do x-store-id e Token JWT
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-loja-slug': storeId }),
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    fetchCustomerAccounts();
  }, [crmSubTab]);

  const fetchCustomerAccounts = async () => {
    if (crmSubTab === 'pendentes') {
      try {
        const res = await fetchWithStore(`${API_URL}/api/crm/customer-accounts`);
        if (res.ok) setCustomerAccounts(await res.json());
      } catch (e) { console.error(e); }
    }
  };

  // ============================================================================
  // ESTADOS E LÓGICA DO MODAL DE CLIENTES (NOVO E EDIÇÃO)
  // ============================================================================
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  
  const initialCustomerForm = {
    id: null, name: '', email: '', cpf: '', birthDate: '', phone: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
    password: ''
  };
  const [customerForm, setCustomerForm] = useState(initialCustomerForm);

  const handleCEPBlur = async () => {
    const cepStr = customerForm.cep.replace(/\D/g, '');
    if (cepStr.length !== 8) return;
    setIsSearchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepStr}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setCustomerForm(prev => ({ 
           ...prev, 
           logradouro: data.logradouro, 
           bairro: data.bairro, 
           cidade: data.localidade, 
           uf: data.uf 
        }));
      } else {
        alert("CEP não encontrado.");
      }
    } catch (e) { alert("Erro ao buscar CEP."); }
    setIsSearchingCep(false);
  };

  const parseAddressString = (addressString) => {
    if (!addressString) return { logradouro: '', numero: '', bairro: '', complemento: '', cidade: '', uf: '', cep: '' };
    const cleanAddress = addressString.split('| OBS:')[0].split('| CUPOM')[0].trim();
    // Exemplo: Rua A, 123, Bairro B
    const parts = cleanAddress.split(',').map(s => s.trim());
    return {
       logradouro: parts[0] || cleanAddress,
       numero: parts[1] || '',
       bairro: parts[2] || '',
       complemento: '', cidade: '', uf: '', cep: ''
    };
  };

  const handleOpenNewCustomer = () => {
     setCustomerForm(initialCustomerForm);
     setShowCustomerModal(true);
  };

  const handleOpenEditCustomer = (c) => {
     const addr = parseAddressString(c.address);
     setCustomerForm({
        id: c.id,
        name: c.name || '',
        email: c.email || '',
        cpf: c.cpf ? maskCPF(c.cpf) : '',
        phone: c.phone ? maskPhone(c.phone) : '',
        birthDate: c.birthDate || '',
        cep: addr.cep,
        logradouro: addr.logradouro,
        numero: addr.numero,
        complemento: addr.complemento,
        bairro: addr.bairro,
        cidade: addr.cidade,
        uf: addr.uf,
        password: '' // Só preenche se quiser mudar a senha
     });
     setShowCustomerModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.email) return alert("Nome e Email são obrigatórios!");

    // Constrói a string de endereço (como o banco do admin salva hoje)
    const newAddressString = `${customerForm.logradouro}, ${customerForm.numero}, ${customerForm.bairro}${customerForm.complemento ? ' - ' + customerForm.complemento : ''}${customerForm.cidade ? ' - ' + customerForm.cidade + '/' + customerForm.uf : ''}`;

    const payload = {
       name: customerForm.name,
       email: customerForm.email,
       cpf: customerForm.cpf.replace(/\D/g, ''), // Limpa máscara pro banco
       phone: customerForm.phone,
       birthDate: customerForm.birthDate,
       address: newAddressString !== ', , ' ? newAddressString : '',
       password: customerForm.password || undefined // Só envia se tiver digitado algo
    };

    try {
      if (customerForm.id) {
         // EDITA EXISTENTE
         const res = await fetchWithStore(`${API_URL}/api/admin/customers/${customerForm.id}`, { 
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) 
         });
         const data = await res.json();
         if (data.success) { alert('Cliente atualizado!'); setShowCustomerModal(false); fetchCustomers(); } else alert(data.error || 'Erro.');
      } else {
         // CRIA NOVO (Usa a mesma rota que o App/Totem usa para Register)
         // Como os admins precisam de uma senha inicial, vamos gerar uma automática se estiver vazia
         payload.password = payload.password || ('ZenixFood' + Math.floor(Math.random() * 10000) + '!');
         
         const res = await fetchWithStore(`${API_URL}/api/auth/register`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) 
         });
         const data = await res.json();
         if (data.success) { alert('Cliente cadastrado com sucesso!'); setShowCustomerModal(false); fetchCustomers(); } else alert(data.error || 'Erro ao cadastrar.');
      }
    } catch (error) { alert('Erro de conexão.'); }
  };

  // ============================================================================

  const handlePayAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/crm/customer-accounts/pay`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ customerId: selectedAccount.id }) 
      });
      const data = await res.json();
      if (data.success) { 
        alert('Conta paga e cliente desbloqueado com sucesso!'); 
        setShowPayModal(false); 
        fetchCustomerAccounts(); 
        fetchCustomers();
      } else { alert(data.error); }
    } catch (e) { alert('Erro na comunicação'); }
  };

  const handleToggleBlock = async (cliente) => {
    const isBlocking = !cliente.isBlocked;
    if (!confirm(`Deseja realmente ${isBlocking ? 'BLOQUEAR' : 'DESBLOQUEAR'} este cliente?`)) return;
    
    try {
      const res = await fetchWithStore(`${API_URL}/api/admin/customers/${cliente.id}/block`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: isBlocking })
      });
      if (res.ok) {
        alert(`Cliente ${isBlocking ? 'Bloqueado' : 'Desbloqueado'}!`);
        fetchCustomers();
      }
    } catch(e) { alert('Erro ao atualizar bloqueio.'); }
  };

  // Filtro Dinâmico para o Extrato
  const filteredMovements = selectedAccount?.accountMovements?.filter(m => {
    if (extratoStartDate && new Date(m.createdAt) < new Date(extratoStartDate + 'T00:00:00')) return false;
    if (extratoEndDate && new Date(m.createdAt) > new Date(extratoEndDate + 'T23:59:59')) return false;
    return true;
  }) || [];

  const exportExtratoToExcel = () => {
    if (!selectedAccount) return;
    const rows = filteredMovements.map(m => [ new Date(m.createdAt).toLocaleDateString('pt-BR'), m.type === 'CHARGE' ? 'Compra' : 'Pagamento', m.description, `R$ ${m.amount.toFixed(2)}`, m.isPaid ? 'Pago' : 'Pendente' ]);
    const csvContent = ["Data;Tipo;Descrição;Valor;Status", ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `Extrato_Cliente_${selectedAccount.name.replace(/\s/g,'_')}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <main className="space-y-6 animate-fade-in-up pb-10">
      
      <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-4 mb-6 gap-4">
        <div className="flex gap-4">
           <button onClick={() => setCrmSubTab('clientes')} className={`font-bold pb-2 transition-all cursor-pointer ${crmSubTab === 'clientes' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-blue-500'}`}>👥 Lista de Clientes</button>
           <button onClick={() => setCrmSubTab('pendentes')} className={`font-bold pb-2 transition-all cursor-pointer flex items-center gap-2 ${crmSubTab === 'pendentes' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-blue-500'}`}>
              ⚠️ Inadimplentes (Fiado) 
             {customerAccounts.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{customerAccounts.length}</span>}
           </button>
        </div>
        
        {crmSubTab === 'clientes' && (
           <button onClick={handleOpenNewCustomer} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2 rounded-xl text-sm transition-colors shadow-sm">
             + Adicionar Cliente
           </button>
        )}
      </div>

      {crmSubTab === 'clientes' && (
        <>
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-black text-slate-900">Clientes ({customers.length})</h2>
            <input type="text" placeholder="Buscar por nome, email, cpf..." value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="w-full md:w-96 bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                <tr><th className="px-6 py-4 font-bold">Cliente</th><th className="px-6 py-4 font-bold">Contato/Docs</th><th className="px-6 py-4 font-bold text-center">Pedidos</th><th className="px-6 py-4 font-bold text-right">Cashback</th><th className="px-6 py-4 font-bold text-center">Ações</th></tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                       <p className="font-bold text-slate-900 flex items-center gap-2">
                          {c.name} 
                          {c.isBlocked && <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">Bloqueado</span>}
                       </p>
                    </td>
                    <td className="px-6 py-4"><span>{c.email}</span></td>
                    <td className="px-6 py-4 text-center"><span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full font-bold">{c.orders?.length || 0}</span></td>
                    <td className="px-6 py-4 text-right"><span className="font-bold text-emerald-600">R$ {Number(c.cashback?.balance || 0).toFixed(2)}</span></td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button onClick={() => handleOpenEditCustomer(c)} className="text-blue-600 hover:text-blue-700 font-bold bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors text-xs cursor-pointer">Editar</button>
                      <button onClick={() => handleToggleBlock(c)} className={`font-bold px-3 py-1.5 rounded-lg transition-colors text-xs cursor-pointer ${c.isBlocked ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                         {c.isBlocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {crmSubTab === 'pendentes' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg mb-6">Controle de Clientes com Fiado Pendente</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {customerAccounts.map(c => (
               <div key={c.id} className="p-5 rounded-2xl border-2 border-red-500 bg-red-50 flex flex-col shadow-sm">
                  <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm mb-3 self-start">Cliente Inadimplente / Bloqueado</span>
                  
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 text-xl leading-none mb-1">{c.name}</h4>
                    <p className="text-xs text-slate-500 font-bold mb-4">{c.email} | {c.phone}</p>
                    
                    <div className="space-y-1.5 text-sm font-medium text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                       <div className="flex justify-between"><span>Dívida Total:</span><span className="font-black text-red-500">R$ {(c.currentDebt || 0).toFixed(2)}</span></div>
                       <div className="flex justify-between"><span>Lançamentos Pendentes:</span><span className="font-black text-slate-800">{c.pendingCount}</span></div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-red-200/50 shrink-0">
                     <button onClick={() => { setSelectedAccount(c); setShowExtratoModal(true); setExtratoStartDate(''); setExtratoEndDate(''); }} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer shadow-sm transition-all">Ver Extrato</button>
                     <button onClick={() => { setSelectedAccount(c); setShowPayModal(true); }} disabled={!c.currentDebt || c.currentDebt <= 0} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer shadow-sm transition-all disabled:cursor-not-allowed">Quitar Dívida</button>
                  </div>
               </div>
             ))}
             {customerAccounts.length === 0 && <p className="col-span-full text-center text-slate-500 text-sm py-10">Nenhuma dívida de cliente encontrada no momento.</p>}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO/EDIÇÃO DE CLIENTES COMPLETO E COM MÁSCARAS              */}
      {/* ========================================================================= */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-3xl shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">{customerForm.id ? '✏️ Editar Cliente' : '👥 Novo Cliente'}</h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
              <form id="customerForm" onSubmit={handleSaveCustomer} className="space-y-6">
                
                {/* 1. DADOS PESSOAIS */}
                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Dados Pessoais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Nome Completo *</label>
                      <input type="text" required value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Ex: João Silva" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">E-mail *</label>
                      <input type="email" required value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="joao@email.com" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">CPF</label>
                      <input type="text" maxLength="14" value={customerForm.cpf} onChange={e => setCustomerForm({...customerForm, cpf: maskCPF(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="000.000.000-00" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">WhatsApp / Telefone</label>
                      <input type="text" maxLength="15" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: maskPhone(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="(11) 90000-0000" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Data de Nascimento</label>
                      <input type="text" maxLength="10" value={customerForm.birthDate} onChange={e => setCustomerForm({...customerForm, birthDate: maskDate(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Senha (Deixe vazio para não alterar)</label>
                      <input type="password" value={customerForm.password} onChange={e => setCustomerForm({...customerForm, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder={customerForm.id ? "••••••••" : "Senha de Acesso (Gerado Auto)"} />
                    </div>
                  </div>
                </div>

                {/* 2. ENDEREÇO */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Endereço de Entrega Principal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2 relative">
                      <label className="text-xs font-bold text-slate-500 block mb-1">CEP</label>
                      <input type="text" maxLength="9" value={customerForm.cep} onChange={e => setCustomerForm({...customerForm, cep: maskCEP(e.target.value)})} onBlur={handleCEPBlur} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="00000-000" />
                      {isSearchingCep && <span className="absolute right-3 top-9 text-[10px] text-amber-500 font-bold animate-pulse">Buscando...</span>}
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-xs font-bold text-slate-500 block mb-1">Logradouro (Rua, Av)</label>
                      <input type="text" value={customerForm.logradouro} onChange={e => setCustomerForm({...customerForm, logradouro: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 block mb-1">Número</label>
                      <input type="text" value={customerForm.numero} onChange={e => setCustomerForm({...customerForm, numero: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-xs font-bold text-slate-500 block mb-1">Bairro</label>
                      <input type="text" value={customerForm.bairro} onChange={e => setCustomerForm({...customerForm, bairro: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 block mb-1">Complemento</label>
                      <input type="text" value={customerForm.complemento} onChange={e => setCustomerForm({...customerForm, complemento: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Apto, Bloco..." />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-slate-500 block mb-1">Cidade</label>
                      <input type="text" value={customerForm.cidade} onChange={e => setCustomerForm({...customerForm, cidade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-slate-500 block mb-1">UF</label>
                      <input type="text" maxLength="2" value={customerForm.uf} onChange={e => setCustomerForm({...customerForm, uf: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 text-center uppercase" />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="shrink-0 pt-4 mt-4 border-t border-slate-100 flex gap-4">
              <button type="button" onClick={() => setShowCustomerModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" form="customerForm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all">Salvar Cliente</button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: VER EXTRATO ANALÍTICO */}
      {showExtratoModal && selectedAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <div>
                  <h3 className="text-xl font-black text-slate-800">Extrato de Compras (Fiado)</h3>
                  <p className="text-sm text-slate-500 font-medium">Cliente: {selectedAccount.name}</p>
               </div>
               <button onClick={() => setShowExtratoModal(false)} className="text-slate-400 font-bold cursor-pointer hover:text-red-500 text-xl">✕</button>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data Início</label>
                 <input type="date" value={extratoStartDate} onChange={e => setExtratoStartDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold focus:outline-none focus:border-blue-500" />
               </div>
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data Fim</label>
                 <input type="date" value={extratoEndDate} onChange={e => setExtratoEndDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold focus:outline-none focus:border-blue-500" />
               </div>
               <div className="flex items-end">
                 <button onClick={exportExtratoToExcel} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-5 py-2 rounded-lg shadow-sm transition-all text-xs cursor-pointer flex items-center gap-2">
                   📥 Exportar Excel
                 </button>
               </div>
            </div>

            <div className="overflow-y-auto pr-2 pb-4 flex-1 hide-scrollbar border border-slate-100 rounded-2xl">
               <table className="w-full text-left text-sm text-slate-700">
                 <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50 sticky top-0">
                   <tr><th className="px-4 py-3 font-black">Data</th><th className="px-4 py-3 font-black">Descrição</th><th className="px-4 py-3 font-black text-right">Valor</th><th className="px-4 py-3 font-black text-center">Status</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredMovements.length === 0 ? (
                     <tr><td colSpan="4" className="text-center py-8 text-slate-500 font-medium">Nenhum movimento neste período.</td></tr>
                   ) : (
                     filteredMovements.map(m => (
                       <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3"><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mr-2 ${m.type === 'CHARGE' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{m.type === 'CHARGE' ? 'Compra' : 'Pagto'}</span>{m.description}</td>
                          <td className={`px-4 py-3 text-right font-black ${m.type === 'CHARGE' ? 'text-red-500' : 'text-emerald-500'}`}>{m.type === 'CHARGE' ? '-' : '+'}R$ {m.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">{m.isPaid ? <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">PAGO</span> : <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">PENDENTE</span>}</td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GERAR PAGAMENTO E DESBLOQUEAR */}
      {showPayModal && selectedAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Liquidar Dívida</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Você está a fechar a conta de <strong>{selectedAccount.name}</strong> no valor de <strong className="text-red-500">R$ {selectedAccount.currentDebt.toFixed(2)}</strong>. Ao confirmar, o cliente será desbloqueado no sistema.</p>

            <form onSubmit={handlePayAccount} className="space-y-4 text-left">
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold text-slate-700 cursor-pointer">Cancelar</button>
                 <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl shadow-lg transition-all cursor-pointer">Confirmar Pagto</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}