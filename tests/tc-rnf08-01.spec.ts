import { expect, test } from '@playwright/test';

test('TC-RNF08-01 — Manifesto e ícones disponíveis no navegador', async ({ page, request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest).toMatchObject({
    name: 'MobiCare — Pedir acompanhamento',
    short_name: 'MobiCare',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    lang: 'pt-PT',
    theme_color: '#0f766e',
    background_color: '#f4f7f6'
  });
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }),
      expect.objectContaining({ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }),
      expect.objectContaining({ src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' })
    ])
  );

  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0f766e');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');

  const widths = await page.evaluate(() =>
    Promise.all(
      ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/icons/apple-touch-icon.png'].map(
        (src) =>
          new Promise<number>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image.naturalWidth);
            image.onerror = () => reject(new Error(`Não foi possível carregar ${src}`));
            image.src = src;
          })
      )
    )
  );
  expect(widths).toEqual([192, 512, 512, 180]);
});
