import { expect, request, test } from '@playwright/test';
import type { PedidoResponse } from '../src/types';

test('TC-UC01-03 — Sinalização de possível direito a TNUD ou Táxi Municipal', async ({
  page
}) => {
  await page.goto('/');

  await page.getByTestId('requester-family').check();
  await page.getByTestId('destination-search').fill('Ílhavo');
  await page.getByTestId('destination-centro-saude-ilhavo').click();
  await page.getByTestId('consultation-at').fill('2026-11-26T14:00');
  await page.getByTestId('need-bengala').check();
  await page.getByTestId('public-support-request').check();
  await page.getByTestId('submit-pedido').click();

  await expect(page.getByTestId('validation-error')).toHaveCount(0);
  await expect(page.getByTestId('public-support-flag')).toContainText('triagem prévia');
  await expect(page.getByTestId('public-support-message')).toHaveText(
    'Encaminhamento prioritário para TNUD / Táxi Saúde Municipal'
  );
  await expect(page.getByTestId('validation-label')).toContainText(
    'Isenção de taxas moderadoras por insuficiência económica'
  );
  await expect(page.getByTestId('transport-options')).toBeVisible();

  const requestId = (await page.getByTestId('request-id').textContent())?.replace('#', '').trim();
  expect(requestId).toBeTruthy();

  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const response = await api.get(`/pedidos/${requestId}`);
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as PedidoResponse;
  expect(body.publicSupportEligible).toBe(true);
  expect(body.publicSupportMessage).toBe(
    'Encaminhamento prioritário para TNUD / Táxi Saúde Municipal'
  );
  expect(body.validationLabel).toContain(
    'Isenção de taxas moderadoras por insuficiência económica'
  );
});
