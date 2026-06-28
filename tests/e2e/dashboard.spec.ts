import { expect, test, type Page } from "@playwright/test";
import { seededDashboardState } from "../../src/server/fixtures";

test("dashboard renders seeded signal graph and can ingest another event", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Conservation Signal Graph" })).toBeVisible();
  await expect(page.getByLabel("Live source gate")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Signal Under Review" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI Observation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review Decision" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Context Graph" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence Trace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Signal Queue" })).toBeVisible();
  await expectVisualReadingOrder(page, [
    "Signal Under Review",
    "AI Observation",
    "Review Decision",
    "Context Graph",
    "Evidence Trace",
    "Signal Queue"
  ]);
  await expect(page.getByRole("button", { name: "Check bird camera" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Analyze bird camera" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Replay test fixture" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept observation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send to review" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Dismiss low confidence" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Watch source" })).toBeVisible();

  const runDetails = page.getByLabel("Evidence trace");
  await expect(runDetails.getByRole("heading", { name: "Evidence Trace" })).toBeVisible();
  await expect(runDetails.getByText("Model", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("fixture-extractor")).toBeVisible();
  await expect(runDetails.getByText("Prompt", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("csg-v0.1")).toBeVisible();
  await expect(runDetails.getByText("Validation", { exact: true })).toBeVisible();
  await expect(runDetails.locator(".detailGrid > div", { hasText: "Validation" }).getByText("fixture", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("Extraction mode", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("memory", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("Graph mode", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("74%")).toBeVisible();
  await expect(runDetails.getByText("18 ms")).toBeVisible();
  await expect(runDetails.getByText("Fixture asset")).toBeVisible();
  await expect(runDetails.getByRole("heading", { name: "Frame Processing" })).toBeVisible();

  await page.getByRole("button", { name: "Accept observation" }).click();
  await expect(page.getByText("Accepted as observation")).toBeVisible();
  await page.getByRole("button", { name: "Replay test fixture" }).click();
  await expect(page.getByText("Test fixture replayed")).toBeVisible();
  await expect(page.getByText("Awaiting monitor review")).toBeVisible();
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
  state.events[0].source.imageUrl = "https://www.nps.gov/common/uploads/cropped_image/example.jpg?version=20260627#frame";
  state.metrics.extractionMode = "groq";

  await page.route("**/api/state", async (route) => {
    await route.fulfill({ json: state });
  });

  await page.goto("/");

  const runDetails = page.getByLabel("Evidence trace");
  await expect(runDetails.getByText("meta-llama/llama-4-scout-17b-16e-instruct")).toBeVisible();
  await expect(runDetails.getByText("1352 ms")).toBeVisible();
  await expect(runDetails.getByText("valid", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("74%")).toBeVisible();
  await expect(runDetails.getByText("memory", { exact: true })).toBeVisible();
  await expect(runDetails.getByText("groq", { exact: true })).toBeVisible();
  const exactSourceLink = runDetails.getByRole("link", {
    name: "https://www.nps.gov/common/uploads/cropped_image/example.jpg?version=20260627#frame"
  });
  await expect(exactSourceLink).toBeVisible();
  await expect(exactSourceLink).toHaveAttribute("href", "https://www.nps.gov/common/uploads/cropped_image/example.jpg?version=20260627#frame");

  const frameMetadata = page.getByLabel("Frame processing metadata");
  await expect(frameMetadata.getByText("4267 x 2400")).toBeVisible();
  await expect(frameMetadata.getByText("4.1 MB")).toBeVisible();
  await expect(frameMetadata.getByText("1600 x 900")).toBeVisible();
  await expect(frameMetadata.getByText("261 KB")).toBeVisible();
  await expect(frameMetadata.getByText("Yes")).toBeVisible();
  await expect(frameMetadata.getByText("oversized dimensions")).toBeVisible();
});

async function expectVisualReadingOrder(page: Page, headingNames: string[]) {
  const positions = [];
  for (const name of headingNames) {
    const box = await page.getByRole("heading", { name }).boundingBox();
    expect(box, `${name} should have a measurable position`).not.toBeNull();
    positions.push({ name, x: box!.x, y: box!.y });
  }

  for (let index = 0; index < positions.length - 1; index += 1) {
    const current = positions[index];
    const next = positions[index + 1];
    const beforeNext = current.y < next.y - 4 || (Math.abs(current.y - next.y) <= 4 && current.x < next.x);
    expect(beforeNext, `${current.name} should appear before ${next.name}`).toBeTruthy();
  }
}
