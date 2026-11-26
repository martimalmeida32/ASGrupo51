import { expect, request, test } from '@playwright/test';
import type { PedidoResponse } from '../src/types';

test('TC-UC02-03 — Criação independente das viagens de ida e de regresso após seleção', async ({
  page
}) => {
  await page.goto('/');

  await page.getByTestId('requester-family').check();
  await page.getByTestId('destination-search').fill('Infante D. Pedro');
  await page.getByTestId('destination-hospital-infante-d-pedro').click();
  await page.getByTestId('consultation-at').fill('2026-11-24T10:30');
  await page.getByTestId('need-bengala').check();
  await page.getByTestId('submit-pedido').click();

  await page.getByTestId('select-transport-voluntario').check();
  await page.getByTestId('confirm-selection').click();

  await expect(page.getByTestId('selection-error')).toHaveCount(0);
  await expect(page.getByTestId('request-status')).toHaveText('Confirmado');
  await expect(page.getByTestId('trip-outbound')).toContainText('#VG-201');
  await expect(page.getByTestId('trip-outbound')).toContainText('Recolha: 24/11/2026 às 09:45');
  await expect(page.getByTestId('trip-return')).toContainText('#VG-202');
  await expect(page.getByTestId('trip-return')).toContainText('ESTAFETA_FLEXIVEL');

  const requestId = (await page.getByTestId('request-id').textContent())?.replace('#', '').trim();
  expect(requestId).toBeTruthy();

  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const response = await api.get(`/pedidos/${requestId}`);
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as PedidoResponse;
  expect(body.status).toBe('Confirmado');
  expect(body.selection?.optionId).toBe('voluntario');
  expect(body.trips).toHaveLength(2);
  expect(body.trips.map((trip) => trip.direction)).toEqual(['OUTBOUND', 'RETURN']);
  expect(body.trips.every((trip) => trip.transportOptionId === 'voluntario')).toBeTruthy();

  const repeated = await api.post(`/pedidos/${requestId}/selecao`, {
    data: { optionId: 'voluntario' }
  });
  expect(repeated.status()).toBe(200);
  const repeatedBody = (await repeated.json()) as PedidoResponse;
  expect(repeatedBody.trips).toHaveLength(2);
  expect(repeatedBody.trips.map((trip) => trip.tripId)).toEqual(['VG-201', 'VG-202']);
});
