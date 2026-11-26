import { expect, request, test } from '@playwright/test';
import type { PedidoResponse } from '../src/types';

test('TC-UC04-01 — Pedido automático do regresso 25 minutos antes do fim previsto', async () => {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });

  const created = await api.post('/pedidos', {
    data: {
      submissionId: 'tc-uc04-01-regresso',
      requesterType: 'familiar-cuidador',
      userId: 'MC-0142',
      destinationId: 'hospital-infante-d-pedro',
      consultationAt: '2026-11-24T10:30',
      mobilityNeeds: ['bengala']
    }
  });
  expect(created.ok()).toBeTruthy();
  const requestId = ((await created.json()) as PedidoResponse).requestId;

  const selected = await api.post(`/pedidos/${requestId}/selecao`, {
    data: { optionId: 'voluntario' }
  });
  expect(selected.ok()).toBeTruthy();
  const confirmed = (await selected.json()) as PedidoResponse;
  expect(confirmed.status).toBe('Confirmado');
  expect(confirmed.plannedEnd).toBe('2026-11-24T11:15:00.000Z');
  expect(confirmed.trips).toHaveLength(2);

  const outbound = confirmed.trips.find((trip) => trip.direction === 'OUTBOUND');
  const initialReturn = confirmed.trips.find((trip) => trip.direction === 'RETURN');
  expect(outbound).toBeTruthy();
  expect(initialReturn).toBeTruthy();
  expect(initialReturn!.status).toBe('ESTAFETA_FLEXIVEL');
  expect(initialReturn!.pickupAt).toBeNull();
  expect(outbound!.tripId).not.toBe(initialReturn!.tripId);

  const completed = await api.post(`/viagens/${outbound!.tripId}/concluir`);
  expect(completed.ok()).toBeTruthy();

  const before = await api.post('/test/clock', {
    data: { now: '2026-11-24T10:49:00Z' }
  });
  expect(before.ok()).toBeTruthy();
  await new Promise((resolve) => setTimeout(resolve, 1200));
  let pedido = (await (await api.get(`/pedidos/${requestId}`)).json()) as PedidoResponse;
  expect(pedido.trips.find((trip) => trip.direction === 'RETURN')!.status).toBe(
    'ESTAFETA_FLEXIVEL'
  );

  const startedAt = Date.now();
  const trigger = await api.post('/test/clock', {
    data: { now: '2026-11-24T10:50:00Z' }
  });
  expect(trigger.ok()).toBeTruthy();
  await expect
    .poll(async () => {
      const atualizado = (await (await api.get(`/pedidos/${requestId}`)).json()) as PedidoResponse;
      return atualizado.trips.find((trip) => trip.direction === 'RETURN')!.status;
    }, { timeout: 2500 })
    .toBe('EM_ROTA');
  expect(Date.now() - startedAt).toBeLessThan(3000);

  pedido = (await (await api.get(`/pedidos/${requestId}`)).json()) as PedidoResponse;
  const returnTrip = pedido.trips.find((trip) => trip.direction === 'RETURN')!;
  expect(pedido.status).toBe('Confirmado');
  expect(pedido.trips.find((trip) => trip.direction === 'OUTBOUND')!.status).toBe('CONCLUIDA');
  expect(returnTrip.status).toBe('EM_ROTA');
  expect(returnTrip.pickupAt).toBe('2026-11-24T11:15:00.000Z');
  expect(returnTrip.triggeredAt).toBe('2026-11-24T10:50:00.000Z');

  const recipients = pedido.notifications.map((item) => item.recipient);
  expect(recipients).toContain('voluntario@acompanhar.pt');
  expect(recipients).toContain('utente@acompanhar.pt');
  expect(recipients).toContain('familiar@acompanhar.pt');
  for (const notification of pedido.notifications.filter((item) =>
    ['utente@acompanhar.pt', 'familiar@acompanhar.pt'].includes(item.recipient)
  )) {
    expect(notification.message).toContain('11:15');
    expect(notification.message).toContain('Voluntário Carlos Mendes');
  }

  const sms = await api.get('/sms');
  expect(sms.ok()).toBeTruthy();
  const messages = ((await sms.json()) as { messages: { requestId: string; recipient: string; message: string }[] }).messages;
  const pedidoSms = messages.filter((item) => item.requestId === requestId);
  expect(pedidoSms).toHaveLength(2);
  expect(pedidoSms.map((item) => item.recipient)).toEqual([
    '+351912000014',
    '+351912000015'
  ]);
  expect(pedidoSms[0].message).toContain('11:15');

  const repeat = await api.post('/regressos/processar');
  expect(((await repeat.json()) as { acionados: number }).acionados).toBe(0);
  const repeatedPedido = (await (
    await api.get(`/pedidos/${requestId}`)
  ).json()) as PedidoResponse;
  expect(repeatedPedido.notifications).toHaveLength(pedido.notifications.length);
  const repeatedSms = (await (await api.get('/sms')).json()) as { messages: unknown[] };
  expect(repeatedSms.messages).toHaveLength(messages.length);
});
