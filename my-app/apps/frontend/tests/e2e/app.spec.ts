import { test, expect } from '@playwright/test';

test('should display correct title', async ({ page }) => {
  await page.goto('https://hello-dapp-fe.vercel.app//');
  await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
});
