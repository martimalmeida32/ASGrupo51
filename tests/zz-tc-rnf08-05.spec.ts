import { expect, request, test } from '@playwright/test';
import type { PedidoResponse } from '../src/types';

test('TC-RNF08-05 — Pedido pendente sobrevive ao recarregamento offline e sincroniza sem duplicados', async ({
  context,
  page
}) => {
  await page.goto('/');
  await expect(page.getByTestId('connection-status')).toContainText('Ligação disponível');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  await context.setOffline(true);
  await page.getByTestId('requester-family').check();
  await page.getByTestId('destination-search').fill('Centro de Saúde de Aveiro');
  await page.getByTestId('destination-centro-saude-aveiro').click();
  await page.getByTestId('consultation-at').fill('2026-11-28T09:30');
  await page.getByTestId('need-bengala').check();
  await page.getByTestId('submit-pedido').click();

  const pending = page.getByTestId('pending-request');
  await expect(pending).toHaveCount(1);
  const submissionId = await pending.getAttribute('data-submission-id');
  expect(submissionId).toBeTruthy();

  await page.reload();
  await expect(page.getByTestId('tab-utente')).toBeVisible();
  await expect(pending).toHaveCount(1);
  await expect(pending).toContainText('Pendente de sincronização');
  expect(await pending.getAttribute('data-submission-id')).toBe(submissionId);
  await expect(page.getByTestId('request-id')).toHaveCount(0);

  await context.setOffline(false);
  await expect(page.getByTestId('connection-status')).toContainText('Ligação disponível');
  await expect(pending).toHaveCount(0);
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
