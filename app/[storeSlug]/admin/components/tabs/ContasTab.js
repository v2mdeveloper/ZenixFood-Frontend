import React, { useState, useEffect } from "react";
import { Plus, Check, X, Loader2 } from "lucide-react";

export default function ContasTab({ API_URL }) {
  const [contas, setContas] = useState([]);
  const [tab, setTab] = useState("PENDENTE");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [fornecedor, setFornecedor] = useState("");

  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [usarCaixaTurno, setUsarCaixaTurno] = useState(false);

  // 🛡️ Helper para injetar o Slug e o Token da Loja nas requisições
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
    fetchContas();
  }, []);

  const fetchContas = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/financeiro/contas-pagar`);
      if (res.ok) {
        const data = await res.json();
        const contasAtualizadas = data.map((c) => {
          let statusAtual = c.status;
          if (statusAtual === "PENDENTE" && new Date(c.dataVencimento) < new Date(new Date().setHours(0,0,0,0))) {
            statusAtual = "ATRASADA";
          }
          return { ...c, status: statusAtual };
        });
        setContas(contasAtualizadas);
      }
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConta = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/financeiro/contas-pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, valor: Number(valor), dataVencimento: vencimento, fornecedor })
      });
      
      if (res.ok) {
        setDescricao(""); setValor(""); setVencimento(""); setFornecedor("");
        alert("Conta adicionada com sucesso!");
        fetchContas();
      } else {
        alert("Erro ao adicionar conta.");
      }
    } catch (error) {
      alert("Erro de conexão ao adicionar conta.");
    }
  };

  const handlePayConta = async () => {
    if (!contaSelecionada) return;
    
    let shiftId = null;
    if (usarCaixaTurno) {
      try {
        const shiftRes = await fetchWithStore(`${API_URL}/api/pdv/status`);
        const shiftData = await shiftRes.json();
        if (shiftData.hasOpenShift) {
          shiftId = shiftData.shiftId;
        } else {
          alert("Não há turno/caixa aberto no PDV para deduzir o valor.");
          return;
        }
      } catch (error) {
        alert("Erro ao validar caixa do PDV.");
        return;
      }
    }

    try {
      const res = await fetchWithStore(`${API_URL}/api/financeiro/contas-pagar/${contaSelecionada.id}/pagar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPagamento, shiftId })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setContaSelecionada(null);
        alert("Pagamento registrado com sucesso!");
        fetchContas();
      } else {
        alert("Erro ao registrar pagamento.");
      }
    } catch (error) {
      alert("Erro de conexão ao registrar pagamento.");
    }
  };

  const contasFiltradas = contas.filter(c => c.status === tab);
  const formatData = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800">💸 Contas a Pagar</h2>
          <p className="text-sm text-slate-500">Cadastre e baixe as despesas e boletos da sua loja.</p>
        </div>
      </div>

      {/* Formulário de Nova Conta */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4 text-slate-700 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" /> Nova Conta
        </h2>
        <form onSubmit={handleAddConta} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Descrição</label><input type="text" required value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Ex: Internet, Luz..." /></div>
          <div><label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Valor (R$)</label><input type="number" step="0.01" required value={valor} onChange={e => setValor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="0.00" /></div>
          <div><label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Vencimento</label><input type="date" required value={vencimento} onChange={e => setVencimento(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
          <div><label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Fornecedor</label><input type="text" required value={fornecedor} onChange={e => setFornecedor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Nome da empresa" /></div>
          <div className="md:col-span-4 flex justify-end mt-2"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md">Adicionar Conta</button></div>
        </form>
      </div>

      {/* Abas e Lista */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button onClick={() => setTab("PENDENTE")} className={`flex-1 py-4 text-center font-bold transition-colors ${tab === "PENDENTE" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-50"}`}>Pendentes</button>
          <button onClick={() => setTab("ATRASADA")} className={`flex-1 py-4 text-center font-bold transition-colors ${tab === "ATRASADA" ? "text-red-600 border-b-2 border-red-600 bg-red-50/50" : "text-slate-500 hover:bg-slate-50"}`}>Atrasadas</button>
          <button onClick={() => setTab("PAGA")} className={`flex-1 py-4 text-center font-bold transition-colors ${tab === "PAGA" ? "text-green-600 border-b-2 border-green-600 bg-green-50/50" : "text-slate-500 hover:bg-slate-50"}`}>Pagas</button>
        </div>

        <div className="p-0 overflow-x-auto min-h-[200px] relative">
          {isLoading && (<div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>)}
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
              <tr><th className="px-6 py-4 font-black">Descrição</th><th className="px-6 py-4 font-black">Fornecedor</th><th className="px-6 py-4 font-black">Vencimento</th><th className="px-6 py-4 font-black">Valor</th><th className="px-6 py-4 font-black text-right">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contasFiltradas.length === 0 && !isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Nenhuma conta encontrada nesta categoria.</td></tr>
              ) : (
                contasFiltradas.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900">{c.descricao}</td>
                    <td className="px-6 py-4 font-medium">{c.fornecedor || '-'}</td>
                    <td className="px-6 py-4 font-medium">{formatData(c.dataVencimento)}</td>
                    <td className="px-6 py-4 font-black text-slate-900">R$ {Number(c.valor).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      {tab !== "PAGA" ? (
                        <button onClick={() => { setContaSelecionada(c); setIsModalOpen(true); }} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors shadow-sm">Pagar</button>
                      ) : (
                        <span className="text-xs text-emerald-600 flex items-center justify-end gap-1 font-black uppercase tracking-widest"><Check className="w-4 h-4" /> Pago ({formatData(c.dataPagamento)})</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {isModalOpen && contaSelecionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in-up border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">Registrar Pagamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors font-bold text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conta Selecionada</p>
                <p className="font-black text-slate-800 text-lg leading-tight">{contaSelecionada.descricao}</p>
                <p className="text-2xl font-black text-blue-600 mt-2">R$ {Number(contaSelecionada.valor).toFixed(2)}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Método de Pagamento</label>
                <select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 font-bold text-slate-800 cursor-pointer">
                  <option value="PIX">PIX</option><option value="DINHEIRO">Dinheiro Espécie</option><option value="BOLETO">Boleto Bancário</option><option value="CARTAO">Cartão de Crédito</option>
                </select>
              </div>
              {metodoPagamento === "DINHEIRO" && (
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 mt-4 cursor-pointer hover:border-blue-300 transition-colors">
                  <input type="checkbox" checked={usarCaixaTurno} onChange={() => setUsarCaixaTurno(!usarCaixaTurno)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                  <div><p className="font-black text-slate-800 text-sm">Deduzir do Caixa Físico</p><p className="text-[10px] font-medium text-slate-500 mt-0.5">Lança uma saída (sangria) no PDV atual.</p></div>
                </label>
              )}
              <div className="mt-8 flex gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold transition-all hover:bg-slate-200">Cancelar</button>
                <button onClick={handlePayConta} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all shadow-md">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}