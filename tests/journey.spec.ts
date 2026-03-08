import { test, expect } from "@playwright/test";

test.describe.configure({ timeout: 120000 });

test("golden path pages render and are navigable", async ({ page }) => {
  await page.goto("/", { timeout: 60000 });
  await expect(page).toHaveTitle(/NovaVision Intelligence/);

  await page.goto("/dashboard", { timeout: 60000 });
  await expect(page.getByRole("heading", { name: /Command Center/i })).toBeVisible();

  await page.goto("/clearance", { timeout: 60000 });
  await expect(page.getByRole("heading", { name: /Global Compliance Audit/i })).toBeVisible();

  await page.goto("/warehouse", { timeout: 60000 });
  await expect(page.getByRole("heading", { name: /Floor Verification/i })).toBeVisible();
});
