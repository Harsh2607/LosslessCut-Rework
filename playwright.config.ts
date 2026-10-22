import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 45000,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Electron E2E runs single worker to prevent display/socket collision
  reporter: [
    ['list'],
    ['html', { outputFolder: 'out/playwright-report', open: 'never' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
