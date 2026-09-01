'use client';
import { useState, useEffect } from 'react';

export default function TurnosTab() {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [printerName, setPrinterName] = useState('');

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [openShiftAuth, setOpenShiftAuth] = useState({ email: '', password: '' });

  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [managerAuth, setManagerAuth] = useState({ email: '', password: '' });

  const [selectedRegister, setSelectedRegister] = useState(null);

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

  useEffect(() => {
    fetchShifts();
    fetchSettings();
    fetchEmployees(); 
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/settings`);
      if (res.ok) setPrinterName((await res.json()).printerName || '');
    } catch(e) {}
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/rh/employees`);
      if (res.ok) setEmployees(await res.json());
    } catch (e) {}
  };

  const getManagerName = (idOrName) => {
    if (!idOrName) return '-';
    const emp = employees.find(e => e.id === idOrName);
    if (emp) return emp.name;
    return idOrName.replace('_', ' '); 
  };

  const fetchShifts = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let url = `${API_URL}/api/pdv/shifts`;
      const params = new URLSearchParams();
      if (filterStartDate) params.append('dataInicio', new Date(filterStartDate).toISOString());
      if (filterEndDate) params.append('dataFim', new Date(filterEndDate).toISOString());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetchWithStore(url);
      if (res.ok) setShifts(await res.json());
    } catch (e) { console.error("Erro ao buscar turnos", e); }
    setLoading(false);
  };

  const limparFiltro = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setTimeout(() => {
      fetchWithStore(`${API_URL}/api/pdv/shifts`).then(r => r.json()).then(data => setShifts(data));
    }, 100);
  };

  const handleOpenShift = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/shifts/open`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerAuth: openShiftAuth })
      });
      const data = await res.json();
      if (data.success) {
        alert('Turno aberto com sucesso!');
        setShowOpenShiftModal(false);
        setOpenShiftAuth({ email: '', password: '' });
        fetchShifts();
      } else alert(data.error);
    } catch (e) { alert('Erro ao abrir turno.'); }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/pdv/shifts/close`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId: selectedShiftId, managerAuth })
      });
      const data = await res.json();
      if (data.success) {
        alert('Turno encerrado e consolidado com sucesso!');
        setShowCloseShiftModal(false);
        setManagerAuth({ email: '', password: '' });
        fetchShifts();
      } else alert(data.error);
    } catch (e) { alert('Erro ao encerrar turno.'); }
  };

  const imprimirFechamento = (register) => {
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'fixed top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black animate-fade-in-up';
    toast.innerText = '🖨️ Enviando relatório para a impressora...';
    document.body.appendChild(toast);

    fetch('http://localhost:8080/imprimir', {
       method: 'POST', 
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ relatorio: true, tipo: 'FECHAMENTO_CAIXA', dados: register, printerName })
    })
    .then(async (res) => {
       setTimeout(() => { const t = document.getElementById(toastId); if(t) t.remove(); }, 1500);
       if (!res.ok) {
          alert(`ERRO: O programa de impressão local está aberto, mas não conseguiu gerar o layout (Erro ${res.status}).`);
       }
    })
    .catch(e => {
       console.error(e);
       setTimeout(() => { const t = document.getElementById(toastId); if(t) t.remove(); }, 500);
       alert('⚠️ FALHA DE COMUNICAÇÃO: O sistema não conseguiu encontrar o seu "Programa de Impressão Local" rodando. Verifique se a tela preta está aberta.');
    });
  };

  const calcTotals = (shift) => {
    let totalApp = 0, totalTotem = 0, totalPdv = 0, totalSalao = 0;
    let totalPix = 0, totalDinheiro = 0, totalCartao = 0, totalFiado = 0;
    let totalEntradas = 0, totalSaidas = 0;

    shift.orders?.forEach(o => {
      const val = Number(o.total);
      if (o.origin === 'APP') totalApp += val;
      else if (o.origin === 'TOTEM') totalTotem += val;
      else if (o.origin === 'PDV') totalPdv += val;
      else if (o.origin === 'SALAO') totalSalao += val;

      if (o.paymentMethod.includes('PIX')) totalPix += val;
      else if (o.paymentMethod === 'CASH') totalDinheiro += val;
      else if (o.paymentMethod.includes('CREDIT') || o.paymentMethod.includes('DEBIT')) totalCartao += val;
      else if (o.paymentMethod.includes('ACCOUNT')) totalFiado += val; 
    });

    shift.registers?.forEach(r => {
      totalDinheiro += Number(r.openingBalance || 0); 
      r.movements?.forEach(m => {
        if (m.type === 'IN') totalEntradas += Number(m.amount);
        if (m.type === 'OUT') totalSaidas += Number(m.amount);
      });
    });

    const faturamentoBruto = totalApp + totalTotem + totalPdv + totalSalao;
    const liquidoCaixaFisico = (totalDinheiro + totalEntradas) - totalSaidas;

    return { totalApp, totalTotem, totalPdv, totalSalao, totalPix, totalDinheiro, totalCartao, totalFiado, totalEntradas, totalSaidas, faturamentoBruto, liquidoCaixaFisico };
  };

  const consolidated = shifts.reduce((acc, shift) => {
    const t = calcTotals(shift);
    acc.totalApp += t.totalApp;
    acc.totalTotem += t.totalTotem;
    acc.totalPdv += t.totalPdv;
    acc.totalSalao += t.totalSalao;
    acc.totalPix += t.totalPix;
    acc.totalDinheiro += t.totalDinheiro;
    acc.totalCartao += t.totalCartao;
    acc.totalFiado += t.totalFiado;
    acc.totalEntradas += t.totalEntradas;
    acc.totalSaidas += t.totalSaidas;
    acc.faturamentoBruto += t.faturamentoBruto;
    acc.liquidoCaixaFisico += t.liquidoCaixaFisico;
    return acc;
  }, { totalApp: 0, totalTotem: 0, totalPdv: 0, totalSalao: 0, totalPix: 0, totalDinheiro: 0, totalCartao: 0, totalFiado: 0, totalEntradas: 0, totalSaidas: 0, faturamentoBruto: 0, liquidoCaixaFisico: 0 });

  const exportToExcel = () => {
    if (shifts.length === 0) return alert('Não há turnos para exportar.');

    const header = [
      "Status", "Data Abertura", "Data Fechamento", "Gerente Fechamento", 
      "Faturamento Bruto", "Cardápio Digital (R$)", "Totem Autoatendimento (R$)", "Caixa PDV (R$)", "App de Lançamento (R$)",
      "Dinheiro Vivo (R$)", "Cartão (R$)", "PIX (R$)", "Fiado / Conta Pendente (R$)",
      "Entradas/Suprimento (R$)", "Saídas/Sangria (R$)"
    ];

    const escapeCSV = (val) => `"${String(val).replace(/"/g, '""')}"`;

    const rows = shifts.map(shift => {
      const t = calcTotals(shift);
      return [
        shift.status === 'OPEN' ? 'ABERTO' : 'FECHADO',
        new Date(shift.openedAt).toLocaleString('pt-BR').replace(',', ''),
        shift.closedAt ? new Date(shift.closedAt).toLocaleString('pt-BR').replace(',', '') : 'Em aberto',
        getManagerName(shift.closedBy), 
        t.faturamentoBruto.toFixed(2).replace('.', ','),
        t.totalApp.toFixed(2).replace('.', ','),
        t.totalTotem.toFixed(2).replace('.', ','),
        t.totalPdv.toFixed(2).replace('.', ','),
        t.totalSalao.toFixed(2).replace('.', ','),
        t.totalDinheiro.toFixed(2).replace('.', ','),
        t.totalCartao.toFixed(2).replace('.', ','),
        t.totalPix.toFixed(2).replace('.', ','),
        t.totalFiado.toFixed(2).replace('.', ','),
        t.totalEntradas.toFixed(2).replace('.', ','),
        t.totalSaidas.toFixed(2).replace('.', ',')
      ];
    });

    const totalRow = [
      "TOTAL CONSOLIDADO DO FILTRO", "", "", "",
      consolidated.faturamentoBruto.toFixed(2).replace('.', ','),
      consolidated.totalApp.toFixed(2).replace('.', ','),
      consolidated.totalTotem.toFixed(2).replace('.', ','),
      consolidated.totalPdv.toFixed(2).replace('.', ','),
      consolidated.totalSalao.toFixed(2).replace('.', ','),
      consolidated.totalDinheiro.toFixed(2).replace('.', ','),
      consolidated.totalCartao.toFixed(2).replace('.', ','),
      consolidated.totalPix.toFixed(2).replace('.', ','),
      consolidated.totalFiado.toFixed(2).replace('.', ','),
      consolidated.totalEntradas.toFixed(2).replace('.', ','),
      consolidated.totalSaidas.toFixed(2).replace('.', ',')
    ];

    const csvContent = "sep=;\n" + [
      header.map(escapeCSV).join(";"),
      ...rows.map(r => r.map(escapeCSV).join(";")),
      Array(15).fill("").join(";"),
      totalRow.map(escapeCSV).join(";")
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); 
    link.setAttribute("href", url); 
    link.setAttribute("download", `Relatorio_Turnos_${new Date().getTime()}.csv`);
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Gerando relatórios financeiros...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 mb-1">📊 Relatórios de Faturamento & Turnos</h2>
            <p className="text-slate-500 text-xs font-medium">Abra novos turnos de trabalho, filtre por períodos ou exporte para Excel.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowOpenShiftModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span> Abrir Turno
            </button>
            <button 
              onClick={exportToExcel}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>📥</span> Exportar Excel
            </button>
          </div>
        </div>

        <form onSubmit={fetchShifts} className="flex flex-wrap md:flex-nowrap gap-4 mt-6 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
           <div className="flex-1 min-w-[200px]">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Início (Data e Hora)</label>
             <input type="datetime-local" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500" />
           </div>
           <div className="flex-1 min-w-[200px]">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fim (Data e Hora)</label>
             <input type="datetime-local" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500" />
           </div>
           <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
             <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-2.5 px-6 rounded-lg shadow-sm transition-colors text-sm cursor-pointer">Buscar</button>
             {(filterStartDate || filterEndDate) && (
               <button type="button" onClick={limparFiltro} className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-black py-2.5 px-4 rounded-lg transition-colors text-sm cursor-pointer">Limpar</button>
             )}
           </div>
        </form>
      </div>

      {shifts.length > 0 && (
        <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full"></div>
          
          <h3 className="text-white font-black tracking-widest uppercase text-xs mb-6 flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            Total Consolidado do Período ({shifts.length} Turnos)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Faturamento Bruto Geral</p>
              <h4 className="text-4xl font-black text-white tracking-tighter">R$ {consolidated.faturamentoBruto.toFixed(2)}</h4>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Total por Origem (Canais)</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-200"><span>📱 Cardápio Digital:</span> <span>R$ {consolidated.totalApp.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-200"><span>💻 Totem Auto:</span> <span>R$ {consolidated.totalTotem.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-200"><span>🏪 Caixa PDV:</span> <span>R$ {consolidated.totalPdv.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold text-amber-400"><span>📋 App Lançamento:</span> <span>R$ {consolidated.totalSalao.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Total por Método de Pgto</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-200"><span>💸 Dinheiro:</span> <span>R$ {consolidated.totalDinheiro.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-200"><span>💳 Cartão:</span> <span>R$ {consolidated.totalCartao.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-200"><span>❇️ PIX:</span> <span>R$ {consolidated.totalPix.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold text-amber-400"><span>📋 Fiado/Pendente:</span> <span>R$ {consolidated.totalFiado.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="bg-white/5 border border-amber-500/30 p-5 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">Total Movimentado Gavetas</p>
              <h4 className="text-2xl font-black text-white tracking-tighter mb-2">R$ {consolidated.liquidoCaixaFisico.toFixed(2)}</h4>
              <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-emerald-400">Entradas: +R${consolidated.totalEntradas.toFixed(2)}</span>
                  <span className="text-red-400">Saídas: -R${consolidated.totalSaidas.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-lg font-black text-slate-800 pt-4 border-t border-slate-200">Histórico de Turnos</h3>
      
      {shifts.length === 0 ? (
          <div className="bg-slate-50 p-10 text-center rounded-2xl border border-slate-200">
            <span className="text-4xl">😴</span>
            <p className="text-slate-500 font-bold mt-4">Nenhum turno encontrado neste filtro.</p>
          </div>
      ) : (
        <div className="space-y-6">
          {shifts.map((shift) => {
            const totals = calcTotals(shift);
            const isOpen = shift.status === 'OPEN';

            return (
              <div key={shift.id} className={`p-6 border rounded-[2rem] flex flex-col gap-6 shadow-sm transition-all ${isOpen ? 'bg-white border-amber-300 ring-4 ring-amber-500/10' : 'bg-slate-50 border-slate-200'}`}>
                
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                      {isOpen ? <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span> : <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>}
                      {isOpen ? 'Turno em Andamento' : 'Turno Encerrado'}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      Aberto em: {new Date(shift.openedAt).toLocaleString('pt-BR')} 
                      {shift.closedAt && ` | Fechado por: ${getManagerName(shift.closedBy)} às ${new Date(shift.closedAt).toLocaleString('pt-BR')}`}
                    </p>
                  </div>
                  {isOpen && (
                    <button 
                      onClick={() => { 
                        setSelectedShiftId(shift.id); 
                        setShowCloseShiftModal(true); 
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Encerrar Turno (Gerente)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                  <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Faturamento Bruto</p>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tighter">R$ {totals.faturamentoBruto.toFixed(2)}</h4>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-center">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-2">Origem das Vendas</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700"><span>Cardápio Digital:</span> <span>R$ {totals.totalApp.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-700"><span>Totem Auto:</span> <span>R$ {totals.totalTotem.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-700"><span>Caixa PDV:</span> <span>R$ {totals.totalPdv.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[10px] font-black text-amber-600"><span>App Lançamento:</span> <span>R$ {totals.totalSalao.toFixed(2)}</span></div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-center">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-2">Método de Pagamento</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-emerald-600"><span>Dinheiro:</span> <span>R$ {totals.totalDinheiro.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[11px] font-bold text-blue-600"><span>Cartão:</span> <span>R$ {totals.totalCartao.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[11px] font-bold text-purple-600"><span>PIX:</span> <span>R$ {totals.totalPix.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[11px] font-bold text-amber-600"><span>Fiado/Pendente:</span> <span>R$ {totals.totalFiado.toFixed(2)}</span></div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-center border-l-4 border-l-amber-400">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Caixa Físico Atual</p>
                    <h4 className="text-xl font-black text-slate-800 tracking-tighter mb-2">R$ {totals.liquidoCaixaFisico.toFixed(2)}</h4>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500">
                        <span className="text-emerald-500">Sup: +R${totals.totalEntradas.toFixed(2)}</span>
                        <span className="text-red-500">San: -R${totals.totalSaidas.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Caixas Operacionais do Turno</h4>
                  {shift.registers?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {shift.registers.map(reg => (
                        <div key={reg.id} className="p-4 bg-slate-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200 hover:border-blue-300 transition-colors">
                            <div>
                              <p className="font-black text-slate-700 text-sm mb-1">Operador: <span className="text-amber-600 uppercase">{getManagerName(reg.openedBy)}</span></p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status: {reg.status === 'OPEN' ? '🟢 Aberto' : '🔴 Fechado'}</p>
                            </div>
                            {reg.status === 'CLOSED' && (
                              <button 
                                onClick={() => {
                                  const regOrders = shift.orders?.filter(o => o.registerId === reg.id) || [];
                                  setSelectedRegister({ ...reg, orders: regOrders });
                                }} 
                                className="bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-blue-600 px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                              >
                                  🔍 Ver Fechamento
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhum caixa PDV foi aberto neste turno.</p>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* MODAL: ABRIR NOVO TURNO MANUALMENTE */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-emerald-500"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><span>➕</span> Abrir Novo Turno</h3>
              <button onClick={() => setShowOpenShiftModal(false)} className="text-slate-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <div className="pt-2">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1"><span>🔒</span> Credenciais do Gerente</p>
                <div className="space-y-3">
                  <input type="text" required value={openShiftAuth.email} onChange={e => setOpenShiftAuth({...openShiftAuth, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 text-slate-800" placeholder="CPF ou E-mail do Gerente" />
                  <input type="password" required value={openShiftAuth.password} onChange={e => setOpenShiftAuth({...openShiftAuth, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 text-slate-800" placeholder="Senha do Gerente" />
                </div>
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-xl shadow-lg transition-all mt-6 text-base cursor-pointer">
                Iniciar Turno
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENCERRAMENTO DE TURNO (GERENTE) */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-amber-500"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><span>📊</span> Fechamento Final</h3>
              <button onClick={() => setShowCloseShiftModal(false)} className="text-slate-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
               <p className="text-xs text-amber-700 font-bold text-center leading-relaxed">
                 Atenção! Todos os caixas de PDV e todas as mesas/comandas devem estar encerrados antes de fechar o turno da loja.
               </p>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1"><span>🔒</span> Credenciais do Gerente</p>
                <div className="space-y-3">
                  <input type="text" required value={managerAuth.email} onChange={e => setManagerAuth({...managerAuth, email: e.target.value})} className="w-full bg-red-50 border border-red-100 rounded-xl p-3 text-sm focus:outline-none focus:border-red-400 text-slate-800" placeholder="CPF ou E-mail do Gerente" />
                  <input type="password" required value={managerAuth.password} onChange={e => setManagerAuth({...managerAuth, password: e.target.value})} className="w-full bg-red-50 border border-red-100 rounded-xl p-3 text-sm focus:outline-none focus:border-red-400 text-slate-800" placeholder="Senha do Gerente" />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-all mt-6 text-base cursor-pointer">
                Consolidar e Encerrar Turno
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AUDITORIA DETALHADA DO CAIXA COM IMPRESSÃO BLINDADA */}
      {selectedRegister && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up relative overflow-hidden max-h-[90vh] flex flex-col">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
               
               <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><span>🧾</span> Auditoria de Caixa</h3>
                  <button onClick={() => setSelectedRegister(null)} className="text-slate-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
               </div>

               <div className="overflow-y-auto pr-2 pb-4 space-y-6 flex-1 hide-scrollbar">
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Operador</p>
                         <p className="font-black text-slate-800 uppercase text-sm">{getManagerName(selectedRegister.openedBy)}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Horário de Operação</p>
                         <p className="text-xs text-slate-600 font-bold">{new Date(selectedRegister.openedAt).toLocaleTimeString('pt-BR')} até {new Date(selectedRegister.closedAt).toLocaleTimeString('pt-BR')}</p>
                       </div>
                  </div>

                  {(() => {
                    let details = { cash: 0, credit: 0, debit: 0, pix: 0 };
                    try { details = JSON.parse(selectedRegister.closingDetails || '{}'); } catch(e){}

                    const repCash = Number(details.cash || 0);
                    const repCredit = Number(details.credit || 0);
                    const repDebit = Number(details.debit || 0);
                    const repPix = Number(details.pix || 0);

                    let sysCash = 0, sysCredit = 0, sysDebit = 0, sysPix = 0;
                    selectedRegister.orders?.forEach(o => {
                        const val = Number(o.total);
                        if (o.paymentMethod === 'CASH') sysCash += val;
                        else if (o.paymentMethod.includes('CREDIT')) sysCredit += val;
                        else if (o.paymentMethod.includes('DEBIT')) sysDebit += val;
                        else if (o.paymentMethod.includes('PIX')) sysPix += val;
                    });

                    let totalIn = 0, totalOut = 0;
                    selectedRegister.movements?.forEach(m => {
                        if (m.type === 'IN') totalIn += Number(m.amount);
                        if (m.type === 'OUT') totalOut += Number(m.amount);
                    });

                    const expectedCash = Number(selectedRegister.openingBalance || 0) + sysCash + totalIn - totalOut;

                    const quebraCash = repCash - expectedCash;
                    const quebraCredit = repCredit - sysCredit;
                    const quebraDebit = repDebit - sysDebit;
                    const quebraPix = repPix - sysPix;

                    const renderQuebra = (val) => {
                        if (val > 0.05) return <span className="text-emerald-500 font-black px-2 py-1 bg-emerald-50 rounded-lg text-xs">+ R$ {val.toFixed(2)} (Sobra)</span>;
                        if (val < -0.05) return <span className="text-red-500 font-black px-2 py-1 bg-red-50 rounded-lg text-xs">- R$ {Math.abs(val).toFixed(2)} (Falta)</span>;
                        return <span className="text-slate-400 font-bold px-2 py-1 bg-slate-100 rounded-lg text-xs">Batido (OK)</span>;
                    }

                    return (
                        <div className="space-y-6">
                            <div>
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Movimentação da Gaveta (Dinheiro)</h4>
                               <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-sm shadow-sm">
                                  <div className="flex justify-between p-3 border-b border-slate-100"><span className="text-slate-600 font-bold">Fundo de Caixa Inicial</span><span className="font-black text-slate-800">R$ {Number(selectedRegister.openingBalance).toFixed(2)}</span></div>
                                  <div className="flex justify-between p-3 border-b border-slate-100"><span className="text-slate-600 font-bold">Vendas em Dinheiro</span><span className="font-black text-emerald-600">+ R$ {sysCash.toFixed(2)}</span></div>
                                  <div className="flex justify-between p-3 border-b border-slate-100"><span className="text-slate-600 font-bold">Suprimentos (Entradas)</span><span className="font-black text-emerald-600">+ R$ {totalIn.toFixed(2)}</span></div>
                                  <div className="flex justify-between p-3 border-b border-slate-100"><span className="text-slate-600 font-bold">Sangrias (Saídas)</span><span className="font-black text-red-500">- R$ {totalOut.toFixed(2)}</span></div>
                                  <div className="flex justify-between p-4 bg-slate-50"><span className="font-black text-slate-800 uppercase text-xs">Total Esperado na Gaveta</span><span className="font-black text-xl text-slate-800 tracking-tighter">R$ {expectedCash.toFixed(2)}</span></div>
                               </div>
                            </div>
                            <div>
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Auditoria de Fechamento (Sistema vs Informado)</h4>
                               <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                                  <table className="w-full text-left text-xs">
                                     <thead className="bg-slate-100 text-slate-500 uppercase font-black tracking-wider">
                                        <tr>
                                           <th className="p-3">Método de Pgto</th>
                                           <th className="p-3">Sistema Registrou</th>
                                           <th className="p-3">Operador Informou</th>
                                           <th className="p-3 text-right">Diferença (Quebra)</th>
                                        </tr>
                                     </thead>
                                     <tbody className="bg-white divide-y divide-slate-100">
                                        <tr className="hover:bg-slate-50 transition-colors">
                                           <td className="p-3 font-bold text-slate-700">💵 Dinheiro Vivo</td>
                                           <td className="p-3 font-bold">R$ {expectedCash.toFixed(2)}</td>
                                           <td className="p-3 font-bold">R$ {repCash.toFixed(2)}</td>
                                           <td className="p-3 text-right">{renderQuebra(quebraCash)}</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                           <td className="p-3 font-bold text-slate-700">💳 Crédito</td>
                                           <td className="p-3 font-bold">R$ {sysCredit.toFixed(2)}</td>
                                           <td className="p-3 font-bold">R$ {repCredit.toFixed(2)}</td>
                                           <td className="p-3 text-right">{renderQuebra(quebraCredit)}</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                           <td className="p-3 font-bold text-slate-700">💳 Débito</td>
                                           <td className="p-3 font-bold">R$ {sysDebit.toFixed(2)}</td>
                                           <td className="p-3 font-bold">R$ {repDebit.toFixed(2)}</td>
                                           <td className="p-3 text-right">{renderQuebra(quebraDebit)}</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                           <td className="p-3 font-bold text-slate-700">❇️ PIX</td>
                                           <td className="p-3 font-bold">R$ {sysPix.toFixed(2)}</td>
                                           <td className="p-3 font-bold">R$ {repPix.toFixed(2)}</td>
                                           <td className="p-3 text-right">{renderQuebra(quebraPix)}</td>
                                        </tr>
                                     </tbody>
                                  </table>
                               </div>
                            </div>
                         </div>
                    )
                  })()}

                  {selectedRegister.movements?.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-4">Detalhamento de Entradas e Saídas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedRegister.movements.map(m => (
                                    <div key={m.id} className="flex flex-col bg-white border border-slate-200 p-4 rounded-2xl text-xs shadow-sm hover:border-amber-300 transition-colors">
                                       <div className="flex justify-between font-black mb-1 items-center">
                                          <span className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-widest ${m.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{m.type === 'IN' ? 'Suprimento' : 'Sangria'}</span>
                                          <span className="text-slate-800 text-sm">R$ {Number(m.amount).toFixed(2)}</span>
                                       </div>
                                       <span className="text-xs text-slate-600 font-bold mt-2">{m.reason}</span>
                                       <span className="text-[9px] text-slate-400 uppercase mt-1">Autorizado por: {getManagerName(m.authorizedBy)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                  )}
               </div>
               
               <div className="pt-4 border-t border-slate-100 mt-2 shrink-0 flex gap-3">
                    <button onClick={() => setSelectedRegister(null)} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm py-4 rounded-xl transition-colors cursor-pointer">
                       Voltar
                    </button>
                    <button onClick={() => imprimirFechamento(selectedRegister)} className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-black py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 text-sm group cursor-pointer">
                       <span className="text-xl group-hover:scale-110 transition-transform">🖨️</span> Imprimir Relatório
                    </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}