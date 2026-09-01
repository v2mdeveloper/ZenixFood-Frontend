'use client';
import { useState, useEffect } from 'react';

export default function AnalyticsTab({ visitsData }) {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [localVisits, setLocalVisits] = useState(visitsData || { visits: [], totalVisits: 0 });
  const [countdown, setCountdown] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStartDate, setDeleteStartDate] = useState('');
  const [deleteEndDate, setDeleteEndDate] = useState('');
  const [deleteType, setDeleteType] = useState('all');

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

  // Mantém os dados sincronizados quando carrega a primeira vez
  useEffect(() => {
    if (visitsData) setLocalVisits(visitsData);
  }, [visitsData]);

  // Contador automático de 10 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh(); // Atualiza sem recarregar a página
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Busca invisível em segundo plano com suporte a multi-tenant
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/admin/analytics?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setLocalVisits(data);
      }
    } catch(e) {}
    setIsRefreshing(false);
    setCountdown(10); // Reinicia o timer
  };

  const handleDeleteLogs = async () => {
    if (deleteType === 'range' && (!deleteStartDate || !deleteEndDate)) {
      return alert('⚠️ Selecione a data de início e fim para excluir.');
    }

    const mensagem = deleteType === 'all' 
      ? 'Tem certeza que deseja apagar TODOS os registros de acesso desta loja?' 
      : `Tem certeza que deseja apagar os registros entre ${deleteStartDate} e ${deleteEndDate}?`;

    if (!confirm(mensagem)) return;

    try {
      const res = await fetchWithStore(`${API_URL}/api/admin/analytics`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: deleteType, startDate: deleteStartDate, endDate: deleteEndDate })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('✅ Registros apagados com sucesso!');
        setShowDeleteModal(false);
        setDeleteStartDate('');
        setDeleteEndDate('');
        handleRefresh(); // Puxa os dados zerados sem recarregar a página
      } else { alert(data.error || 'Erro ao apagar registros.'); }
    } catch (error) { alert('Erro de conexão ao tentar apagar os logs.'); }
  };

  return (
    <main className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">👁️ Rastreador de Acessos</h2>
          <p className="text-slate-500 text-sm mt-1">Monitore quem está acessando seu cardápio em tempo real.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-amber-100 text-amber-700 px-6 py-3 rounded-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider">Total Histórico</p>
            <p className="text-3xl font-black">{localVisits?.totalVisits || 0}</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => { setCountdown(10); handleRefresh(); }} 
              disabled={isRefreshing}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <span>🔄</span> {isRefreshing ? 'Atualizando...' : 'Atualizar Agora'}
            </button>
            <span className="text-[10px] text-slate-400 font-bold text-center">Próximo refresh em {countdown}s</span>
          </div>

          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border border-red-200"
          >
            <span>🗑️</span> Limpar Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100 border-b border-slate-200 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4 font-bold">Data / Hora</th>
              <th className="px-6 py-4 font-bold">Visitante</th>
              <th className="px-6 py-4 font-bold">Dispositivo</th>
              <th className="px-6 py-4 font-bold">IP (Localização)</th>
            </tr>
          </thead>
          <tbody>
            {(!localVisits?.visits || localVisits.visits.length === 0) && (
              <tr><td colSpan="4" className="text-center py-8 text-slate-500">Nenhum acesso registrado ainda.</td></tr>
            )}
            {localVisits?.visits?.map(visit => (
              <tr key={visit.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-600 font-medium">{new Date(visit.createdAt).toLocaleString('pt-BR')}</td>
                <td className="px-6 py-4">
                  {visit.user ? <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">👤 {visit.user.name}</span> : <span className="font-bold text-slate-500">👀 Visitante Anônimo</span>}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">{visit.device === 'Celular' ? '📱 Celular' : '💻 Computador'}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{visit.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-lg font-black text-slate-900">🗑️ Limpar Registros de Acesso</h3><button onClick={() => setShowDeleteModal(false)} className="text-slate-400 font-bold hover:text-slate-700 cursor-pointer">✕</button></div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-700"><input type="radio" name="deleteType" checked={deleteType === 'all'} onChange={() => setDeleteType('all')} className="accent-red-600 cursor-pointer" />Excluir TODOS os registros de acesso</label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-700"><input type="radio" name="deleteType" checked={deleteType === 'range'} onChange={() => setDeleteType('range')} className="accent-red-600 cursor-pointer" />Excluir por intervalo de datas</label>
            </div>
            {deleteType === 'range' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data Início</label><input type="date" value={deleteStartDate} onChange={e => setDeleteStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold" /></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data Fim</label><input type="date" value={deleteEndDate} onChange={e => setDeleteEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold" /></div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleDeleteLogs} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl transition-all shadow-md cursor-pointer">Confirmar Exclusão</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}