# Test Plan

## Purpose
Make the prototype credible as an AI-assisted development artifact.

## Required checks

| Check | Command | What it proves |
| --- | --- | --- |
| Type and build check | `npm run build` | Dashboard and server types compile |
| Unit tests | `npm run test` | Schemas, source gate, and graph mapping work |
| Browser test | `npm run test:e2e` | Dashboard renders and can ingest a signal |
| Source gate | `npm run source:probe` | Source status is explicit |
| Source cadence probe | `GET /api/sources/probe/phenocam` and `npm run source:probe` | Freshness, update interval, headers, and daily counts are recorded before Groq speed claims |
| Neo4j smoke test | `npm run graph:probe` | Graph write boundary works when Neo4j is configured |

## Acceptance scenarios

- The app opens to an operational dashboard, not a marketing page.
- The source gate is visible before any live, near-live, or speed-sensitive claim.
- A source with a stale image URL is rejected or labeled as stale before ingestion.
- A source with measured cadence stores freshness evidence with every event.
- The UI can check updating source candidates before frame analysis.
- A fixture event can be ingested and labeled as fixture data.
- The graph contains observation, risk, action, question, source, frame, place, and run nodes.
- The UI shows metrics for event count, graph mode, extraction mode, and latency.
- Playwright verifies desktop and mobile dashboard rendering.

## Evidence bundle

Each public milestone should preserve:

- test output
- browser screenshots
- source-policy decision
- source-cadence evidence
- observer-context source decision when context is part of the claim
- latency and cost notes
- short writeup of what changed

## Change log
- 2026-06-28: Marked the PhenoCam cadence probe as implemented and added UI acceptance for source-cadence checks.
- 2026-06-28: Added source-cadence proof as a required test gate before public speed claims.
- 2026-06-27: Created first test plan.
