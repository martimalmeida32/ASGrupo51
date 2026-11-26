import { expect, request, test } from '@playwright/test';
import type { PedidoResponse } from '../src/types';

test('TC-UC06-03 — Registo telefónico completo com aviso TNUD/Táxi e confirmação por SMS', async ({
  page
}) => {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  await api.post('/test/clock', { data: { now: '2026-11-20T10:00:00Z' } });

  await page.goto('/');
  await page.getByTestId('tab-telefone').click();

  await page.getByTestId('utente-search').fill('912345678');
  await page.getByTestId('utente-search-button').click();
  await expect(page.getByTestId('telefone-name')).toHaveText('Maria Ferreira');
  await expect(page.getByTestId('telefone-card')).toHaveText('#MC-0205');
  await expect(page.getByTestId('telefone-phone')).toHaveText('912345678');
  await expect(page.getByTestId('telefone-mobility-profile')).toHaveText('Acompanhante');

  await page.getByTestId('utente-search').fill('MC-0205');
  await page.getByTestId('utente-search-button').click();
  await expect(page.getByTestId('telefone-name')).toHaveText('Maria Ferreira');

  await page.getByTestId('telefone-destination').selectOption('centro-saude-aveiro');
  await page.getByTestId('telefone-consultation-at').fill('2026-11-25T15:00');
  await page.getByTestId('telefone-public-support').check();
  await expect(page.getByTestId('telefone-public-support-message')).toContainText(
    'TNUD / Táxi Saúde Municipal'
  );

  const options = page.getByTestId('telefone-option-voluntario');
  await expect(options).toContainText('Voluntário Carlos Mendes');
  await expect(options).toContainText('Recomendado');
  await page.getByTestId('select-telefone-voluntario').check();

  const startedAt = Date.now();
  await page.getByTestId('telefone-confirm').click();
  await expect(page.getByTestId('telefone-result')).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(5000);

  const requestId = (await page.getByTestId('telefone-request-id').textContent())
    ?.replace('#', '')
    .trim();
  expect(requestId).toBeTruthy();
  await expect(page.getByTestId('telefone-request-status')).toHaveText('Confirmado');
  await expect(page.getByTestId('telefone-request-profile')).toHaveText('Acompanhante');
  await expect(page.getByTestId('telefone-trips')).toContainText('Ida');
  await expect(page.getByTestId('telefone-trips')).toContainText('Regresso');
  await expect(page.getByTestId('telefone-sms')).toContainText('912345678');
  await expect(page.getByTestId('telefone-sms')).toContainText('25/11/2026 às 15:00');
  await expect(page.getByTestId('telefone-sms')).toContainText('Entrada principal');

  const stored = (await (await api.get(`/pedidos/${requestId}`)).json()) as PedidoResponse;
  expect(stored.status).toBe('Confirmado');
  expect(stored.publicSupportEligible).toBe(true);
  expect(stored.plannedEnd).toBe('2026-11-25T15:45:00.000Z');
  expect(stored.trips).toHaveLength(2);
  const outbound = stored.trips.find((trip) => trip.direction === 'OUTBOUND')!;
  const returnTrip = stored.trips.find((trip) => trip.direction === 'RETURN')!;
  expect(outbound.tripId).not.toBe(returnTrip.tripId);
  expect(outbound.status).toBe('AGENDADA');
  expect(outbound.pickupAt).toBe('2026-11-25T14:15');
  expect(returnTrip.status).toBe('ESTAFETA_FLEXIVEL');

  const smsResponse = await api.get('/sms');
  const smsReceivedAt = Date.now();
  const sms = (await smsResponse.json()) as {
    messages: { requestId: string; recipient: string; message: string; sentAt: string }[];
  };
  const confirmation = sms.messages.find(
    (item) => item.requestId === requestId && item.recipient === '912345678'
  );
  expect(confirmation).toBeTruthy();
  expect(confirmation!.message).toContain('25/11/2026 às 15:00');
  expect(confirmation!.message).toContain('Entrada principal de Centro de Saúde de Aveiro');
  expect(smsReceivedAt - startedAt).toBeLessThan(5000);
});
