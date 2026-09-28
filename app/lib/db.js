import Dexie from 'dexie';

// 1. Cria a instância do Banco de Dados Local
export const db = new Dexie('ZenixFoodLocalDB');

// 2. Define a estrutura das tabelas locais
// O '++id' significa que o Dexie vai gerar um Auto-Incremento localmente
db.version(1).stores({
  // Tabela para guardar os pedidos que foram feitos sem internet
  fila_pedidos: '++id, lojaId, statusSync, createdAt',
  
  // Tabelas de Cache (para abrir o PDV mesmo sem net)
  cache_categorias: 'id, lojaId, order',
  cache_produtos: 'id, lojaId, categoryId',
  cache_clientes: 'id, lojaId, cpf'
});