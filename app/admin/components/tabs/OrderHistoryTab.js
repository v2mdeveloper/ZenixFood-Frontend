'use client';
import { useState, useMemo, useEffect } from 'react';

export default function OrderHistoryTab({ orders = [], setSelectedOrderDetails, getMetodoPagamentoLabel, getProductSizeLabel }) {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [activeView, setActiveView] = useState('geral'); // 'geral', 'relatorios', 'funcionarios'
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [employees, setEmployees] = useState([]);
  const [tipPercentage, setTipPercentage] = useState(10);
  
  const [activeOrigins, setActiveOrigins] = useState({
    APP: true, TOTEM: true, PDV: true, SALAO: true
  });

  const toggleOrigin = (origin) => setActiveOrigins(prev => ({ ...prev, [origin]: !prev[origin] }));

  // 🛡️ Helper local para garantir o envio do x-store-id e Token JWT
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  // Busca dados de RH para cruzamento de comissões com suporte multi-tenant
  useEffect(() => {
    fetchWithStore(`${API_URL}/api/rh/employees`).then(r => r.ok ? r.json() : []).then(setEmployees).catch(() => {});
    fetchWithStore(`${API_URL}/api/settings`).then(r => r.ok ? r.json() : {}).then(data => setTipPercentage(Number(data.tipPercentage) || 10)).catch(() => {});
  }, []);

  // Fallback seguro caso a função de tamanho não seja passada
  const sizeLabelFn = getProductSizeLabel || ((item) => {
    if (!item.product) return "";
    if (item.product.price1kg && Number(item.price) === Number(item.product.price1kg)) return " (1kg)";
    if (item.product.price700g && Number(item.price) === Number(item.product.price700g)) return " (700g)";
    if (item.product.name.toLowerCase().includes('costela') && item.product.price700g) return " (500g)";
    return "";
  });

  // =========================================================
  // LÓGICA DE FILTRAGEM GLOBAL
  // =========================================================
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 1. Filtro de Origem
      if (!activeOrigins[o.origin || 'APP']) return false;

      // 2. Filtro de Data
      if (startDate || endDate) {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          start.setTime(start.getTime() + start.getTimezoneOffset() * 60000);
          if (orderDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          end.setTime(end.getTime() + end.getTimezoneOffset() * 60000);
          if (orderDate > end) return false;
        }
      }

      // 3. Filtro de Busca Geral (Nome, CPF, Pedido, Endereço)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = o.client?.name?.toLowerCase().includes(term);
        const termNumbers = term.replace(/\D/g, '');
        const cpfMatch = termNumbers && o.client?.cpf ? o.client.cpf.replace(/\D/g, '').includes(termNumbers) : false;
        const idMatch = o.shortId?.toString().includes(term);
        const addressMatch = o.address?.toLowerCase().includes(term); 
        if (!nameMatch && !cpfMatch && !idMatch && !addressMatch) return false;
      }

      // 4. Filtro por Produto Específico
      if (productSearch) {
        const hasProduct = o.items?.some(i => i.product?.name?.toLowerCase().includes(productSearch.toLowerCase()));
        if (!hasProduct) return false;
      }

      return true;
    });
  }, [orders, activeOrigins, startDate, endDate, searchTerm, productSearch]);

  // =========================================================
  // CÁLCULOS: ESTATÍSTICAS GERAIS E RELATÓRIOS
  // =========================================================
  const { stats, reportStats, employeeStats } = useMemo(() => {
    let totalRevenue = 0;
    let deliveredRevenue = 0;
    let counts = { APP: 0, TOTEM: 0, PDV: 0, SALAO: 0 };
    let revenue = { APP: 0, TOTEM: 0, PDV: 0, SALAO: 0 };
    let deliveredOrdersCount = 0;
    let validOrdersCount = 0; 

    const prodMap = {};
    const custMap = {};
    const empMap = {};
    let totalEmpRevenue = 0;
    let totalCommissionsToPay = 0;

    filteredOrders.forEach(o => {
      const val = Number(o.total) || 0;
      const origin = o.origin || 'APP';
      
      const isValidSale = o.status !== 'CANCELED' && o.status !== 'PENDING';

      if (isValidSale) {
        totalRevenue += val;
        validOrdersCount++;
        
        if (counts[origin] !== undefined) {
          counts[origin]++;
          revenue[origin] += val;
        }

        if (origin === 'SALAO' || origin === 'PDV') {
           const empName = o.waiter || (origin === 'SALAO' ? 'Garçom (Não Registrado)' : 'Caixa PDV (Não Registrado)');
           if (!empMap[empName]) {
              const empObj = employees.find(e => e.name === empName);
              empMap[empName] = { name: empName, count: 0, revenue: 0, origin: origin, receivesTips: empObj ? empObj.receivesTips : false };
           }
           empMap[empName].count += 1;
           empMap[empName].revenue += val;
           totalEmpRevenue += val;
           if (empMap[empName].receivesTips) {
              totalCommissionsToPay += val * (tipPercentage / 100);
           }
        }
      }

      if (o.status === 'DELIVERED') {
         deliveredRevenue += val;
         deliveredOrdersCount++;

         const cName = o.client?.name || 'Cliente Avulso';
         custMap[cName] = (custMap[cName] || 0) + val;

         o.items?.forEach(i => {
             const pName = (i.product?.name || 'Desconhecido') + sizeLabelFn(i);
             prodMap[pName] = (prodMap[pName] || 0) + i.quantity;
         });
      }
    });

    const averageTicket = validOrdersCount > 0 ? totalRevenue / validOrdersCount : 0;
    const reportAverageTicket = deliveredOrdersCount > 0 ? deliveredRevenue / deliveredOrdersCount : 0;

    const topProducts = Object.entries(prodMap).sort((a,b) => b[1] - a[1]).slice(0, 10);
    const maxProduct = Math.max(...topProducts.map(p => p[1]), 1);

    const topCustomers = Object.entries(custMap).sort((a,b) => b[1] - a[1]).slice(0, 10);
    const maxCustomer = Math.max(...topCustomers.map(c => c[1]), 1);

    const rankingEmp = Object.values(empMap).sort((a, b) => b.revenue - a.revenue);

    return {
      stats: { totalRevenue, totalOrders: validOrdersCount, averageTicket, counts, revenue }, 
      reportStats: { deliveredRevenue, deliveredOrdersCount, reportAverageTicket, topProducts, maxProduct, topCustomers, maxCustomer },
      employeeStats: { ranking: rankingEmp, totalEmpRevenue, totalCommissionsToPay }
    };
  }, [filteredOrders, employees, tipPercentage, sizeLabelFn]);

  // =========================================================
  // EXPORTAÇÃO PARA EXCEL
  // =========================================================
  const exportToExcel = () => {
    if (activeView === 'funcionarios') {
      if (employeeStats.ranking.length === 0) return alert("Não há dados de funcionários para exportar.");
      const header = ["Posição", "Funcionário", "Canal Principal", "Qtd Vendas", "Faturamento (R$)", `Comissão A Pagar (${tipPercentage}%) (R$)`];
      const escapeCSV = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

      const rows = employeeStats.ranking.map((emp, i) => [
        `${i + 1}º`, emp.name, emp.origin === 'SALAO' ? 'Mesas/Comandas' : 'PDV Caixa', emp.count, emp.revenue.toFixed(2).replace('.', ','), 
        emp.receivesTips ? (emp.revenue * (tipPercentage/100)).toFixed(2).replace('.', ',') : "0,00"
      ]);

      const csvContent = "sep=;\n" + [
        header.map(escapeCSV).join(";"), 
        ...rows.map(r => r.map(escapeCSV).join(";")), 
        Array(6).fill("").join(";"), 
        ["TOTAL", "", "", "", employeeStats.totalEmpRevenue.toFixed(2).replace('.', ','), employeeStats.totalCommissionsToPay.toFixed(2).replace('.', ',')].map(escapeCSV).join(";")
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `Comissoes_Funcionarios_${new Date().getTime()}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } else {
      if (filteredOrders.length === 0) return alert("Não há dados para exportar.");
      const header = ["Nº Pedido", "Data/Hora", "Vendedor", "Cliente", "CPF", "Canal", "Pagamento", "Status", "Itens", "Total (R$)"];
      const escapeCSV = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

      const rows = filteredOrders.map(o => [
        o.shortId, new Date(o.createdAt).toLocaleString('pt-BR'), o.waiter || '-', o.client?.name || 'Avulso', o.client?.cpf || '-',
        o.origin || 'APP', getMetodoPagamentoLabel(o.paymentMethod), translateStatus(o.status).label, 
        o.items?.map(i => `${i.quantity}x ${i.product?.name}${sizeLabelFn(i)}`).join(' | '),
        Number(o.total).toFixed(2).replace('.', ',')
      ]);

      const csvContent = "sep=;\n" + [header.map(escapeCSV).join(";"), ...rows.map(r => r.map(escapeCSV).join(";")), Array(10).fill("").join(";"), ["TOTAL FILTRADO VÁLIDO", "", "", "", "", "", "", "", "", stats.totalRevenue.toFixed(2).replace('.', ',')].map(escapeCSV).join(";")].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `Relatorio_Vendas_${new Date().getTime()}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
  };

  const translateStatus = (status) => {
    const map = { 'PENDING': { label: 'Pendente', color: 'bg-slate-100 text-slate-600' }, 'PREPARING': { label: 'Na Chapa', color: 'bg-amber-100 text-amber-700' }, 'READY': { label: 'Em Rota/Pronto', color: 'bg-blue-100 text-blue-700' }, 'DELIVERED': { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700' }, 'CANCELED': { label: 'Cancelado', color: 'bg-red-100 text-red-700' }};
    return map[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
  };

  const getOrigemInfo = (origin) => {
    switch (origin) {
      case 'SALAO': return { label: 'Mesas/Comandas', icon: '🪑', color: 'bg-amber-100 text-amber-700', hex: '#f59e0b' };
      case 'TOTEM': return { label: 'Totem', icon: '💻', color: 'bg-blue-100 text-blue-700', hex: '#3b82f6' };
      case 'PDV': return { label: 'Caixa / Balcão', icon: '🏪', color: 'bg-emerald-100 text-emerald-700', hex: '#10b981' };
      case 'APP': return { label: 'Cardápio Digital', icon: '📱', color: 'bg-purple-100 text-purple-700', hex: '#a855f7' };
      default: return { label: 'Desconhecido', icon: '❓', color: 'bg-slate-100 text-slate-600', hex: '#94a3b8' };
    }
  };

  let cumulativePercent = 0;
  const pieData = ['SALAO', 'APP', 'TOTEM', 'PDV'].map(origin => {
     const value = stats.revenue[origin];
     const percentage = stats.totalRevenue > 0 ? (value / stats.totalRevenue) * 100 : 0;
     const offset = 100 - cumulativePercent;
     cumulativePercent += percentage;
     return { origin, value, percentage, offset, hex: getOrigemInfo(origin).hex };
  }).filter(d => d.value > 0);

  return (
    <main className="space-y-6 animate-fade-in-up pb-10">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-1">🗃️ Inteligência de Vendas & Relatórios</h2>
          <p className="text-slate-500 text-xs font-medium">Consulte o histórico completo, estatísticas de produtos e desempenho da sua equipe.</p>
        </div>
        <button onClick={exportToExcel} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>📥</span> Exportar para Excel
        </button>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="flex gap-4 border-b border-slate-200 pb-px mb-6 px-2 overflow-x-auto hide-scrollbar">
         <button onClick={() => setActiveView('geral')} className={`pb-3 font-black text-sm uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${activeView === 'geral' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-amber-500'}`}>Visão Geral & Histórico</button>
         <button onClick={() => setActiveView('relatorios')} className={`pb-3 font-black text-sm uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${activeView === 'relatorios' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-400 hover:text-purple-500'}`}>Top Produtos & Clientes</button>
         <button onClick={() => setActiveView('funcionarios')} className={`pb-3 font-black text-sm uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${activeView === 'funcionarios' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-blue-500'}`}>Comissões e Equipe</button>
      </div>

      {/* ÁREA DE FILTROS GLOBAIS (ESCURA) */}
      <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/50 blur-3xl rounded-full pointer-events-none"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Busca Inteligente</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input type="text" placeholder="Nome, CPF, Pedido..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 shadow-inner placeholder-slate-600" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Filtrar por Produto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🍔</span>
              <input type="text" placeholder="Ex: Smash Burger" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 shadow-inner placeholder-slate-600" />
            </div>
          </div>

          <div className="flex gap-3">
             <div className="flex-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data Início</label>
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer" />
             </div>
             <div className="flex-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data Fim</label>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer" />
             </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mostrar Canais</label>
            <div className="flex flex-wrap gap-2">
              {['SALAO', 'APP', 'TOTEM', 'PDV'].map(orig => {
                const info = getOrigemInfo(orig);
                const isActive = activeOrigins[orig];
                return (
                  <button key={orig} onClick={() => toggleOrigin(orig)} className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border ${isActive ? `${info.color} border-transparent` : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500'}`}>
                    <span>{info.icon}</span> {orig === 'SALAO' ? 'Salão' : info.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-3xl text-center mt-6">
           <span className="text-5xl mb-4 inline-block opacity-50">📭</span>
           <h3 className="text-lg font-black text-slate-700">Nenhuma venda encontrada</h3>
           <p className="text-sm text-slate-500 font-medium mt-1">Altere as datas ou remova os filtros para ver os resultados.</p>
        </div>
      ) : (
        <>
          {/* ABA 1: GERAL E HISTÓRICO */}
          {activeView === 'geral' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-center"><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Pedidos Concluídos (Validos)</p><h4 className="text-4xl font-black text-slate-800 tracking-tighter">{stats.totalOrders}</h4></div>
                   <div className="bg-emerald-500 p-6 rounded-3xl shadow-lg shadow-emerald-500/20 flex flex-col justify-center"><p className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold mb-1">Faturamento Filtrado</p><h4 className="text-3xl font-black text-white tracking-tighter">R$ {stats.totalRevenue.toFixed(2)}</h4></div>
                   <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-center"><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ticket Médio Geral</p><h4 className="text-3xl font-black text-slate-800 tracking-tighter">R$ {stats.averageTicket.toFixed(2)}</h4></div>

                   <div className="col-span-full bg-white border border-slate-200 p-5 rounded-3xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['SALAO', 'APP', 'TOTEM', 'PDV'].map(orig => {
                        const info = getOrigemInfo(orig);
                        return (
                          <div key={orig} className={`p-4 rounded-2xl border ${activeOrigins[orig] ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-100 opacity-30'}`}>
                             <p className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-1"><span>{info.icon}</span> {orig === 'SALAO' ? 'Mesas' : orig}</p>
                             <p className="text-xl font-black text-slate-800 leading-none mb-1">R$ {stats.revenue[orig].toFixed(2)}</p>
                             <p className="text-[10px] font-bold text-slate-400">{stats.counts[orig]} vendas validas</p>
                          </div>
                        )
                      })}
                   </div>
                </div>

                <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-6 w-full text-center">Faturamento por Canal</h3>
                   {pieData.length > 0 ? (
                     <div className="relative w-48 h-48 flex items-center justify-center">
                       <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90 rounded-full drop-shadow-md">
                         {pieData.map((slice, i) => (
                            <circle key={i} r="16" cx="16" cy="16" fill="transparent" stroke={slice.hex} strokeWidth="32" strokeDasharray={`${slice.percentage} 100`} strokeDashoffset={slice.offset} className="transition-all duration-1000 ease-out hover:opacity-80"/>
                         ))}
                       </svg>
                       <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-inner"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span><span className="text-lg font-black text-slate-800">R$ {stats.totalRevenue.toFixed(0)}</span></div>
                     </div>
                   ) : (
                     <div className="w-48 h-48 rounded-full border-8 border-slate-100 flex items-center justify-center"><span className="text-3xl opacity-30">📊</span></div>
                   )}
                   <div className="w-full mt-6 space-y-2">
                      {pieData.map((slice, i) => (
                         <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: slice.hex }}></span><span className="text-slate-600 uppercase">{getOrigemInfo(slice.origin).label}</span></div>
                            <span className="text-slate-800 font-black">{slice.percentage.toFixed(1)}%</span>
                         </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm mt-6">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                    <tr><th className="px-6 py-5 font-black">Nº Pedido</th><th className="px-6 py-5 font-black">Data/Hora</th><th className="px-6 py-5 font-black">Vendedor</th><th className="px-6 py-5 font-black">Cliente / Mesa</th><th className="px-6 py-5 font-black">Canal</th><th className="px-6 py-5 font-black">Pagamento</th><th className="px-6 py-5 font-black">Total</th><th className="px-6 py-5 font-black text-right">Ação</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(order => {
                      const origInfo = getOrigemInfo(order.origin);
                      const isCanceledOrPending = order.status === 'CANCELED' || order.status === 'PENDING';
                      return (
                        <tr key={order.id} className={`hover:bg-slate-50 transition-colors group ${isCanceledOrPending ? 'opacity-50 grayscale' : ''}`}>
                          <td className="px-6 py-4 font-black text-slate-900">#{order.shortId}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{new Date(order.createdAt).toLocaleString('pt-BR')}</td>
                          <td className="px-6 py-4 font-black text-amber-600 uppercase text-[10px] tracking-wider">{order.waiter || '-'}</td>
                          <td className="px-6 py-4"><p className="font-black text-slate-800 leading-tight mb-0.5">{order.client?.name || 'Cliente Avulso'}</p>{order.address && <p className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block truncate max-w-[150px]">{order.address}</p>}</td>
                          <td className="px-6 py-4"><span className={`${origInfo.color} px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max shadow-sm border border-black/5`}><span>{origInfo.icon}</span> {origInfo.label}</span></td>
                          <td className="px-6 py-4 text-[11px] font-bold text-slate-500">
                             {getMetodoPagamentoLabel(order.paymentMethod)}
                             <br/>
                             <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase mt-1 inline-block ${translateStatus(order.status).color}`}>{translateStatus(order.status).label}</span>
                          </td>
                          <td className={`px-6 py-4 font-black text-base ${isCanceledOrPending ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>R$ {Number(order.total).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right"><button onClick={() => setSelectedOrderDetails(order)} className="text-amber-600 hover:text-white font-black bg-amber-100 hover:bg-amber-500 px-4 py-2 rounded-xl transition-all text-xs cursor-pointer shadow-sm">Detalhes</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 2: RELATÓRIOS (TOP PRODUTOS E CLIENTES) */}
          {activeView === 'relatorios' && (
             <div className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl"><p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Faturamento (Apenas Concluídos)</p><h3 className="text-3xl font-black text-slate-900">R$ {reportStats.deliveredRevenue.toFixed(2)}</h3></div>
                  <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl"><p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Pedidos Concluídos</p><h3 className="text-3xl font-black text-slate-900">{reportStats.deliveredOrdersCount}</h3></div>
                  <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl"><p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Ticket Médio Real</p><h3 className="text-3xl font-black text-slate-900">R$ {reportStats.reportAverageTicket.toFixed(2)}</h3></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><span>🍔</span> Produtos Mais Vendidos</h3>
                    {reportStats.topProducts.length > 0 ? (
                      <div className="space-y-4">
                        {reportStats.topProducts.map(([produto, qtd], index) => {
                          const porcentagem = (qtd / reportStats.maxProduct) * 100;
                          return (
                            <div key={index} className="space-y-1.5">
                              <div className="flex justify-between text-sm items-end">
                                <span className="font-bold text-slate-700 flex items-center gap-2"><span className="text-xs text-slate-400 font-black">{index + 1}º</span> {produto}</span>
                                <span className="text-amber-600 font-black">{qtd} un.</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                                <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${porcentagem}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">Nenhum produto concluído no período.</p>
                    )}
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><span>🏆</span> Top Clientes (Faturamento)</h3>
                    {reportStats.topCustomers.length > 0 ? (
                      <div className="space-y-4">
                        {reportStats.topCustomers.map(([cliente, valor], index) => {
                          const porcentagem = (valor / reportStats.maxCustomer) * 100;
                          return (
                            <div key={index} className="space-y-1.5">
                              <div className="flex justify-between text-sm items-end">
                                <span className="font-bold text-slate-700 flex items-center gap-2"><span className="text-xs text-slate-400 font-black">{index + 1}º</span> {cliente}</span>
                                <span className="text-emerald-600 font-black">R$ {Number(valor).toFixed(2)}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                                <div className="bg-gradient-to-r from-blue-400 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${porcentagem}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">Nenhum cliente registrado no período.</p>
                    )}
                  </div>
                </div>
             </div>
          )}

          {/* ABA 3: FUNCIONÁRIOS E COMISSÕES */}
          {activeView === 'funcionarios' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-600 p-8 rounded-[2rem] shadow-lg shadow-emerald-600/20 text-white relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
                   <p className="text-[10px] uppercase tracking-widest text-emerald-200 font-black mb-2">Total de Comissões A Pagar ({tipPercentage}%)</p>
                   <h4 className="text-5xl font-black tracking-tighter">R$ {employeeStats.totalCommissionsToPay.toFixed(2)}</h4>
                   <p className="text-sm font-medium text-emerald-100 mt-2">Valor bruto a ser distribuído no período filtrado.</p>
                </div>
                <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm flex flex-col justify-center">
                   <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Maior Vendedor do Período</p>
                   <h4 className="text-3xl font-black text-amber-500 tracking-tighter flex items-center gap-2"><span>🥇</span> {employeeStats.ranking[0]?.name || '-'}</h4>
                   <p className="text-sm font-bold text-slate-600 mt-2">{employeeStats.ranking[0] ? `Trouxe R$ ${employeeStats.ranking[0].revenue.toFixed(2)} para a loja.` : '-'}</p>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2"><span>👥</span> Desempenho e Distribuição de Taxas</h3>
                <div className="space-y-8">
                  {employeeStats.ranking.map((emp, index) => {
                     const percent = employeeStats.totalEmpRevenue > 0 ? (emp.revenue / employeeStats.totalEmpRevenue) * 100 : 0;
                     const comissao = emp.receivesTips ? emp.revenue * (tipPercentage / 100) : 0;
                     const isPodium = index < 3;
                     const medalColors = ['bg-amber-500 text-white shadow-md', 'bg-slate-300 text-slate-700', 'bg-orange-300 text-orange-900'];
                     
                     return (
                       <div key={emp.name} className="flex flex-col relative group">
                          <div className="flex justify-between items-end mb-3">
                            <div>
                              <p className="font-black text-slate-800 text-base flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black tracking-tighter ${isPodium ? medalColors[index] : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>{index + 1}º</span>
                                {emp.name}
                              </p>
                              <div className="ml-11 mt-1 flex gap-2">
                                 <span className="text-[9px] bg-slate-100 text-slate-500 font-black uppercase tracking-widest px-2 py-0.5 rounded">{emp.origin === 'SALAO' ? 'Salão' : 'Caixa PDV'}</span>
                                 {emp.receivesTips && <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black uppercase tracking-widest px-2 py-0.5 rounded">Ganha {tipPercentage}%</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Vendeu: <span className="text-slate-800 text-lg">R$ {emp.revenue.toFixed(2)}</span></p>
                              {emp.receivesTips ? (
                                <p className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-100 uppercase">
                                  + R$ {comissao.toFixed(2)} a Pagar
                                </p>
                              ) : (
                                <p className="text-[11px] font-bold text-slate-400">Sem comissão</p>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden ml-11" style={{ width: 'calc(100% - 2.75rem)' }}>
                            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                          </div>
                       </div>
                     )
                  })}
                  {employeeStats.ranking.length === 0 && <p className="text-center text-slate-400 font-medium py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">Nenhuma venda de funcionário registrada neste período.</p>}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}