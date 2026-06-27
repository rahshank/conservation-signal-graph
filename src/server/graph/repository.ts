import neo4j, { type Driver } from "neo4j-driver";
import type { ExtractedObservation, GraphNode, GraphRelationship, GraphSnapshot, SourceEvent } from "../../shared/schema";
import { buildGraphSnapshot } from "./map-observation";

const KNOWN_NODE_KINDS: GraphNode["kind"][] = [
  "Source",
  "Frame",
  "Observation",
  "SpeciesCandidate",
  "Place",
  "Risk",
  "Action",
  "Question",
  "Run"
];

const KNOWN_RELATIONSHIP_TYPES: GraphRelationship["type"][] = [
  "CAPTURED_FROM",
  "OBSERVED_AT",
  "SUGGESTS_SPECIES",
  "RAISES_RISK",
  "REQUIRES_ACTION",
  "RAISES_QUESTION",
  "SUPPORTED_BY",
  "GENERATED_IN_RUN"
];
const APP_NAMESPACE_LABEL = "ConservationSignalGraph";

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

  constructor(private driver: Driver) {}

  async writeObservation(source: SourceEvent, observation: ExtractedObservation): Promise<GraphSnapshot> {
    const graph = buildGraphSnapshot(source, observation);
    const session = this.driver.session();
    try {
      await session.executeWrite(async (tx) => {
        for (const node of graph.nodes) {
          await tx.run(
            `
            MERGE (node:${APP_NAMESPACE_LABEL}:${node.kind} {id: $id})
              SET node.label = $label,
                  node.confidence = $confidence,
                  node.app = $app
            `,
            {
              id: node.id,
              label: node.label,
              confidence: node.confidence ?? null,
              app: APP_NAMESPACE_LABEL
            }
          );
        }

        for (const relationship of graph.relationships) {
          await tx.run(
            `
            MATCH (from:${APP_NAMESPACE_LABEL} {id: $from})
            MATCH (to:${APP_NAMESPACE_LABEL} {id: $to})
            MERGE (from)-[relationship:${relationship.type}]->(to)
              SET relationship.confidence = $confidence
            `,
            {
              from: relationship.from,
              to: relationship.to,
              confidence: relationship.confidence ?? null
            }
          );
        }
      });
    } finally {
      await session.close();
    }
    return this.snapshot();
  }

  async snapshot(): Promise<GraphSnapshot> {
    const session = this.driver.session();
    try {
      const [nodeResult, relationshipResult] = await session.executeRead(async (tx) => {
        const nodes = await tx.run(
          `
          MATCH (node)
          WHERE $appLabel IN labels(node)
            AND any(label IN labels(node) WHERE label IN $knownKinds)
          RETURN node.id AS id,
                 node.label AS label,
                 [label IN labels(node) WHERE label IN $knownKinds][0] AS kind,
                 node.confidence AS confidence
          ORDER BY id
          `,
          { knownKinds: KNOWN_NODE_KINDS, appLabel: APP_NAMESPACE_LABEL }
        );
        const relationships = await tx.run(
          `
          MATCH (from)-[relationship]->(to)
          WHERE type(relationship) IN $knownTypes
            AND $appLabel IN labels(from)
            AND $appLabel IN labels(to)
            AND any(label IN labels(from) WHERE label IN $knownKinds)
            AND any(label IN labels(to) WHERE label IN $knownKinds)
          RETURN from.id AS from, to.id AS to, type(relationship) AS type, relationship.confidence AS confidence
          ORDER BY from, type, to
          `,
          {
            knownKinds: KNOWN_NODE_KINDS,
            knownTypes: KNOWN_RELATIONSHIP_TYPES,
            appLabel: APP_NAMESPACE_LABEL
          }
        );
        return [nodes, relationships] as const;
      });

      return {
        nodes: nodeResult.records.map((record) => ({
          id: record.get("id") as string,
          label: record.get("label") as string,
          kind: record.get("kind") as GraphNode["kind"],
          confidence: toOptionalNumber(record.get("confidence"))
        })),
        relationships: relationshipResult.records.map((record) => ({
          from: record.get("from") as string,
          to: record.get("to") as string,
          type: record.get("type") as GraphRelationship["type"],
          confidence: toOptionalNumber(record.get("confidence"))
        }))
      };
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
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
