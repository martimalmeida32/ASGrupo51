import { expect, test } from '@playwright/test';

test('TC-RNF08-03 — Recarregamento da interface sem ligação', async ({ context, page }) => {
  await page.goto('/');
  await expect(page.getByTestId('connection-status')).toContainText('Ligação disponível');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByTestId('tab-utente')).toBeVisible();
  await expect(page.getByTestId('tab-telefone')).toBeVisible();
  await expect(page.getByTestId('destination-search')).toBeVisible();
  await expect(page.getByTestId('submit-pedido')).toBeVisible();
  await expect(page.getByTestId('connection-status')).toContainText('Sem ligação');
});
