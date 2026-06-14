import { test, expect } from "@playwright/test";

test("renders the dashboard heading", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /world cup 2026 dashboard/i }),
  ).toBeVisible();
});
