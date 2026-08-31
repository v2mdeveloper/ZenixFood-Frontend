'use client';

export default function CategoriesTab({
  menu,
  newCategoryName,
  setNewCategoryName,
  newCategoryIsDrink,        // <-- Novo Estado
  setNewCategoryIsDrink,     // <-- Novo Estado
  handleAddCategory,
  moveCategory,
  moveProduct,
  setEditingCategory,
  handleDeleteCategory
}) {
  return (
    <main className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up">
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-black text-slate-900 mb-4 uppercase tracking-wider text-sm">Criar Categoria</h2>
          <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
            <input 
              type="text" 
              required 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              placeholder="Ex: Bebidas..." 
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" 
            />
            
            {/* 🚨 NOVA CAIXA DE SELEÇÃO: VAI PARA O BAR? 🚨 */}
            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <input 
                type="checkbox" 
                checked={newCategoryIsDrink || false} 
                onChange={(e) => setNewCategoryIsDrink && setNewCategoryIsDrink(e.target.checked)} 
                className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
              />
              <div className="flex flex-col">
                 <span className="text-xs font-black text-slate-800">🍹 Categoria de Bebidas</span>
                 <span className="text-[10px] text-slate-500 leading-tight mt-0.5">Enviar itens desta categoria para o KDS do Bar.</span>
              </div>
            </label>

            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl transition-all shadow-sm cursor-pointer mt-2">
              Criar Categoria
            </button>
          </form>
        </div>
      </div>
      
      <div className="md:col-span-2 space-y-6">
        {menu.map((category, index) => (
          <div key={category.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all hover:border-amber-400">
            
            {/* CABEÇALHO DA CATEGORIA */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveCategory(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-amber-500 disabled:opacity-20 transition-colors cursor-pointer p-1">▲</button>
                  <button onClick={() => moveCategory(index, 'down')} disabled={index === menu.length - 1} className="text-slate-400 hover:text-amber-500 disabled:opacity-20 transition-colors cursor-pointer p-1">▼</button>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                     <h3 className="text-xl font-black text-amber-600 uppercase">{category.name}</h3>
                     {/* 🚨 MOSTRADOR VISUAL DO KDS 🚨 */}
                     {category.isDrink ? (
                        <span className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm"><span>🍹</span> KDS Bar</span>
                     ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm"><span>👨‍🍳</span> KDS Cozinha</span>
                     )}
                  </div>
                  <p className="text-slate-500 text-xs font-bold">{category.products.length} produto(s) vinculado(s)</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEditingCategory(category)} className="text-slate-600 hover:text-slate-900 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">Editar</button>
                <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">Excluir</button>
              </div>
            </div>

            {/* LISTA E ORDENAÇÃO DE PRODUTOS */}
            <div className="mt-4 pt-4 border-t border-slate-100 pl-10">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ordem dos Produtos Exibidos</h4>
               <div className="flex flex-col gap-2">
                 {category.products.map((product, pIndex) => (
                    <div key={product.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl hover:border-blue-300 transition-colors">
                       <span className="text-xs font-bold text-slate-700">{product.name}</span>
                       <div className="flex gap-1">
                          <button onClick={() => moveProduct && moveProduct(category.id, pIndex, 'up')} disabled={pIndex === 0} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-300 disabled:opacity-30 transition-colors cursor-pointer shadow-sm">▲</button>
                          <button onClick={() => moveProduct && moveProduct(category.id, pIndex, 'down')} disabled={pIndex === category.products.length - 1} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-300 disabled:opacity-30 transition-colors cursor-pointer shadow-sm">▼</button>
                       </div>
                    </div>
                 ))}
                 {(!category.products || category.products.length === 0) && <p className="text-xs text-slate-400 italic">Nenhum produto cadastrado nesta categoria.</p>}
               </div>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}