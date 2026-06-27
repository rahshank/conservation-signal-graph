# Neo4j Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Neo4j the read/write graph source when Neo4j credentials are configured.

**Architecture:** Keep `GraphRepository` as the app boundary. Preserve memory mode for local fixture work and tests, but make `Neo4jGraphRepository.snapshot()` read graph nodes and relationships from Neo4j instead of the memory fallback. Keep the first Neo4j write focused on the current graph contract: source, frame, place, observation, run, species candidates, risks, actions, questions, and their relationships.

**Tech Stack:** TypeScript, neo4j-driver, Vitest, Docker Compose Neo4j, Zod graph schemas.

---

### Task 1: Repository Contract Test

**Files:**
- Create: `tests/graph-repository.test.ts`
- Modify: `src/server/graph/repository.ts`

- [x] **Step 1: Write the failing test**

Create a test that writes `fixtureSourceEvent` and `fixtureObservation` to a repository backed by a fake Neo4j session, then calls `snapshot()`.

Assert:
- `snapshot.nodes.length` is `13`
- `snapshot.relationships.length` is `12`
- the graph has a `Run` node
- the graph has `SUGGESTS_SPECIES`, `RAISES_RISK`, `REQUIRES_ACTION`, `RAISES_QUESTION`, and `GENERATED_IN_RUN` relationships
- `repository.mode` is `neo4j`

- [x] **Step 2: Run test to verify it fails**

Run:

```sh
npm run test -- tests/graph-repository.test.ts
```

Expected: failure because the current Neo4j repository writes only part of the graph and reads snapshots from the memory fallback.

- [x] **Step 3: Implement minimal Neo4j read/write mapping**

Update `Neo4jGraphRepository` so `writeObservation()` merges every node and relationship from `buildGraphSnapshot(source, observation)`.

Code review addition: namespace all persisted nodes with `ConservationSignalGraph`, match relationship endpoints only inside that namespace, and read snapshots only from that namespace. This keeps the prototype safe against unrelated data when using an existing Neo4j database.

Update `snapshot()` so it reads from Neo4j:

```cypher
MATCH (node)
WHERE any(label IN labels(node) WHERE label IN $knownKinds)
RETURN node.id AS id, node.label AS label, labels(node)[0] AS kind, node.confidence AS confidence
```

and:

```cypher
MATCH (from)-[relationship]->(to)
WHERE any(label IN labels(from) WHERE label IN $knownKinds)
  AND any(label IN labels(to) WHERE label IN $knownKinds)
RETURN from.id AS from, to.id AS to, type(relationship) AS type, relationship.confidence AS confidence
```

- [x] **Step 4: Run test to verify it passes**

Run:

```sh
npm run test -- tests/graph-repository.test.ts
```

Expected: graph repository test passes.

### Task 2: Local Neo4j Proof

**Files:**
- Modify: `src/server/graph/probe-neo4j.ts`
- Modify: `docs/Evidence_2026-06-27.md`

- [x] **Step 1: Make probe output assertable**

Ensure `npm run graph:probe` prints JSON with:
- `mode`
- `nodes`
- `relationships`
- relationship type counts

Code review addition: the probe forces `CSG_FORCE_FIXTURE=0` so the graph persistence proof is not disabled by fixture extraction mode.

- [ ] **Step 2: Start local Neo4j**

Run:

```sh
docker compose up -d
```

Expected: Neo4j container is running locally on Bolt port `7687`.

Result on 2026-06-27: blocked because `docker`, `podman`, `colima`, `neo4j`, Homebrew, and Java runtime are not available in this local environment.

- [ ] **Step 3: Run probe**

Run:

```sh
npm run graph:probe
```

Expected: `mode` is `neo4j`, `nodes` is `13`, and `relationships` is `12`.

Result on 2026-06-27: blocked because `npm run graph:probe` could not connect to `127.0.0.1:7687`.

- [x] **Step 4: Record evidence**

Update `docs/Evidence_2026-06-27.md` with the Neo4j probe output and the commands run.

### Task 3: Verification And Review

**Files:**
- Modify only files touched by Tasks 1 and 2.

- [x] **Step 1: Run full verification**

Run:

```sh
npm run check
npm run test:e2e
.tools/bin/fieldwork-web check conservation-signal-graph
```

Expected: all checks pass.

- [x] **Step 2: Request code review**

Review the branch diff against `main`. Check for persistence bugs, graph contract gaps, missing evidence, and unsafe local Neo4j assumptions.

Result on 2026-06-27: review found missing app namespace isolation and missing `CSG_FORCE_FIXTURE=0` proof guidance. Both were fixed.

- [ ] **Step 3: Commit and push**

Run:

```sh
git add src/server/graph/repository.ts src/server/graph/probe-neo4j.ts tests/graph-repository.test.ts docs/Evidence_2026-06-27.md docs/superpowers/plans/2026-06-27-neo4j-persistence.md
git commit -m "Persist graph snapshots in Neo4j"
git push -u origin rah-8-neo4j-persistence
```

Expected: branch is pushed and ready for PR or review.

## Self-review

- Spec coverage: covers `RAH-8` acceptance for Neo4j mode, write/read persistence, and graph probe evidence.
- Placeholder scan: no placeholders.
- Type consistency: uses existing `GraphRepository`, `GraphSnapshot`, and relationship type names.
