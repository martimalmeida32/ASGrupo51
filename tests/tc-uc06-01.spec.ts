import { expect, request, test } from '@playwright/test';

test('TC-UC06-01 — Bloqueio de pedido telefónico com antecedência inferior a 24h sem exceção [caso de falha]', async ({
  page
}) => {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  await api.post('/test/clock', { data: { now: '2026-11-20T15:00:00Z' } });

  const smsAntes = (await (await api.get('/sms')).json()) as {
    messages: unknown[];
  };

  await page.goto('/');
  await page.getByTestId('tab-telefone').click();

  await page.getByTestId('utente-search').fill('MC-0087');
  await page.getByTestId('utente-search-button').click();
  await expect(page.getByTestId('telefone-name')).toHaveText('Utente Registado');
  await expect(page.getByTestId('telefone-card')).toHaveText('#MC-0087');

  await page.getByTestId('telefone-destination').selectOption('hospital-sao-joao');
  await page.getByTestId('telefone-consultation-at').fill('2026-11-21T09:30');
  await page.getByTestId('select-telefone-voluntario').check();
  await expect(page.getByTestId('telefone-urgencia')).not.toBeChecked();

  await page.getByTestId('telefone-confirm').click();

  await expect(page.getByTestId('telefone-bloqueio-antecedencia')).toHaveText(
    'Violação de antecedência mínima de 24 horas'
  );
  await expect(page.getByTestId('telefone-bloqueio-antecedencia-acao')).toContainText(
    'declare uma exceção autorizada'
  );
  await expect(page.getByTestId('telefone-result')).toHaveCount(0);
  await expect(page.getByTestId('utente-result')).toBeVisible();

  const smsDepois = (await (await api.get('/sms')).json()) as {
    messages: unknown[];
  };
  expect(smsDepois.messages).toHaveLength(smsAntes.messages.length);
});
