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
  
  // NAVEGAÇÃO PRINCIPAL
  const [activeTab, setActiveTab] = useState('HOJE'); // 'HOJE', 'CALENDARIO', 'HISTORICO'
  
  // ESTADOS DO CALENDÁRIO
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // MODAIS E INTERAÇÕES
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [novoEventoForm, setNovoEventoForm] = useState({ id: null, nome: '', tipo: 'MISTO', dataHoraInicio: '', dataHoraFim: '', qtdPessoas: 1, observacoes: '' });
  const [csvPreview, setCsvPreview] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!storeSlug) return;
    const identifyStore = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`, { headers: { 'x-loja-slug': storeSlug } });
        const data = await res.json();
        if (data.success) { localStorage.setItem('zenix_store_id', data.store.id); setStoreStatus('FOUND'); } 
        else setStoreStatus('NOT_FOUND');
      } catch (error) { setStoreStatus('NOT_FOUND'); }
    };
    identifyStore();
  }, [storeSlug]);

  useEffect(() => {
    const token = localStorage.getItem('@ZenixFood:employeeToken');
    const savedUser = localStorage.getItem('@ZenixFood:employeeUser');
    if (token && savedUser) { setIsAuthenticated(true); setEmployeeUser(JSON.parse(savedUser)); }
  }, []);

  useEffect(() => {
    if (isAuthenticated && storeStatus === 'FOUND') fetchEventos();
  }, [isAuthenticated, storeStatus]);

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('@ZenixFood:employeeToken');
    const headers = { ...(token && { 'Authorization': `Bearer ${token}` }), ...(storeSlug && { 'x-loja-slug': storeSlug }), ...options.headers };
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
    localStorage.removeItem('@ZenixFood:employeeToken'); localStorage.removeItem('@ZenixFood:employeeUser'); setIsAuthenticated(false);
  };

  const fetchEventos = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/eventos`);
      if (res.ok) {
         const data = await res.json();
         setEventos(data);
         if(selectedEvento) {
            const atualizado = data.find(e => e.id === selectedEvento.id);
            if(atualizado) setSelectedEvento(atualizado);
         }
      }
    } catch (e) { console.error(e); } finally { setLoadingData(false); }
  };

  // 🔥 FORMATAR DATA PARA FUSO LOCAL (Corrige o problema do input datetime-local)
  const toLocalISOString = (dateObj) => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setNovoEventoForm({ id: null, nome: '', tipo: 'MISTO', dataHoraInicio: toLocalISOString(new Date()), dataHoraFim: '', qtdPessoas: 1, observacoes: '' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (evento) => {
    setIsEditing(true);
    setNovoEventoForm({
      id: evento.id,
      nome: evento.nome,
      tipo: evento.tipo,
      dataHoraInicio: toLocalISOString(new Date(evento.dataHoraInicio)),
      dataHoraFim: evento.dataHoraFim ? toLocalISOString(new Date(evento.dataHoraFim)) : '',
      qtdPessoas: evento.qtdPessoas,
      observacoes: evento.observacoes || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveEvento = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing ? `${API_URL}/api/eventos/${novoEventoForm.id}` : `${API_URL}/api/eventos`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetchWithStore(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoEventoForm) });
      if (res.ok) { 
        alert(`Evento ${isEditing ? 'atualizado' : 'criado'}!`); 
        setIsCreateModalOpen(false); 
        fetchEventos(); 
      } else alert('Erro ao salvar evento.');
    } catch (e) { alert('Erro de conexão.'); }
  };

  const handleFinalizarEvento = async (eventoId) => {
    if(!confirm("Tem certeza que deseja finalizar este evento? Ele será movido para o histórico e o relatório estará disponível.")) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/eventos/${eventoId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'FINALIZADO' })
      });
      if (res.ok) { alert("Evento finalizado com sucesso!"); setSelectedEvento(null); fetchEventos(); }
    } catch (e) { alert("Erro ao finalizar."); }
  };

  const handleCheckIn = async (convidadoId) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/eventos/convidado/${convidadoId}/checkin`, { method: 'PUT' });
      if (res.ok) {
        setSelectedEvento(prev => ({
          ...prev, convidados: prev.convidados.map(c => c.id === convidadoId ? { ...c, statusCheckIn: true, horaCheckIn: new Date().toISOString() } : c)
        }));
      }
    } catch (e) { alert('Erro ao realizar check-in'); }
  };

  // 🔥 GERADOR DE RELATÓRIO EXCEL/CSV
  const handleDownloadRelatorio = async (evento) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/eventos/${evento.id}/relatorio`);
      const data = await res.json();
      if (data.success) {
        let csvContent = "NOME,CPF,EMAIL,MESA,COMANDA,CHECK-IN,GASTO (R$)\n";
        data.convidados.forEach(c => {
          csvContent += `"${c.nome}","${c.cpf}","${c.email}","${c.mesa}","${c.comanda}","${c.checkIn}","${c.gasto}"\n`;
        });
        csvContent += `\n,,,,,TOTAL DO EVENTO,"R$ ${data.totalGasto}"\n`;

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Relatorio_${data.eventoNome.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      } else alert(data.error);
    } catch (e) { alert("Erro ao gerar relatório."); }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "nome,cpf,email,telefone,mesa,posicao,comanda\nJoão Silva,11122233344,joao@teste.com,11999999999,10,Lugar 1,2001\nMaria Alves,,maria@teste.com,,10,Lugar 2,2002";
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'Zenix_Modelo_Convidados.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

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
        if (data.length >= headers.length) {
          let rowObj = {};
          headers.forEach((header, index) => {
            let cleanHeader = header.replace(/["\r]/g, '');
            let cleanData = data[index] ? data[index].replace(/["\r]/g, '').trim() : '';
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
      if (res.ok) { alert(data.message); setShowImportModal(false); setCsvPreview([]); fetchEventos(); setSelectedEvento(null); } 
      else alert(data.error);
    } catch (e) { alert('Erro na comunicação com o servidor.'); } finally { setIsImporting(false); }
  };

  // 🔥 LÓGICA DO CALENDÁRIO E FILTROS
  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const firstDay = getFirstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
    const days = [];
    
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const isSelected = isSameDay(dayDate, selectedDate);
      const isToday = isSameDay(dayDate, new Date());
      
      // Verifica se tem evento não finalizado neste dia
      const hasEvent = eventos.some(e => e.status !== 'FINALIZADO' && isSameDay(new Date(e.dataHoraInicio), dayDate));

      days.push(
        <button 
          key={d} onClick={() => setSelectedDate(dayDate)} 
          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold text-sm relative transition-all cursor-pointer ${isSelected ? 'bg-blue-600 text-white shadow-md' : isToday ? 'border-2 border-blue-500 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          {d}
          {hasEvent && <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`}></span>}
        </button>
      );
    }

    return (
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
         <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 font-black text-slate-500">{"<"}</button>
            <h3 className="font-black text-lg text-slate-800 uppercase tracking-widest">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 font-black text-slate-500">{">"}</button>
         </div>
         <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {weekDays.map(wd => <span key={wd}>{wd}</span>)}
         </div>
         <div className="grid grid-cols-7 gap-2 place-items-center">
            {days}
         </div>
      </div>
    );
  };

  // 🔥 LISTAS FILTRADAS POR ABA
  const eventosHoje = eventos.filter(e => e.status !== 'FINALIZADO' && isSameDay(new Date(e.dataHoraInicio), new Date()));
  const eventosSelecionadosCalendario = eventos.filter(e => e.status !== 'FINALIZADO' && isSameDay(new Date(e.dataHoraInicio), selectedDate));
  const eventosHistorico = eventos.filter(e => e.status === 'FINALIZADO').sort((a,b) => new Date(b.dataHoraInicio) - new Date(a.dataHoraInicio));
  const convidadosFiltrados = selectedEvento?.convidados?.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase())) || [];

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:h-screen">
      <header className="bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-center shadow-lg shrink-0 gap-4">
         <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
               <span className="text-3xl hidden sm:block">🥂</span>
               <div>
                  <h1 className="text-lg md:text-xl font-black leading-none">Recepção</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hostess: {employeeUser?.name}</p>
               </div>
            </div>
            {/* SUB-MENU RESPONSIVO */}
            <div className="flex bg-slate-800 p-1 rounded-xl">
               <button onClick={() => {setActiveTab('HOJE'); setSelectedEvento(null);}} className={`px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-colors ${activeTab === 'HOJE' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>HOJE</button>
               <button onClick={() => {setActiveTab('CALENDARIO'); setSelectedEvento(null);}} className={`px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-colors ${activeTab === 'CALENDARIO' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>CALENDÁRIO</button>
               <button onClick={() => {setActiveTab('HISTORICO'); setSelectedEvento(null);}} className={`px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-colors ${activeTab === 'HISTORICO' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>HISTÓRICO</button>
            </div>
         </div>
         <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
            <button onClick={() => router.push(`/${storeSlug}/lancamentos`)} className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-colors">Voltar ao Salão</button>
            <button onClick={handleLogout} className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-colors shrink-0">Sair</button>
         </div>
      </header>

      {/* MUDANÇA PRINCIPAL: flex-col no mobile, flex-row no desktop */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4">
        
        {/* LISTA ESQUERDA (Dinâmica baseada na aba) */}
        <div className={`w-full md:w-1/3 flex flex-col gap-4 ${selectedEvento ? 'hidden md:flex' : 'flex'}`}>
           
           {activeTab === 'HOJE' && (
             <div className="flex flex-col h-full gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex justify-between items-center shrink-0">
                  <h2 className="font-black text-lg">Eventos de Hoje</h2>
                  <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full font-black text-xl flex items-center justify-center shadow-md">+</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pb-10">
                  {eventosHoje.map(evento => (
                    <div key={evento.id} onClick={() => setSelectedEvento(evento)} className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedEvento?.id === evento.id ? 'bg-amber-50 border-amber-500 shadow-md scale-[1.02]' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                        <h3 className={`font-black text-lg leading-tight mb-1 ${selectedEvento?.id === evento.id ? 'text-amber-700' : 'text-slate-800'}`}>{evento.nome}</h3>
                        <p className="text-xs text-slate-500 font-bold mb-3">{new Date(evento.dataHoraInicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${evento.tipo === 'MISTO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{evento.tipo.replace('_', ' ')}</span>
                          <span className="text-xs font-black text-slate-600">👥 {evento.convidados?.filter(c => c.statusCheckIn).length || 0} / {evento.convidados?.length || 0}</span>
                        </div>
                    </div>
                  ))}
                  {eventosHoje.length === 0 && <p className="text-center text-slate-400 mt-10 text-sm">Nenhum evento agendado para hoje.</p>}
                </div>
             </div>
           )}

           {activeTab === 'CALENDARIO' && (
             <div className="flex flex-col h-full gap-4">
                {renderCalendar()}
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex justify-between items-center shrink-0">
                  <h2 className="font-black text-lg text-blue-700">Agenda: {selectedDate.toLocaleDateString('pt-BR')}</h2>
                  <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full font-black text-xl flex items-center justify-center shadow-md">+</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pb-10">
                  {eventosSelecionadosCalendario.map(evento => (
                    <div key={evento.id} onClick={() => setSelectedEvento(evento)} className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedEvento?.id === evento.id ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02]' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                        <h3 className={`font-black text-lg leading-tight mb-1 ${selectedEvento?.id === evento.id ? 'text-blue-700' : 'text-slate-800'}`}>{evento.nome}</h3>
                        <p className="text-xs text-slate-500 font-bold mb-3">{new Date(evento.dataHoraInicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  ))}
                  {eventosSelecionadosCalendario.length === 0 && <p className="text-center text-slate-400 mt-5 text-sm">Livre.</p>}
                </div>
             </div>
           )}

           {activeTab === 'HISTORICO' && (
             <div className="flex flex-col h-full gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col shrink-0">
                  <h2 className="font-black text-lg text-emerald-700">Histórico de Eventos</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Eventos já finalizados.</p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pb-10">
                  {eventosHistorico.map(evento => (
                    <div key={evento.id} onClick={() => setSelectedEvento(evento)} className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedEvento?.id === evento.id ? 'bg-emerald-50 border-emerald-500 shadow-md scale-[1.02]' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                        <h3 className={`font-black text-lg leading-tight mb-1 ${selectedEvento?.id === evento.id ? 'text-emerald-700' : 'text-slate-800'}`}>{evento.nome}</h3>
                        <p className="text-xs text-slate-500 font-bold mb-3">Realizado em {new Date(evento.dataHoraInicio).toLocaleDateString()}</p>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">✅ FINALIZADO</span>
                    </div>
                  ))}
                  {eventosHistorico.length === 0 && <p className="text-center text-slate-400 mt-10 text-sm">Nenhum evento finalizado ainda.</p>}
                </div>
             </div>
           )}
        </div>

        {/* DETALHES DO EVENTO (DIREITA) */}
        <div className={`flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex-col overflow-hidden ${!selectedEvento ? 'hidden md:flex' : 'flex'}`}>
           {selectedEvento ? (
             <>
               <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <button onClick={() => setSelectedEvento(null)} className="md:hidden bg-slate-200 w-8 h-8 rounded-full font-black text-slate-600">←</button>
                      <h2 className="text-xl md:text-3xl font-black text-slate-800">{selectedEvento.nome}</h2>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 font-medium md:pl-0 pl-10">{selectedEvento.observacoes || 'Sem observações especiais.'}</p>
                  </div>
                  
                  {activeTab !== 'HISTORICO' ? (
                     <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <div className="flex gap-2">
                           <button onClick={() => openEditModal(selectedEvento)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-black shadow-sm transition-colors text-xs">✏️ Editar</button>
                           <button onClick={() => handleFinalizarEvento(selectedEvento.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-3 rounded-xl font-black shadow-sm transition-colors text-xs border border-red-200">🚩 Finalizar</button>
                        </div>
                        <button onClick={() => setShowImportModal(true)} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95">
                           📥 Importar (CSV)
                        </button>
                     </div>
                  ) : (
                     <button onClick={() => handleDownloadRelatorio(selectedEvento)} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95">
                        📊 Baixar Relatório (Excel)
                     </button>
                  )}
               </div>
               
               <div className="p-4 bg-slate-100 border-b border-slate-200 shrink-0">
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="🔍 Buscar nome na lista..." className="w-full bg-white border border-slate-300 p-3 md:p-4 rounded-2xl text-base md:text-lg font-bold shadow-sm focus:outline-none focus:border-blue-500" />
               </div>

               <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                  <div className="space-y-3">
                      {convidadosFiltrados.map(conv => (
                         <div key={conv.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-300 transition-colors">
                            <div className="flex-1">
                               <p className="font-black text-slate-800 text-base">{conv.nome}</p>
                               <div className="flex flex-wrap gap-2 mt-2">
                                  {conv.mesaIndicada && <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">🪑 Mesa {conv.mesaIndicada} {conv.posicaoMesa && `- ${conv.posicaoMesa}`}</span>}
                                  {conv.comandaIndicada && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">💳 Cmd {conv.comandaIndicada}</span>}
                               </div>
                            </div>
                            <div className="w-full md:w-auto text-right">
                               {conv.statusCheckIn ? (
                                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black w-full text-center">✅ Check-in às {new Date(conv.horaCheckIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                               ) : (
                                  activeTab !== 'HISTORICO' ? (
                                     <button onClick={() => handleCheckIn(conv.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-black shadow-sm transition-colors cursor-pointer active:scale-95 w-full">Dar Check-in</button>
                                  ) : (
                                     <span className="text-xs font-bold text-slate-400">Não compareceu</span>
                                  )
                               )}
                            </div>
                         </div>
                      ))}
                  </div>
                  {convidadosFiltrados.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <span className="text-5xl mb-4">📋</span>
                        <p className="text-lg font-black text-slate-800">A lista está vazia.</p>
                        {activeTab !== 'HISTORICO' && <p className="text-sm text-slate-500">Clique em "Importar Lista" para enviar o arquivo CSV.</p>}
                     </div>
                  )}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <span className="text-6xl mb-4">🥂</span>
                <p className="text-2xl font-black">Selecione um evento</p>
                <p className="text-sm font-medium mt-2">Para ver a lista e gerir convidados.</p>
             </div>
           )}
        </div>
      </main>

      {/* MODAL CRIAR/EDITAR EVENTO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
              <h2 className="text-2xl font-black mb-6 text-slate-800">{isEditing ? '✏️ Editar Evento' : '✨ Novo Evento'}</h2>
              <form onSubmit={handleSaveEvento} className="space-y-4">
                 <input type="text" required value={novoEventoForm.nome} onChange={e => setNovoEventoForm({...novoEventoForm, nome: e.target.value})} placeholder="Nome do Evento" className="w-full border rounded-xl p-3 font-bold bg-slate-50 focus:outline-none focus:border-blue-500" />
                 
                 <select value={novoEventoForm.tipo} onChange={e => setNovoEventoForm({...novoEventoForm, tipo: e.target.value})} className="w-full border rounded-xl p-3 font-bold bg-slate-50 cursor-pointer focus:outline-none focus:border-blue-500">
                    <option value="MISTO">Misto (Mesas + Comandas)</option>
                    <option value="APENAS_MESAS">Apenas Reserva de Mesas</option>
                    <option value="APENAS_COMANDAS">Apenas Lista com Comandas</option>
                 </select>
                 
                 <div className="flex gap-2">
                    <div className="flex-1"><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Início</label><input type="datetime-local" required value={novoEventoForm.dataHoraInicio} onChange={e => setNovoEventoForm({...novoEventoForm, dataHoraInicio: e.target.value})} className="w-full border rounded-xl p-3 text-xs font-bold bg-slate-50 focus:outline-none focus:border-blue-500" /></div>
                    <div className="flex-1"><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Fim</label><input type="datetime-local" value={novoEventoForm.dataHoraFim} onChange={e => setNovoEventoForm({...novoEventoForm, dataHoraFim: e.target.value})} className="w-full border rounded-xl p-3 text-xs font-bold bg-slate-50 focus:outline-none focus:border-blue-500" /></div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Observações (Opcional)</label>
                    <textarea value={novoEventoForm.observacoes} onChange={e => setNovoEventoForm({...novoEventoForm, observacoes: e.target.value})} placeholder="Instruções para a equipe..." className="w-full border rounded-xl p-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-500" rows="2"></textarea>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold cursor-pointer transition-colors">Cancelar</button>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black shadow-md cursor-pointer transition-colors">Salvar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL IMPORTAR PLANILHA */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shrink-0 border-b pb-4 gap-4">
                 <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1">Importar Convidados (CSV)</h2>
                    <p className="text-[10px] md:text-xs text-slate-500 font-bold">Colunas requeridas: <span className="bg-slate-100 px-1 rounded text-slate-700">nome, cpf, email, telefone, mesa, posicao, comanda</span></p>
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={handleDownloadTemplate} className="flex-1 md:flex-none bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-black transition-colors">Baixar Modelo</button>
                    <button onClick={() => { setShowImportModal(false); setCsvPreview([]); }} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-black hover:text-red-500 transition-colors shrink-0">✕</button>
                 </div>
              </div>

              {csvPreview.length === 0 ? (
                 <div className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-6 md:p-10 bg-slate-50 relative group hover:border-blue-500 transition-colors">
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</span>
                    <p className="font-black text-slate-700 mb-2 text-center">Clique para procurar o arquivo .CSV</p>
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 </div>
              ) : (
                 <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl p-4 hide-scrollbar">
                    <p className="font-black text-emerald-600 mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs md:text-sm">✓ {csvPreview.length} convidados identificados prontos para importação.</p>
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

              <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t mt-4 shrink-0">
                 {csvPreview.length > 0 && <button onClick={() => setCsvPreview([])} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold w-full md:w-auto">Limpar</button>}
                 <button onClick={confirmImport} disabled={csvPreview.length === 0 || isImporting} className="bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 cursor-pointer w-full md:w-auto">
                    {isImporting ? 'Abrindo Comandas...' : `Confirmar Importação`}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}