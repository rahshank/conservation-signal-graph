import { expect, test, type Page } from "@playwright/test";
import { seededDashboardState } from "../../src/server/fixtures";

test("dashboard renders seeded signal graph and can ingest another event", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Ethogram Graph");
  await expect(page.getByRole("heading", { name: "Ethogram Graph" })).toBeVisible();
  await expect(page.getByLabel("Source gate")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Find updating sources" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Analyze NPS benchmark" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check bird camera" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Replay test fixture" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Analyze bird camera" })).toHaveCount(0);
  await expect(page.getByLabel("Test controls").getByRole("button", { name: "Load fixture replay" })).toBeVisible();
  await expect(page.getByLabel("Proof modes").getByText("Extraction: fixture")).toBeVisible();
  await expect(page.getByLabel("System status").getByText("Current extraction")).toBeVisible();
  await expect(page.getByLabel("System status").getByText("fixture", { exact: true })).toBeVisible();
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
  await page.getByLabel("Test controls").getByRole("button", { name: "Load fixture replay" }).click();
  await expect(page.getByText("Test fixture loaded")).toBeVisible();
  await expect(page.getByText("Awaiting monitor review")).toBeVisible();
  await expect(page.getByLabel("Proof modes").getByText("Source: dataset fixture")).toBeVisible();
  await expect(page.getByLabel("Proof modes").getByText("Extraction: fixture")).toBeVisible();
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

test("source cadence probe shows updating source candidates before frame analysis", async ({ page }) => {
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
              apiDateLast: "2026-06-26",
              latestModified: "Sat, 27 Jun 2026 19:49:02 GMT",
              etag: "\"6a40292e-535c4\"",
              byteSize: 341444,
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

  await expect(page.getByLabel("Source gate").getByText("Fresh source candidates found", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Updating Source Candidates" })).toBeVisible();
  await expect(page.getByLabel("Source cadence candidates").getByText("aguamarga", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Source cadence candidates").getByText("Fresh: checked 1:31 AM, source image 6 min old, expected ~38 RGB frames/day")).toBeVisible();
  await expect(page.getByLabel("Source cadence candidates").getByText("aguamarga reported 38 RGB frames and 39 infrared frames on 2026-06-26.")).toBeVisible();
});

test("analyze NPS benchmark promotes the Groq known-context image into review", async ({ page }) => {
  const initialState = seededDashboardState();
  const birdState = seededDashboardState();
  birdState.events[0] = {
    source: {
      sourceId: "nps:peregrine-falcon",
      sourceName: "Peregrine Falcon Webcam",
      sourceType: "static_image_benchmark",
      capturedAt: "2026-06-28T02:13:14.404Z",
      imageUrl: "https://www.nps.gov/common/uploads/cropped_image/FCD71ADD-A61D-57A9-C8A70C735880F813.jpg",
      locationLabel: "Channel Islands National Park",
      sourcePageUrl: "https://www.nps.gov/media/webcam/view.htm?id=A3663442-C6F8-DCB7-A82C44AE5E184E64",
      licenseOrTermsRef: "NPS API and DOI/NPS notices",
      termsStatus: "requires_key"
    },
    observation: {
      observationId: "obs-peregrine-live",
      sourceId: "nps:peregrine-falcon",
      frameId: "frame-peregrine-live",
      observedAt: "2026-06-28T02:13:14.404Z",
      speciesCandidates: [
        {
          label: "Peregrine Falcon",
          confidence: 0.95,
          evidence: "Distinctive markings, shape, and flight pattern"
        }
      ],
      risks: [],
      actions: [],
      questions: [],
      summary: "The image shows a Peregrine Falcon in flight.",
      confidence: 0.95,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      promptVersion: "csg-v0.1",
      latencyMs: 1304,
      validationStatus: "valid",
      frameProcessing: {
        originalImageUrl: "https://www.nps.gov/common/uploads/cropped_image/FCD71ADD-A61D-57A9-C8A70C735880F813.jpg",
        originalWidth: 8640,
        originalHeight: 5760,
        originalBytes: 11_054_549,
        submittedWidth: 1600,
        submittedHeight: 1067,
        submittedBytes: 133_007,
        resized: true,
        reason: "oversized_dimensions"
      }
    }
  };
  birdState.metrics = {
    ...birdState.metrics,
    totalEvents: 2,
    liveEvents: 0,
    fixtureEvents: 1,
    averageLatencyMs: 661,
    extractionMode: "groq"
  };
  birdState.sourceGate = {
    status: "ready_for_probe",
    label: "NPS benchmark analyzed",
    detail: "Analyzed Peregrine Falcon Webcam with Groq."
  };

  await page.route("**/api/state", async (route) => {
    await route.fulfill({ json: initialState });
  });
  await page.route("**/api/events/ingest/nps", async (route) => {
    await route.fulfill({ json: birdState });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Analyze NPS benchmark" }).click();

  await expect(page.getByLabel("Source gate").getByText("NPS benchmark analyzed", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Signal under review").getByText("Peregrine Falcon Webcam", { exact: true })).toBeVisible();
  await expect(page.getByLabel("AI observation").getByText("The image shows a Peregrine Falcon in flight.")).toBeVisible();
  await expect(page.getByLabel("Proof modes").getByText("Source: static image benchmark")).toBeVisible();
  await expect(page.getByLabel("Proof modes").getByText("Extraction: groq")).toBeVisible();
  await expect(page.getByLabel("System status").getByText("Current extraction")).toBeVisible();
  await expect(page.getByLabel("System status").getByText("groq", { exact: true })).toBeVisible();
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
