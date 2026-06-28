import type { DashboardState, ExtractedObservation, SourceEvent } from "../shared/schema";
import { buildGraphSnapshot } from "./graph/map-observation";

export const fixtureSourceEvent: SourceEvent = {
  sourceId: "fixture-wsu-lynx-replay",
  sourceName: "Camera-trap replay fixture",
  sourceType: "dataset_fixture",
  capturedAt: "2026-06-27T18:00:00.000Z",
  imageBlobRef: "/fixture-frame.svg",
  locationLabel: "Protected-area edge habitat",
  sourcePageUrl: "https://lila.science/datasets",
  licenseOrTermsRef: "LILA dataset catalogue; fixture metadata only in this prototype",
  termsStatus: "fixture_only",
  notes: "Development fixture. Public claims must not describe this as a live camera feed."
};

export const fixtureObservation: ExtractedObservation = {
  observationId: "obs-fixture-001",
  sourceId: fixtureSourceEvent.sourceId,
  frameId: "frame-fixture-001",
  observedAt: fixtureSourceEvent.capturedAt,
  speciesCandidates: [
    {
      label: "medium mammal candidate",
      confidence: 0.72,
      evidence: "Quadruped silhouette and reflective eyes near the trail edge."
    },
    {
      label: "uncertain ungulate or canid",
      confidence: 0.41,
      evidence: "Body shape is partially occluded; scale marker is unavailable."
    }
  ],
  risks: [
    {
      label: "low-confidence species identification",
      severity: "medium",
      confidence: 0.68,
      evidence: "Species class has two plausible candidates."
    },
    {
      label: "human-review needed before response",
      severity: "low",
      confidence: 0.81,
      evidence: "The observation affects the protected-area activity log."
    }
  ],
  actions: [
    {
      label: "Queue frame for ranger or biologist review",
      ownerHint: "field-review",
      confidence: 0.82
    },
    {
      label: "Compare with recent activity at the same camera",
      ownerHint: "graph-query",
      confidence: 0.76
    }
  ],
  questions: [
    "Has this camera recorded similar candidates in the last seven days?",
    "Is there enough evidence to connect this observation to an existing species node?"
  ],
  summary: "A camera-trap replay event produced an uncertain mammal observation that should be reviewed before operational use.",
  confidence: 0.74,
  model: "fixture-extractor",
  promptVersion: "csg-v0.1",
  latencyMs: 18,
  validationStatus: "fixture"
};

export function seededDashboardState(): DashboardState {
  const graph = buildGraphSnapshot(fixtureSourceEvent, fixtureObservation);
  return {
    events: [{ source: fixtureSourceEvent, observation: fixtureObservation }],
    graph,
    metrics: {
      totalEvents: 1,
      liveEvents: 0,
      fixtureEvents: 1,
      averageLatencyMs: fixtureObservation.latencyMs,
      validationPassRate: 1,
      graphMode: "memory",
      extractionMode: "fixture"
    },
    sourceGate: {
      status: "ready_for_probe",
      label: "Source freshness gate",
      detail: "Use Find updating sources to check PhenoCam freshness before any Groq inference. NPS remains a separate static image benchmark."
    }
  };
}
