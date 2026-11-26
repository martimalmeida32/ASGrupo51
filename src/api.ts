import type {
  CreatePedidoInput,
  CreateTelephonePedidoInput,
  PedidoResponse,
  TransportOption,
  UtenteResponse
} from './types';

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

export async function pesquisarUtentes(query: string): Promise<UtenteResponse[]> {
  const response = await fetch(`/utentes?q=${encodeURIComponent(query)}`);
  const payload = (await readJson(response)) as { utentes: UtenteResponse[] };
  return payload.utentes;
}

export async function registrarPedidoTelefonico(
  input: CreateTelephonePedidoInput
): Promise<PedidoResponse> {
  const response = await fetch('/pedidos/telefonicos', {
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

export async function selecionarTransporte(
  requestId: string,
  optionId: string
): Promise<PedidoResponse> {
  const response = await fetch(`/pedidos/${encodeURIComponent(requestId)}/selecao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId })
  });
  return (await readJson(response)) as PedidoResponse;
}
