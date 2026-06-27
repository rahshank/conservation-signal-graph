# Backlog Snapshot

## Purpose
Preserve the original backlog import for Conservation Signal Graph.

Linear is now the operating backlog:

- Project: https://linear.app/rahshank/project/conservation-signal-graph-2f78e7f44301
- Baseline document: https://linear.app/rahshank/document/project-baseline-8fd339e51a7d

GitHub remains the code and PR surface. Repository docs remain the durable evidence and learning record. This file is a historical snapshot and should not be edited as the active board.

## Status Values

- Todo
- In Progress
- Done

## Issues

| Title | Status | Acceptance |
| --- | --- | --- |
| Source viability: NPS Yosemite Falls webcam | Done | `npm run source:probe` returns a live camera source with API key configured |
| Expose model-run and frame-normalization details in UI | In Progress | Linear `RAH-6`; UI shows model, prompt version, latency, validation status, confidence, extraction mode, graph mode, and normalization metadata |
| Modern product design pass | In Progress | Linear `RAH-7`; desktop and mobile screenshots feel like a designed product surface |
| Persist observation graph in Neo4j | Todo | Linear `RAH-8`; local Neo4j starts and `npm run graph:probe` reports `mode: neo4j` |
| Expand Neo4j relationship writes | Todo | Linear `RAH-9`; species, risk, action, and question relationships are persisted in Neo4j |
| Create public evidence bundle | Todo | Linear `RAH-10`; screenshots, test output, latency notes, and source decision live together |
| Source viability: second public camera candidate | Done | Bartlett Cove documented in source register; targeted adapter and Groq proof passed |
| Credential hygiene after local GitHub bootstrap | Done | Rotate the exposed local GitHub credential and confirm no credentials exist in repo files or issue text |
| Add image normalization before Groq vision calls | Done | Oversized source frames are normalized before Groq inference, metadata is recorded, and bird-cam proof passed through the product path |
| Define product personas and narrative test lenses | Todo | Linear `RAH-13`; personas shape acceptance criteria, UI labels, evidence screenshots, and the public case-study narrative |
| Ingest trusted commentary context for camera sources | Todo | Linear `RAH-14`; official or permitted commentary can be ingested as source-linked context and connected to frames, observations, species, actors, events, and review questions |

## Change log
- 2026-06-27: Switched active backlog ownership to Linear and converted this file to a historical snapshot.
- 2026-06-27: Added trusted commentary context backlog item.
- 2026-06-27: Added persona-definition backlog item.
- 2026-06-27: Marked issue #9 done after image normalization passed the product-path bird-cam proof.
- 2026-06-27: Added issue #9 after the bird-cam proof exposed Groq image-size limits.
- 2026-06-27: Closed issue #7 after documenting Bartlett Cove and proving targeted Groq extraction.
- 2026-06-27: Updated Groq issue status after successful real model calls against Yosemite Falls and Bartlett Cove.
- 2026-06-27: Created the actual GitHub Project, attached issues #1-#8, and recorded current statuses.
- 2026-06-27: Added design-pass and credential-hygiene work after the first real GitHub setup pass.
- 2026-06-27: Created first backlog seed.
