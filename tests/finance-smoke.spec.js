import { test, expect } from '@playwright/test';

test('finance dashboard loads with panels and theme', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Executive Performance Overview' })
  ).toBeVisible();

  const panelCount = await page.locator('.radf-panel').count();
  expect(panelCount).toBeGreaterThan(0);

  await expect(page.locator('html')).toHaveClass(/fecc-theme-(dark|light)/);
});
