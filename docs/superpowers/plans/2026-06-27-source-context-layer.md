# Source Context Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a learning/context layer and targeted NPS camera selection so the project can move from Yosemite Falls source proof to a more wildlife-likely source.

**Architecture:** Keep context artifacts in the same repository as the executable prototype. Extend the NPS adapter with explicit webcam targeting by `webcamId` or title substring, then run the same Groq extraction path against a stronger source candidate.

**Tech Stack:** TypeScript, Vitest, NPS webcam API, Groq vision extraction, Markdown context docs.

---

### Task 1: Targeted NPS Webcam Selection

**Files:**
- Modify: `src/server/adapters/nps-webcam.ts`
- Modify: `tests/schema.test.ts`

- [ ] **Step 1: Write the failing test**

Add a Vitest case that calls `probeNpsWebcamSource` with `titleIncludes: "Bartlett Cove Lagoon"` and a mocked NPS response containing two webcam records. Assert that the selected source name is `Bartlett Cove Lagoon and Fairweather Range`, the normalized image URL begins with `https://www.nps.gov/common/uploads/`, and the source is `live_camera`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```sh
npm run test
```

Expected: failure because `titleIncludes` is not yet part of the adapter options.

- [ ] **Step 3: Implement minimal adapter change**

Add optional `webcamId` and `titleIncludes` options. Read environment fallbacks from `NPS_WEBCAM_ID` and `NPS_WEBCAM_TITLE`. When a target is present, request a wider result set and select the matching webcam before falling back to the first image-bearing webcam.

- [ ] **Step 4: Run test to verify it passes**

Run:

```sh
npm run test
```

Expected: all Vitest tests pass.

### Task 2: Context Docs

**Files:**
- Create: `docs/context/README.md`
- Create: `docs/context/Pipeline_Explainer.md`
- Create: `docs/context/Source_Candidate_Register.md`
- Create: `docs/context/Glossary.md`
- Modify: `README.md`
- Modify: `docs/Source_Policy.md`

- [ ] **Step 1: Add context folder map**

Create a short README for the learning/context artifacts.

- [ ] **Step 2: Explain the pipeline**

Write a plain-language pipeline explainer covering source frame, Groq inference, structured observation, graph write, graph query, and UI evidence.

- [ ] **Step 3: Add source register**

Score source candidates by wildlife likelihood, machine access, permission status, refresh behavior, and review-link quality.

- [ ] **Step 4: Add glossary**

Define Groq, inference, embeddings, vector search, pgvector, Neo4j, knowledge graph, graph query, fixture, live source, validation status, and evidence bundle.

- [ ] **Step 5: Link docs from README and Source Policy**

Update existing docs so the learning layer is discoverable from the project entrypoints.

### Task 3: Bartlett Cove Groq Proof

**Files:**
- Modify: `docs/Evidence_2026-06-27.md`
- Modify: `docs/GitHub_Project_Backlog.md`

- [ ] **Step 1: Run targeted source proof**

Run:

```sh
node --env-file-if-exists=.env --import tsx -e "process.env.CSG_FORCE_FIXTURE='0'; const { probeNpsWebcamSource } = await import('./src/server/adapters/nps-webcam.ts'); const { extractObservation } = await import('./src/server/extraction/extractor.ts'); const result = await probeNpsWebcamSource({ titleIncludes: 'Bartlett Cove Lagoon' }); if (!result.ok) throw new Error(result.status + ': ' + result.detail); const obs = await extractObservation(result.source); console.log(JSON.stringify({ source: result.source.sourceName, model: obs.model, promptVersion: obs.promptVersion, latencyMs: obs.latencyMs, validationStatus: obs.validationStatus, confidence: obs.confidence, summary: obs.summary, speciesCandidates: obs.speciesCandidates, risks: obs.risks, actions: obs.actions, questions: obs.questions }, null, 2));"
```

Expected: valid Groq extraction with a recorded latency and source name.

- [ ] **Step 2: Record evidence**

Add the targeted source and Groq result to `docs/Evidence_2026-06-27.md`.

- [ ] **Step 3: Run verification**

Run:

```sh
npm run check
npm run test:e2e
```

Expected: secret scan, build, unit tests, and Playwright tests pass.

- [ ] **Step 4: Commit and push**

Run:

```sh
git add .
git commit -m "Add source context layer"
git push origin main
```

Expected: commit pushed to `main`.
