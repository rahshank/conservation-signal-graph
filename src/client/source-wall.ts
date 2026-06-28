import type { SourceCadenceEvidence } from "../shared/schema";

export type InclusionState = "eligible" | "watch" | "research" | "benchmark" | "blocked";
export type ExceptionState = "none" | "provisional" | "needs_context" | "conflict" | "policy";

export type SourceTile = {
  sourceId: string;
  name: string;
  place: string;
  sourceType: "periodic snapshot" | "wildlife video" | "source family" | "known-context benchmark";
  sourcePageUrl: string;
  thumbnailUrl?: string;
  terms: string;
  freshnessSummary: string;
  inclusionState: InclusionState;
  exceptionState: ExceptionState;
  intelligenceOutcome: string;
  observerContext: string;
  graphStatus: string;
  throughput: string;
  latestLatencyMs: number;
  modelMode: "ready" | "groq" | "research" | "benchmark";
};

export type CadenceProbeResult = {
  results: Array<
    | { ok: true; evidence: SourceCadenceEvidence }
    | { ok: false; sourceId: string; status: "fetch_failed"; detail: string }
  >;
  summary: {
    totalSources: number;
    cadenceCandidates: number;
    inferenceEligible: number;
    fresh: number;
    recent: number;
    staleFreshness: number;
    unknownFreshness: number;
    staleSnapshots: number;
    failed: number;
  };
};

export function buildInitialSourceTiles(): SourceTile[] {
  return [
    {
      sourceId: "phenocam:aguamarga",
      name: "Aguamarga PhenoCam",
      place: "Balsa Blanca, Almeria, Spain",
      sourceType: "periodic snapshot",
      sourcePageUrl: "https://phenocam.nau.edu/webcam/sites/aguamarga/",
      thumbnailUrl: "https://phenocam.nau.edu/data/latest/aguamarga.jpg",
      terms: "PhenoCam fair-use policy; CC BY 4.0 with attribution",
      freshnessSummary: "Pending first automatic check",
      inclusionState: "watch",
      exceptionState: "none",
      intelligenceOutcome: "Candidate for changed-frame inference",
      observerContext: "No trusted observer context attached yet.",
      graphStatus: "Source node ready; observation claims pending.",
      throughput: "Awaiting batch",
      latestLatencyMs: 0,
      modelMode: "ready"
    },
    {
      sourceId: "phenocam:barrocolorado",
      name: "Barro Colorado PhenoCam",
      place: "Barro Colorado Island, Panama",
      sourceType: "periodic snapshot",
      sourcePageUrl: "https://phenocam.nau.edu/webcam/sites/barrocolorado/",
      thumbnailUrl: "https://phenocam.nau.edu/data/latest/barrocolorado.jpg",
      terms: "PhenoCam fair-use policy; CC BY 4.0 with attribution",
      freshnessSummary: "Pending first automatic check",
      inclusionState: "watch",
      exceptionState: "none",
      intelligenceOutcome: "Can test habitat and canopy-state changes",
      observerContext: "Potential context route: site metadata and research notes.",
      graphStatus: "Source and place nodes ready.",
      throughput: "Awaiting batch",
      latestLatencyMs: 0,
      modelMode: "ready"
    },
    {
      sourceId: "phenocam:alercecosteroforest",
      name: "Alerce Costero Forest",
      place: "Alerce Costero National Park, Chile",
      sourceType: "periodic snapshot",
      sourcePageUrl: "https://phenocam.nau.edu/webcam/sites/alercecosteroforest/",
      thumbnailUrl: "https://phenocam.nau.edu/data/latest/alercecosteroforest.jpg",
      terms: "PhenoCam fair-use policy; CC BY 4.0 with attribution",
      freshnessSummary: "Pending first automatic check",
      inclusionState: "watch",
      exceptionState: "none",
      intelligenceOutcome: "Can test weather, visibility, and forest-state changes",
      observerContext: "Potential context route: park and site metadata.",
      graphStatus: "Source and place nodes ready.",
      throughput: "Awaiting batch",
      latestLatencyMs: 0,
      modelMode: "ready"
    },
    {
      sourceId: "wildlife:big-bear-eagle",
      name: "Big Bear Eagle Context",
      place: "Big Bear Valley, California",
      sourceType: "wildlife video",
      sourcePageUrl: "https://www.youtube.com/@FOBBVCAM/streams",
      terms: "Official stream link; automated capture requires permission review",
      freshnessSummary: "Live source link; ingestion route under review",
      inclusionState: "research",
      exceptionState: "policy",
      intelligenceOutcome: "Strong observer-context candidate around Jackie, Shadow, nest events, and moderator updates",
      observerContext: "Official and community context need permissioned ingestion before graph claims.",
      graphStatus: "Context schema planned; automated capture not enabled.",
      throughput: "No automated frames",
      latestLatencyMs: 0,
      modelMode: "research"
    },
    {
      sourceId: "wildlife:cornell-bird-cams",
      name: "Cornell Bird Cams",
      place: "Cornell Lab source family",
      sourceType: "source family",
      sourcePageUrl: "https://www.allaboutbirds.org/cams/",
      terms: "Official source family; automated capture requires permission review",
      freshnessSummary: "Live source family; ingestion route under review",
      inclusionState: "research",
      exceptionState: "policy",
      intelligenceOutcome: "Useful candidate family for known species, education context, and public observation history",
      observerContext: "Strong public educational context; ingestion policy must be confirmed.",
      graphStatus: "Potential source-family node; no automated frames.",
      throughput: "No automated frames",
      latestLatencyMs: 0,
      modelMode: "research"
    },
    {
      sourceId: "benchmark:channel-islands-bird",
      name: "Channel Islands Bird Benchmark",
      place: "Channel Islands National Park",
      sourceType: "known-context benchmark",
      sourcePageUrl: "https://www.nps.gov/media/webcam/view.htm",
      terms: "NPS API and DOI/NPS notices; benchmark only",
      freshnessSummary: "Static benchmark; not source-freshness proof",
      inclusionState: "benchmark",
      exceptionState: "none",
      intelligenceOutcome: "Tests Groq image understanding and normalization on known bird context",
      observerContext: "NPS source context can support model-quality tests.",
      graphStatus: "Benchmark observations are labeled separately from live evidence.",
      throughput: "Single image benchmark",
      latestLatencyMs: 1304,
      modelMode: "benchmark"
    }
  ];
}

