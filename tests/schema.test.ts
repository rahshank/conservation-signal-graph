import { describe, expect, it } from "vitest";
import { createApp } from "../src/server/app";
import { fixtureObservation, fixtureSourceEvent } from "../src/server/fixtures";
import { probeNpsWebcamSource } from "../src/server/adapters/nps-webcam";
import { buildGraphSnapshot } from "../src/server/graph/map-observation";
import { extractedObservationSchema, sourceEventSchema } from "../src/shared/schema";

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
