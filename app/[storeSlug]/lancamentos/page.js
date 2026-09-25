'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LancamentosPDV() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params?.storeSlug || '';

  // Estados dos Dados
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  
  // Estados do Carrinho e UI
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Pagamento (Integração Maquininha)
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isSmartPOS, setIsSmartPOS] = useState(false);

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_employeeToken') || localStorage.getItem('zenix_token');
    const headers = { 
      'x-loja-slug': storeSlug,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers 
    };
    return fetch(url, { ...options, headers });
  };

  // DETECÇÃO DA MAQUININHA E ESCUTA DE EVENTOS NATIVOS
  useEffect(() => {
    // Se o objeto ZenixPOS foi injetado pelo nosso App Android, estamos na maquininha
    if (typeof window !== 'undefined' && window.ZenixPOS) {
      setIsSmartPOS(true);
    }

    // Funções que o Android vai chamar de volta quando o cliente tirar o cartão
    window.pagamentoAprovado = (transacaoId) => {
      setPaymentStatus('APROVADO');
      alert(`✅ Pagamento Aprovado! Transação: ${transacaoId}`);
      fecharMesaOuComanda(transacaoId);
    };

    window.pagamentoRecusado = (motivoErro) => {
      setPaymentStatus('RECUSADO');
      alert(`❌ Erro no cartão: ${motivoErro}`);
    };

    return () => {
      delete window.pagamentoAprovado;
      delete window.pagamentoRecusado;
    };
  }, []);

  // 2. BUSCA DE DADOS (Categorias e Produtos)
  useEffect(() => {
    if (storeSlug) fetchData();
  }, [storeSlug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetchWithStore(`${API_URL}/api/categories`),
        fetchWithStore(`${API_URL}/api/products`)
      ]);

      if (catRes.ok && prodRes.ok) {
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(catData);
        setProducts(prodData.filter(p => p.isActive));
        if (catData.length > 0) setActiveCategory(catData[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar cardápio:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. LÓGICA DO CARRINHO
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, observacao: '' }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQtd = item.quantity + delta;
        return newQtd > 0 ? { ...item, quantity: newQtd } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

  // A PONTE COM A MAQUININHA PAGBANK/STONE (ANDROID)
  const handleCheckout = async (metodo) => {
    if (cart.length === 0) return alert("O carrinho está vazio.");

    if (metodo === 'CREDITO_POS' || metodo === 'DEBITO_POS') {
      if (isSmartPOS) {
        setPaymentStatus('PROCESSANDO');
        const valorEmCentavos = Math.round(cartTotal * 100);
        const tipoCartao = metodo === 'CREDITO_POS' ? 'credito' : 'debito';
        const identificadorPedido = `PDV-${Date.now()}`;
        
        // ENVIA COMANDO PARA O ANDROID LIGAR A LEITORA DE CARTÃO
        window.ZenixPOS.iniciarPagamento(valorEmCentavos, tipoCartao, identificadorPedido);
      } else {
        alert("⚠️ Você está no navegador. A leitura física de cartão só funciona dentro da Maquininha Smart POS do ZenixFood.");
      }
    } else {
      // Dinheiro ou Pix Manual (Não precisa da leitora da maquininha)
      fecharMesaOuComanda(`MANUAL-${Date.now()}`);
    }
  };

  const fecharMesaOuComanda = async (referencia) => {
    try {
       // Aqui vai a sua requisição normal para o backend criar/fechar o pedido
       const payload = {
          items: cart.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price, notes: i.observacao })),
          total: cartTotal,
          paymentMethod: 'SMART_POS',
          reference: referencia,
          source: 'GARCOM_APP'
       };

       const res = await fetchWithStore(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
       });

       if (res.ok) {
          setCart([]);
          setIsCartOpen(false);
          setPaymentStatus('');
          alert("Pedido enviado para a cozinha com sucesso!");
       }
    } catch (e) {
       alert("Erro ao fechar pedido no servidor.");
    }
  };

  const filteredProducts = products.filter(p => 
    (activeCategory ? p.categoryId === activeCategory : true) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-[#f58220] font-black">Carregando Cardápio...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans relative overflow-hidden">
      
      {/* HEADER FIXO - OTIMIZADO PARA MAQUININHA */}
      <header className="bg-[#0e4a56] text-white p-4 shadow-md z-10 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-300 font-bold uppercase">Atendimento</span>
            <span className="font-black text-lg leading-none">Mesa Livre / Balcão</span>
          </div>
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl text-xs font-bold active:bg-white/20">
            Voltar
          </button>
        </div>
        
        {/* BUSCA RÁPIDA (Com dedos grandes) */}
        <input 
          type="text" 
          placeholder="🔍 Buscar produto..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-[#f58220]"
        />
      </header>

      {/* ROLAGEM HORIZONTAL DE CATEGORIAS */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="flex overflow-x-auto hide-scrollbar p-3 gap-2">
          <button 
            onClick={() => setActiveCategory('')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-black transition-colors ${activeCategory === '' ? 'bg-[#f58220] text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-black transition-colors ${activeCategory === cat.id ? 'bg-[#f58220] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE PRODUTOS (SCROLLÁVEL) */}
      <main className="flex-1 overflow-y-auto p-3 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map(product => (
            <div key={product.id} onClick={() => addToCart(product)} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm active:scale-95 transition-transform flex flex-col h-full cursor-pointer">
              {product.imageUrl ? (
                <div className="w-full h-24 rounded-xl bg-slate-100 mb-2 overflow-hidden shrink-0">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-20 rounded-xl bg-slate-100 mb-2 flex items-center justify-center text-2xl shrink-0">🍔</div>
              )}
              <h3 className="font-bold text-slate-800 text-xs leading-tight mb-1 flex-1">{product.name}</h3>
              <p className="font-black text-[#0e4a56] text-sm">R$ {Number(product.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </main>

      {/* BARRA FIXA DO CARRINHO (BOTTOM BAR) */}
      {cart.length > 0 && (
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-20 shrink-0">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#f58220] text-white p-4 rounded-2xl font-black text-sm flex justify-between items-center shadow-lg active:bg-[#e07318] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-lg">{cart.reduce((acc, i) => acc + i.quantity, 0)} itens</span>
            </div>
            <span>Ver Comanda • R$ {cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* MODAL DO CARRINHO / CHECKOUT (OCUPA TELA TODA NO SMART POS) */}
      {isCartOpen && (
        <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col animate-fade-in-up">
          <header className="bg-[#0e4a56] text-white p-5 flex justify-between items-center shrink-0">
            <h2 className="font-black text-lg">Resumo do Pedido</h2>
            <button onClick={() => setIsCartOpen(false)} className="bg-white/20 w-8 h-8 rounded-full font-bold active:bg-white/30">✕</button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div className="flex-1 pr-2">
                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                  <p className="text-[#0e4a56] font-black text-xs">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1 shrink-0">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg font-black text-slate-600 shadow-sm active:scale-90">-</button>
                  <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-[#0e4a56] rounded-lg font-black text-white shadow-sm active:scale-90">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 border-t border-slate-200 rounded-t-3xl shadow-[0_-15px_30px_rgba(0,0,0,0.1)] shrink-0">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 font-bold">Total a Cobrar</span>
              <span className="text-3xl font-black text-slate-900">R$ {cartTotal.toFixed(2)}</span>
            </div>

            {paymentStatus === 'PROCESSANDO' ? (
              <div className="bg-amber-100 border border-amber-300 p-6 rounded-2xl text-center">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="font-black text-amber-800 text-lg">Insira o cartão na máquina...</p>
                <p className="text-xs text-amber-600 font-bold mt-1">Aguardando senha do cliente</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleCheckout('CREDITO_POS')} className="bg-[#0e4a56] hover:bg-[#0a3842] text-white p-4 rounded-xl font-black text-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
                  <span className="text-xl">💳</span>
                  Crédito
                </button>
                <button onClick={() => handleCheckout('DEBITO_POS')} className="bg-[#0e4a56] hover:bg-[#0a3842] text-white p-4 rounded-xl font-black text-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
                  <span className="text-xl">💳</span>
                  Débito
                </button>
                <button onClick={() => handleCheckout('DINHEIRO')} className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-black text-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
                  <span className="text-xl">💵</span>
                  Dinheiro
                </button>
                <button onClick={() => handleCheckout('PIX')} className="bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-xl font-black text-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
                  <span className="text-xl">💠</span>
                  Pix
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ESTILOS EXTRAS PARA OCULTAR BARRA DE SCROLL */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}