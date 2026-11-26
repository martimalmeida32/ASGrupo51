import { expect, request, test } from '@playwright/test';
import type { PedidoResponse } from '../src/types';

test('TC-UC06-04 — Inscrição inicial de novo utente com cartão MobiCare e autorização de pedido urgente (< 24h)', async ({
  page
}) => {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3001' });
  await api.post('/test/clock', { data: { now: '2026-11-20T14:00:00Z' } });

  await page.goto('/');
  await page.getByTestId('tab-telefone').click();
  await page.getByTestId('abrir-inscricao').click();
  await page.getByTestId('inscricao-name').fill('João Silva');
  await page.getByTestId('inscricao-phone').fill('913111222');
  await page.getByTestId('inscricao-need-bengala').check();
  await page.getByTestId('inscricao-submit').click();

  await expect(page.getByTestId('inscricao-card')).toHaveText('Cartão #MC-0310 ativo');
  await expect(page.getByTestId('inscricao-name-result')).toHaveText('João Silva');
  await expect(page.getByTestId('inscricao-profile-result')).toHaveText('Bengala');
  await expect(page.getByTestId('telefone-name')).toHaveText('João Silva');
  await expect(page.getByTestId('telefone-card')).toHaveText('#MC-0310');

  await page.getByTestId('telefone-destination').selectOption('centro-saude-aveiro');
  await page.getByTestId('telefone-consultation-at').fill('2026-11-21T10:00');
  await page.getByTestId('telefone-urgencia').check();
  await page.getByTestId('telefone-tecnico').fill('Técnica Ana Rocha');
  await page
    .getByTestId('telefone-justificacao')
    .fill('Consulta urgente confirmada pelo hospital com condutor disponível a título excecional.');
  await page.getByTestId('select-telefone-voluntario').check();
  await page.getByTestId('telefone-confirm').click();

  await expect(page.getByTestId('telefone-result')).toBeVisible();
  await expect(page.getByTestId('telefone-request-status')).toHaveText('Confirmado');
  await expect(page.getByTestId('telefone-validation-label')).toContainText(
    'Exceção urgente autorizada pela coordenação'
  );
  await expect(page.getByTestId('telefone-audit-entry')).toContainText('Técnica Ana Rocha');
  await expect(page.getByTestId('telefone-audit-entry')).toContainText('EXCECAO_BR_01');

  const requestId = (await page.getByTestId('telefone-request-id').textContent())
    ?.replace('#', '')
    .trim();
  expect(requestId).toBeTruthy();

  const stored = (await (await api.get(`/pedidos/${requestId}`)).json()) as PedidoResponse;
  expect(stored.status).toBe('Confirmado');
  expect(stored.trips).toHaveLength(2);
  expect(stored.audit).toHaveLength(1);
  expect(stored.audit[0]).toEqual(
    expect.objectContaining({
      cardId: 'MC-0310',
      actor: 'Técnica Ana Rocha',
      action: 'EXCECAO_BR_01',
      justification:
        'Consulta urgente confirmada pelo hospital com condutor disponível a título excecional.',
      createdAt: '2026-11-20T14:00:00.000Z'
    })
  );

  const denied = await api.post('/pedidos/telefonicos', {
    data: {
      cardId: 'MC-0310',
      destinationId: 'centro-saude-aveiro',
      consultationAt: '2026-11-21T10:00',
      optionId: 'voluntario'
    }
  });
  expect(denied.status()).toBe(422);
  expect((await denied.json()) as { error: string }).toEqual({
    error: 'Antecedência mínima de 24 horas não cumprida'
  });
});
