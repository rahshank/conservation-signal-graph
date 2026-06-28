import { expect, test, type Page } from "@playwright/test";
import { seededDashboardState } from "../../src/server/fixtures";

test("source wall opens as a multi-source intelligence surface", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Ethogram Graph");
  await expect(page.getByRole("heading", { name: "Ethogram Graph" })).toBeVisible();
  await expect(page.getByLabel("Source wall")).toBeVisible();
  await expect(page.getByTestId("source-card")).toHaveCount(6);
  await expect(page.getByRole("button", { name: /Aguamarga PhenoCam/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Big Bear Eagle Context/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Cornell Bird Cams/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Aguamarga PhenoCam" })).toBeVisible();
  await expect(page.getByLabel("Selected source workbench").getByText("Provisional graph state")).toBeVisible();
  await expect(page.getByLabel("Exception queue").getByText("Uncertainty, policy blocks, and context conflicts rise for investigation.")).toBeVisible();
  await expect(page.getByLabel("Technical trace").getByText("Groq throughput")).toBeVisible();

  const sourceLinks = page.getByTestId("source-link");
  await expect(sourceLinks).toHaveCount(6);
  await expect(sourceLinks.first()).toHaveAttribute("href", /https:\/\/phenocam\.nau\.edu/);

  await expectVisualReadingOrder(page, ["Source Wall", "Intelligence Workbench", "Exception Queue", "Technical Trace"]);
});

test("selecting a wildlife source shows research mode instead of pretending ingestion is approved", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Big Bear Eagle Context/ }).click();

  await expect(page.getByLabel("Selected source workbench").getByRole("heading", { name: "Big Bear Eagle Context" })).toBeVisible();
  await expect(page.getByLabel("Selected source workbench").getByText("automated capture requires permission review")).toBeVisible();
  await expect(page.getByLabel("Selected source workbench").getByText("No automated frames")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open actual source" })).toHaveAttribute("href", "https://www.youtube.com/@FOBBVCAM/streams");
});

test("source cadence probe updates PhenoCam freshness and keeps source links visible", async ({ page }) => {
  const cadenceState = seededDashboardState();
  cadenceState.sourceGate = {
    status: "ready_for_probe",
    label: "Fresh source candidates found",
    detail: "1 of 1 PhenoCam sources are eligible for inference now. 1 fresh, 0 recent, 0 stale freshness, 0 unknown, 0 failed."
  };

  await page.route("**/api/state", async (route) => {
    await route.fulfill({ json: cadenceState });
  });
  await page.route("**/api/sources/probe/phenocam", async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            ok: true,
            evidence: {
              sourceId: "phenocam:aguamarga",
              sourceName: "aguamarga",
              sourceType: "periodic_snapshot",
              status: "cadence_candidate",
              checkedAt: "2026-06-28T02:00:00.000Z",
              latestImageUrl: "https://phenocam.nau.edu/data/latest/aguamarga.jpg",
              sourcePageUrl: "https://phenocam.nau.edu/webcam/sites/aguamarga/",
              locationLabel: "Grassland, Balsa Blanca, Almeria, Spain",
              termsStatus: "permitted",
              licenseOrTermsRef: "PhenoCam fair-use policy; CC BY 4.0 with attribution.",
              freshnessObservation: {
                checkedAt: "2026-06-28T05:31:23.000Z",
                sourceReportedAt: "2026-06-28T05:25:02.000Z",
                ageMs: 381000,
                ageLabel: "6 min old",
                status: "fresh",
                basis: "last_modified",
                expectedCadenceSeconds: 2274,
                expectedFramesPerDay: 38,
                includeForInference: true,
                summary: "Fresh: checked 1:31 AM, source image 6 min old, expected ~38 RGB frames/day"
              },
              dailyCounts: [{ localDate: "2026-06-26", rgbCount: 38, infraredCount: 39 }],
              cadenceSummary: "aguamarga reported 38 RGB frames and 39 infrared frames on 2026-06-26.",
              recommendedAction: "Eligible for timed polling and changed-frame Groq extraction."
            }
          }
        ],
        summary: {
          totalSources: 1,
          cadenceCandidates: 1,
          inferenceEligible: 1,
          fresh: 1,
          recent: 0,
          staleFreshness: 0,
          unknownFreshness: 0,
          staleSnapshots: 0,
          failed: 0
        }
      }
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Find updating sources" }).click();

  await expect(page.getByLabel("Selected source workbench").getByText("Fresh: checked 1:31 AM, source image 6 min old, expected ~38 RGB frames/day")).toBeVisible();
  await expect(page.getByLabel("Technical trace").getByText("Expected ~38 RGB frames/day")).toBeVisible();
  await expect(page.getByLabel("Technical trace").getByText("707 ms")).toBeVisible();
});

async function expectVisualReadingOrder(page: Page, headingNames: string[]) {
  const positions = [];
  for (const name of headingNames) {
    const box = await page.getByRole("heading", { name }).boundingBox();
    expect(box, `${name} should have a measurable position`).not.toBeNull();
    positions.push({ name, y: box!.y });
  }

  for (let index = 0; index < positions.length - 1; index += 1) {
    expect(positions[index].y, `${positions[index].name} should appear before ${positions[index + 1].name}`).toBeLessThanOrEqual(positions[index + 1].y);
  }
}
