import { describe, expect, it } from "vitest";
import type { Driver, ManagedTransaction, QueryResult, RecordShape, Session } from "neo4j-driver";
import { fixtureObservation, fixtureSourceEvent } from "../src/server/fixtures";
import { Neo4jGraphRepository } from "../src/server/graph/repository";

describe("Neo4jGraphRepository", () => {
  it("persists and reads the full observation graph contract", async () => {
    const driver = new FakeNeo4jDriver();
    const repository = new Neo4jGraphRepository(driver as unknown as Driver);

    await repository.writeObservation(fixtureSourceEvent, fixtureObservation);
    const snapshot = await repository.snapshot();

    expect(repository.mode).toBe("neo4j");
    expect(driver.readQueries).toBeGreaterThan(0);
    expect(snapshot.nodes).toHaveLength(13);
    expect(snapshot.relationships).toHaveLength(12);
    expect(snapshot.nodes.some((node) => node.kind === "Run")).toBe(true);
    expect(new Set(snapshot.relationships.map((relationship) => relationship.type))).toEqual(
      new Set([
        "CAPTURED_FROM",
        "OBSERVED_AT",
        "SUPPORTED_BY",
        "GENERATED_IN_RUN",
        "SUGGESTS_SPECIES",
        "RAISES_RISK",
        "REQUIRES_ACTION",
        "RAISES_QUESTION"
      ])
    );
  });
});

class FakeNeo4jDriver {
  readQueries = 0;

  private readonly graph = {
    nodes: new Map<string, { id: string; label: string; kind: string; confidence?: number }>(),
    relationships: new Map<string, { from: string; to: string; type: string; confidence?: number }>()
  };

  session(): Pick<Session, "executeRead" | "executeWrite" | "close"> {
    return {
      executeRead: async <T>(work: (tx: ManagedTransaction) => Promise<T> | T) => {
        this.readQueries += 1;
        return work(this.transaction());
      },
      executeWrite: async <T>(work: (tx: ManagedTransaction) => Promise<T> | T) => work(this.transaction()),
      close: async () => {}
    };
  }

  async close() {}

  private transaction(): ManagedTransaction {
    return {
      run: async (query: string, params?: RecordShape) => this.run(query, params ?? {})
    } as ManagedTransaction;
  }

  private run(query: string, params: RecordShape): QueryResult {
    if (query.includes("MERGE (node:")) {
      const kind = query.match(/MERGE \(node:([A-Za-z]+) \{id: \$id\}\)/)?.[1];
      if (kind) {
        this.graph.nodes.set(params.id as string, {
          id: params.id as string,
          label: params.label as string,
          kind,
          confidence: (params.confidence ?? undefined) as number | undefined
        });
      }
      return result([]);
    }
    if (query.includes("MERGE (from)-[relationship:")) {
      const type = query.match(/MERGE \(from\)-\[relationship:([A-Z_]+)\]->\(to\)/)?.[1];
      if (type) {
        const relationship = {
          from: params.from as string,
          to: params.to as string,
          type,
          confidence: (params.confidence ?? undefined) as number | undefined
        };
        this.graph.relationships.set(`${relationship.from}:${relationship.type}:${relationship.to}`, relationship);
      }
      return result([]);
    }
    if (query.includes("RETURN node.id AS id")) {
      return result(
        Array.from(this.graph.nodes.values()).map((node) => ({
          id: node.id,
          label: node.label,
          kind: node.kind,
          confidence: node.confidence
        }))
      );
    }
    if (query.includes("RETURN from.id AS from")) {
      return result(
        Array.from(this.graph.relationships.values()).map((relationship) => ({
          from: relationship.from,
          to: relationship.to,
          type: relationship.type,
          confidence: relationship.confidence
        }))
      );
    }
    return result([]);
  }
}

function result(rows: Array<Record<string, unknown>>): QueryResult {
  return {
    records: rows.map((row) => ({
      get: (key: string) => row[key]
    }))
  } as QueryResult;
}
