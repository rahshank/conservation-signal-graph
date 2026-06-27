# GitHub Project Backlog

## Purpose
Track the GitHub Project backlog for Conservation Signal Graph.

Project: https://github.com/users/rahshank/projects/1

GitHub created the Project as private by default. Visibility should be changed separately if public project-board traceability is required.

## Status Values

- Todo
- In Progress
- Done

## Issues

| Title | Status | Acceptance |
| --- | --- | --- |
| Source viability: NPS Yosemite Falls webcam | Done | `npm run source:probe` returns a live camera source with API key configured |
| Run first real Groq vision extraction | In Progress | Real Groq calls passed for Yosemite Falls and Bartlett Cove; UI still needs clear model, prompt version, latency, and validation status display |
| Modern product design pass | In Progress | Desktop and mobile screenshots feel like a designed product surface |
| Persist observation graph in Neo4j | Todo | Local Neo4j starts and `npm run graph:probe` reports `mode: neo4j` |
| Expand Neo4j relationship writes | Todo | Species, risk, action, and question relationships are persisted in Neo4j |
| Create public evidence bundle | Todo | Screenshots, test output, latency notes, and source decision live together |
| Source viability: second public camera candidate | Todo | Terms and access route documented; decision recorded |
| Credential hygiene after local GitHub bootstrap | Done | Rotate the exposed local GitHub credential and confirm no credentials exist in repo files or issue text |

## Change log
- 2026-06-27: Updated Groq issue status after successful real model calls against Yosemite Falls and Bartlett Cove.
- 2026-06-27: Created the actual GitHub Project, attached issues #1-#8, and recorded current statuses.
- 2026-06-27: Added design-pass and credential-hygiene work after the first real GitHub setup pass.
- 2026-06-27: Created first backlog seed.
