import type { CreatePedidoInput, PedidoResponse, TransportOption } from './types';

async function readJson(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error ?? 'Não foi possível concluir a operação.');
  }
  return payload;
}

export async function criarPedido(input: CreatePedidoInput): Promise<PedidoResponse> {
  const response = await fetch('/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return (await readJson(response)) as PedidoResponse;
}

export async function obterOpcoes(requestId: string): Promise<TransportOption[]> {
  const response = await fetch(`/pedidos/${encodeURIComponent(requestId)}/opcoes`);
  const payload = (await readJson(response)) as { options: TransportOption[] };
  return payload.options;
}
