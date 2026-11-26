import { expect, request, test } from '@playwright/test';

test('TC-UC01-02 — Rejeição de pedido com antecedência inferior a 24 horas [caso de falha]', async ({
  page
}) => {
  await page.goto('/');

  await page.getByTestId('requester-family').check();
  await page.getByTestId('destination-search').fill('Ílhavo');
  await page.getByTestId('destination-centro-saude-ilhavo').click();
  await page.getByTestId('consultation-at').fill('2026-11-21T10:00');
  await page.getByTestId('need-bengala').check();
  await page.getByTestId('submit-pedido').click();

  await expect(page.getByTestId('validation-error')).toHaveText(
    'Antecedência mínima de 24 horas não cumprida'
  );
  await expect(page.getByTestId('ipss-contact')).toContainText('contacte a IPSS');
  await expect(page.getByTestId('ipss-phone')).toHaveAttribute('href', /^tel:/);
  await expect(page.getByTestId('request-id')).toHaveCount(0);

  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const response = await api.post('/pedidos', {
    data: {
      submissionId: 'tc-uc01-02-submission',
      requesterType: 'familiar-cuidador',
      userId: 'MC-0142',
      destinationId: 'centro-saude-ilhavo',
      consultationAt: '2026-11-21T10:00',
      mobilityNeeds: ['bengala']
    }
  });
  expect(response.status()).toBe(422);
  expect((await response.json()).error).toBe('Antecedência mínima de 24 horas não cumprida');
});
