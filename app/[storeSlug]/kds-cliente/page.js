'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function KdsClientePage() {
  const params = useParams();
  const storeSlug = params.storeSlug;

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [storeStatus, setStoreStatus] = useState('LOADING');
  const [totemOrders, setTotemOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const announcedOrders = useRef(new Set());

  // 🎯 NOVOS ESTADOS PARA O GERENCIAMENTO DE VOZ
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Identifica e valida a loja pelo slug da URL antes de liberar o painel
  useEffect(() => {
    if (!storeSlug) return;

    const identifyStore = async () => {
      try {
        const res = await fetch(`${API_URL || 'https://zenixfood-backend.onrender.com'}/api/settings`, { headers: { 'x-loja-slug': storeSlug } });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem('zenix_store_id', data.store.id);
          setStoreStatus('FOUND');
        } else {
          setStoreStatus('NOT_FOUND');
        }
      } catch (error) {
        setStoreStatus('NOT_FOUND');
      }
    };

    identifyStore();
  }, [storeSlug]);

  // Helper local com interceptador de Inadimplência
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

  const extractFirstName = (order) => {
    if (order.origin === 'TOTEM' && order.address) {
      const match = order.address.match(/Cliente:\s*(.*?)(?:\s*\||$)/);
      if (match && match[1]) {
         return match[1].trim().split(' ')[0];
      }
    }
    return order.client?.name ? order.client.name.split(' ')[0] : 'Cliente';
  };

  useEffect(() => {
    if (storeStatus !== 'FOUND') return;

    fetchKdsData();
    const interval = setInterval(fetchKdsData, 4000);
    const clock = setInterval(() => setNow(Date.now()), 10000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, [storeStatus]);

  const fetchKdsData = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/kds`);
      if (res.ok) {
        const data = await res.json();
        setTotemOrders(data.totemOrders || []);
      }
    } catch (e) {
      console.error("Erro ao buscar dados do KDS Cliente");
    }
    setLoading(false);
  };

  // 🎯 CARREGAMENTO E CONFIGURAÇÃO DE VOZES DA API DO NAVEGADOR
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length === 0) return;

      // Coloca as vozes em Português no topo da lista
      const sortedVoices = [...availableVoices].sort((a, b) => {
        if (a.lang.includes('pt') && !b.lang.includes('pt')) return -1;
        if (!a.lang.includes('pt') && b.lang.includes('pt')) return 1;
        return a.name.localeCompare(b.name);
      });

      setVoices(sortedVoices);

      // Carrega a voz preferida salva anteriormente
      const savedVoice = localStorage.getItem('zenix_selectedVoice');
      if (savedVoice) {
        setSelectedVoiceURI(savedVoice);
      } else {
        const defaultPtBr = sortedVoices.find(v => v.lang.includes('pt'));
        if (defaultPtBr) setSelectedVoiceURI(defaultPtBr.voiceURI);
      }
    };

    loadVoices();
    // Navegadores carregam vozes de forma assíncrona, então precisamos deste listener
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleVoiceChange = (e) => {
    const uri = e.target.value;
    setSelectedVoiceURI(uri);
    localStorage.setItem('zenix_selectedVoice', uri);
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Testando a voz do locutor. Pedido 1 0 5, pronto para retirada.");
      if (selectedVoiceURI) {
        const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
        if (voice) utterance.voice = voice;
      } else {
        utterance.lang = 'pt-BR';
      }
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const TEMPO_LIMPEZA_MS = 60 * 60 * 1000;

  const preparingOrders = totemOrders.filter(o => o.status === 'PREPARING');
  
  const readyOrders = totemOrders.filter(o => {
    if (o.status !== 'READY') return false;
    const orderTime = new Date(o.updatedAt || o.createdAt).getTime();
    if (now - orderTime > TEMPO_LIMPEZA_MS) return false;
    return true;
  });

  // 🎯 LÓGICA DE ANÚNCIO ATUALIZADA PARA USAR A VOZ ESCOLHIDA
  useEffect(() => {
    readyOrders.forEach(order => {
      if (!announcedOrders.current.has(order.id)) {
        announcedOrders.current.add(order.id);
        
        if ('speechSynthesis' in window) {
          const nomeCliente = extractFirstName(order);
          // Adiciona espaços entre as letras do Short ID para o robô soletrar pausadamente
          const shortIdFalado = order.shortId.split('').join(' '); 
          const text = `Pedido ${shortIdFalado}, ${nomeCliente}. Pronto para retirada.`;
          
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Aplica a voz selecionada se ela existir
          if (selectedVoiceURI) {
            const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
            if (voice) utterance.voice = voice;
          } else {
            utterance.lang = 'pt-BR';
          }
          
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    });
  }, [readyOrders, voices, selectedVoiceURI]);

  const handleFullscreen = () => {
    if (typeof document !== 'undefined') {
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) docEl.requestFullscreen().catch(()=>{});
      }
    }
  };

  if (storeStatus === 'LOADING' || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-500 font-black text-2xl">
         <span className="text-6xl mb-4 animate-bounce">📺</span>
         Carregando Painel de Chamadas da Loja...
      </div>
    );
  }

  if (storeStatus === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
        <span className="text-6xl mb-4">🚫</span>
        <h1 className="text-3xl font-black text-white mb-2">Acesso Negado</h1>
        <p className="text-slate-400">Nenhuma loja encontrada para este endereço.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col overflow-hidden cursor-pointer selection:bg-transparent relative" onClick={handleFullscreen}>
      
      <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🍔</span>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Painel de Chamadas</h1>
            <p className="text-amber-600 font-bold tracking-widest uppercase text-sm mt-1">Acompanhe o seu Pedido</p>
          </div>
        </div>
        
        <div className="text-right flex items-center gap-6">
           {/* BOTÃO PARA ABRIR CONFIGURAÇÃO DE VOZ (Impede o clique de ativar a tela cheia) */}
           <button 
             onClick={(e) => { e.stopPropagation(); setShowVoiceSettings(!showVoiceSettings); }}
             className="w-14 h-14 bg-slate-100 hover:bg-slate-200 text-3xl rounded-full flex items-center justify-center transition-colors cursor-pointer"
             title="Configurar Voz do Locutor"
           >
             🗣️
           </button>
           <p className="text-4xl font-black text-slate-700">{new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </header>

      {/* MENU SUSPENSO DE CONFIGURAÇÃO DE VOZ */}
      {showVoiceSettings && (
        <div 
          className="absolute top-28 right-8 bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 z-50 w-[400px] animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">🗣️ Voz do Locutor</h3>
            <button onClick={() => setShowVoiceSettings(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer">✕</button>
          </div>
          
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Selecione a Voz Desejada</label>
          <select 
            value={selectedVoiceURI} 
            onChange={handleVoiceChange}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-bold cursor-pointer mb-4 shadow-inner"
          >
            {voices.map(voice => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>

          <button 
            onClick={testVoice}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-4 rounded-xl transition-colors shadow-sm cursor-pointer text-lg flex items-center justify-center gap-2"
          >
            ▶️ Testar Locutor
          </button>
        </div>
      )}

      <main className="flex-1 flex w-full">
        
        <section className="w-1/2 border-r border-slate-200 flex flex-col bg-slate-50">
           <div className="bg-amber-100 border-b border-amber-200 p-6 text-center shadow-sm shrink-0">
              <h2 className="text-4xl font-black text-amber-800 uppercase tracking-widest flex items-center justify-center gap-4">
                 <span>🔥</span> Preparando
              </h2>
           </div>
           
           <div className="flex-1 p-8 overflow-y-hidden flex flex-wrap content-start gap-6">
              {preparingOrders.map(order => (
                 <div key={order.id} className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
                    <span className="text-6xl font-black text-amber-500 tracking-tighter">#{order.shortId}</span>
                    <span className="text-3xl font-bold text-slate-700 truncate max-w-[50%] text-right uppercase">
                       {extractFirstName(order)}
                    </span>
                 </div>
              ))}
              {preparingOrders.length === 0 && (
                 <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                    <span className="text-6xl mb-4">👨‍🍳</span>
                    <p className="text-2xl font-bold text-slate-400">Nenhum pedido na grelha</p>
                 </div>
              )}
           </div>
        </section>

        <section className="w-1/2 flex flex-col bg-slate-100">
           <div className="bg-emerald-100 border-b border-emerald-200 p-6 text-center shadow-sm shrink-0">
              <h2 className="text-4xl font-black text-emerald-800 uppercase tracking-widest flex items-center justify-center gap-4">
                 <span>🛎️</span> Prontos para Retirar
              </h2>
           </div>
           
           <div className="flex-1 p-8 overflow-y-hidden flex flex-wrap content-start gap-6">
              {readyOrders.map((order, index) => (
                 <div key={order.id} className={`w-full bg-emerald-50 border-4 border-emerald-500 rounded-[2rem] p-6 flex items-center justify-between shadow-md ${index === 0 ? 'animate-pulse scale-105 my-2' : ''}`}>
                    <span className="text-7xl font-black text-emerald-600 tracking-tighter drop-shadow-sm">#{order.shortId}</span>
                    <span className="text-4xl font-black text-emerald-900 truncate max-w-[50%] text-right uppercase">
                       {extractFirstName(order)}
                    </span>
                 </div>
              ))}
              {readyOrders.length === 0 && (
                 <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                    <span className="text-6xl mb-4">🛍️</span>
                    <p className="text-2xl font-bold text-slate-400">Nenhum pedido aguardando</p>
                 </div>
              )}
           </div>
        </section>

      </main>

      <footer className="bg-white border-t border-slate-200 p-4 text-center shrink-0">
         <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">
            Fique atento ao seu número na tela. Os pedidos não retirados em 60 minutos saem do painel.
         </p>
      </footer>

    </div>
  );
}