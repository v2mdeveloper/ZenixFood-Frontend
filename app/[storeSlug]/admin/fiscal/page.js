'use client';
import { useState, useEffect } from 'react';

export default function FilaFiscal() {
  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  const [pedidos, setPedidos] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  //Helper local para garantir o envio do x-store-id e Token JWT
const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    //SE O BACKEND BARRAR POR FALTA DE PAGAMENTO:
    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; // Redireciona para a tela de aviso
      }
    }

    return response;
  };
  // Busca os pedidos concluídos do backend da loja atual
  useEffect(() => {
    fetchWithStore(`${API_URL}/api/admin/orders?status=concluido`)
      .then(res => res.json())
      .then(data => setPedidos(data))
      .catch(err => console.error("Erro ao carregar pedidos:", err));
  }, [API_URL]);

  const emitirEImprimir = async (orderId) => {
    setLoadingId(orderId);
    try {
      // 1. Dispara a emissão na Focus NFe com suporte multi-tenant
      const response = await fetchWithStore(`${API_URL}/api/admin/orders/${orderId}/fiscal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.success) {
        // 2. A nota foi emitida! Pegamos o link do PDF (Danfe)
        const urlDanfe = `https://api.focusnfe.com.br${data.data?.caminho_danfe || data.fiscalData?.urlDanfe || ''}`;
        
        // 3. Chamada para a impressora térmica local (Spooler na Porta 8080)
        try {
          await fetch('http://localhost:8080/imprimir-danfe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urlDanfe })
          });
        } catch (printErr) {
          console.error("Erro no spooler local de impressão da DANFE", printErr);
        }

        // 4. Remove o pedido da fila ou atualiza o status na tela
        setPedidos(prev => prev.filter(p => p.id !== orderId));
      } else {
        alert(`Erro na emissão: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fila de Emissão Fiscal</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {pedidos.map((pedido) => (
            <li key={pedido.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Pedido #{pedido.shortId}
                </p>
                <p className="text-sm text-gray-500">
                  Chegou às: {new Date(pedido.createdAt).toLocaleTimeString()} | Total: R$ {pedido.total}
                </p>
              </div>
              
              <button
                onClick={() => emitirEImprimir(pedido.id)}
                disabled={loadingId === pedido.id}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingId === pedido.id ? 'Processando...' : 'Emitir e Imprimir'}
              </button>
            </li>
          ))}
          {pedidos.length === 0 && (
            <p className="p-4 text-gray-500">Nenhum pedido aguardando emissão.</p>
          )}
        </ul>
      </div>
    </div>
  );
}