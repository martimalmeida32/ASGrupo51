import type { CreatePedidoInput } from './types';

export interface PedidoPendente {
  id: string;
  input: CreatePedidoInput;
  createdAt: string;
}

const DATABASE_NAME = 'mobicare-offline';
const STORE_NAME = 'pedidos-pendentes';
const DATABASE_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o armazenamento local.'));
  });
}

export async function enqueuePedido(input: CreatePedidoInput): Promise<PedidoPendente> {
  const database = await openDatabase();
  const item: PedidoPendente = {
    id: input.submissionId,
    input,
    createdAt: new Date().toISOString()
  };

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(item);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível guardar o pedido localmente.'));
  });

  database.close();
  return item;
}

export async function listarPedidosPendentes(): Promise<PedidoPendente[]> {
  const database = await openDatabase();

  const items = await new Promise<PedidoPendente[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as PedidoPendente[]);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível ler os pedidos pendentes.'));
  });

  database.close();
  return items;
}

export async function removerPedidoPendente(id: string): Promise<void> {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível remover o pedido pendente.'));
  });

  database.close();
}
