import { describe, expect, it } from "vitest";
import { buildInitialSourceTiles, mergeCadenceProbeIntoTiles } from "../src/client/source-wall";

describe("source wall model", () => {
  it("starts with six real linked sources and keeps benchmarks out of the hero position", () => {
    const tiles = buildInitialSourceTiles();

    expect(tiles).toHaveLength(6);
    expect(tiles[0].sourceId).toBe("phenocam:aguamarga");
    expect(tiles.every((tile) => tile.sourcePageUrl.startsWith("https://"))).toBe(true);
    expect(tiles.find((tile) => tile.sourceId === "benchmark:channel-islands-bird")?.inclusionState).toBe("benchmark");
  });

  it("updates PhenoCam freshness without changing research and benchmark tiles", () => {
    const tiles = buildInitialSourceTiles();
    const updated = mergeCadenceProbeIntoTiles(tiles, {
      results: [
        {
          ok: true,
          evidence: {
            sourceId: "phenocam:aguamarga",
            sourceName: "aguamarga",
            sourceType: "periodic_snapshot",
            status: "cadence_candidate",
            checkedAt: "2026-06-28T05:31:23.000Z",
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
    });

    const aguamarga = updated.find((tile) => tile.sourceId === "phenocam:aguamarga");
    expect(aguamarga?.inclusionState).toBe("eligible");
    expect(aguamarga?.thumbnailUrl).toBe("https://phenocam.nau.edu/data/latest/aguamarga.jpg");
    expect(aguamarga?.freshnessSummary).toBe("Fresh: checked 1:31 AM, source image 6 min old, expected ~38 RGB frames/day");
    expect(updated.find((tile) => tile.sourceId === "wildlife:big-bear-eagle")?.inclusionState).toBe("research");
  });
});
