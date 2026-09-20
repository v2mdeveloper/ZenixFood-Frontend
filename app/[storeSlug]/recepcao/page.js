'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RecepcaoHostessPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug;

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [storeStatus, setStoreStatus] = useState('LOADING');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeUser, setEmployeeUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [eventos, setEventos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Modais e Interações
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Formulários
  const [novoEventoForm, setNovoEventoForm] = useState({ nome: '', tipo: 'MISTO', dataHoraInicio: '', dataHoraFim: '', qtdPessoas: 1, observacoes: '' });
  const [csvPreview, setCsvPreview] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!storeSlug) return;
    const identifyStore = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`, { headers: { 'x-loja-slug': storeSlug } });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('zenix_store_id', data.store.id);
          setStoreStatus('FOUND');
        } else setStoreStatus('NOT_FOUND');
      } catch (error) { setStoreStatus('NOT_FOUND'); }
    };
    identifyStore();
  }, [storeSlug]);

  useEffect(() => {
    const token = localStorage.getItem('@ZenixFood:employeeToken');
    const savedUser = localStorage.getItem('@ZenixFood:employeeUser');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setEmployeeUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && storeStatus === 'FOUND') {
      fetchEventos();
    }
  }, [isAuthenticated, storeStatus]);

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('@ZenixFood:employeeToken');
    const storeId = storeSlug;
    const headers = { ...(token && { 'Authorization': `Bearer ${token}` }), ...(storeId && { 'x-loja-slug': storeId }), ...options.headers };
    return fetch(url, { ...options, headers });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoadingLogin(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/employee/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-loja-slug': storeSlug }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('@ZenixFood:employeeToken', data.token); localStorage.setItem('@ZenixFood:employeeUser', JSON.stringify(data.employee));
        setIsAuthenticated(true); setEmployeeUser(data.employee);
      } else alert(data.error || 'Credenciais inválidas.');
    } catch (e) { alert('Erro ao fazer login.'); } finally { setLoadingLogin(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('@ZenixFood:employeeToken');
    localStorage.removeItem('@ZenixFood:employeeUser');
    setIsAuthenticated(false);
  };

  const fetchEventos = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/eventos`);
      if (res.ok) setEventos(await res.json());
    } catch (e) { console.error(e); } finally { setLoadingData(false); }
  };

  const handleCreateEvento = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/eventos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoEventoForm)
      });
      if (res.ok) {
        alert('Evento criado com sucesso!');
        setIsCreateModalOpen(false);
        setNovoEventoForm({ nome: '', tipo: 'MISTO', dataHoraInicio: '', dataHoraFim: '', qtdPessoas: 1, observacoes: '' });
        fetchEventos();
      } else alert('Erro ao criar evento.');
    } catch (e) { alert('Erro de conexão.'); }
  };

  const handleCheckIn = async (convidadoId) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/eventos/convidado/${convidadoId}/checkin`, { method: 'PUT' });
      if (res.ok) {
        // Atualiza a lista local para não precisar recarregar tudo
        setSelectedEvento(prev => ({
          ...prev,
          convidados: prev.convidados.map(c => c.id === convidadoId ? { ...c, statusCheckIn: true, horaCheckIn: new Date().toISOString() } : c)
        }));
      }
    } catch (e) { alert('Erro ao realizar check-in'); }
  };

  // 📝 LEITOR DE ARQUIVO CSV NATIVO (SEM BIBLIOTECAS EXTRAS)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return alert('O arquivo CSV parece estar vazio ou não tem cabeçalho.');

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const convidadosArray = [];

      for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',');
        if (data.length === headers.length) {
          let rowObj = {};
          headers.forEach((header, index) => {
            // Mapeia colunas comuns para o formato que a API espera
            let cleanHeader = header.replace(/["\r]/g, '');
            let cleanData = data[index].replace(/["\r]/g, '').trim();
            if(cleanHeader.includes('nome')) rowObj.nome = cleanData;
            if(cleanHeader.includes('cpf')) rowObj.cpf = cleanData;
            if(cleanHeader.includes('email')) rowObj.email = cleanData;
            if(cleanHeader.includes('telefone') || cleanHeader.includes('celular')) rowObj.telefone = cleanData;
            if(cleanHeader.includes('mesa')) rowObj.mesaIndicada = cleanData;
            if(cleanHeader.includes('posicao') || cleanHeader.includes('lugar')) rowObj.posicaoMesa = cleanData;
            if(cleanHeader.includes('comanda')) rowObj.comandaIndicada = cleanData;
          });
          if(rowObj.nome) convidadosArray.push(rowObj);
        }
      }
      setCsvPreview(convidadosArray);
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (csvPreview.length === 0) return alert('Nenhum convidado para importar.');
    setIsImporting(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/eventos/${selectedEvento.id}/importar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ convidados: csvPreview })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowImportModal(false);
        setCsvPreview([]);
        fetchEventos(); // Recarrega para ver os convidados adicionados
        setSelectedEvento(null); // Fecha o painel atual para atualizar a lista
      } else {
        alert(data.error);
      }
    } catch (e) { alert('Erro na comunicação com o servidor.'); } finally { setIsImporting(false); }
  };

  if (storeStatus === 'LOADING') return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando Recepção...</div>;
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-black text-white text-center mb-6">🥂 Recepção Hostess</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full rounded-xl p-3.5 bg-slate-950 border border-slate-800 text-white" placeholder="Email" />
          <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full rounded-xl p-3.5 bg-slate-950 border border-slate-800 text-white" placeholder="Senha" />
          <button type="submit" disabled={loadingLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl">Entrar</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col h-screen">
      {/* HEADER DA RECEPÇÃO */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg shrink-0">
         <div className="flex items-center gap-3">
            <span className="text-3xl">🥂</span>
            <div>
               <h1 className="text-xl font-black leading-none">Portal da Recepção</h1>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hostess: {employeeUser?.name}</p>
            </div>
         </div>
         <div className="flex gap-3">
            <button onClick={() => router.push(`/${storeSlug}/lancamentos`)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">Voltar ao Salão</button>
            <button onClick={handleLogout} className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">Sair</button>
         </div>
      </header>

      <main className="flex-1 overflow-hidden flex p-4 gap-4">
        
        {/* LISTA DE EVENTOS (ESQUERDA) */}
        <div className="w-1/3 flex flex-col gap-4">
           <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex justify-between items-center shrink-0">
              <h2 className="font-black text-lg">Eventos do Dia</h2>
              <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full font-black text-xl flex items-center justify-center shadow-md">+</button>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar">
              {loadingData ? <p className="text-center text-slate-400 mt-10">Carregando...</p> : eventos.map(evento => {
                 const isActive = selectedEvento?.id === evento.id;
                 const checkins = evento.convidados?.filter(c => c.statusCheckIn).length || 0;
                 const total = evento.convidados?.length || 0;

                 return (
                   <div key={evento.id} onClick={() => setSelectedEvento(evento)} className={`p-5 rounded-3xl border cursor-pointer transition-all ${isActive ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02]' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                      <h3 className={`font-black text-lg leading-tight mb-1 ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{evento.nome}</h3>
                      <p className="text-xs text-slate-500 font-bold mb-3">{new Date(evento.dataHoraInicio).toLocaleString()}</p>
                      
                      <div className="flex justify-between items-center">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${evento.tipo === 'MISTO' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{evento.tipo.replace('_', ' ')}</span>
                         <span className="text-xs font-black text-slate-600">👥 {checkins} / {total} chegaram</span>
                      </div>
                   </div>
                 )
              })}
              {eventos.length === 0 && !loadingData && <p className="text-center text-slate-400 mt-10 text-sm">Nenhum evento agendado.</p>}
           </div>
        </div>

        {/* DETALHES DO EVENTO SELECIONADO E LISTA NA PORTA (DIREITA) */}
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
           {selectedEvento ? (
             <>
               <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 mb-1">{selectedEvento.nome}</h2>
                    <p className="text-sm text-slate-500 font-medium">{selectedEvento.observacoes || 'Sem observações especiais.'}</p>
                  </div>
                  <button onClick={() => setShowImportModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-black shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95">
                     📥 Importar Lista (CSV)
                  </button>
               </div>
               
               <div className="p-4 bg-slate-100 border-b border-slate-200 shrink-0">
                  <input type="text" placeholder="Buscar nome na lista da porta..." className="w-full bg-white border border-slate-300 p-4 rounded-2xl text-lg font-bold shadow-sm focus:outline-none focus:border-blue-500" />
               </div>

               <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                  <table className="w-full text-left">
                     <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                        <tr>
                           <th className="pb-3">Convidado</th>
                           <th className="pb-3">Mesa / Posição</th>
                           <th className="pb-3">Comanda</th>
                           <th className="pb-3 text-right">Status Porta</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {selectedEvento.convidados?.map(conv => (
                           <tr key={conv.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-4">
                                 <p className="font-black text-slate-800">{conv.nome}</p>
                                 <p className="text-xs text-slate-500">{conv.cpf || conv.email || 'Sem dados extra'}</p>
                              </td>
                              <td className="py-4">
                                 {conv.mesaIndicada ? <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">🪑 M{conv.mesaIndicada} - {conv.posicaoMesa}</span> : '-'}
                              </td>
                              <td className="py-4">
                                 {conv.comandaIndicada ? <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">💳 #{conv.comandaIndicada}</span> : '-'}
                              </td>
                              <td className="py-4 text-right">
                                 {conv.statusCheckIn ? (
                                    <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">✅ ENTROU às {new Date(conv.horaCheckIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 ) : (
                                    <button onClick={() => handleCheckIn(conv.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm transition-colors cursor-pointer active:scale-95">Dar Check-in</button>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {(!selectedEvento.convidados || selectedEvento.convidados.length === 0) && (
                     <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <span className="text-5xl mb-4">📋</span>
                        <p className="text-lg font-black text-slate-800">A lista está vazia.</p>
                        <p className="text-sm text-slate-500">Clique em "Importar Lista" para enviar o arquivo CSV.</p>
                     </div>
                  )}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <span className="text-6xl mb-4">🥂</span>
                <p className="text-2xl font-black">Selecione um evento</p>
                <p className="text-sm font-medium mt-2">Para ver a lista de convidados e realizar o check-in na porta.</p>
             </div>
           )}
        </div>

      </main>

      {/* MODAL CRIAR EVENTO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
              <h2 className="text-2xl font-black mb-6 text-slate-800">Novo Evento</h2>
              <form onSubmit={handleCreateEvento} className="space-y-4">
                 <input type="text" required value={novoEventoForm.nome} onChange={e => setNovoEventoForm({...novoEventoForm, nome: e.target.value})} placeholder="Nome do Evento (Ex: Niver João)" className="w-full border rounded-xl p-3 font-bold bg-slate-50" />
                 <select value={novoEventoForm.tipo} onChange={e => setNovoEventoForm({...novoEventoForm, tipo: e.target.value})} className="w-full border rounded-xl p-3 font-bold bg-slate-50 cursor-pointer">
                    <option value="MISTO">Misto (Mesas + Comandas)</option>
                    <option value="APENAS_MESAS">Apenas Reserva de Mesas</option>
                    <option value="APENAS_COMANDAS">Apenas Lista com Comandas</option>
                 </select>
                 <div className="flex gap-2">
                    <div className="flex-1"><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Início</label><input type="datetime-local" required value={novoEventoForm.dataHoraInicio} onChange={e => setNovoEventoForm({...novoEventoForm, dataHoraInicio: e.target.value})} className="w-full border rounded-xl p-3 text-sm bg-slate-50" /></div>
                    <div className="flex-1"><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Fim (Opcional)</label><input type="datetime-local" value={novoEventoForm.dataHoraFim} onChange={e => setNovoEventoForm({...novoEventoForm, dataHoraFim: e.target.value})} className="w-full border rounded-xl p-3 text-sm bg-slate-50" /></div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold">Cancelar</button>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black shadow-md">Criar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL IMPORTAR PLANILHA */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-6 shrink-0 border-b pb-4">
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-1">Importar Convidados (CSV)</h2>
                    <p className="text-xs text-slate-500 font-bold">O arquivo CSV deve ter as colunas: <span className="bg-slate-100 px-1 rounded text-slate-700">nome, cpf, email, telefone, mesa, posicao, comanda</span></p>
                 </div>
                 <button onClick={() => { setShowImportModal(false); setCsvPreview([]); }} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-black hover:text-red-500 transition-colors">✕</button>
              </div>

              {csvPreview.length === 0 ? (
                 <div className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-10 bg-slate-50 relative group hover:border-blue-500 transition-colors">
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</span>
                    <p className="font-black text-slate-700 mb-2">Clique para procurar o arquivo .CSV</p>
                    <p className="text-xs text-slate-500">Salva no Excel ou Planilhas Google como formato CSV.</p>
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 </div>
              ) : (
                 <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl p-4 hide-scrollbar">
                    <p className="font-black text-emerald-600 mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-sm">✓ {csvPreview.length} convidados identificados prontos para importação.</p>
                    <div className="space-y-2">
                       {csvPreview.slice(0, 50).map((conv, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
                             <div><span className="font-black text-slate-800 block">{conv.nome}</span> <span className="text-slate-500">{conv.cpf || conv.email}</span></div>
                             <div className="text-right">
                                {conv.mesaIndicada && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-1 font-bold">Mesa {conv.mesaIndicada}</span>}
                                {conv.comandaIndicada && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded ml-1 font-bold">Cmd {conv.comandaIndicada}</span>}
                             </div>
                          </div>
                       ))}
                       {csvPreview.length > 50 && <p className="text-center text-xs font-bold text-slate-400 pt-2">E mais {csvPreview.length - 50} linhas...</p>}
                    </div>
                 </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t mt-4 shrink-0">
                 {csvPreview.length > 0 && <button onClick={() => setCsvPreview([])} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold">Limpar / Trocar Arquivo</button>}
                 <button onClick={confirmImport} disabled={csvPreview.length === 0 || isImporting} className="bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer">
                    {isImporting ? 'Processando e Abrindo Comandas...' : `Confirmar Importação de ${csvPreview.length} convidados`}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}