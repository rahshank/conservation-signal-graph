# Conservation Signal Graph

## Purpose
Build a public-quality Groq + Neo4j prototype for protected-area monitoring.

A camera or near-live source enters the system. Groq turns the frame into structured observations. Neo4j stores the observation as a context graph. The UI shows incoming events, source status, graph relationships, confidence, unresolved risks, and response cues.

## Current status
The prototype scaffold is implemented with:

- TypeScript server and React dashboard
- NPS webcam source probe
- Groq extraction boundary
- Neo4j graph repository boundary
- Fixture extractor for local development
- Unit tests and Playwright smoke test
- Source-policy, product, technical, and test docs

The live-source gate is still open. The NPS webcam API is the first serious target, but it requires an API key before a live-source proof can run.

Secret handling and GitHub setup: [Secrets And GitHub Setup](docs/Secrets_And_GitHub_Setup.md)

## Run locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:4178`.

## Verify

```sh
npm run check
npm run test:e2e
npm run source:probe
```

`npm run source:probe` reports `missing_key` until `NPS_API_KEY` is set.

## Optional Neo4j

```sh
docker compose up -d
npm run graph:probe
```

The app uses in-memory graph storage when Neo4j credentials are absent or `CSG_FORCE_FIXTURE=1`.

## Folder map

| Path | Role | Status |
| --- | --- | --- |
| `src/client/` | Operational dashboard | working prototype |
| `src/server/` | API, source adapters, Groq boundary, graph repository | working prototype |
| `src/shared/` | Typed schemas shared by app and server | current |
| `tests/` | Unit and Playwright tests | current |
| `docs/` | Product, source, technical, and public writeup material | current |
| `.github/` | Issue and PR templates for public project workflow | current |

First verification record: [Evidence 2026-06-27](docs/Evidence_2026-06-27.md)

## Source links

- Groq models: https://console.groq.com/docs/models
- Groq vision: https://console.groq.com/docs/vision
- Groq structured outputs: https://console.groq.com/docs/structured-outputs
- Neo4j graph concepts: https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/
- NPS API documentation: https://www.nps.gov/subjects/developer/api-documentation.htm
- NPS API key start: https://www.nps.gov/subjects/developer/get-started.htm
- LILA conservation datasets: https://lila.science/datasets
- GitHub Projects: https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
- Playwright: https://playwright.dev/docs/intro

## Change log
- 2026-06-27: Created the project scaffold, source gate, dashboard, graph model, tests, and project docs.
