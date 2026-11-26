import { defineConfig, devices } from '@playwright/test';
import { join } from 'node:path';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    baseURL: 'http://127.0.0.1:3001',
    trace: 'retain-on-failure'
  },
  webServer: {
    command:
      'node node_modules/typescript/bin/tsc --noEmit && node node_modules/vite/bin/vite.js build && node server/index.mjs',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PORT: '3001',
      MOBICARE_DB: join(process.cwd(), 'data', 'test.db'),
      MOBICARE_RESET_DB: '1',
      MOBICARE_NOW: '2026-11-20T16:00:00Z',
      MOBICARE_TEST_CLOCK: '1'
    }
  }
});
