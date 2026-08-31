'use client';
import { useState, useEffect } from 'react';

export default function FilaFiscal() {
  const [pedidos, setPedidos] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // Busca os pedidos do backend (exemplo de chamada)
  useEffect(() => {
    fetch('/api/admin/orders?status=concluido')
      .then(res => res.json())
      .then(data => setPedidos(data))
      .catch(err => console.error("Erro ao carregar pedidos:", err));
  }, []);

  const emitirEImprimir = async (orderId) => {
    setLoadingId(orderId);
    try {
      // 1. Dispara a emissão na Focus NFe
      const response = await fetch(`/api/admin/orders/${orderId}/fiscal`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // 2. A nota foi emitida! Pegamos o link do PDF (Danfe)
        const urlDanfe = `https://api.focusnfe.com.br${data.data.caminho_danfe}`;
        
        // 3. Chamada para a sua função de impressão atual
        // Substitua 'suaFuncaoDeImprimir' pelo método que você já usa hoje
        await suaFuncaoDeImprimir(urlDanfe);

        // 4. Remove o pedido da fila ou atualiza o status na tela
        setPedidos(prev => prev.filter(p => p.id !== orderId));
      } else {
        alert(`Erro na emissão: ${data.error}`);
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
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
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