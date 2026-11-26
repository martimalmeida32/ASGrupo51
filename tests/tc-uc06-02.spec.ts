import { expect, request, test } from '@playwright/test';

const MENSAGEM_112 =
  'Ligar de imediato para o 112 — caso clínico não elegível para transporte MobiCare';

test('TC-UC06-02 — Bloqueio imediato por deteção de urgência médica aguda e orientação para 112 [caso de falha]', async ({
  page
}) => {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  await api.post('/test/clock', { data: { now: '2026-11-20T15:00:00Z' } });

  const smsAntes = (await (await api.get('/sms')).json()) as {
    messages: unknown[];
  };

  await page.goto('/');
  await page.getByTestId('tab-telefone').click();

  await page.getByTestId('utente-search').fill('MC-0205');
  await page.getByTestId('utente-search-button').click();
  await expect(page.getByTestId('telefone-name')).toHaveText('Maria Ferreira');

  await page.getByTestId('telefone-sintomas-urgencia').click();

  await expect(page.getByTestId('emergencia-112')).toBeVisible();
  await expect(page.getByTestId('emergencia-112-message')).toHaveText(MENSAGEM_112);
  await expect(page.getByTestId('emergencia-112-call')).toHaveAttribute('href', 'tel:112');
  await expect(page.getByTestId('telefone-confirm')).toHaveCount(0);
  await expect(page.getByTestId('telefone-result')).toHaveCount(0);

  const bloqueio = await api.post('/pedidos/telefonicos', {
    data: {
      cardId: 'MC-0205',
      destinationId: 'centro-saude-aveiro',
      consultationAt: '2026-11-25T15:00',
      optionId: 'voluntario',
      acuteMedicalEmergency: true
    }
  });
  expect(bloqueio.status()).toBe(422);
  expect(await bloqueio.json()).toEqual({ error: MENSAGEM_112, emergency: true });

  const smsDepois = (await (await api.get('/sms')).json()) as {
    messages: unknown[];
  };
  expect(smsDepois.messages).toHaveLength(smsAntes.messages.length);
});
