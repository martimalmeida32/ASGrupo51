import { expect, request, test } from '@playwright/test';
import type { PedidoResponse } from '../src/types';

test('TC-UC01-05 — Gravação local e sincronização automática de pedido em modo offline [caso de falha de rede]', async ({
  context,
  page
}) => {
  await page.goto('/');
  await expect(page.getByTestId('connection-status')).toContainText('Ligação disponível');

  await context.setOffline(true);
  await expect(page.getByTestId('connection-status')).toContainText('Sem ligação');

  await page.getByTestId('requester-family').check();
  await page.getByTestId('destination-search').fill('Centro de Saúde de Aveiro');
  await page.getByTestId('destination-centro-saude-aveiro').click();
  await page.getByTestId('consultation-at').fill('2026-11-28T09:30');
  await page.getByTestId('need-bengala').check();
  await page.getByTestId('submit-pedido').click();

  await expect(page.getByTestId('pending-request')).toHaveCount(1);
  await expect(page.getByTestId('pending-request')).toContainText('Pendente de sincronização');
  await expect(page.getByTestId('request-id')).toHaveCount(0);

  const submissionId = await page
    .getByTestId('pending-request')
    .getAttribute('data-submission-id');
  expect(submissionId).toBeTruthy();

  await context.setOffline(false);
  await expect(page.getByTestId('connection-status')).toContainText('Ligação disponível');
  await expect(page.getByTestId('pending-request')).toHaveCount(0);
  await expect(page.getByTestId('sync-message')).toContainText('sincronizados');

  const requestId = (await page.getByTestId('request-id').textContent())?.replace('#', '').trim();
  expect(requestId).toBeTruthy();

  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const response = await api.get(`/pedidos/${requestId}`);
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as PedidoResponse;
  expect(body.consultationAt).toBe('2026-11-28T09:30:00Z');
  expect(body.destination).toBe('Centro de Saúde de Aveiro');

  const duplicate = await api.post('/pedidos', {
    data: {
      submissionId,
      requesterType: 'familiar-cuidador',
      userId: 'MC-0142',
      destinationId: 'centro-saude-aveiro',
      consultationAt: '2026-11-28T09:30',
      mobilityNeeds: ['bengala']
    }
  });
  expect(duplicate.status()).toBe(200);
  expect((await duplicate.json() as PedidoResponse).requestId).toBe(requestId);
});
