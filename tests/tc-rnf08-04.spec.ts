import { expect, test } from '@playwright/test';

test('TC-RNF08-04 — Respostas da API não são servidas da cache offline', async ({ context, page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  const endpoint = '/pedidos/PED-999/opcoes';
  const onlineStatus = await page.evaluate(async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    return response.status;
  }, endpoint);
  expect(onlineStatus).toBe(404);

  const cached = await page.evaluate(async (url) => {
    const cache = await caches.open('mobicare-shell-v1');
    return Boolean(await cache.match(url));
  }, endpoint);
  expect(cached).toBe(false);

  await context.setOffline(true);
  const offlineStatus = await page.evaluate(async (url) => {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      return response.status;
    } catch {
      return 0;
    }
  }, endpoint);
  expect(offlineStatus).toBe(0);

  await page.reload();
  await expect(page.getByTestId('tab-utente')).toBeVisible();
});
