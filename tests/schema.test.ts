import { describe, expect, it } from "vitest";
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
});

describe("graph mapping", () => {
  it("maps an observation into typed graph nodes and relationships", () => {
    const graph = buildGraphSnapshot(fixtureSourceEvent, fixtureObservation);
    expect(graph.nodes.some((node) => node.kind === "Observation")).toBe(true);
    expect(graph.relationships.some((relationship) => relationship.type === "RAISES_RISK")).toBe(true);
    expect(graph.relationships.some((relationship) => relationship.type === "REQUIRES_ACTION")).toBe(true);
  });
});
