export default function ProductsTab({
  allProducts, searchProduct, setSearchProduct, filteredProducts,
  setIsCreatingProduct, isCreatingProduct, newProduct, setNewProduct, handleAddProduct,
  menu, fiscalData, editingProduct, setEditingProduct, handleEditProduct,
  toggleProductStatus, calculateCmv, getCmvColor, productGroups
}) {
  return (
    <>
      <main>
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Gestão de Produtos Finais ({allProducts.length})</h2>
            <p className="text-slate-500 text-sm mt-1">Gerencie os preços, custos e visualize a margem (CMV) em tempo real.</p>
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <input type="text" placeholder="Buscar produto..." value={searchProduct} onChange={(e) => setSearchProduct(e.target.value)} className="w-full md:w-64 bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
            <button onClick={() => setIsCreatingProduct(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-black px-6 py-3 rounded-xl whitespace-nowrap transition-all shadow-sm">+ Novo Produto</button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Foto</th>
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
                
                return (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" /> : <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-center text-slate-500">SEM FOTO</div>}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{product.category?.name || 'Sem Categoria'}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-600 text-base">R$ {Number(product.price).toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-amber-600">R$ {Number(product.costPrice || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 font-black"><span className={`px-2.5 py-1 rounded-lg ${cmvColor}`}>{cmv}%</span></td>
                  <td className="px-6 py-4"><button onClick={() => toggleProductStatus(product)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{product.isActive ? '🟢 ATIVO' : '🔴 INATIVO'}</button></td>
                  <td className="px-6 py-4 text-right"><button onClick={() => setEditingProduct(product)} className="text-amber-600 hover:text-amber-700 font-bold bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors text-xs">Editar</button></td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL: CRIAR PRODUTO */}
      {isCreatingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-2xl shadow-2xl my-8">
            <h3 className="text-xl font-black text-slate-900 mb-4">Adicionar Novo Produto</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="Nome do Produto Final" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              <textarea required value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} placeholder="Descrição do Cardápio" rows="2" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 resize-none"></textarea>
              <input type="url" value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="Link Foto (URL)" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço Base/500g</label><input type="number" step="0.01" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="Ex: 35.00" className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-bold" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço 700g</label><input type="number" step="0.01" value={newProduct.price700g} onChange={(e) => setNewProduct({...newProduct, price700g: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 focus:outline-none focus:border-emerald-500 font-bold" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço 1kg</label><input type="number" step="0.01" value={newProduct.price1kg} onChange={(e) => setNewProduct({...newProduct, price1kg: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 focus:outline-none focus:border-emerald-500 font-bold" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Custo Manual</label><input type="number" step="0.01" value={newProduct.costPrice} onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" /></div>
              </div>
              
              <div className="pt-2">
                 <label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Categoria do Cardápio</label>
                 <select required value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500">
                   {menu.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                 </select>
              </div>

              {/* CAIXA DE GRUPO/PRAÇA DE PRODUÇÃO (CRIAR) */}
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
                <p className="text-[10px] text-slate-500 mt-1 ml-1">Ao selecionar um grupo com Regra Fiscal vinculada, ela será puxada automaticamente.</p>
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
                <button type="button" onClick={() => setIsCreatingProduct(false)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 rounded-xl font-bold transition-all">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-500 text-black hover:bg-amber-600 font-black py-3 rounded-xl shadow-md transition-all">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PRODUTO */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-2xl shadow-2xl my-8">
            <h3 className="text-xl font-black text-slate-900 mb-4">Editar Produto</h3>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <input type="text" required value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              <textarea required value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} rows="2" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 resize-none"></textarea>
              <input type="url" value={editingProduct.imageUrl || ''} onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço Base/500g</label><input type="number" step="0.01" required value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-sm text-emerald-600 font-bold focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço 700g</label><input type="number" step="0.01" value={editingProduct.price700g || ''} onChange={(e) => setEditingProduct({...editingProduct, price700g: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 font-bold focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Preço 1kg</label><input type="number" step="0.01" value={editingProduct.price1kg || ''} onChange={(e) => setEditingProduct({...editingProduct, price1kg: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-emerald-600 font-bold focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Custo Manual</label><input type="number" step="0.01" value={editingProduct.costPrice || 0} onChange={(e) => setEditingProduct({...editingProduct, costPrice: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-amber-600 font-bold focus:outline-none focus:border-amber-500" /></div>
              </div>
              
              <div className="pt-2">
                 <label className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1 block">Categoria do Cardápio</label>
                 <select required value={editingProduct.categoryId} onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500">
                   {menu.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                 </select>
              </div>

              {/* CAIXA DE GRUPO/PRAÇA DE PRODUÇÃO (EDITAR) */}
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
                <p className="text-[10px] text-slate-500 mt-1 ml-1">Ao selecionar um grupo com Regra Fiscal vinculada, ela será puxada automaticamente.</p>
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
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 rounded-xl font-bold transition-all">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl shadow-md transition-all">Atualizar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}