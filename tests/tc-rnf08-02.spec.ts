import { expect, test } from '@playwright/test';

test('TC-RNF08-02 — Instalação aceite pelo utilizador', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('install-button')).toHaveCount(0);

  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.defineProperty(event, 'prompt', {
      value: () => {
        (window as unknown as { installPromptCalled?: boolean }).installPromptCalled = true;
        return Promise.resolve();
      }
    });
    Object.defineProperty(event, 'userChoice', {
      value: Promise.resolve({ outcome: 'accepted' })
    });
    window.dispatchEvent(event);
  });

  await expect(page.getByTestId('install-button')).toBeVisible();
  await expect(page.getByTestId('install-button')).toHaveText('Instalar aplicação');
  await page.getByTestId('install-button').click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { installPromptCalled?: boolean }).installPromptCalled))
    .toBe(true);
  await expect(page.getByTestId('install-button')).toHaveCount(0);

  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.defineProperty(event, 'prompt', { value: () => Promise.resolve() });
    Object.defineProperty(event, 'userChoice', {
      value: Promise.resolve({ outcome: 'accepted' })
    });
    window.dispatchEvent(event);
  });
  await expect(page.getByTestId('install-button')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByTestId('install-button')).toHaveCount(0);
});
