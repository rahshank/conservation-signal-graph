import { describe, expect, it } from "vitest";
import {
  buildPhenoCamSourceEvent,
  probePhenoCamSite,
  probePhenoCamSites
} from "../src/server/adapters/phenocam";

describe("PhenoCam cadence adapter", () => {
  it("turns current PhenoCam metadata, headers, and daily counts into cadence evidence", async () => {
    const result = await probePhenoCamSite("aguamarga", {
      fetchImpl: createPhenoCamFetch(),
      checkedAt: "2026-06-28T05:31:23.000Z"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.evidence.sourceId).toBe("phenocam:aguamarga");
    expect(result.evidence.sourceName).toBe("aguamarga");
    expect(result.evidence.sourceType).toBe("periodic_snapshot");
    expect(result.evidence.status).toBe("cadence_candidate");
    expect(result.evidence.latestImageUrl).toBe("https://phenocam.nau.edu/data/latest/aguamarga.jpg");
    expect(result.evidence.latestModified).toBe("Sun, 28 Jun 2026 05:25:02 GMT");
    expect(result.evidence.etag).toBe("\"6a40292e-535c4\"");
    expect(result.evidence.byteSize).toBe(341444);
    expect(result.evidence.freshnessObservation).toEqual({
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
    });
    expect(result.evidence.dailyCounts[0]).toEqual({
      localDate: "2026-06-26",
      rgbCount: 38,
      infraredCount: 39
    });
    expect(result.evidence.cadenceSummary).toContain("38 RGB frames");
  });

  it("marks stale PhenoCam sites without pretending they are cadence candidates", async () => {
    const result = await probePhenoCamSite("acadia", {
      fetchImpl: createPhenoCamFetch({ stale: true }),
      checkedAt: "2026-06-28T05:31:23.000Z"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.evidence.sourceId).toBe("phenocam:acadia");
    expect(result.evidence.status).toBe("stale_snapshot");
    expect(result.evidence.freshnessObservation.status).toBe("stale");
    expect(result.evidence.freshnessObservation.includeForInference).toBe(false);
    expect(result.evidence.recommendedAction).toContain("Do not run Groq");
  });

  it("probes several feeds and preserves each source as its own graph-ready source event", async () => {
    const result = await probePhenoCamSites(["aguamarga", "acadia"], {
      fetchImpl: createPhenoCamFetch(),
      checkedAt: "2026-06-28T05:31:23.000Z"
    });

    expect(result.results).toHaveLength(2);
    expect(result.summary.totalSources).toBe(2);
    expect(result.summary.cadenceCandidates).toBe(1);
    expect(result.summary.inferenceEligible).toBe(1);
    expect(result.summary.fresh).toBe(1);
    expect(result.summary.staleFreshness).toBe(1);

    const first = result.results[0];
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const sourceEvent = buildPhenoCamSourceEvent(first.evidence, "2026-06-28T02:00:00.000Z");
    expect(sourceEvent.sourceType).toBe("periodic_snapshot");
    expect(sourceEvent.sourceId).toBe("phenocam:aguamarga");
    expect(sourceEvent.imageUrl).toBe("https://phenocam.nau.edu/data/latest/aguamarga.jpg");
    expect(sourceEvent.freshnessObservation?.summary).toContain("Fresh:");
    expect(sourceEvent.termsStatus).toBe("permitted");
    expect(sourceEvent.notes).toContain("38 RGB frames");
  });
});

function createPhenoCamFetch(options: { stale?: boolean } = {}): typeof fetch {
  return async (input, init) => {
    const url = new URL(String(input));
    const siteFromPath = url.pathname.split("/").filter(Boolean).at(-1);
    const site = siteFromPath?.replace(".jpg", "") ?? url.searchParams.get("site") ?? "aguamarga";
    const stale = options.stale || site === "acadia";

    if (url.pathname.startsWith("/api/cameras/")) {
      return jsonResponse({
        Sitename: site,
        active: !stale,
        date_first: stale ? "2007-03-15" : "2023-11-29",
        date_last: stale ? "2022-01-07" : "2026-06-26",
        Lat: stale ? 44.3769 : 36.94,
        Lon: stale ? -68.2608 : -2.0332,
        sitemetadata: {
          site_description: stale ? "Acadia National Park" : "Grassland, Balsa Blanca, Almeria, Spain",
          primary_veg_type: stale ? "DB" : "GR",
          secondary_veg_type: stale ? "EN" : null,
          site_acknowledgements: stale
            ? "Camera images from Acadia National Park are provided courtesy of the National Park Service Air Resources Program."
            : ""
        }
      });
    }

    if (url.pathname === "/api/dailycounts/") {
      return jsonResponse({
        results: [
          {
            local_date: stale ? "2022-01-07" : "2026-06-26",
            site,
            rgb_count: stale ? 1 : 38,
            ir_count: stale ? 0 : 39
          }
        ]
      });
    }

    if (url.pathname === `/data/latest/${site}.jpg` && init?.method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers: {
          "Last-Modified": stale ? "Fri, 07 Jan 2022 11:00:02 GMT" : "Sun, 28 Jun 2026 05:25:02 GMT",
          ETag: stale ? "\"61d81d32-2bd06\"" : "\"6a40292e-535c4\"",
          "Content-Length": stale ? "179462" : "341444"
        }
      });
    }

    return new Response("not found", { status: 404 });
  };
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
