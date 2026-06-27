import type { ExtractedObservation, GraphNode, GraphRelationship, GraphSnapshot, SourceEvent } from "../../shared/schema";

export function buildGraphSnapshot(source: SourceEvent, observation: ExtractedObservation): GraphSnapshot {
  const sourceNodeId = `source:${source.sourceId}`;
  const frameNodeId = `frame:${observation.frameId}`;
  const placeNodeId = `place:${slug(source.locationLabel)}`;
  const observationNodeId = `observation:${observation.observationId}`;
  const runNodeId = `run:${observation.promptVersion}:${observation.model}`;

  const nodes: GraphNode[] = [
    { id: sourceNodeId, label: source.sourceName, kind: "Source" as const },
    { id: frameNodeId, label: observation.frameId, kind: "Frame" as const },
    { id: placeNodeId, label: source.locationLabel, kind: "Place" as const },
    { id: observationNodeId, label: observation.summary, kind: "Observation" as const, confidence: observation.confidence },
    { id: runNodeId, label: observation.model, kind: "Run" as const }
  ];

  for (const candidate of observation.speciesCandidates) {
    nodes.push({
      id: `species:${slug(candidate.label)}`,
      label: candidate.label,
      kind: "SpeciesCandidate",
      confidence: candidate.confidence
    });
  }
  for (const risk of observation.risks) {
    nodes.push({
      id: `risk:${slug(risk.label)}`,
      label: risk.label,
      kind: "Risk",
      confidence: risk.confidence
    });
  }
  for (const action of observation.actions) {
    nodes.push({
      id: `action:${slug(action.label)}`,
      label: action.label,
      kind: "Action",
      confidence: action.confidence
    });
  }
  for (const question of observation.questions) {
    nodes.push({
      id: `question:${slug(question)}`,
      label: question,
      kind: "Question"
    });
  }

  const relationships: GraphRelationship[] = [
    { from: frameNodeId, to: sourceNodeId, type: "CAPTURED_FROM" as const },
    { from: frameNodeId, to: placeNodeId, type: "OBSERVED_AT" as const },
    { from: observationNodeId, to: frameNodeId, type: "SUPPORTED_BY" as const, confidence: observation.confidence },
    { from: observationNodeId, to: runNodeId, type: "GENERATED_IN_RUN" as const }
  ];

  for (const candidate of observation.speciesCandidates) {
    relationships.push({
      from: observationNodeId,
      to: `species:${slug(candidate.label)}`,
      type: "SUGGESTS_SPECIES",
      confidence: candidate.confidence
    });
  }
  for (const risk of observation.risks) {
    relationships.push({
      from: observationNodeId,
      to: `risk:${slug(risk.label)}`,
      type: "RAISES_RISK",
      confidence: risk.confidence
    });
  }
  for (const action of observation.actions) {
    relationships.push({
      from: observationNodeId,
      to: `action:${slug(action.label)}`,
      type: "REQUIRES_ACTION",
      confidence: action.confidence
    });
  }
  for (const question of observation.questions) {
    relationships.push({
      from: observationNodeId,
      to: `question:${slug(question)}`,
      type: "RAISES_QUESTION"
    });
  }

  return { nodes: dedupeById(nodes), relationships };
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
