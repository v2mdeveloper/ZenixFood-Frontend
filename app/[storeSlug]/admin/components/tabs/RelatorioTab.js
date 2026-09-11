import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Calendar as CalendarIcon, Loader2 } from "lucide-react";

export default function RelatorioTab({ API_URL }) {
  const getDefaultStartDate = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

  const [dataInicio, setDataInicio] = useState(getDefaultStartDate());
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  const [resumo, setResumo] = useState({ faturamentoBruto: 0, despesasPagas: 0, sangriasCaixa: 0, suprimentosCaixa: 0, lucroLiquido: 0 });
  const [vendasMetodo, setVendasMetodo] = useState([]);
  const [fluxoCaixaDia, setFluxoCaixaDia] = useState([]);
  const [transacoes, setTransacoes] = useState([]);

  // 🛡️ Helper para injetar o Slug e o Token da Loja
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-loja-slug': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 402) {
      if (typeof window !== 'undefined') window.location.href = `/${storeId}/bloqueado`;
    }
    return response;
  };

  useEffect(() => {
    fetchRelatorio();
  }, []);

  const fetchRelatorio = async () => {
    setIsLoading(true);
    try {
      const relRes = await fetchWithStore(`${API_URL}/api/financeiro/relatorio?dataInicio=${dataInicio}T00:00:00.000Z&dataFim=${dataFim}T23:59:59.999Z`);
      const relData = await relRes.json();

      const ordRes = await fetchWithStore(`${API_URL}/api/orders`);
      const ordData = await ordRes.json();

      if (relData.success) {
        setResumo({
          faturamentoBruto: relData.resumo.totalVendas || 0,
          despesasPagas: relData.resumo.totalDespesas || 0,
          sangriasCaixa: relData.resumo.sangriasCaixa || 0,
          suprimentosCaixa: relData.resumo.suprimentosCaixa || 0,
          lucroLiquido: relData.resumo.saldoLiquido || 0,
        });

        const coresMetodos = { "PIX": "#10B981", "PIX_ONLINE": "#059669", "CREDIT_CARD_ONLINE": "#3B82F6", "CREDITO": "#2563EB", "DEBITO": "#60A5FA", "DINHEIRO": "#F59E0B", "CUSTOMER_ACCOUNT": "#8B5CF6", "EMPLOYEE_ACCOUNT": "#D946EF" };
        const formatVendas = Object.entries(relData.detalhamento.vendasPorMetodo || {}).map(([name, value]) => ({ name: name.replace('_ONLINE', ' Online'), value: Number(value), color: coresMetodos[name] || "#9CA3AF" }));
        setVendasMetodo(formatVendas);

        let allTransacoes = [];
        const inicioDate = new Date(`${dataInicio}T00:00:00`);
        const fimDate = new Date(`${dataFim}T23:59:59`);
        
        const pedidosFiltrados = Array.isArray(ordData) ? ordData.filter((o) => {
          const d = new Date(o.createdAt);
          return d >= inicioDate && d <= fimDate && o.status === "DELIVERED";
        }) : [];

        pedidosFiltrados.forEach((p) => { allTransacoes.push({ id: `pd-${p.id}`, dataReal: new Date(p.createdAt), tipo: "RECEITA", descricao: `Pedido #${p.shortId} ${p.origin ? `(${p.origin})` : ""}`, metodo: p.paymentMethod, valor: Number(p.total) }); });
        (relData.detalhamento.contasPagas || []).forEach((c) => { allTransacoes.push({ id: `cp-${c.id}`, dataReal: new Date(c.dataPagamento), tipo: "DESPESA", descricao: `Conta: ${c.descricao} (${c.fornecedor || 'Geral'})`, metodo: c.metodoPagamento || "-", valor: Number(c.valor) }); });
        (relData.detalhamento.movimentacoesCaixa || []).forEach((m) => { allTransacoes.push({ id: `mv-${m.id}`, dataReal: new Date(m.createdAt), tipo: m.type === "OUT" ? "SANGRIA" : "SUPRIMENTO", descricao: `Caixa: ${m.reason}`, metodo: "Dinheiro Caixa", valor: Number(m.amount) }); });

        allTransacoes.sort((a, b) => b.dataReal.getTime() - a.dataReal.getTime());
        setTransacoes(allTransacoes);

        const fluxoMap = new Map();
        allTransacoes.forEach(t => {
          const dataStr = `${String(t.dataReal.getDate()).padStart(2,'0')}/${String(t.dataReal.getMonth()+1).padStart(2,'0')}`;
          if (!fluxoMap.has(dataStr)) fluxoMap.set(dataStr, { name: dataStr, receitas: 0, despesas: 0 });
          const item = fluxoMap.get(dataStr);
          if (t.tipo === "RECEITA" || t.tipo === "SUPRIMENTO") item.receitas += t.valor;
          else if (t.tipo === "DESPESA" || t.tipo === "SANGRIA") item.despesas += t.valor;
        });

        const fluxoArr = Array.from(fluxoMap.values()).sort((a, b) => {
          const [d1, m1] = a.name.split('/'); const [d2, m2] = b.name.split('/');
          return new Date(2026, Number(m1)-1, Number(d1)).getTime() - new Date(2026, Number(m2)-1, Number(d2)).getTime();
        });
        setFluxoCaixaDia(fluxoArr);
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (date) => date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div><h2 className="text-xl font-black text-slate-800">📊 Relatório Financeiro</h2><p className="text-sm text-slate-500">Visão detalhada e dashboard de resultados reais</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl"><CalendarIcon className="w-5 h-5 text-slate-400" /><input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700 font-bold" /><span className="text-slate-400 font-bold px-1">até</span><input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700 font-bold" /></div>
          <button onClick={fetchRelatorio} disabled={isLoading} className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}Gerar Relatório</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden group hover:shadow-md transition-shadow"><div className="absolute top-4 right-4 p-3 bg-emerald-50 rounded-full transition-transform group-hover:scale-110"><TrendingUp className="w-6 h-6 text-emerald-600" /></div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Faturamento Bruto</p><h2 className="text-3xl font-black text-slate-800">{formatCurrency(resumo.faturamentoBruto)}</h2><div className="flex items-center gap-1 mt-3 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">Receitas de Pedidos</div></div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 relative overflow-hidden group hover:shadow-md transition-shadow"><div className="absolute top-4 right-4 p-3 bg-red-50 rounded-full transition-transform group-hover:scale-110"><TrendingDown className="w-6 h-6 text-red-600" /></div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Despesas Pagas</p><h2 className="text-3xl font-black text-slate-800">{formatCurrency(resumo.despesasPagas)}</h2><div className="flex items-center gap-1 mt-3 text-[10px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-100 w-fit px-2 py-1 rounded-md">Fornecedores e contas</div></div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-100 relative overflow-hidden group hover:shadow-md transition-shadow"><div className="absolute top-4 right-4 p-3 bg-amber-50 rounded-full transition-transform group-hover:scale-110"><Wallet className="w-6 h-6 text-amber-600" /></div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sangrias (Caixa)</p><h2 className="text-3xl font-black text-slate-800">{formatCurrency(resumo.sangriasCaixa)}</h2><div className="flex items-center gap-1 mt-3 text-[10px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-100 w-fit px-2 py-1 rounded-md">Dinheiro retirado</div></div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-md border border-blue-700 relative overflow-hidden group hover:shadow-lg transition-shadow text-white"><div className="absolute top-4 right-4 p-3 bg-white/10 rounded-full transition-transform group-hover:scale-110"><DollarSign className="w-6 h-6 text-white" /></div><p className="text-xs font-black text-blue-200 uppercase tracking-widest mb-2">Lucro Líquido</p><h2 className="text-3xl font-black text-white">{formatCurrency(resumo.lucroLiquido)}</h2><div className="flex items-center gap-1 mt-3 text-[10px] font-black uppercase text-blue-100 bg-white/10 w-fit px-2 py-1 rounded-md">Vendas - Despesas</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-black text-slate-800 mb-6">Fluxo de Caixa Diário</h3>
          <div className="h-80 w-full">
            {fluxoCaixaDia.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%"><BarChart data={fluxoCaixaDia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} tickFormatter={(value) => `R$ ${value}`} /><RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} /><Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '12px' }} /><Bar dataKey="receitas" name="Entradas (Vendas)" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={45} /><Bar dataKey="despesas" name="Saídas (Contas/Sangrias)" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={45} /></BarChart></ResponsiveContainer>
            ) : (<div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">Nenhum dado no período selecionado.</div>)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-black text-slate-800 mb-2">Vendas por Método</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Distribuição de pagamentos</p>
          <div className="flex-1 w-full flex items-center justify-center min-h-[250px]">
            {vendasMetodo.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={vendasMetodo} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={5} dataKey="value" stroke="none">{vendasMetodo.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><RechartsTooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} /><Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '12px' }} /></PieChart></ResponsiveContainer>
            ) : (<div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">Sem vendas no período.</div>)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><div><h3 className="text-lg font-black text-slate-800">Detalhamento de Transações</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Histórico cronológico do período</p></div></div>
        <div className="overflow-x-auto min-h-[200px] relative">
          {isLoading && (<div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>)}
          <table className="w-full text-left border-collapse text-sm text-slate-700">
            <thead><tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100"><th className="p-5">Data e Hora</th><th className="p-5">Tipo</th><th className="p-5">Descrição</th><th className="p-5">Método</th><th className="p-5 text-right">Valor</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {transacoes.length === 0 && !isLoading ? (<tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Nenhuma transação encontrada no período.</td></tr>) : (transacoes.map((t) => (<tr key={t.id} className="hover:bg-slate-50 transition-colors"><td className="p-5 font-bold whitespace-nowrap">{formatDate(t.dataReal)}</td><td className="p-5"><span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${t.tipo === 'RECEITA' || t.tipo === 'SUPRIMENTO' ? 'bg-emerald-100 text-emerald-700' : t.tipo === 'DESPESA' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{t.tipo}</span></td><td className="p-5 font-black text-slate-900">{t.descricao}</td><td className="p-5 text-slate-500 font-bold">{t.metodo}</td><td className={`p-5 text-right font-black whitespace-nowrap ${t.tipo === 'RECEITA' || t.tipo === 'SUPRIMENTO' ? 'text-emerald-600' : 'text-red-600'}`}>{t.tipo === 'RECEITA' || t.tipo === 'SUPRIMENTO' ? '+' : '-'} {formatCurrency(t.valor)}</td></tr>)))}
            </tbody>
          </table>
        </div>
        <div className="p-5 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">Exibindo {transacoes.length} transações no período</div>
      </div>
    </div>
  );
}