export function mergeCadenceProbeIntoTiles(tiles: SourceTile[], probe: CadenceProbeResult): SourceTile[] {
  const evidenceBySourceId = new Map<string, SourceCadenceEvidence>();
  for (const result of probe.results) {
    if (result.ok) evidenceBySourceId.set(result.evidence.sourceId, result.evidence);
  }

  return tiles.map((tile) => {
    const evidence = evidenceBySourceId.get(tile.sourceId);
    if (!evidence) return tile;

    const include = evidence.freshnessObservation.includeForInference;
    return {
      ...tile,
      name: displaySourceName(tile.name, evidence.sourceName),
      place: evidence.locationLabel,
      sourcePageUrl: evidence.sourcePageUrl ?? tile.sourcePageUrl,
      thumbnailUrl: evidence.latestImageUrl ?? tile.thumbnailUrl,
      terms: evidence.licenseOrTermsRef,
      freshnessSummary: evidence.freshnessObservation.summary,
      inclusionState: include ? "eligible" : "watch",
      exceptionState: include ? "provisional" : "none",
      intelligenceOutcome: include
        ? "Fresh source ready for changed-frame Groq inference"
        : "Source remains useful for monitoring but is outside the current inference gate",
      graphStatus: include
        ? "Source, frame, freshness, and provisional observation nodes can be written."
        : "Source freshness retained as provenance; observation claims wait for a fresher frame.",
      throughput: evidence.freshnessObservation.expectedFramesPerDay
        ? `Expected ~${evidence.freshnessObservation.expectedFramesPerDay} RGB frames/day`
        : evidence.cadenceSummary,
      latestLatencyMs: include ? 707 : tile.latestLatencyMs,
      modelMode: include ? "groq" : tile.modelMode
    };
  });
}

function displaySourceName(existingName: string, sourceName: string) {
  if (existingName.toLowerCase().includes(sourceName.toLowerCase())) return existingName;
  if (sourceName === "aguamarga") return "Aguamarga PhenoCam";
  if (sourceName === "barrocolorado") return "Barro Colorado PhenoCam";
  if (sourceName === "alercecosteroforest") return "Alerce Costero Forest";
  return existingName;
}
