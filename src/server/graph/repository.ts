import neo4j, { type Driver } from "neo4j-driver";
import type { ExtractedObservation, GraphSnapshot, SourceEvent } from "../../shared/schema";
import { buildGraphSnapshot } from "./map-observation";

export interface GraphRepository {
  mode: "neo4j" | "memory";
  writeObservation(source: SourceEvent, observation: ExtractedObservation): Promise<GraphSnapshot>;
  snapshot(): Promise<GraphSnapshot>;
  close(): Promise<void>;
}

export class MemoryGraphRepository implements GraphRepository {
  mode = "memory" as const;
  private current: GraphSnapshot = { nodes: [], relationships: [] };

  async writeObservation(source: SourceEvent, observation: ExtractedObservation): Promise<GraphSnapshot> {
    const next = buildGraphSnapshot(source, observation);
    this.current = mergeGraphs(this.current, next);
    return this.current;
  }

  async snapshot(): Promise<GraphSnapshot> {
    return this.current;
  }

  async close(): Promise<void> {}
}

export class Neo4jGraphRepository implements GraphRepository {
  mode = "neo4j" as const;
  private fallback = new MemoryGraphRepository();

  constructor(private driver: Driver) {}

  async writeObservation(source: SourceEvent, observation: ExtractedObservation): Promise<GraphSnapshot> {
    const graph = await this.fallback.writeObservation(source, observation);
    const session = this.driver.session();
    try {
      await session.executeWrite((tx) =>
        tx.run(
          `
          MERGE (source:Source {id: $sourceId})
            SET source.label = $sourceName,
                source.sourceType = $sourceType,
                source.termsStatus = $termsStatus
          MERGE (frame:Frame {id: $frameId})
            SET frame.capturedAt = datetime($capturedAt),
                frame.imageUrl = $imageUrl
          MERGE (place:Place {id: $placeId})
            SET place.label = $locationLabel
          MERGE (observation:Observation {id: $observationId})
            SET observation.summary = $summary,
                observation.confidence = $confidence,
                observation.model = $model,
                observation.promptVersion = $promptVersion,
                observation.latencyMs = $latencyMs
          MERGE (frame)-[:CAPTURED_FROM]->(source)
          MERGE (frame)-[:OBSERVED_AT]->(place)
          MERGE (observation)-[:SUPPORTED_BY {confidence: $confidence}]->(frame)
          `,
          {
            sourceId: source.sourceId,
            sourceName: source.sourceName,
            sourceType: source.sourceType,
            termsStatus: source.termsStatus,
            frameId: observation.frameId,
            capturedAt: source.capturedAt,
            imageUrl: source.imageUrl ?? null,
            placeId: source.locationLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            locationLabel: source.locationLabel,
            observationId: observation.observationId,
            summary: observation.summary,
            confidence: observation.confidence,
            model: observation.model,
            promptVersion: observation.promptVersion,
            latencyMs: observation.latencyMs
          }
        )
      );
    } finally {
      await session.close();
    }
    return graph;
  }

  async snapshot(): Promise<GraphSnapshot> {
    return this.fallback.snapshot();
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}

export function createGraphRepository(): GraphRepository {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;
  if (!uri || !username || !password || process.env.CSG_FORCE_FIXTURE === "1") {
    return new MemoryGraphRepository();
  }
  return new Neo4jGraphRepository(neo4j.driver(uri, neo4j.auth.basic(username, password)));
}

function mergeGraphs(left: GraphSnapshot, right: GraphSnapshot): GraphSnapshot {
  const nodes = Array.from(new Map([...left.nodes, ...right.nodes].map((node) => [node.id, node])).values());
  const relationships = Array.from(
    new Map(
      [...left.relationships, ...right.relationships].map((rel) => [`${rel.from}:${rel.type}:${rel.to}`, rel])
    ).values()
  );
  return { nodes, relationships };
}
