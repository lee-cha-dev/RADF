import { test, expect } from '@playwright/test';

test('RADF styles are applied from package CSS', async ({ page }) => {
  await page.goto('/');

  const panel = page.locator('.radf-panel').first();
  await expect(panel).toBeVisible();

  const borderRadius = await panel.evaluate((el) =>
    window.getComputedStyle(el).borderRadius
  );

  expect(borderRadius).toBe('16px');
});
