import { useEffect, useState } from 'react';

export default function AdminHeader({ isAutoPrintEnabled, toggleAutoPrintState, handleAdminLogout, activeTab, setActiveTab }) {
  const [storeId, setStoreId] = useState('');

  useEffect(() => {
    const currentStore = localStorage.getItem('zenix_store_id') || '';
    setStoreId(currentStore);
  }, []);

  const tabs = [
    { id: 'kanban', label: '📋 Pedidos Ativos' },
    { id: 'expedicao', label: '🛵 Expedição & Rotas' },
    { id: 'historico', label: '🗃️ Histórico' }, 
    { id: 'analytics', label: '👁️ Acessos' },
    { id: 'produtos', label: '🍔 Produtos' },
    { id: 'categorias', label: '🗂️ Categorias' },
    { id: 'promocoes', label: '⭐ Promoções & Cupons' },
    { id: 'crm', label: '👥 Clientes' },
    { id: 'estoque', label: '📦 Estoque & Fichas' },
    { id: 'relatorios', label: '📊 Relatórios' },
    { id: 'fiscal', label: '🧾 Fiscal' },
    { id: 'config', label: '⚙️ Config' } 
  ];

  return (
    <div className="print:hidden">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 uppercase">ZenixFood Admin</h1>
              {storeId && (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                  Loja: {storeId}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-1">Centro de Comando Multi-Tenant</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer text-slate-600 hover:text-slate-900 shadow-sm">
              <input type="checkbox" checked={isAutoPrintEnabled} onChange={(e) => toggleAutoPrintState(e.target.checked)} className="rounded text-amber-500 focus:ring-0 border-slate-300" />
              🖨️ Spooler Local (Porta 8080)
            </label>
            <button onClick={handleAdminLogout} className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 font-bold text-xs px-4 py-2 rounded-xl transition-colors">
              Desconectar
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex-1 md:flex-none text-center ${activeTab === tab.id ? 'bg-amber-500 text-black shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
    </div>
  );
}