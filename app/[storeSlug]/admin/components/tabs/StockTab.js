import { useState, useEffect, useCallback } from 'react';

export default function StockTab({
  estoqueSubTab, setEstoqueSubTab,
  fetchMovimentacoes, handleUploadXMLPreview, setXmlFile, novaMovimentacao, setNovaMovimentacao, insumos, handleMovimentacaoManual,
  novoInsumo, setNovoInsumo, handleSalvarInsumo, toggleInsumoStatus, setEditingInsumo, editingInsumo, handleEditInsumoSubmit,
  allProducts, fichasVisiveis, carregarFicha, setFichasVisiveis, calculateCmv, getCmvColor, handleRemoveFicha, handleAddFicha,
  movimentacoes, showXmlModal, setShowXmlModal, xmlPreviewData, xmlMappings, updateMapping, handleConfirmXmlImport
}) {
  
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  // ESTADOS DO CHEF DE RECEITAS IA
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [savedAiRecipes, setSavedAiRecipes] = useState([]);
  const [loadingAiRecipes, setLoadingAiRecipes] = useState(false);

  // ESTADOS DO CONSELHEIRO FINANCEIRO IA
  const [isAnalyzingFinance, setIsAnalyzingFinance] = useState(false);
  const [financeAnalysis, setFinanceAnalysis] = useState(null);

  // ESTADOS: RECEITAS E PREPAROS
  const [receitasDB, setReceitasDB] = useState([]);
  const [formReceita, setFormReceita] = useState({ id: null, nome: '', insumoSaidaId: '', rendimento: '', preparo: '', itens: [], isActive: true });
  const [multiplicadores, setMultiplicadores] = useState({});

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
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; 
      }
    }

    return response;
  };

  // ==========================================
  // FUNÇÕES DE SUB-RECEITAS E PREPAROS
  // ==========================================
  const fetchReceitasDB = useCallback(async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/receitas`);
      if (res.ok) setReceitasDB(await res.json());
    } catch (e) { console.error(e); }
  }, [API_URL]);

  useEffect(() => {
    if (estoqueSubTab === 'receitas') fetchReceitasDB();
    if (estoqueSubTab === 'chef-ia') fetchAiRecipes();
  }, [estoqueSubTab, fetchReceitasDB]);

  const handleAddIngredienteReceita = () => {
    setFormReceita({ ...formReceita, itens: [...formReceita.itens, { insumoId: '', quantity: '' }] });
  };

  const handleIngredienteReceitaChange = (index, field, value) => {
    const novosItens = [...formReceita.itens];
    novosItens[index][field] = value;
    setFormReceita({ ...formReceita, itens: novosItens });
  };

  const handleRemoverIngredienteReceita = (index) => {
    const novosItens = formReceita.itens.filter((_, i) => i !== index);
    setFormReceita({ ...formReceita, itens: novosItens });
  };

  const handleSalvarReceita = async (e) => {
    e.preventDefault();
    if (formReceita.itens.length === 0) return alert("Adicione pelo menos 1 ingrediente.");
    
    try {
      const isEdit = !!formReceita.id;
      const url = isEdit ? `${API_URL}/api/receitas/${formReceita.id}` : `${API_URL}/api/receitas`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetchWithStore(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formReceita)
      });
      const data = await res.json();
      
      if (data.success) {
        alert(isEdit ? "Receita atualizada!" : "Receita salva com sucesso!");
        setFormReceita({ id: null, nome: '', insumoSaidaId: '', rendimento: '', preparo: '', itens: [], isActive: true });
        fetchReceitasDB();
        if (typeof handleMovimentacaoManual === 'function') fetchMovimentacoes(); 
      } else alert(data.error);
    } catch (error) { alert("Erro ao salvar a receita."); }
  };

  const handleEditReceita = (receita) => {
    const dados = JSON.parse(receita.ingredientes || '{}');
    setFormReceita({
      id: receita.id,
      nome: receita.nome,
      insumoSaidaId: dados.insumoSaidaId || '',
      rendimento: dados.rendimento || '',
      preparo: receita.preparo || '',
      itens: dados.itens || [],
      isActive: dados.isActive !== false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReceita = async (id) => {
    if (!confirm("Tem a certeza que deseja excluir esta receita?")) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/receitas/${id}`, { method: 'DELETE' });
      if (res.ok) fetchReceitasDB();
    } catch (e) { alert("Erro ao excluir."); }
  };

  const handleToggleReceitaStatus = async (receita) => {
    const dados = JSON.parse(receita.ingredientes || '{}');
    const newStatus = dados.isActive === false ? true : false;
    try {
      await fetchWithStore(`${API_URL}/api/receitas/${receita.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...receita, ...dados, isActive: newStatus })
      });
      fetchReceitasDB();
    } catch (e) { alert("Erro ao mudar status."); }
  };

  const handleProduzirReceita = async (receitaId) => {
    const multiplicador = multiplicadores[receitaId] || 1;
    if (!confirm(`Confirma a produção de ${multiplicador}x esta receita?\n\nOs ingredientes serão descontados do estoque.`)) return;
    
    try {
      const res = await fetchWithStore(`${API_URL}/api/receitas/${receitaId}/produzir`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ multiplicador })
      });
      const data = await res.json();
      if (data.success) {
        alert("Produção concluída! Estoque atualizado.");
        setMultiplicadores(prev => ({ ...prev, [receitaId]: 1 }));
        fetchMovimentacoes(); 
      } else {
        alert(data.error);
      }
    } catch (e) { alert("Erro ao produzir."); }
  };

  // ==========================================
  // FUNÇÕES DO CHEF IA
  // ==========================================
  const fetchAiRecipes = useCallback(async () => {
    setLoadingAiRecipes(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/ai/receitas`);
      if (res.ok) setSavedAiRecipes(await res.json());
    } catch (e) { console.error(e); }
    setLoadingAiRecipes(false);
  }, [API_URL]);

  const handleGenerateRecipe = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;
    setAiGenerating(true);
    setAiResult(null);
    try {
      const res = await fetchWithStore(`${API_URL}/api/ai/receitas/gerar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.success) setAiResult(data.receita);
      else alert(data.error);
    } catch (e) { alert('Erro ao conectar com a IA.'); }
    setAiGenerating(false);
  };

  const handleApproveRecipe = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/ai/receitas/aprovar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aiResult)
      });
      const data = await res.json();
      if (data.success) {
        alert(`🎉 Receita Aprovada e Salva!\n\n${data.insumosCriados} novos insumos foram cadastrados no estoque!`);
        setAiResult(null); setAiPrompt('');
        fetchAiRecipes(); 
      } else alert(data.error);
    } catch (e) { alert('Erro ao salvar.'); }
  };

  // ==========================================
  // FUNÇÃO: CONSELHEIRO FINANCEIRO IA
  // ==========================================
  const handlePedirAnaliseFinanceira = async () => {
      setIsAnalyzingFinance(true);
      setFinanceAnalysis(null);

      const produtosLimposParaIA = allProducts.map(product => {
          const ficha = product.fichasTecnicas || [];
          const custoTotal = ficha.reduce((acc, f) => acc + (f.quantity * Number(f.insumo.cost)), 0);
          const precoVenda = Number(product.price);
          const lucroBruto = precoVenda - custoTotal;
          const margemLucro = (precoVenda > 0 && custoTotal > 0) ? ((lucroBruto / precoVenda) * 100).toFixed(1) : "0.0";
          return { nome: product.name, custoReal: custoTotal, precoVenda: precoVenda, lucroReais: lucroBruto, margemPorcentagem: margemLucro };
      });

      try {
          const res = await fetchWithStore(`${API_URL}/api/ai/analise-lucros`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ produtos: produtosLimposParaIA })
          });
          const data = await res.json();
          if (data.success) setFinanceAnalysis(data.analise);
          else alert(data.error);
      } catch (error) {
          alert('Falha ao acionar o Conselheiro IA.');
      }
      setIsAnalyzingFinance(false);
  };

  const exportLucratividadeToExcel = () => {
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
      csvContent += "Produto;Custo (R$);Preco de Venda (R$);Lucro Bruto (R$);Margem de Lucro (%)\n";

      allProducts.forEach(product => {
          const ficha = product.fichasTecnicas || [];
          const custoTotal = ficha.reduce((acc, f) => acc + (f.quantity * Number(f.insumo.cost)), 0);
          const precoVenda = Number(product.price);
          const lucroBruto = precoVenda - custoTotal;
          const margemLucro = precoVenda > 0 ? ((lucroBruto / precoVenda) * 100).toFixed(1) : "0.0";
          const cleanName = product.name.replace(/;/g, ",").replace(/\n/g, " ");
          csvContent += `${cleanName};${custoTotal.toFixed(2).replace('.',',')};${precoVenda.toFixed(2).replace('.',',')};${lucroBruto.toFixed(2).replace('.',',')};${margemLucro.replace('.',',')}%\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Relatorio_Lucratividade_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const tabs = [
    { id: 'insumos', label: 'Ingredientes (Insumos)' },
    { id: 'fichas', label: 'Fichas & CMV' },
    { id: 'lucratividade', label: '📊 Lucros' },
    { id: 'receitas', label: '🍲 Preparos (Sub-receitas)' },
    { id: 'chef-ia', label: '✨ Chef IA' },
    { id: 'movimentacoes', label: 'Entradas/Saídas' }
  ];

  return (
    <main className="space-y-6">
      
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setEstoqueSubTab(tab.id); if(tab.id === 'movimentacoes') fetchMovimentacoes(); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${estoqueSubTab === tab.id ? 'bg-amber-500 text-black shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* ABA: INGREDIENTES / INSUMOS */}
      {/* ============================================================== */}
      {estoqueSubTab === 'insumos' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4">Cadastrar Insumo</h2>
              <form onSubmit={handleSalvarInsumo} className="space-y-4">
                <div><label className="text-xs text-slate-500 block mb-1">Nome do Ingrediente / Preparo</label><input type="text" required value={novoInsumo.name} onChange={(e) => setNovoInsumo({...novoInsumo, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Ex: Arroz Cozido" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-slate-500 block mb-1">Unidade</label><select value={novoInsumo.unit} onChange={(e) => setNovoInsumo({...novoInsumo, unit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"><option value="UN">Unidade (UN)</option><option value="KG">Quilo (KG)</option><option value="L">Litro (L)</option></select></div>
                  <div><label className="text-xs text-slate-500 block mb-1">Custo (R$)</label><input type="number" step="0.01" required value={novoInsumo.cost} onChange={(e) => setNovoInsumo({...novoInsumo, cost: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                </div>
                <div><label className="text-xs text-slate-500 block mb-1">Estoque Inicial</label><input type="number" step="0.001" required value={novoInsumo.stock} onChange={(e) => setNovoInsumo({...novoInsumo, stock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl transition-all shadow-md">Adicionar ao Estoque</button>
              </form>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm">
              <h2 className="text-lg font-black text-blue-900 mb-2">Importar Nota Fiscal (XML)</h2>
              <p className="text-xs text-slate-500 mb-4">Adicione ingredientes e atualize custos enviando o XML do fornecedor.</p>
              <form onSubmit={handleUploadXMLPreview} className="space-y-4">
                <input type="file" accept=".xml" onChange={(e) => setXmlFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all shadow-md">Analisar XML</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
             <div className="p-6 border-b border-slate-100 shrink-0"><h2 className="text-lg font-black text-slate-900">Seu Estoque Atual</h2></div>
             <div className="overflow-x-auto flex-1 hide-scrollbar">
               <table className="w-full text-left text-sm text-slate-700">
                 <thead className="bg-slate-50 text-xs text-slate-500 uppercase sticky top-0 shadow-sm">
                   <tr><th className="px-6 py-4">Status</th><th className="px-6 py-4">Insumo</th><th className="px-6 py-4 text-right">Qtd Estoque</th><th className="px-6 py-4 text-right">Custo Unid.</th><th className="px-6 py-4 text-center">Ações</th></tr>
                 </thead>
                 <tbody>
                   {insumos.map(insumo => (
                     <tr key={insumo.id} className="border-b border-slate-100 hover:bg-slate-50">
                       <td className="px-6 py-4">
                         <button onClick={() => toggleInsumoStatus(insumo)} className={`w-10 h-5 rounded-full relative transition-colors ${insumo.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                           <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${insumo.isActive ? 'translate-x-5' : ''}`}></span>
                         </button>
                       </td>
                       <td className="px-6 py-4 font-bold text-slate-900">{insumo.name}</td>
                       <td className="px-6 py-4 text-right font-black"><span className={insumo.stock <= 0 ? 'text-red-500' : 'text-emerald-600'}>{Number(insumo.stock).toFixed(3)} {insumo.unit}</span></td>
                       <td className="px-6 py-4 text-right">R$ {Number(insumo.cost).toFixed(2)}</td>
                       <td className="px-6 py-4 text-center"><button onClick={() => setEditingInsumo(insumo)} className="text-amber-600 hover:text-amber-700 font-bold text-xs bg-amber-50 px-3 py-1 rounded-lg">Editar</button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* ABA: FICHAS TÉCNICAS E CMV */}
      {/* ============================================================== */}
      {estoqueSubTab === 'fichas' && (
        <section className="space-y-6 animate-fade-in-up">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-2">Fichas Técnicas & Rentabilidade (CMV)</h2>
            <p className="text-sm text-slate-500 mb-6">Monte a receita exata de cada produto para calcular o Custo de Mercadoria Vendida (CMV) e abater do estoque automaticamente.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProducts.map(product => {
                const ficha = fichasVisiveis[product.id] || (product.fichasTecnicas && product.fichasTecnicas.length > 0 ? product.fichasTecnicas : null);
                const custoTotalFicha = ficha ? ficha.reduce((acc, f) => acc + (f.quantity * Number(f.insumo.cost)), 0) : 0;
                const cmvAtual = calculateCmv(custoTotalFicha, product.price);
                return (
                  <div key={product.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 relative">
                    {ficha ? (
                      <span className={`absolute -top-3 -right-3 px-3 py-1 rounded-xl text-xs font-black shadow-md ${getCmvColor(cmvAtual)}`}>CMV: {cmvAtual}%</span>
                    ) : (
                      <span className="absolute -top-3 -right-3 bg-slate-200 text-slate-600 px-3 py-1 rounded-xl text-xs font-bold shadow-md">Sem Ficha</span>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" /> : <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-xl">🍔</div>}
                      <div><h3 className="font-black text-slate-900 leading-tight">{product.name}</h3><p className="text-xs text-slate-500">Venda: R$ {Number(product.price).toFixed(2)}</p></div>
                    </div>
                    {ficha ? (
                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-2">
                          {ficha.length === 0 ? <p className="text-xs text-slate-400 italic text-center">Nenhum ingrediente adicionado.</p> : ficha.map(f => (
                            <div key={f.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1">
                              <span className="font-bold text-slate-700">{f.insumo.name}</span>
                              <div className="flex items-center gap-2"><span className="text-slate-500">{f.quantity} {f.insumo.unit}</span><button onClick={() => handleRemoveFicha(f.id, product.id)} className="text-red-500 hover:bg-red-50 w-5 h-5 rounded flex items-center justify-center font-bold">✕</button></div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center bg-slate-200 p-2 rounded-lg text-xs font-bold"><span className="text-slate-600">Custo Total da Receita:</span><span className="text-slate-900">R$ {custoTotalFicha.toFixed(2)}</span></div>
                        <form onSubmit={(e) => handleAddFicha(e, product.id)} className="flex gap-2">
                          <select name="insumoId" required className="flex-1 bg-white border border-slate-200 rounded-lg text-xs p-2"><option value="">Ingrediente...</option>{insumos.filter(i => i.isActive).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
                          <input type="number" name="quantity" step="0.001" placeholder="Qtd" required className="w-16 bg-white border border-slate-200 rounded-lg text-xs p-2 text-center" />
                          <button type="submit" className="bg-amber-500 text-black font-black px-3 rounded-lg hover:bg-amber-400">+</button>
                        </form>
                      </div>
                    ) : (
                      <button onClick={() => carregarFicha(product.id)} className="w-full bg-slate-800 text-white font-bold py-2 rounded-xl text-sm hover:bg-black transition-colors mt-2">Configurar Receita</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* ABA: RELATÓRIO DE LUCRATIVIDADE */}
      {/* ============================================================== */}
      {estoqueSubTab === 'lucratividade' && (
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
             <div>
               <h2 className="text-xl font-black text-slate-900">Relatório Geral de Lucratividade</h2>
               <p className="text-sm text-slate-500">Visão geral do custo real e margem de ganho de todos os seus produtos.</p>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
               <button onClick={exportLucratividadeToExcel} className="flex-1 md:flex-none bg-slate-800 hover:bg-black text-white font-bold px-4 py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2">
                 📊 Exportar Excel
               </button>
               <button 
                 onClick={handlePedirAnaliseFinanceira} 
                 disabled={isAnalyzingFinance || allProducts.length === 0}
                 className={`flex-1 md:flex-none font-black px-4 py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 ${isAnalyzingFinance ? 'bg-amber-500/50 text-black/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}
               >
                 {isAnalyzingFinance ? '🧠 Analisando finanças...' : '🧠 Conselheiro IA'}
               </button>
             </div>
          </div>

          {financeAnalysis && (
             <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8 animate-fade-in-up relative">
                <button onClick={() => setFinanceAnalysis(null)} className="absolute top-4 right-4 bg-amber-200 text-amber-800 hover:bg-amber-300 w-8 h-8 rounded-full font-bold flex items-center justify-center transition-colors">✕</button>
                <div className="flex items-center gap-3 mb-4"><span className="text-3xl">🧠</span><h3 className="text-xl font-black text-amber-900">Análise do Conselheiro IA</h3></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
                   <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {typeof financeAnalysis === 'string' ? financeAnalysis : financeAnalysis.resumo || "Não foi possível carregar a análise. Tente novamente."}
                   </div>
                </div>
             </div>
          )}

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
             <table className="w-full text-left text-sm text-slate-700">
               <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-100">
                 <tr><th className="px-6 py-4">Produto</th><th className="px-6 py-4 text-right">Custo da Receita</th><th className="px-6 py-4 text-right">Preço de Venda</th><th className="px-6 py-4 text-right">Lucro Bruto (R$)</th><th className="px-6 py-4 text-right">Margem de Lucro</th></tr>
               </thead>
               <tbody>
                 {allProducts.length === 0 && <tr><td colSpan="5" className="text-center py-8">Nenhum produto cadastrado.</td></tr>}
                 {allProducts.map(product => {
                   const ficha = product.fichasTecnicas || [];
                   const custoTotal = ficha.reduce((acc, f) => acc + (f.quantity * Number(f.insumo.cost)), 0);
                   const precoVenda = Number(product.price);
                   const lucroBruto = precoVenda - custoTotal;
                   const margemLucro = (precoVenda > 0 && custoTotal > 0) ? ((lucroBruto / precoVenda) * 100).toFixed(1) : (ficha.length === 0 ? "Sem Ficha" : "100.0");
                   
                   let margemColor = 'text-slate-400 font-normal';
                   if (margemLucro !== "Sem Ficha") {
                       const m = Number(margemLucro);
                       margemColor = m >= 50 ? 'text-emerald-600 bg-emerald-50' : (m >= 30 ? 'text-amber-500 bg-amber-50' : 'text-red-500 bg-red-50');
                   }

                   return (
                     <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                       <td className="px-6 py-4 text-right text-red-500 font-medium">{custoTotal > 0 ? `R$ ${custoTotal.toFixed(2)}` : <span className="text-slate-300">R$ 0.00</span>}</td>
                       <td className="px-6 py-4 text-right font-medium">R$ {precoVenda.toFixed(2)}</td>
                       <td className="px-6 py-4 text-right font-black text-emerald-600">{ficha.length > 0 ? `R$ ${lucroBruto.toFixed(2)}` : '-'}</td>
                       <td className="px-6 py-4 text-right"><span className={`px-3 py-1 rounded-lg font-black text-xs ${margemColor}`}>{margemLucro !== "Sem Ficha" ? `${margemLucro}%` : margemLucro}</span></td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* ABA: PREPAROS E SUB-RECEITAS */}
      {/* ============================================================== */}
      {estoqueSubTab === 'receitas' && (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up">
          
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-4">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                 <h2 className="text-lg font-black text-slate-900">{formReceita.id ? '✏️ Editar Receita' : '🍲 Nova Receita / Preparo'}</h2>
                 {formReceita.id && <button onClick={() => setFormReceita({ id: null, nome: '', insumoSaidaId: '', rendimento: '', preparo: '', itens: [], isActive: true })} className="text-xs font-bold text-slate-400 hover:text-red-500">Cancelar Edição</button>}
              </div>
              
              <form onSubmit={handleSalvarReceita} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1">Nome do Preparo</label>
                  <input type="text" required value={formReceita.nome} onChange={(e) => setFormReceita({...formReceita, nome: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 font-bold" placeholder="Ex: Panela de Arroz, Molho de Tomate..." />
                </div>
                
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-inner">
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-3">O que esta receita produz?</p>
                   <div className="space-y-3">
                     <div>
                       <label className="text-xs text-emerald-800 font-bold block mb-1">Insumo Gerado (Estoque)</label>
                       <select required value={formReceita.insumoSaidaId} onChange={(e) => setFormReceita({...formReceita, insumoSaidaId: e.target.value})} className="w-full bg-white border border-emerald-300 rounded-xl p-2 text-sm focus:outline-none font-bold text-emerald-900 cursor-pointer">
                         <option value="">Selecione o Insumo Pronto...</option>
                         {insumos.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="text-xs text-emerald-800 font-bold block mb-1">Rendimento (Quantidade Gerada)</label>
                       <input type="number" step="0.001" required value={formReceita.rendimento} onChange={(e) => setFormReceita({...formReceita, rendimento: e.target.value})} className="w-full bg-white border border-emerald-300 rounded-xl p-2 text-sm focus:outline-none font-bold text-emerald-900" placeholder="Ex: 2.5 (Kg)" />
                     </div>
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-center mb-2 mt-4">
                      <label className="text-xs text-slate-500 font-bold uppercase tracking-widest block">Ingredientes</label>
                      <button type="button" onClick={handleAddIngredienteReceita} className="text-[10px] bg-amber-100 text-amber-700 font-black px-2 py-1 rounded hover:bg-amber-200">+ Adicionar Insumo</button>
                   </div>
                   
                   <div className="space-y-2">
                     {formReceita.itens.map((item, index) => (
                       <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <select required value={item.insumoId} onChange={(e) => handleIngredienteReceitaChange(index, 'insumoId', e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none">
                             <option value="">Insumo Cru...</option>
                             {insumos.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                          </select>
                          <input type="number" step="0.001" required placeholder="Qtd" value={item.quantity} onChange={(e) => handleIngredienteReceitaChange(index, 'quantity', e.target.value)} className="w-20 bg-white border border-slate-200 rounded-lg p-2 text-xs text-center focus:outline-none" />
                          <button type="button" onClick={() => handleRemoverIngredienteReceita(index)} className="text-red-500 font-black w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded">✕</button>
                       </div>
                     ))}
                     {formReceita.itens.length === 0 && <p className="text-xs text-slate-400 italic text-center py-2 border-2 border-dashed border-slate-200 rounded-xl">Clique em + Adicionar para inserir ingredientes.</p>}
                   </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1">Modo de Preparo (Opcional)</label>
                  <textarea rows="3" value={formReceita.preparo} onChange={(e) => setFormReceita({...formReceita, preparo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 resize-none" placeholder="Instruções para a cozinha..." />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest mt-2">
                  {formReceita.id ? 'Salvar Edição' : 'Salvar Nova Receita'}
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-2">
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                   <div>
                     <h2 className="text-lg font-black text-slate-900">Seus Preparos & Sub-receitas</h2>
                     <p className="text-xs text-slate-500 mt-1">Produza as receitas para abater o estoque cru e dar entrada no item pronto.</p>
                   </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-slate-100 space-y-4">
                   {receitasDB.length === 0 && <div className="text-center py-10 text-slate-400 font-bold">Nenhuma receita cadastrada ainda.</div>}
                   {receitasDB.map(receita => {
                      const dados = JSON.parse(receita.ingredientes || '{}');
                      const insumoGerado = insumos.find(i => i.id === dados.insumoSaidaId);
                      const isActive = dados.isActive !== false;

                      return (
                         <div key={receita.id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${isActive ? 'border-blue-200' : 'border-slate-300 opacity-60 grayscale'}`}>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                               <div>
                                  <div className="flex items-center gap-3">
                                     <h3 className="text-lg font-black text-slate-800">{receita.nome}</h3>
                                     {!isActive && <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Inativo</span>}
                                  </div>
                                  {insumoGerado && <p className="text-xs font-bold text-emerald-600 mt-1">Gera: {dados.rendimento} {insumoGerado.unit} de {insumoGerado.name}</p>}
                               </div>
                               
                               <div className="flex items-center gap-2">
                                  <button onClick={() => handleToggleReceitaStatus(receita)} className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                                     {isActive ? 'Desativar' : 'Ativar'}
                                  </button>
                                  <button onClick={() => handleEditReceita(receita)} className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100">Editar</button>
                                  <button onClick={() => handleDeleteReceita(receita.id)} className="text-[10px] font-black bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Excluir</button>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ingredientes Usados</p>
                                  <ul className="space-y-1.5">
                                     {(dados.itens || []).map((item, i) => {
                                        const ins = insumos.find(x => x.id === item.insumoId);
                                        return (
                                           <li key={i} className="text-xs font-bold text-slate-700 flex justify-between border-b border-slate-200/50 pb-1 last:border-0">
                                              <span>{ins ? ins.name : 'Insumo Excluído'}</span>
                                              <span className="text-slate-500">{item.quantity} {ins?.unit}</span>
                                           </li>
                                        )
                                     })}
                                  </ul>
                               </div>
                               <div className="flex flex-col justify-center bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                  <div className="flex justify-between items-center mb-2">
                                     <span className="text-xs font-bold text-slate-600">Custo Total da Panela:</span>
                                     <span className="text-sm font-black text-red-500">R$ {Number(dados.custoTotal || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                     <span className="text-xs font-bold text-slate-600">Custo por {insumoGerado?.unit || 'Unid'}:</span>
                                     <span className="text-sm font-black text-emerald-600">R$ {Number(dados.custoPorUnidade || 0).toFixed(2)}</span>
                                  </div>
                               </div>
                            </div>

                            {isActive && (
                               <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                     <span className="text-[10px] font-black uppercase text-slate-500 px-3 bg-white border-r border-slate-200 py-3">Produzir</span>
                                     <input type="number" min="1" step="0.5" value={multiplicadores[receita.id] || 1} onChange={(e) => setMultiplicadores({...multiplicadores, [receita.id]: e.target.value})} className="w-16 bg-transparent text-center text-sm font-black text-slate-800 focus:outline-none py-2" title="Multiplicador (Quantas vezes fez a receita?)" />
                                     <span className="text-[10px] font-black uppercase text-slate-500 px-3 bg-white border-l border-slate-200 py-3">Vezes</span>
                                  </div>
                                  <button onClick={() => handleProduzirReceita(receita.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl shadow-md transition-colors text-sm uppercase tracking-widest">
                                     👨‍🍳 Confirmar Produção
                                  </button>
                               </div>
                            )}

                         </div>
                      );
                   })}
                </div>
             </div>
          </div>

        </section>
      )}

      {/* ============================================================== */}
      {/* ABA: CHEF IA (CORRIGIDA E BLINDADA) */}
      {/* ============================================================== */}
      {estoqueSubTab === 'chef-ia' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 text-6xl opacity-10">✨</div>
             <h2 className="text-2xl font-black text-amber-500 mb-2 relative z-10">Criador de Receitas com IA</h2>
             <p className="text-slate-300 text-sm mb-6 relative z-10">Peça qualquer ideia de lanche. A IA cria a receita e, se você aprovar, os ingredientes são cadastrados sozinhos no seu estoque!</p>
             
             <form onSubmit={handleGenerateRecipe} className="relative z-10 space-y-4">
               <div>
                 <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Sua Ideia ou Desejo</label>
                 <textarea 
                   value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} 
                   placeholder="Ex: Crie um hambúrguer apimentado com nachos e molho de queijo..." 
                   rows="4" className="w-full bg-black/50 border border-slate-600 rounded-xl p-4 text-white focus:outline-none focus:border-amber-500 resize-none text-sm placeholder:text-slate-600" 
                 />
               </div>
               <button 
                  type="submit" disabled={aiGenerating || !aiPrompt}
                  className={`w-full font-black text-md py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] ${aiGenerating ? 'bg-amber-500/50 text-black/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}
               >
                  {aiGenerating ? 'Chef IA Pensando... 🍳' : '🪄 Gerar Receita Mágica'}
               </button>
             </form>
          </div>

          <div className="space-y-6">
            {aiResult && (
              <div className="bg-amber-50 p-6 md:p-8 rounded-3xl border border-amber-200 shadow-xl animate-fade-in-up">
                 <div className="bg-amber-500 text-black text-xs font-black inline-block px-3 py-1 rounded-full uppercase tracking-widest mb-4">Sugestão do Chef</div>
                 <h3 className="text-2xl font-black text-amber-900 mb-4">{aiResult.nome}</h3>
                 <div className="mb-6"><h4 className="font-bold text-amber-700 mb-2 border-b border-amber-200 pb-1">🛒 Ingredientes:</h4><ul className="grid grid-cols-2 gap-2">{aiResult.ingredientes?.map((ing, idx) => (<li key={idx} className="text-sm text-amber-900 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 block"></span> {ing}</li>))}</ul></div>
                 <div className="mb-6"><h4 className="font-bold text-amber-700 mb-2 border-b border-amber-200 pb-1">👨‍🍳 Preparo:</h4><p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{aiResult.preparo}</p></div>
                 <button onClick={handleApproveRecipe} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2">✅ Aprovar & Cadastrar Insumos</button>
              </div>
            )}
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2"><span>📖</span> Livro de Receitas da IA</h3>
               
               {loadingAiRecipes ? (
                 <p className="text-slate-500 text-sm animate-pulse flex justify-center py-6">Consultando livros...</p>
               ) : savedAiRecipes.length === 0 ? (
                 <p className="text-slate-500 text-sm italic text-center py-6">Nenhuma receita gerada ainda.</p>
               ) : (
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                   {savedAiRecipes.map(receita => {
                      
                      // 🔥 BLINDAGEM APLICADA AQUI (Impede o "r.join is not a function")
                      let listaFormatada = [];
                      try {
                         const dadosCnus = JSON.parse(receita.ingredientes || '[]');
                         if (Array.isArray(dadosCnus)) {
                             listaFormatada = dadosCnus;
                         } else if (dadosCnus.itens) {
                             listaFormatada = dadosCnus.itens.map(it => {
                                 const ins = insumos.find(x => x.id === it.insumoId);
                                 return ins ? `${it.quantity}x ${ins.name}` : 'Ingrediente';
                             });
                         }
                      } catch (e) {
                         listaFormatada = ["Erro ao carregar"];
                      }

                      return (
                       <div key={receita.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:border-amber-200 transition-colors shadow-sm">
                          <h4 className="font-black text-amber-800 mb-1">{receita.nome}</h4>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Criada em: {new Date(receita.criadoEm).toLocaleDateString('pt-BR')}</p>
                          
                          <div className="bg-white p-3 rounded-xl border border-slate-100 mb-3">
                            <p className="text-xs font-black text-slate-700 mb-1">🛒 Ingredientes:</p>
                            <p className="text-xs text-slate-500">{Array.isArray(listaFormatada) ? listaFormatada.join(', ') : 'Formato Indisponível'}</p>
                          </div>
                          
                          <div className="bg-white p-3 rounded-xl border border-slate-100">
                            <p className="text-xs font-black text-slate-700 mb-1">👨‍🍳 Preparo:</p>
                            <p className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed">{receita.preparo}</p>
                          </div>
                       </div>
                      )
                   })}
                 </div>
               )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* ABA: MOVIMENTAÇÕES (ENTRADAS E SAÍDAS) */}
      {/* ============================================================== */}
      {estoqueSubTab === 'movimentacoes' && (() => {
        const notasImportadas = Object.values(
          movimentacoes.filter(m => m.xmlRef).reduce((acc, mov) => {
            if (!acc[mov.xmlRef]) {
               acc[mov.xmlRef] = { chave: mov.xmlRef, data: mov.createdAt, qtdItens: 0 };
            }
            acc[mov.xmlRef].qtdItens += 1;
            return acc;
          }, {})
        ).sort((a, b) => new Date(b.data) - new Date(a.data));

        return (
          <section className="space-y-6 animate-fade-in-up">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-4">Ajuste Manual</h2>
                <form onSubmit={handleMovimentacaoManual} className="space-y-4">
                  <div><label className="text-xs text-slate-500 block mb-1">Insumo</label><select required value={novaMovimentacao.insumoId} onChange={(e) => setNovaMovimentacao({...novaMovimentacao, insumoId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"><option value="">Selecione...</option>{insumos.map(i => <option key={i.id} value={i.id}>{i.name} (Atual: {Number(i.stock).toFixed(2)})</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500 block mb-1">Tipo</label><select required value={novaMovimentacao.type} onChange={(e) => setNovaMovimentacao({...novaMovimentacao, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-amber-500"><option value="IN">Entrada (+)</option><option value="OUT">Saída (-)</option></select></div>
                    <div><label className="text-xs text-slate-500 block mb-1">Quantidade</label><input type="number" step="0.001" required value={novaMovimentacao.quantity} onChange={(e) => setNovaMovimentacao({...novaMovimentacao, quantity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                  </div>
                  <div><label className="text-xs text-slate-500 block mb-1">Motivo / Justificativa</label><input type="text" required value={novaMovimentacao.reason} onChange={(e) => setNovaMovimentacao({...novaMovimentacao, reason: e.target.value})} placeholder="Ex: Quebra, Vencimento..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" /></div>
                  <button type="submit" className="w-full bg-slate-800 hover:bg-black text-white font-black py-3 rounded-xl transition-all shadow-md">Registrar Movimentação</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-3xl border border-blue-200 shadow-sm overflow-hidden flex flex-col">
                 <div className="p-6 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
                    <div>
                       <h2 className="text-lg font-black text-blue-900">🧾 Notas Fiscais Importadas</h2>
                       <p className="text-xs text-slate-500 mt-1">Histórico de NFe (XML) que já deram entrada no estoque.</p>
                    </div>
                 </div>
                 <div className="overflow-x-auto flex-1">
                   <table className="w-full text-left text-sm text-slate-700">
                     <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr><th className="px-6 py-4">Data de Entrada</th><th className="px-6 py-4">Chave da NFe</th><th className="px-6 py-4 text-center">Itens Processados</th><th className="px-6 py-4 text-right">Status</th></tr>
                     </thead>
                     <tbody>
                        {notasImportadas.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-slate-400">Nenhuma NFe importada ainda.</td></tr>}
                        {notasImportadas.map(nota => (
                          <tr key={nota.chave} className="border-b border-slate-100 hover:bg-blue-50/20">
                            <td className="px-6 py-4 font-bold text-slate-700">{new Date(nota.data).toLocaleString('pt-BR')}</td>
                            <td className="px-6 py-4">
                               <span className="font-mono text-[10px] sm:text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 block break-all w-max max-w-[200px] sm:max-w-full">{nota.chave}</span>
                            </td>
                            <td className="px-6 py-4 text-center font-black text-slate-800">{nota.qtdItens}</td>
                            <td className="px-6 py-4 text-right"><span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest">OK</span></td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
              </div>

            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-6">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h2 className="text-lg font-black text-slate-900">Extrato Detalhado de Movimentações (Item a Item)</h2></div>
               <div className="overflow-x-auto max-h-[60vh]">
                 <table className="w-full text-left text-sm text-slate-700">
                   <thead className="bg-slate-50 text-xs text-slate-500 uppercase sticky top-0 shadow-sm"><tr><th className="px-6 py-4">Data/Hora</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Insumo</th><th className="px-6 py-4 text-right">Qtd</th><th className="px-6 py-4">Motivo</th></tr></thead>
                   <tbody>
                     {movimentacoes.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-400">Nenhuma movimentação.</td></tr>}
                     {movimentacoes.map(mov => (
                       <tr key={mov.id} className="border-b border-slate-100 hover:bg-slate-50">
                         <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{new Date(mov.createdAt).toLocaleString('pt-BR')}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${mov.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{mov.type === 'IN' ? 'ENTRADA' : 'SAÍDA'}</span></td>
                         <td className="px-6 py-4 font-bold text-slate-900">{mov.insumo?.name}</td>
                         <td className={`px-6 py-4 text-right font-black ${mov.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>{mov.type === 'IN' ? '+' : '-'}{Number(mov.quantity).toFixed(3)} {mov.insumo?.unit}</td>
                         <td className="px-6 py-4 text-xs text-slate-600">{mov.reason}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </section>
        );
      })()}

      {/* MODAL DE EDIÇÃO DE INSUMO (CRU) */}
      {editingInsumo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-black text-amber-600 mb-4">Editar Insumo</h3>
            <form onSubmit={handleEditInsumoSubmit} className="space-y-4">
              <div><label className="text-xs text-slate-500 block mb-1">Nome do Insumo</label><input type="text" required value={editingInsumo.name} onChange={(e) => setEditingInsumo({...editingInsumo, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-slate-500 block mb-1">Unidade</label><select value={editingInsumo.unit} onChange={(e) => setEditingInsumo({...editingInsumo, unit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"><option value="UN">Unidade (UN)</option><option value="KG">Quilo (KG)</option><option value="L">Litro (L)</option></select></div>
                <div><label className="text-xs text-slate-500 block mb-1">Custo Base (R$)</label><input type="number" step="0.01" required value={editingInsumo.cost} onChange={(e) => setEditingInsumo({...editingInsumo, cost: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" /></div>
              </div>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => setEditingInsumo(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl">Cancelar</button><button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl shadow-md">Salvar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTAÇÃO DE XML */}
      {showXmlModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 bg-blue-50 rounded-t-3xl flex justify-between items-center"><h3 className="text-xl font-black text-blue-900">Mapeamento de XML</h3><button onClick={() => setShowXmlModal(false)} className="text-blue-900 font-bold">✕</button></div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-4 bg-slate-100 p-3 rounded-xl border border-slate-200 text-sm text-slate-600 font-mono break-all"><span className="font-bold text-slate-900 block mb-1">Chave NFe:</span> {xmlPreviewData.chaveNfe}</div>
                <div className="space-y-3">
                  {xmlPreviewData.items.map(item => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-blue-300 transition-colors">
                      <div className="md:col-span-6"><p className="font-bold text-slate-900 text-sm">{item.name}</p><p className="text-xs text-slate-500 mt-1">XML: <span className="font-bold text-blue-600">{item.quantity} {item.unit}</span> | Custo Unid: <span className="font-bold text-emerald-600">R$ {item.unitCost.toFixed(2)}</span></p></div>
                      <div className="md:col-span-6">
                        <select value={xmlMappings[item.id]?.action === 'LINK' ? xmlMappings[item.id].mappedInsumoId : xmlMappings[item.id]?.action} onChange={(e) => updateMapping(item.id, e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500">
                          <option value="IGNORE">❌ Ignorar este item</option><option value="NEW">✨ Criar NOVO insumo</option>
                          <optgroup label="Vincular a Insumo Existente:">{insumos.map(i => <option key={i.id} value={i.id}>🔗 Somar ao: {i.name}</option>)}</optgroup>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
                <button onClick={() => setShowXmlModal(false)} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar Importação</button>
                <button onClick={handleConfirmXmlImport} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-xl shadow-md transition-all">Confirmar & Atualizar Estoque</button>
              </div>
           </div>
        </div>
      )}

    </main>
  );
}