import { createGraphRepository } from "./repository";
import { fixtureObservation, fixtureSourceEvent } from "../fixtures";

process.env.CSG_FORCE_FIXTURE = "0";

const repository = createGraphRepository();
const graph = await repository.writeObservation(fixtureSourceEvent, fixtureObservation);
await repository.close();

const relationshipTypes = graph.relationships.reduce<Record<string, number>>((counts, relationship) => {
  counts[relationship.type] = (counts[relationship.type] ?? 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    {
      mode: repository.mode,
      nodes: graph.nodes.length,
      relationships: graph.relationships.length,
      relationshipTypes
    },
    null,
    2
  )
);
