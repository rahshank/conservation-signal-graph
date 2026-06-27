import { createGraphRepository } from "./repository";
import { fixtureObservation, fixtureSourceEvent } from "../fixtures";

const repository = createGraphRepository();
const graph = await repository.writeObservation(fixtureSourceEvent, fixtureObservation);
await repository.close();

console.log(JSON.stringify({ mode: repository.mode, nodes: graph.nodes.length, relationships: graph.relationships.length }, null, 2));
