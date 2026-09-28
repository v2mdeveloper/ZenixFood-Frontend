'use client';
import { useState, useEffect } from 'react';
import { db } from './lib/db'; 

export function useOfflineSync(API_URL, lojaId, token) {
  const [isOnline, setIsOnline] = useState(true);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Verifica o status inicial
    setIsOnline(navigator.onLine);
    checkFila();

    // Event Listeners Nativos do Navegador para Queda de Internet
    const handleOnline = () => { 
      setIsOnline(true); 
      syncFilaBacklog(); 
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Tenta sincronizar a fila a cada 10 segundos, caso o evento 'online' falhe
    const interval = setInterval(() => {
      if (navigator.onLine) syncFilaBacklog();
      checkFila();
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [lojaId]);

  // Conta quantos pedidos estão presos no computador do cliente
  const checkFila = async () => {
    try {
      const count = await db.fila_pedidos.where({ statusSync: 'PENDENTE' }).count();
      setPedidosPendentes(count);
    } catch (error) {
      console.error("Erro ao ler DexieDB:", error);
    }
  };

  // Esta é a função que o botão "Finalizar Pedido" do seu PDV vai chamar
  const processarPedido = async (pedidoPayload) => {
    try {
      // Guarda no banco local do navegador imediatamente (Zero Delay)
      const localId = await db.fila_pedidos.add({
        payload: pedidoPayload,
        statusSync: 'PENDENTE',
        lojaId: lojaId,
        createdAt: new Date().toISOString()
      });

      checkFila();

      // Se tiver internet, já tenta mandar pro Servidor agora mesmo
      if (navigator.onLine) {
        syncPedidoEspecifico(localId, pedidoPayload);
      }

      // Retorna sucesso para a interface, a pessoa já pode atender o próximo cliente
      return { success: true, localId, isOffline: !navigator.onLine };

    } catch (error) {
      console.error("Erro ao salvar no banco local:", error);
      return { success: false, error: "Falha ao gravar pedido localmente." };
    }
  };

  // Função interna para mandar um pedido específico pro backend
  const syncPedidoEspecifico = async (localId, payload) => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Sucesso na nuvem! Deleta do computador local
        await db.fila_pedidos.delete(localId);
      } else {
        // Se a nuvem recusou (ex: limite de fiado estourado), marcamos com erro para o gerente revisar
        await db.fila_pedidos.update(localId, { statusSync: 'ERRO_API' });
      }
    } catch (error) {
      // Se caiu aqui, a internet piscou bem na hora do envio. O PENDENTE se mantém.
    }
  };

  // Função que roda em segundo plano para limpar a fila
  const syncFilaBacklog = async () => {
    if (isSyncing || !navigator.onLine || !lojaId) return;
    setIsSyncing(true);

    try {
      const pendentes = await db.fila_pedidos.where({ statusSync: 'PENDENTE' }).toArray();
      
      for (const item of pendentes) {
        await syncPedidoEspecifico(item.id, item.payload);
      }
    } catch (error) {
      console.error("Erro na sincronização em background:", error);
    } finally {
      setIsSyncing(false);
      checkFila();
    }
  };

  return { 
    isOnline, 
    pedidosPendentes, 
    processarPedido 
  };
}