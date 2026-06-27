import { z } from "zod";

export const sourceEventSchema = z.object({
  sourceId: z.string().min(1),
  sourceName: z.string().min(1),
  sourceType: z.enum(["live_camera", "dataset_fixture"]),
  capturedAt: z.string().datetime(),
  imageUrl: z.string().url().optional(),
  imageBlobRef: z.string().optional(),
  locationLabel: z.string().min(1),
  sourcePageUrl: z.string().url().optional(),
  licenseOrTermsRef: z.string().min(1),
  termsStatus: z.enum(["permitted", "requires_key", "requires_permission", "fixture_only"]),
  notes: z.string().optional()
});

export const extractedObservationSchema = z.object({
  observationId: z.string().min(1),
  sourceId: z.string().min(1),
  frameId: z.string().min(1),
  observedAt: z.string().datetime(),
  speciesCandidates: z.array(
    z.object({
      label: z.string().min(1),
      confidence: z.number().min(0).max(1),
      evidence: z.string().min(1)
    })
  ),
  risks: z.array(
    z.object({
      label: z.string().min(1),
      severity: z.enum(["low", "medium", "high"]),
      confidence: z.number().min(0).max(1),
      evidence: z.string().min(1)
    })
  ),
  actions: z.array(
    z.object({
      label: z.string().min(1),
      ownerHint: z.string().min(1),
      confidence: z.number().min(0).max(1)
    })
  ),
  questions: z.array(z.string().min(1)),
  summary: z.string().min(1),
  confidence: z.number().min(0).max(1),
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  latencyMs: z.number().min(0),
  validationStatus: z.enum(["valid", "fixture", "invalid"])
});

export const graphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["Source", "Frame", "Observation", "SpeciesCandidate", "Place", "Risk", "Action", "Question", "Run"]),
  confidence: z.number().optional()
});

export const graphRelationshipSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum([
    "CAPTURED_FROM",
    "OBSERVED_AT",
    "SUGGESTS_SPECIES",
    "RAISES_RISK",
    "REQUIRES_ACTION",
    "RAISES_QUESTION",
    "SUPPORTED_BY",
    "GENERATED_IN_RUN"
  ]),
  confidence: z.number().optional()
});

export const graphSnapshotSchema = z.object({
  nodes: z.array(graphNodeSchema),
  relationships: z.array(graphRelationshipSchema)
});

export type SourceEvent = z.infer<typeof sourceEventSchema>;
export type ExtractedObservation = z.infer<typeof extractedObservationSchema>;
export type GraphNode = z.infer<typeof graphNodeSchema>;
export type GraphRelationship = z.infer<typeof graphRelationshipSchema>;
export type GraphSnapshot = z.infer<typeof graphSnapshotSchema>;

export type SignalMetrics = {
  totalEvents: number;
  liveEvents: number;
  fixtureEvents: number;
  averageLatencyMs: number;
  validationPassRate: number;
  graphMode: "neo4j" | "memory";
  extractionMode: "groq" | "fixture";
};

export type DashboardState = {
  events: Array<{
    source: SourceEvent;
    observation: ExtractedObservation;
  }>;
  graph: GraphSnapshot;
  metrics: SignalMetrics;
  sourceGate: {
    status: "blocked_missing_key" | "ready_for_probe" | "fixture_only";
    label: string;
    detail: string;
  };
};
