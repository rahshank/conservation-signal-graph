import { describe, expect, it } from "vitest";
import { createApp } from "../src/server/app";
import { fixtureObservation, fixtureSourceEvent } from "../src/server/fixtures";
import { probeNpsWebcamSource, defaultNpsWebcamTitle } from "../src/server/adapters/nps-webcam";
import { buildGraphSnapshot } from "../src/server/graph/map-observation";
import type { GraphRepository } from "../src/server/graph/repository";
import { extractedObservationSchema, sourceEventSchema, type GraphSnapshot } from "../src/shared/schema";

describe("source and extraction schemas", () => {
  it("validates the fixture source event", () => {
    expect(sourceEventSchema.parse(fixtureSourceEvent).sourceType).toBe("dataset_fixture");
  });

  it("validates the fixture extraction", () => {
    expect(extractedObservationSchema.parse(fixtureObservation).validationStatus).toBe("fixture");
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
      expect(result.source.sourceType).toBe("live_camera");
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
            sourceType: "live_camera",
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
        expect(snapshot.sourceGate.label).toBe("Live source ingest failed");
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
