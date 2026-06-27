import { expect, test } from "@playwright/test";

test("dashboard renders seeded signal graph and can ingest another event", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Conservation Signal Graph" })).toBeVisible();
  await expect(page.getByLabel("Live source gate")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Signal Feed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Context Graph" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review Queue" })).toBeVisible();

  await page.getByRole("button", { name: "Fixture run" }).click();
  await expect(page.getByText("Signal ingested")).toBeVisible();
  await expect(page.getByText("Events")).toBeVisible();
});
