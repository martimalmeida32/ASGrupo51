import { expect, request, test } from '@playwright/test';
import type { PedidoResponse } from '../src/types';

const expectedDates = [
  '27/11/2026 às 11:00',
  '04/12/2026 às 11:00',
  '11/12/2026 às 11:00',
  '18/12/2026 às 11:00',
  '25/12/2026 às 11:00'
];

const expectedIsoDates = [
  '2026-11-27T11:00:00Z',
  '2026-12-04T11:00:00Z',
  '2026-12-11T11:00:00Z',
  '2026-12-18T11:00:00Z',
  '2026-12-25T11:00:00Z'
];

test('TC-UC01-04 — Criação de pedido recorrente semanal para 4 semanas e destino não listado', async ({
  page
}) => {
  await page.goto('/');

  await page.getByTestId('requester-family').check();
  await page.getByTestId('destination-search').fill('Clínica Fisioterapia Ria (Aveiro)');
  await page.getByTestId('destination-custom').click();
  await page.getByTestId('consultation-at').fill('2026-11-27T11:00');
  await page.getByTestId('recorrencia-semanal').check();
  await page.getByTestId('need-bengala').check();
  await page.getByTestId('submit-pedido').click();

  await expect(page.getByTestId('validation-error')).toHaveCount(0);
  await expect(page.getByTestId('selected-destination')).toContainText(
    'Clínica Fisioterapia Ria (Aveiro)'
  );
  await expect(page.getByTestId('mobility-profile')).toHaveText('Bengala');
  await expect(page.getByTestId('series-id')).toContainText('Série: SER-');

  const seriesRequests = page.getByTestId('series-request');
  await expect(seriesRequests).toHaveCount(5);
  expect(await page.getByTestId('series-request-date').allTextContents()).toEqual(expectedDates);
  for (const seriesRequest of await seriesRequests.all()) {
    await expect(seriesRequest).toContainText('A escolher o meio');
  }
  await expect(page.getByTestId('series-validation-label')).toHaveCount(5);
  for (const label of await page.getByTestId('series-validation-label').all()) {
    await expect(label).toHaveText('Destino não listado - validação prévia');
  }

  const ids = (await page.getByTestId('series-request-id').allTextContents()).map((value) =>
    value.replace('#', '').trim()
  );
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const bodies: PedidoResponse[] = [];
  for (const id of ids) {
    const response = await api.get(`/pedidos/${id}`);
    expect(response.ok()).toBeTruthy();
    bodies.push(await response.json());
  }

  expect(bodies.map((body) => body.consultationAt)).toEqual(expectedIsoDates);
  expect(bodies.every((body) => body.status === 'A escolher o meio')).toBeTruthy();
  expect(bodies.every((body) => body.customDestination === true)).toBeTruthy();
  expect(
    bodies.every((body) => body.validationLabel === 'Destino não listado - validação prévia')
  ).toBeTruthy();
  expect(bodies.every((body) => body.destination === 'Clínica Fisioterapia Ria (Aveiro)')).toBeTruthy();
  expect(bodies.every((body) => body.seriesId === bodies[0].seriesId)).toBeTruthy();
});
