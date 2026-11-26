import { expect, request, test } from '@playwright/test';

test('TC-UC01-01 — Submissão com sucesso de pedido de acompanhamento com antecedência válida', async ({
  page
}) => {
  await page.goto('/');

  await expect(page.getByTestId('authenticated-user')).toContainText('#MC-0142');
  await page.getByTestId('requester-self').check();
  await page.getByTestId('destination-search').fill('Infante D. Pedro');
  await page.getByTestId('destination-hospital-infante-d-pedro').click();
  await page.getByTestId('consultation-at').fill('2026-11-24T10:30');
  await page.getByTestId('need-cadeira-de-rodas').check();
  await page.getByTestId('submit-pedido').click();

  await expect(page.getByTestId('validation-error')).toHaveCount(0);
  await expect(page.getByTestId('selected-destination')).toContainText(
    'Hospital Infante D. Pedro (Aveiro)'
  );
  await expect(page.getByTestId('request-id')).toHaveText('#PED-104');
  await expect(page.getByTestId('request-status')).toHaveText('A escolher o meio');
  await expect(page.getByTestId('mobility-profile')).toHaveText('Cadeira de rodas');
  await expect(page.getByTestId('notification-status')).toContainText(
    'Coordenação da IPSS notificada'
  );

  const options = page.getByTestId('transport-option');
  await expect(options).toHaveCount(3);
  await expect(options.nth(0)).toContainText('Voluntário');
  await expect(options.nth(1)).toContainText('Viatura Adaptada de Parceiro');
  await expect(options.nth(2)).toContainText('Operador Profissional');

  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const response = await api.get('/pedidos/PED-104');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.requestId).toBe('PED-104');
  expect(body.status).toBe('A escolher o meio');
  expect(body.mobilityProfile).toBe('Cadeira de rodas');
  expect(body.destination).toBe('Hospital Infante D. Pedro (Aveiro)');
  expect(body.consultationAt).toBe('2026-11-24T10:30:00Z');
  expect(body.notification.recipient).toBe('coordenacao@acompanhar.pt');
});
