import { expect, request, test } from '@playwright/test';
import type { TransportOption } from '../src/types';

test('TC-UC02-01 — Filtragem por compatibilidade e ordenação em cascata', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('requester-family').check();
  await page.getByTestId('destination-search').fill('Infante D. Pedro');
  await page.getByTestId('destination-hospital-infante-d-pedro').click();
  await page.getByTestId('consultation-at').fill('2026-11-24T10:30');
  await page.getByTestId('need-bengala').check();
  await page.getByTestId('submit-pedido').click();

  const options = page.getByTestId('transport-option');
  await expect(options).toHaveCount(3);
  expect(await options.nth(0).textContent()).toContain('Voluntário Carlos Mendes');
  expect(await options.nth(0).textContent()).toContain('Recomendado');
  expect(await options.nth(0).textContent()).toContain('0,00 €');
  expect(await options.nth(1).textContent()).toContain('Viatura Adaptada de Parceiro');
  expect(await options.nth(2).textContent()).toContain('Operador Profissional');

  const requestId = (await page.getByTestId('request-id').textContent())?.replace('#', '').trim();
  expect(requestId).toBeTruthy();

  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const startedAt = Date.now();
  const response = await api.get(`/pedidos/${requestId}/opcoes`);
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { options: TransportOption[] };
  expect(Date.now() - startedAt).toBeLessThan(3000);
  expect(body.options.map((option) => option.id)).toEqual([
    'voluntario',
    'viatura-adaptada',
    'operador-profissional'
  ]);

  const restricted = await api.post('/pedidos', {
    data: {
      submissionId: 'tc-uc02-01-maca',
      requesterType: 'proprio-utente',
      userId: 'MC-0142',
      destinationId: 'hospital-infante-d-pedro',
      consultationAt: '2026-11-25T10:30',
      mobilityNeeds: ['maca']
    }
  });
  expect(restricted.ok()).toBeTruthy();
  const restrictedId = ((await restricted.json()) as { requestId: string }).requestId;
  const restrictedOptions = await api.get(`/pedidos/${restrictedId}/opcoes`);
  expect((await restrictedOptions.json() as { options: TransportOption[] }).options).toEqual([
    expect.objectContaining({ id: 'operador-profissional' })
  ]);
});
