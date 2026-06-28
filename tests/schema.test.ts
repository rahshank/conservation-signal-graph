import { describe, expect, it } from "vitest";
import { createApp } from "../src/server/app";
import { fixtureObservation, fixtureSourceEvent, seededDashboardState } from "../src/server/fixtures";
import { probeNpsWebcamSource, defaultNpsWebcamTitle } from "../src/server/adapters/nps-webcam";
import { buildGraphSnapshot } from "../src/server/graph/map-observation";
import type { GraphRepository } from "../src/server/graph/repository";
import { extractedObservationSchema, sourceCadenceEvidenceSchema, sourceEventSchema, type GraphSnapshot } from "../src/shared/schema";

describe("source and extraction schemas", () => {
  it("validates the fixture source event", () => {
    expect(sourceEventSchema.parse(fixtureSourceEvent).sourceType).toBe("dataset_fixture");
  });

  it("validates the fixture extraction", () => {
    expect(extractedObservationSchema.parse(fixtureObservation).validationStatus).toBe("fixture");
  });

  it("starts with the source-freshness gate instead of the NPS benchmark gate", () => {
    const state = seededDashboardState();
    expect(state.sourceGate.status).toBe("ready_for_probe");
    expect(state.sourceGate.label).toBe("Source freshness gate");
    expect(state.sourceGate.detail).toContain("checks PhenoCam freshness automatically");
    expect(state.sourceGate.detail).not.toContain("NPS_API_KEY");
  });
});

describe("live source gate", () => {
  it("reports a missing NPS key as a non-destructive gate result", async () => {
    const result = await probeNpsWebcamSource({ apiKey: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe("missing_key");
  });

  it("can target a specific NPS webcam by title", async () => {
    const result = await probeNpsWebcamSource({
      apiKey: "test-key",
      titleIncludes: "Bartlett Cove Lagoon",
      fetchImpl: async () =>
        new Response(JSON.stringify({
          data: [
            {
              id: "falls",
              title: "Yosemite Falls",
              relatedParks: [{ parkCode: "yose", fullName: "Yosemite National Park" }],
              images: [{ url: "/common/uploads/cropped_image/falls.jpg" }]
            },
            {
              id: "lagoon",
              title: "Bartlett Cove Lagoon and Fairweather Range",
              relatedParks: [{ parkCode: "glba", fullName: "Glacier Bay National Park & Preserve" }],
              images: [{ url: "https://www.nps.govhttps://www.nps.gov/common/uploads/cropped_image/lagoon.jpg" }]
            }
          ]
        }), { status: 200 })
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source.sourceName).toBe("Bartlett Cove Lagoon and Fairweather Range");
      expect(result.source.sourceType).toBe("static_image_benchmark");
      expect(result.source.imageUrl).toBe("https://www.nps.gov/common/uploads/cropped_image/lagoon.jpg");
    }
  });

  it("defaults to a known animal camera source", async () => {
    const result = await probeNpsWebcamSource({
      apiKey: "test-key",
      fetchImpl: async (input) => {
        const url = new URL(String(input));
        expect(url.searchParams.get("parkCode")).toBeNull();
        expect(url.searchParams.get("limit")).toBe("500");
        return new Response(JSON.stringify({
          data: [
            {
              id: "falls",
              title: "Yosemite Falls",
              relatedParks: [{ parkCode: "yose", fullName: "Yosemite National Park" }],
              images: [{ url: "/common/uploads/cropped_image/falls.jpg" }]
            },
            {
              id: "peregrine",
              title: "Peregrine Falcon Webcam",
              relatedParks: [{ parkCode: "chis", fullName: "Channel Islands National Park" }],
              images: [{ url: "/common/uploads/cropped_image/peregrine.jpg" }]
            }
          ]
        }), { status: 200 });
      }
    });

    expect(defaultNpsWebcamTitle).toBe("Peregrine Falcon");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source.sourceName).toBe("Peregrine Falcon Webcam");
      expect(result.source.locationLabel).toBe("Channel Islands National Park");
    }
  });
});

