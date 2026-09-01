'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function DeliveryApp() {
  const params = useParams();
  const storeSlug = params.storeSlug;

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [storeStatus, setStoreStatus] = useState('LOADING');
  const [authMode, setAuthMode] = useState('login'); 
  const [loggedEmployee, setLoggedEmployee] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', cpf: '', email: '', phone: '', password: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [capturedFace, setCapturedFace] = useState(null);
  const [pendingFaceVerifyId, setPendingFaceVerifyId] = useState(null); 
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [myOrders, setMyOrders] = useState([]);
  const [deliveryCodes, setDeliveryCodes] = useState({});

  // Valida e identifica a loja pelo slug da URL
  useEffect(() => {
    if (!storeSlug) return;

    const identifyStore = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stores/slug/${storeSlug}`);
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

  useEffect(() => {
    const savedToken = localStorage.getItem('@Canone:deliveryToken');
    const savedEmployee = localStorage.getItem('@Canone:deliveryUser');
    if (savedToken && savedEmployee) {
      setLoggedEmployee(JSON.parse(savedEmployee));
    }
  }, []);

  useEffect(() => {
    let interval;
    if (loggedEmployee && storeStatus === 'FOUND') {
      fetchMyOrders();
      interval = setInterval(fetchMyOrders, 10000);
    }
    return () => clearInterval(interval);
  }, [loggedEmployee, storeStatus]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("⚠️ Erro ao aceder à câmara. Permita o uso da câmara nas definições do seu telemóvel/navegador.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 300, 300);
      const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setCapturedFace(base64Image);
      
      const stream = videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
    }
  };

  const retakePhoto = () => {
    setCapturedFace(null);
    startCamera();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!capturedFace) {
      alert("Você precisa de tirar uma foto do seu rosto primeiro!");
      return;
    }

    setIsProcessing(true);
    const storeId = localStorage.getItem('zenix_store_id');
    try {
      const payload = { ...registerForm, facePhoto: capturedFace };
      const res = await fetch(`${API_URL}/api/rh/delivery-persons/register`, {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'x-store-id': storeId 
        }, 
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Cadastro efetuado com sucesso! Pode fazer o seu login.");
        setAuthMode('login');
        setCapturedFace(null);
      } else {
        alert(`❌ Erro: ${data.error}`);
      }
    } catch (e) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    const storeId = localStorage.getItem('zenix_store_id');
    try {
      const res = await fetch(`${API_URL}/api/auth/employee/login`, {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'x-store-id': storeId 
        }, 
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();

      if (!res.ok) return alert(data.error || 'Credenciais inválidas.');

      if (data.needsFaceValidation) {
         setPendingFaceVerifyId(data.employeeId);
         setShowCamera(true);
         startCamera();
      } else if (data.success) {
         finishLoginProcess(data.token, data.employee);
      }
    } catch (error) {
      alert('Erro de conexão ao tentar fazer login.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFaceVerify = async () => {
    if (!capturedFace) return;
    setIsProcessing(true);
    const storeId = localStorage.getItem('zenix_store_id');
    try {
      const res = await fetch(`${API_URL}/api/auth/employee/face-login-verify`, {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'x-store-id': storeId 
        }, 
        body: JSON.stringify({ employeeId: pendingFaceVerifyId, currentFacePhoto: capturedFace })
      });
      const data = await res.json();

      if (data.success) {
         setShowCamera(false);
         setCapturedFace(null);
         finishLoginProcess(data.token, data.employee);
      } else {
         alert(`❌ ${data.error}`);
         retakePhoto();
      }
    } catch (e) {
      alert("Erro ao validar rosto. Tente Novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finishLoginProcess = (token, employee) => {
    if (!employee.role.toLowerCase().includes('entregador')) {
      alert('❌ Acesso negado. Área exclusiva para Entregadores.');
      return;
    }
    localStorage.setItem('@Canone:deliveryToken', token);
    localStorage.setItem('@Canone:deliveryUser', JSON.stringify(employee));
    setLoggedEmployee(employee);
  };

  const handleLogout = () => {
    localStorage.removeItem('@Canone:deliveryToken');
    localStorage.removeItem('@Canone:deliveryUser');
    setLoggedEmployee(null);
    setMyOrders([]);
    setLoginForm({ email: '', password: '' });
  };

  const fetchMyOrders = async () => {
    const storeId = localStorage.getItem('zenix_store_id');
    const token = localStorage.getItem('@Canone:deliveryToken');
    try {
      const res = await fetch(`${API_URL}/api/delivery/my-orders/${loggedEmployee.id}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...(storeId && { 'x-store-id': storeId })
        }
      });
      if (res.ok) setMyOrders(await res.json());
    } catch (e) { console.error('Erro ao buscar rotas'); }
  };

  const handleConfirmDelivery = async (order) => {
    const code = deliveryCodes[order.id];
    if (!code || code.length < 4) return alert('⚠️ Digite a senha de 4 dígitos!');
    
    const storeId = localStorage.getItem('zenix_store_id');
    const token = localStorage.getItem('@Canone:deliveryToken');
    try {
      const res = await fetch(`${API_URL}/api/delivery/confirm`, {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...(storeId && { 'x-store-id': storeId })
        }, 
        body: JSON.stringify({ shortId: order.shortId, code })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Pedido entregue!`);
        setDeliveryCodes(prev => ({ ...prev, [order.id]: '' }));
        fetchMyOrders(); 
      } else { 
        alert(`❌ Erro: ${data.error}`); 
      }
    } catch (e) { alert('Erro de conexão com o servidor da loja.'); }
  };

  if (storeStatus === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 font-black text-xl animate-pulse">
        Carregando aplicativo de entregas...
      </div>
    );
  }

  if (storeStatus === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-white">
        <span className="text-6xl mb-4">🚫</span>
        <h1 className="text-3xl font-black mb-2">Acesso Negado</h1>
        <p className="text-slate-400">Nenhuma loja encontrada para este endereço.</p>
      </div>
    );
  }

  if (showCamera) {
     return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-4">
           <div className="w-full max-w-sm bg-[#121212] p-8 rounded-3xl border border-white/5 shadow-2xl text-center">
              <h2 className="text-xl font-black text-amber-500 mb-4">
                 {authMode === 'register' ? 'Registo Facial' : 'Validação de Segurança'}
              </h2>
              <p className="text-xs text-zinc-400 mb-6">
                 {authMode === 'register' ? 'Precisamos da foto do seu rosto para validar as suas entregas futuras.' : 'Primeiro login do dia detetado. Valide o seu rosto com a central para iniciar o turno.'}
              </p>

              <div className="relative w-64 h-64 mx-auto mb-6 rounded-full overflow-hidden border-4 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                 {!capturedFace ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
                 ) : (
                    <img src={capturedFace} alt="Captura" className="w-full h-full object-cover transform -scale-x-100" />
                 )}
                 <canvas ref={canvasRef} width="300" height="300" className="hidden"></canvas>
              </div>

              {!capturedFace ? (
                 <button onClick={capturePhoto} className="w-full bg-amber-500 text-black font-black py-4 rounded-xl shadow-md active:scale-95 cursor-pointer">
                    📸 Tirar Foto
                 </button>
              ) : (
                 <div className="flex gap-2">
                    <button onClick={retakePhoto} className="flex-1 bg-white/10 text-white font-bold py-4 rounded-xl cursor-pointer">Repetir</button>
                    <button onClick={authMode === 'register' ? () => setShowCamera(false) : handleFaceVerify} disabled={isProcessing} className="flex-1 bg-emerald-500 text-black font-black py-4 rounded-xl shadow-md cursor-pointer">
                       {isProcessing ? 'Aguarde...' : '✔ Confirmar'}
                    </button>
                 </div>
              )}
           </div>
        </div>
     );
  }

  if (!loggedEmployee) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-sm bg-[#121212] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
          
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">🛵</span>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">Cânone Riders</h1>
            <p className="text-zinc-500 text-xs mt-2">Área do Entregador</p>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2 block">E-mail ou CPF</label>
                <input type="text" required value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} placeholder="O seu acesso" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-base focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2 block">A Sua Senha</label>
                <input type="password" required value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-base focus:outline-none focus:border-amber-500" />
              </div>
              <button type="submit" disabled={isProcessing} className={`w-full font-black text-lg py-4 rounded-2xl mt-4 transition-all shadow-md cursor-pointer ${isProcessing ? 'bg-amber-500/50 text-black/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95'}`}>
                {isProcessing ? 'Acessando...' : 'Entrar na Rota'}
              </button>
              <p className="text-center text-xs text-zinc-500 mt-4">
                 Novo por aqui? <button type="button" onClick={() => setAuthMode('register')} className="text-amber-500 font-bold underline cursor-pointer">Cadastre-se</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="text" required value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} placeholder="Nome Completo" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              <input type="text" required value={registerForm.cpf} onChange={(e) => setRegisterForm({...registerForm, cpf: e.target.value})} placeholder="CPF" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              <input type="email" required value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} placeholder="E-mail" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              <input type="tel" required value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} placeholder="Telemóvel" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              <input type="password" required value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} placeholder="Crie uma Senha" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              
              <button type="button" onClick={() => { setShowCamera(true); startCamera(); }} className={`w-full font-bold text-sm py-3 rounded-xl transition-all border cursor-pointer ${capturedFace ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-amber-500 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'}`}>
                 {capturedFace ? '✅ Rosto Registado (Alterar)' : '📸 Registar Rosto (Obrigatório)'}
              </button>

              <button type="submit" disabled={isProcessing} className="w-full font-black text-lg py-4 rounded-2xl mt-4 transition-all bg-amber-500 text-black active:scale-95 cursor-pointer">
                {isProcessing ? 'Aguarde...' : 'Criar Conta'}
              </button>
              <p className="text-center text-xs text-zinc-500 mt-4">
                 Já tem conta? <button type="button" onClick={() => setAuthMode('login')} className="text-amber-500 font-bold underline cursor-pointer">Fazer Login</button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans pb-10">
      <header className="bg-[#121212] border-b border-white/5 p-6 rounded-b-3xl shadow-2xl flex justify-between items-center z-10 sticky top-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-white">🛵 Rotas</h1>
          <p className="text-amber-500 font-bold text-sm tracking-wide mt-1">Piloto: {loggedEmployee.name.split(' ')[0]}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-xl font-bold shadow-md transition-colors text-sm cursor-pointer">
           Sair
        </button>
      </header>

      <div className="p-4 space-y-4 mt-4 max-w-lg mx-auto w-full">
        <div className="flex justify-between items-center px-2 mb-2">
           <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Suas entregas ativas</span>
           <span className="bg-white/10 text-white text-xs font-black px-3 py-1 rounded-full">{myOrders.length} Pendentes</span>
        </div>

        {myOrders.length === 0 ? (
          <div className="text-center p-10 bg-[#121212] rounded-3xl shadow-sm border border-white/5 mt-10">
            <span className="text-6xl mb-4 block grayscale opacity-50 animate-pulse">🚦</span>
            <p className="text-zinc-400 font-bold">Nenhuma entrega atribuída a você no momento.</p>
            <p className="text-zinc-600 text-xs mt-2">Aguarde o despacho da loja.</p>
          </div>
        ) : (
          myOrders.map(order => (
            <div key={order.id} className="bg-[#121212] p-5 rounded-3xl shadow-xl border border-white/5 relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>

              <div className="flex justify-between items-start pl-2">
                 <div>
                   <span className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-1">Pedido #{order.shortId}</span>
                   <p className="text-xl font-black text-white leading-tight">{order.client?.name}</p>
                 </div>
                 <div className="text-right">
                   <span className="text-xs font-bold text-zinc-500 block mb-1">A Receber</span>
                   <p className="text-emerald-400 font-black text-lg bg-emerald-400/10 px-3 py-1 rounded-xl">
                      R$ {Number(order.total).toFixed(2)}
                   </p>
                 </div>
              </div>

              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 mt-4 ml-2">
                 <p className="text-amber-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">📍 Endereço de Entrega</p>
                 <p className="text-sm font-bold text-zinc-300 leading-relaxed">{order.address.split('| OBS:')[0].split('| CUPOM')[0]}</p>
                 
                 {order.address.includes('| OBS:') && (
                    <p className="text-xs text-amber-500 mt-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                       <span className="font-bold">⚠️ OBS:</span> {order.address.split('| OBS:')[1]}
                    </p>
                 )}
              </div>

              <div className="flex gap-2 pt-4 mt-4 border-t border-white/5 items-end ml-2">
                 <div className="flex-1">
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1 uppercase tracking-wider">Senha do Cliente</label>
                    <input 
                       type="text" 
                       maxLength="4"
                       placeholder="Ex: 1234"
                       value={deliveryCodes[order.id] || ''}
                       onChange={(e) => setDeliveryCodes({...deliveryCodes, [order.id]: e.target.value.replace(/\D/g, '')})}
                       className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-center text-2xl font-black text-amber-500 tracking-[0.2em] focus:outline-none focus:border-amber-500 transition-colors"
                    />
                 </div>
                 <button 
                    onClick={() => handleConfirmDelivery(order)} 
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black px-4 h-[60px] rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95 transition-all cursor-pointer"
                 >
                    Confirmar
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}