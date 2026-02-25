import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 60000 });

test('homepage has correct title', async ({ page }) => {
    await page.goto('/', { timeout: 60000 });

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/NovaVision Intelligence/);
});