describe("graph mapping", () => {
  it("maps an observation into typed graph nodes and relationships", () => {
    const graph = buildGraphSnapshot(fixtureSourceEvent, fixtureObservation);
    expect(graph.nodes.some((node) => node.kind === "Observation")).toBe(true);
    expect(graph.relationships.some((relationship) => relationship.type === "RAISES_RISK")).toBe(true);
    expect(graph.relationships.some((relationship) => relationship.type === "REQUIRES_ACTION")).toBe(true);
  });
});

describe("production server wiring", () => {
  it("creates the production app with the SPA fallback route", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const { graphRepository } = await createApp();
      await graphRepository.close();
    } finally {
      if (previousNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previousNodeEnv;
      }
    }
  });
});

describe("source cadence probe route", () => {
  it("surfaces PhenoCam cadence evidence without ingesting a frame", async () => {
    const { app, graphRepository } = await createApp({
      phenocamProbe: async () => ({
        results: [
          {
            ok: true,
            evidence: sourceCadenceEvidenceSchema.parse({
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
            })
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
      })
    });

    const testServer = await listenForTest(app);
    try {
      const response = await fetch(`${testServer.baseUrl}/api/sources/probe/phenocam`);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.summary.cadenceCandidates).toBe(1);

      const snapshotResponse = await fetch(`${testServer.baseUrl}/api/state`);
      const snapshot = await snapshotResponse.json();
      expect(snapshot.sourceGate.label).toBe("Fresh source candidates found");
      expect(snapshot.sourceGate.detail).toContain("1 of 1 PhenoCam sources are eligible");
    } finally {
      await testServer.close();
      await graphRepository.close();
    }
  });
});

describe("ingest failure handling", () => {
  it("does not report live ingest success when graph writing fails", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousForceFixture = process.env.CSG_FORCE_FIXTURE;
    const previousNpsKey = process.env.NPS_API_KEY;
    process.env.NODE_ENV = "test";
    process.env.CSG_FORCE_FIXTURE = "1";
    process.env.NPS_API_KEY = "test-key";

    class FailingGraphRepository implements GraphRepository {
      mode = "neo4j" as const;
      async writeObservation(): Promise<GraphSnapshot> {
        throw new Error("graph offline");
      }
      async snapshot(): Promise<GraphSnapshot> {
        return { nodes: [], relationships: [] };
      }
      async close(): Promise<void> {}
    }

    try {
      const { app, graphRepository } = await createApp({
        graphRepository: new FailingGraphRepository(),
        npsProbe: async () => ({
          ok: true,
          source: sourceEventSchema.parse({
            sourceId: "nps:peregrine",
            sourceName: "Peregrine Falcon Webcam",
            sourceType: "static_image_benchmark",
            capturedAt: "2026-06-27T18:00:00.000Z",
            imageUrl: "https://www.nps.gov/common/uploads/cropped_image/peregrine.jpg",
            locationLabel: "Channel Islands National Park",
            sourcePageUrl: "https://www.nps.gov/media/webcam/view.htm?id=peregrine",
            licenseOrTermsRef: "NPS API test fixture",
            termsStatus: "requires_key"
          })
        })
      });

      const testServer = await listenForTest(app);
      try {
        const response = await fetch(`${testServer.baseUrl}/api/events/ingest/nps`, { method: "POST" });
        expect(response.status).toBe(500);

        const snapshotResponse = await fetch(`${testServer.baseUrl}/api/state`);
        const snapshot = await snapshotResponse.json();
        expect(snapshot.sourceGate.label).toBe("Source ingest failed");
        expect(snapshot.sourceGate.detail).toContain("graph offline");
      } finally {
        await testServer.close();
      }
      await graphRepository.close();
    } finally {
      restoreEnv("NODE_ENV", previousNodeEnv);
      restoreEnv("CSG_FORCE_FIXTURE", previousForceFixture);
      restoreEnv("NPS_API_KEY", previousNpsKey);
    }
  });
});

async function listenForTest(app: Awaited<ReturnType<typeof createApp>>["app"]): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const { createServer } = await import("node:http");
  const server = createServer(app);
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Test server did not bind to a TCP port."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve, closeReject) => server.close((error) => error ? closeReject(error) : closeResolve()))
      });
    });
  });
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
