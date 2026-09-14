import { useState } from 'react';

export default function ProductsTab({
  allProducts, searchProduct, setSearchProduct, filteredProducts,
  setIsCreatingProduct, isCreatingProduct, newProduct, setNewProduct, handleAddProduct,
  menu, fiscalData, editingProduct, setEditingProduct, handleEditProduct,
  toggleProductStatus, toggleFeatureProduct, calculateCmv, getCmvColor, productGroups
}) {
  
  //ESTADOS PARA IMPORTAÇÃO DE PLANILHA
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ total: 0, current: 0, errors: [], statusText: '' });

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  // Função para baixar o Modelo de Planilha com Pizzas e Combos
  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Categoria,Produto,Descricao,Preco,E_Pizza(S/N),Max_Sabores,Mult_Tamanho,E_Combo(S/N)\n"
      + "PIZZAS GRANDES,Pizza Grande 3 Sabores,Ate 3 sabores a sua escolha.,65.00,S,3,1.0,N\n"
      + "PIZZAS GRANDES,Pizza de Calabresa,Mussarela e Calabresa,50.00,S,1,1.0,N\n"
      + "COMBOS,Combo Família,2 Pizzas + 1 Refri 2L,90.00,N,1,1.0,S\n"
      + "BEBIDAS,Coca-Cola 2L,Refrigerante 2 Litros,15.00,N,1,1.0,N";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_produtos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🚀 Função que processa a Planilha, CRIA CATEGORIAS e envia para o Banco
  const handleProcessImport = async () => {
    if (!importFile) return alert("Selecione um arquivo CSV primeiro!");
    setIsImporting(true);
    setImportProgress({ total: 0, current: 0, errors: [], statusText: 'Lendo arquivo...' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      if (rows.length < 2) {
        setIsImporting(false);
        return alert("O arquivo parece estar vazio ou sem produtos.");
      }

      const splitRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
      const headers = rows[0].split(splitRegex).map(h => h.trim().toLowerCase());
      
      const catIdx = headers.findIndex(h => h.includes('categoria'));
      const nameIdx = headers.findIndex(h => h.includes('produto'));
      const descIdx = headers.findIndex(h => h.includes('descri'));
      const priceIdx = headers.findIndex(h => h.includes('preco') || h.includes('preço'));
      const pizzaIdx = headers.findIndex(h => h.includes('pizza'));
      const saboresIdx = headers.findIndex(h => h.includes('sabores'));
      const multIdx = headers.findIndex(h => h.includes('mult'));
      const comboIdx = headers.findIndex(h => h.includes('combo'));

      const cleanText = (str) => str ? str.replace(/^"|"$/g, '').trim() : '';

      const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken');
      const storeId = window.location.pathname.split('/')[1];

      // ==============================================================
      // 1️⃣ ETAPA DE INTELIGÊNCIA: VERIFICAR E CRIAR CATEGORIAS FALTANTES
      // ==============================================================
      setImportProgress(prev => ({ ...prev, statusText: 'Verificando categorias...' }));
      
      const uniqueCatNames = [...new Set(rows.slice(1).map(row => {
          const cols = row.split(splitRegex);
          return cols[catIdx] ? cleanText(cols[catIdx]) : '';
      }).filter(Boolean))];

      let updatedMenu = [...menu];
      let createdAnyCat = false;

      for (const catName of uniqueCatNames) {
          const exists = updatedMenu.find(c => c.name.toLowerCase() === catName.toLowerCase());
          if (!exists) {
              try {
                  await fetch(`${API_URL}/api/categories`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'x-loja-slug': storeId },
                      body: JSON.stringify({ name: catName, isDrink: false })
                  });
                  createdAnyCat = true;
              } catch (err) { console.error("Erro ao criar categoria automática:", err); }
          }
      }

      // Se o robô criou categorias novas, buscamos o menu atualizado
      if (createdAnyCat) {
          try {
              const menuRes = await fetch(`${API_URL}/api/menu?_=${Date.now()}`, {
                  headers: { 'Authorization': `Bearer ${token}`, 'x-loja-slug': storeId }
              });
              if (menuRes.ok) updatedMenu = await menuRes.json();
          } catch(err) { console.error("Erro ao recarregar menu"); }
      }

      // ==============================================================
      // 2️⃣ ETAPA: PREPARAR OS PRODUTOS VINCULANDO AOS IDs CORRETOS
      // ==============================================================
      setImportProgress(prev => ({ ...prev, statusText: 'Preparando produtos...' }));
      const productsToImport = [];

      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(splitRegex);
        if (!columns[nameIdx]) continue;

        const rowCat = cleanText(columns[catIdx]);
        const matchedCat = updatedMenu.find(c => c.name.toLowerCase() === rowCat.toLowerCase());
        const categoryId = matchedCat ? matchedCat.id : (updatedMenu[0]?.id || '');

        const isPizzaVal = cleanText(columns[pizzaIdx]).toUpperCase();
        const isComboVal = comboIdx >= 0 ? cleanText(columns[comboIdx]).toUpperCase() : 'N';
        
        const isPizza = isPizzaVal === 'S' || isPizzaVal === 'SIM';
        const isCombo = isComboVal === 'S' || isComboVal === 'SIM';

        productsToImport.push({
          name: cleanText(columns[nameIdx]),
          description: cleanText(columns[descIdx]),
          price: Number(cleanText(columns[priceIdx]).replace(',', '.') || 0),
          categoryId: categoryId,
          isPizza: isPizza && !isCombo,
          maxFlavors: isPizza ? Number(cleanText(columns[saboresIdx]) || 1) : 1,
          sizeMultiplier: isPizza ? Number(cleanText(columns[multIdx]).replace(',', '.') || 1.0) : 1.0,
          isCombo: isCombo && !isPizza,
          comboItems: [], 
          isActive: true,
          pricingStrategy: 'HIGHEST'
        });
      }

      // ==============================================================
      // 3️⃣ ETAPA: SALVAR NO BANCO DE DADOS
      // ==============================================================
      setImportProgress({ total: productsToImport.length, current: 0, errors: [], statusText: 'Salvando no banco de dados...' });
      
      let currentCount = 0;
      let errorList = [];

      for (const prod of productsToImport) {
        try {
          const res = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-loja-slug': storeId
            },
            body: JSON.stringify(prod)
          });
          if (!res.ok) throw new Error("Erro no servidor");
        } catch(err) {
          errorList.push(prod.name);
        }
        currentCount++;
        setImportProgress(prev => ({ ...prev, current: currentCount, errors: errorList }));
      }

      setIsImporting(false);
      alert(`✅ Importação Concluída!\n\n${currentCount - errorList.length} Produtos salvos com sucesso.\nCategorias ajustadas automaticamente.\n${errorList.length} Erros.`);
      setShowImportModal(false);
      setImportFile(null);
      
      window.location.reload();
    };

    reader.readAsText(importFile);
  };


  return (
    <>
      <main>
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Gestão de Produtos Finais ({allProducts.length})</h2>
            <p className="text-slate-500 text-sm mt-1">Gerencie preços, CMV e cadastre produtos em massa via planilha.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input type="text" placeholder="Buscar produto..." value={searchProduct} onChange={(e) => setSearchProduct(e.target.value)} className="w-full md:w-56 bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
            
            <button onClick={() => setShowImportModal(true)} className="bg-slate-800 hover:bg-slate-900 text-white font-black px-5 py-3 rounded-xl whitespace-nowrap transition-all shadow-sm flex items-center gap-2">
              <span>📥</span> Planilha
            </button>
            
            <button onClick={() => setIsCreatingProduct(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-black px-5 py-3 rounded-xl whitespace-nowrap transition-all shadow-sm">+ Novo</button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Foto</th>
                {/* 🎯 NOVA COLUNA CÓDIGO */}
                <th className="px-6 py-4 font-bold">Código</th>
                <th className="px-6 py-4 font-bold">Produto</th>
                <th className="px-6 py-4 font-bold">Preço Base</th>
                <th className="px-6 py-4 font-bold">Custo Un.</th>
                <th className="px-6 py-4 font-bold">CMV %</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const cmv = calculateCmv(product.costPrice, product.price);
                const cmvColor = getCmvColor(cmv);
                // Gera o código amigável cortando os últimos 6 caracteres do ID
                const friendlyCode = product.id ? product.id.slice(-6).toUpperCase() : '000000';
                
                return (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" /> : <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-center text-slate-500">SEM FOTO</div>}</td>
                  
                  {/* 🎯 EXIBIÇÃO DO CÓDIGO AMIGÁVEL */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      #{friendlyCode}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 flex items-center flex-wrap gap-2">
                        {product.name}
                        {product.isPizza && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-amber-200">🍕 Pizza ({product.maxFlavors} Sabores)</span>}
                        {product.isCombo && <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-blue-200">🍔 Combo</span>}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{product.category?.name || 'Sem Categoria'}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-600 text-base">R$ {Number(product.price).toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-amber-600">R$ {Number(product.costPrice || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 font-black"><span className={`px-2.5 py-1 rounded-lg ${cmvColor}`}>{cmv}%</span></td>
                  <td className="px-6 py-4"><button onClick={() => toggleProductStatus(product)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{product.isActive ? '🟢 ATIVO' : '🔴 INATIVO'}</button></td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingProduct({
                        ...product,
                        isPizza: Boolean(product.isPizza),
                        maxFlavors: product.maxFlavors || 1,
                        pricingStrategy: product.pricingStrategy || 'HIGHEST',
                        sizeMultiplier: product.sizeMultiplier !== undefined ? product.sizeMultiplier : 1.0,
                        isCombo: Boolean(product.isCombo),
                        comboItems: product.comboItems || product.comboItemsAsParent || []
                      })} 
                      className="text-amber-600 hover:text-amber-700 font-bold bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors text-xs cursor-pointer"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🚀 MODAL DE IMPORTAÇÃO DE PLANILHA */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-xl shadow-2xl animate-fade-in-up text-center">
            <h3 className="text-2xl font-black text-slate-900 mb-2">📥 Importação em Massa</h3>
            <p className="text-sm text-slate-500 mb-6">Cadastre dezenas de Pizzas e Combos de uma só vez usando o Excel.</p>
            
            {!isImporting ? (
              <>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mb-6 text-left">
                  <h4 className="font-bold text-blue-800 text-sm mb-2">1º Passo: Baixe o Modelo Padrão</h4>
                  <p className="text-xs text-blue-600 mb-3">Preencha a planilha no Excel respeitando as colunas. Salve o arquivo no formato <strong>CSV (UTF-8)</strong>.</p>
                  <button onClick={downloadCsvTemplate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm w-full cursor-pointer">
                    ⬇️ Baixar Planilha Modelo (CSV)
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-left">
                  <h4 className="font-bold text-amber-800 text-sm mb-2">2º Passo: Enviar Planilha Preenchida</h4>
                  <p className="text-[10px] text-amber-700 mb-3">Dica: Os sub-itens dos combos devem ser incluídos pelo botão "Editar" após a importação para garantir a baixa de estoque correta.</p>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-200 file:text-amber-800 hover:file:bg-amber-300 cursor-pointer"
                  />
                </div>

                <div className="flex gap-4 pt-8">
                  <button onClick={() => setShowImportModal(false)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 rounded-xl font-bold transition-all cursor-pointer">Cancelar</button>
                  <button onClick={handleProcessImport} disabled={!importFile} className="flex-1 bg-emerald-500 text-white disabled:bg-slate-300 hover:bg-emerald-600 font-black py-3 rounded-xl shadow-md transition-all cursor-pointer">
                    🚀 Iniciar Importação
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8">
                <span className="text-6xl animate-bounce block mb-4">🚀</span>
                <h4 className="text-lg font-black text-slate-800 mb-1">{importProgress.statusText}</h4>
                <p className="text-xs text-slate-500 font-bold mb-3">Por favor, não feche esta janela.</p>
                <div className="w-full bg-slate-200 rounded-full h-4 mb-2 overflow-hidden">
                  <div className="bg-emerald-500 h-4 transition-all duration-300" style={{ width: `${(importProgress.current / (importProgress.total || 1)) * 100}%` }}></div>
                </div>
                {importProgress.total > 0 && <p className="text-sm font-bold text-slate-600">{importProgress.current} de {importProgress.total} processados</p>}
                {importProgress.errors.length > 0 && <p className="text-xs text-red-500 font-bold mt-2">{importProgress.errors.length} erro(s) encontrado(s)</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CRIAR PRODUTO MANUAL */}
      {isCreatingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-2xl shadow-2xl my-8">
            <h3 className="text-xl font-black text-slate-900 mb-4">Adicionar Novo Produto</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="Nome do Produto Final" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              <textarea required value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} placeholder="Descrição do Cardápio" rows="2" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 resize-none"></textarea>
              <input type="url" value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="Link Foto (URL)" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              
              {/* 🍕 CONFIGURAÇÃO DE PIZZARIA */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2 cursor-pointer">
                    <input type="checkbox" checked={newProduct.isPizza || false} onChange={(e) => setNewProduct({...newProduct, isPizza: e.target.checked, isCombo: false})} className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer" />
                    🍕 Este produto é uma Pizza (Múltiplos Sabores)?
                </label>
                
                {newProduct.isPizza && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50 p-4 rounded-xl border border-amber-200 animate-fade-in-up">
                        <div>
                            <label className="text-[10px] text-amber-800 uppercase font-bold block mb-1">Máx. de Sabores</label>
                            <select value={newProduct.maxFlavors || 1} onChange={(e) => setNewProduct({...newProduct, maxFlavors: parseInt(e.target.value)})} className="w-full bg-white border border-amber-300 rounded-lg p-2 text-sm font-bold text-slate-800 outline-none">
                                <option value={1}>1 Sabor</option>
                                <option value={2}>Até 2 Sabores</option>
                                <option value={3}>Até 3 Sabores</option>
                                <option value={4}>Até 4 Sabores</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-amber-800 uppercase font-bold block mb-1">Regra de Preço</label>
                            <select value={newProduct.pricingStrategy || 'HIGHEST'} onChange={(e) => setNewProduct({...newProduct, pricingStrategy: e.target.value})} className="w-full bg-white border border-amber-300 rounded-lg p-2 text-sm font-bold text-slate-800 outline-none">
                                <option value="HIGHEST">Pelo Maior Valor</option>
                                <option value="AVERAGE">Pela Média (Soma/Qtd)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-amber-800 uppercase font-bold block mb-1">Mult. de Tamanho da Ficha</label>
                            <input type="number" step="0.1" value={newProduct.sizeMultiplier !== undefined ? newProduct.sizeMultiplier : 1.0} onChange={(e) => setNewProduct({...newProduct, sizeMultiplier: parseFloat(e.target.value)})} placeholder="Ex: 1.0 ou 0.5" className="w-full bg-white border border-amber-300 rounded-lg p-2 text-sm font-bold text-slate-800 outline-none" />
                        </div>
                    </div>
                )}
              </div>

              {/* 🍔 CONFIGURAÇÃO DE COMBOS ANINHADOS */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2 cursor-pointer">
                    <input type="checkbox" checked={newProduct.isCombo || false} onChange={(e) => setNewProduct({...newProduct, isCombo: e.target.checked, isPizza: false})} className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                    🍔🍟🥤 Este produto é um Combo (Pacote de Produtos)?
                </label>
                
                {newProduct.isCombo && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-fade-in-up space-y-3">
                        <p className="text-[10px] text-blue-800 uppercase font-bold">Monte os itens do pacote (Sub-produtos que baixarão estoque):</p>
                        
                        <div className="space-y-2">
                            {(newProduct.comboItems || []).map((item, idx) => {
                                const pRef = allProducts.find(p => p.id === item.productId);
                                return (
                                    <div key={idx} className="flex justify-between items-center bg-white border border-blue-100 p-2 rounded-lg shadow-sm">
                                        <span className="text-sm font-bold text-slate-800">{pRef?.name || 'Produto Excluído'}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">Qtd: {item.quantity}</span>
                                            <button type="button" onClick={() => {
                                                const novosItems = [...(newProduct.comboItems || [])];
                                                novosItems.splice(idx, 1);
                                                setNewProduct({...newProduct, comboItems: novosItems});
                                            }} className="text-red-500 hover:text-red-700 font-bold px-1">✕</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-blue-300 shadow-inner">
                            <select id="new-combo-prod" className="flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none">
                                <option value="">Adicionar item ao combo...</option>
                                {/* 🎯 FILTRO CORRIGIDO: Agora permite adicionar Pizzas nos Combos (apenas remove outros combos) */}
                                {allProducts.filter(p => !p.isCombo).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <input type="number" id="new-combo-qty" defaultValue="1" min="1" className="w-16 bg-slate-50 border border-slate-200 rounded text-center text-sm font-bold outline-none p-1" />
                            <button type="button" onClick={() => {
                                const pId = document.getElementById('new-combo-prod').value;
                                const pQty = parseInt(document.getElementById('new-combo-qty').value);
                                if (pId && pQty > 0) {
                                    setNewProduct({...newProduct, comboItems: [...(newProduct.comboItems || []), { productId: pId, quantity: pQty }]});
                                    document.getElementById('new-combo-prod').value = "";
                                    document.getElementById('new-combo-qty').value = 1;
                                }
                            }} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-1.5 rounded-lg transition-colors cursor-pointer">+</button>
                        </div>
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço Base</label><input type="number" step="0.01" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="Ex: 35.00" className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-bold" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço 700g (Opci.)</label><input type="number" step="0.01" value={newProduct.price700g} onChange={(e) => setNewProduct({...newProduct, price700g: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 focus:outline-none focus:border-emerald-500 font-bold" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço 1kg (Opci.)</label><input type="number" step="0.01" value={newProduct.price1kg} onChange={(e) => setNewProduct({...newProduct, price1kg: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 focus:outline-none focus:border-emerald-500 font-bold" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Custo Manual</label><input type="number" step="0.01" value={newProduct.costPrice} onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" /></div>
              </div>
              
              <div className="pt-2">
                 <label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Categoria do Cardápio</label>
                 <select required value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500">
                   {menu.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                 </select>
              </div>

              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Praça/Grupo de Produção (Imprime Aonde?)</label>
                <select 
                  value={newProduct.groupId || ''} 
                  onChange={e => setNewProduct({...newProduct, groupId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Sem grupo (Imprime apenas no Caixa)</option>
                  {productGroups && productGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Destino: {g.printer?.name || 'Nenhum'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div><label className="text-[10px] text-slate-500 font-bold mb-1 block">Código NCM</label><input type="text" maxLength="8" value={newProduct.ncm} onChange={(e) => setNewProduct({...newProduct, ncm: e.target.value})} placeholder="Ex: 21069090" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-slate-500 font-bold mb-1 block">Código EAN</label><input type="text" maxLength="14" value={newProduct.ean} onChange={(e) => setNewProduct({...newProduct, ean: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-500" /></div>
              </div>
              
              <div className="pt-2">
                <label className="text-[10px] font-bold text-amber-600 mb-1 block">🧾 Regra Fiscal Associada</label>
                <select value={newProduct.regraFiscalId} onChange={(e) => setNewProduct({...newProduct, regraFiscalId: e.target.value})} className="w-full bg-amber-50 border border-amber-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500">
                  <option value="">-- Nenhuma Regra --</option>
                  {fiscalData?.regras?.map(r => <option key={r.id} value={r.id}>{r.id} - {r.descricao}</option>)}
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsCreatingProduct(false)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 rounded-xl font-bold transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-500 text-black hover:bg-amber-600 font-black py-3 rounded-xl shadow-md transition-all cursor-pointer">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PRODUTO */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-2xl shadow-2xl my-8">
            <h3 className="text-xl font-black text-slate-900 mb-4">Editar Produto</h3>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <input type="text" required value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              <textarea required value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} rows="2" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 resize-none"></textarea>
              <input type="url" value={editingProduct.imageUrl || ''} onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value})} placeholder="Link Foto (URL)" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2 cursor-pointer">
                    <input type="checkbox" checked={editingProduct.isPizza || false} onChange={(e) => setEditingProduct({...editingProduct, isPizza: e.target.checked, isCombo: false})} className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer" />
                    🍕 Este produto é uma Pizza (Múltiplos Sabores)?
                </label>
                
                {editingProduct.isPizza && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50 p-4 rounded-xl border border-amber-200 animate-fade-in-up">
                        <div>
                            <label className="text-[10px] text-amber-800 uppercase font-bold block mb-1">Máx. de Sabores</label>
                            <select value={editingProduct.maxFlavors || 1} onChange={(e) => setEditingProduct({...editingProduct, maxFlavors: parseInt(e.target.value)})} className="w-full bg-white border border-amber-300 rounded-lg p-2 text-sm font-bold text-slate-800 outline-none">
                                <option value={1}>1 Sabor</option>
                                <option value={2}>Até 2 Sabores</option>
                                <option value={3}>Até 3 Sabores</option>
                                <option value={4}>Até 4 Sabores</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-amber-800 uppercase font-bold block mb-1">Regra de Preço</label>
                            <select value={editingProduct.pricingStrategy || 'HIGHEST'} onChange={(e) => setEditingProduct({...editingProduct, pricingStrategy: e.target.value})} className="w-full bg-white border border-amber-300 rounded-lg p-2 text-sm font-bold text-slate-800 outline-none">
                                <option value="HIGHEST">Pelo Maior Valor</option>
                                <option value="AVERAGE">Pela Média (Soma/Qtd)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-amber-800 uppercase font-bold block mb-1">Mult. de Tamanho da Ficha</label>
                            <input type="number" step="0.1" value={editingProduct.sizeMultiplier !== undefined ? editingProduct.sizeMultiplier : 1.0} onChange={(e) => setEditingProduct({...editingProduct, sizeMultiplier: parseFloat(e.target.value)})} placeholder="Ex: 1.0 ou 0.5" className="w-full bg-white border border-amber-300 rounded-lg p-2 text-sm font-bold text-slate-800 outline-none" />
                        </div>
                    </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2 cursor-pointer">
                    <input type="checkbox" checked={editingProduct.isCombo || false} onChange={(e) => setEditingProduct({...editingProduct, isCombo: e.target.checked, isPizza: false})} className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                    🍔🍟🥤 Este produto é um Combo (Pacote de Produtos)?
                </label>
                
                {editingProduct.isCombo && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-fade-in-up space-y-3">
                        <p className="text-[10px] text-blue-800 uppercase font-bold">Monte os itens do pacote (Sub-produtos que baixarão estoque):</p>
                        <div className="space-y-2">
                            {(editingProduct.comboItems || editingProduct.comboItemsAsParent || []).map((item, idx) => {
                                const pRef = allProducts.find(p => p.id === item.productId);
                                return (
                                    <div key={idx} className="flex justify-between items-center bg-white border border-blue-100 p-2 rounded-lg shadow-sm">
                                        <span className="text-sm font-bold text-slate-800">{pRef?.name || item.product?.name || 'Produto Excluído'}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">Qtd: {item.quantity}</span>
                                            <button type="button" onClick={() => {
                                                const arrayBase = editingProduct.comboItems || editingProduct.comboItemsAsParent || [];
                                                const novosItems = [...arrayBase];
                                                novosItems.splice(idx, 1);
                                                setEditingProduct({...editingProduct, comboItems: novosItems, comboItemsAsParent: novosItems});
                                            }} className="text-red-500 hover:text-red-700 font-bold px-1">✕</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-blue-300 shadow-inner">
                            <select id="edit-combo-prod" className="flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none">
                                <option value="">Adicionar item ao combo...</option>
                                {/* 🎯 FILTRO CORRIGIDO: Agora permite adicionar Pizzas nos Combos (apenas remove outros combos e ele mesmo) */}
                                {allProducts.filter(p => !p.isCombo && p.id !== editingProduct.id).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <input type="number" id="edit-combo-qty" defaultValue="1" min="1" className="w-16 bg-slate-50 border border-slate-200 rounded text-center text-sm font-bold outline-none p-1" />
                            <button type="button" onClick={() => {
                                const pId = document.getElementById('edit-combo-prod').value;
                                const pQty = parseInt(document.getElementById('edit-combo-qty').value);
                                if (pId && pQty > 0) {
                                    const arrayAtual = editingProduct.comboItems || editingProduct.comboItemsAsParent || [];
                                    const novosItems = [...arrayAtual, { productId: pId, quantity: pQty }];
                                    setEditingProduct({...editingProduct, comboItems: novosItems, comboItemsAsParent: novosItems});
                                    document.getElementById('edit-combo-prod').value = "";
                                    document.getElementById('edit-combo-qty').value = 1;
                                }
                            }} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-1.5 rounded-lg transition-colors cursor-pointer">+</button>
                        </div>
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço Base</label><input type="number" step="0.01" required value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-sm text-emerald-600 font-bold focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço 700g (Opci.)</label><input type="number" step="0.01" value={editingProduct.price700g || ''} onChange={(e) => setEditingProduct({...editingProduct, price700g: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 font-bold focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço 1kg (Opci.)</label><input type="number" step="0.01" value={editingProduct.price1kg || ''} onChange={(e) => setEditingProduct({...editingProduct, price1kg: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 font-bold focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Custo Manual</label><input type="number" step="0.01" value={editingProduct.costPrice || 0} onChange={(e) => setEditingProduct({...editingProduct, costPrice: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-amber-600 font-bold focus:outline-none focus:border-amber-500" /></div>
              </div>
              
              <div className="pt-2">
                 <label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Categoria do Cardápio</label>
                 <select required value={editingProduct.categoryId} onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500">
                   {menu.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                 </select>
              </div>

              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Praça/Grupo de Produção (Imprime Aonde?)</label>
                <select 
                  value={editingProduct.groupId || ''} 
                  onChange={e => setEditingProduct({...editingProduct, groupId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Sem grupo (Imprime apenas no Caixa)</option>
                  {productGroups && productGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Destino: {g.printer?.name || 'Nenhum'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div><label className="text-[10px] text-slate-500 font-bold mb-1 block">Código NCM</label><input type="text" maxLength="8" value={editingProduct.ncm || ''} onChange={(e) => setEditingProduct({...editingProduct, ncm: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-slate-500 font-bold mb-1 block">Código de Barras EAN</label><input type="text" maxLength="14" value={editingProduct.ean || ''} onChange={(e) => setEditingProduct({...editingProduct, ean: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-500" /></div>
              </div>
              
              <div className="pt-2">
                <label className="text-[10px] font-bold text-amber-600 mb-1 block">🧾 Regra Fiscal Associada</label>
                <select value={editingProduct.regraFiscalId || ''} onChange={(e) => setEditingProduct({...editingProduct, regraFiscalId: e.target.value})} className="w-full bg-amber-50 border border-amber-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500">
                  <option value="">-- Nenhuma Regra --</option>
                  {fiscalData?.regras?.map(r => <option key={r.id} value={r.id}>{r.id} - {r.descricao}</option>)}
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 rounded-xl font-bold transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl shadow-md transition-all cursor-pointer">Atualizar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}