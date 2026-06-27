import { expect, test } from "@playwright/test";
import { seededDashboardState } from "../../src/server/fixtures";

test("dashboard renders seeded signal graph and can ingest another event", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Conservation Signal Graph" })).toBeVisible();
  await expect(page.getByLabel("Live source gate")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Signal Feed" })).toBeVisible();
  const runDetails = page.getByLabel("Model run details");
  await expect(runDetails.getByRole("heading", { name: "Run Details" })).toBeVisible();
  await expect(runDetails.getByText("Model", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("fixture-extractor")).toBeVisible();
  await expect(runDetails.getByText("Prompt", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("csg-v0.1")).toBeVisible();
  await expect(runDetails.getByText("Validation", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("Extraction mode", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("Graph mode", { exact: true })).toBeVisible();
  await expect(runDetails.getByRole("heading", { name: "Frame Processing" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Context Graph" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review Queue" })).toBeVisible();

  await page.getByRole("button", { name: "Fixture run" }).click();
  await expect(page.getByText("Signal ingested")).toBeVisible();
  await expect(page.getByText("Events")).toBeVisible();
});

test("dashboard renders frame normalization metadata from model runs", async ({ page }) => {
  const state = seededDashboardState();
  state.events[0].observation = {
    ...state.events[0].observation,
    validationStatus: "valid",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    latencyMs: 1352,
    frameProcessing: {
      originalImageUrl: "https://www.nps.gov/common/uploads/cropped_image/example.jpg",
      originalWidth: 4267,
      originalHeight: 2400,
      originalBytes: 4_341_288,
      submittedWidth: 1600,
      submittedHeight: 900,
      submittedBytes: 267_439,
      resized: true,
      reason: "oversized_dimensions"
    }
  };
  state.metrics.extractionMode = "groq";

  await page.route("**/api/state", async (route) => {
    await route.fulfill({ json: state });
  });

  await page.goto("/");

  const frameMetadata = page.getByLabel("Frame processing metadata");
  await expect(frameMetadata.getByText("4267 x 2400")).toBeVisible();
  await expect(frameMetadata.getByText("4.1 MB")).toBeVisible();
  await expect(frameMetadata.getByText("1600 x 900")).toBeVisible();
  await expect(frameMetadata.getByText("261 KB")).toBeVisible();
  await expect(frameMetadata.getByText("Yes")).toBeVisible();
  await expect(frameMetadata.getByText("oversized dimensions")).toBeVisible();
});
