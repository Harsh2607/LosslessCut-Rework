import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import axe from 'axe-core';

test.describe('LosslessCut Electron E2E Smoke & A11y Suite', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeAll(async () => {
    app = await electron.launch({
      args: ['.', '--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox'],
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    page = await app.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  test('Application launches and renders valid window title', async () => {
    const title = await page.title();
    expect(title).toMatch(/LosslessCut/i);
  });

  test('Main window displays Welcome Screen dropzone on empty state', async () => {
    const dropzone = page.locator('text=Drop Media File Here');
    await expect(dropzone).toBeVisible({ timeout: 15000 });
  });

  test('Automated Accessibility (axe-core) scan on main workspace', async () => {
    await page.evaluate(axe.source);
    // @ts-expect-error axe is injected into globalThis
    const results = await page.evaluate(async () => globalThis.axe.run(document, { rules: { 'color-contrast': { enabled: false } } }));

    const criticalViolations = results.violations.filter((v: { impact: string }) => v.impact === 'critical');
    expect(criticalViolations).toHaveLength(0);
  });
});
