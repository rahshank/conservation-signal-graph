# Ethogram Graph

## Purpose
Build a public-quality Groq + Neo4j prototype for multi-feed ecological and wildlife observation.

Many recurring sources enter the system: periodic ecological cameras, permissioned wildlife feeds, benchmark images, and trusted observer context. Groq turns visual and text inputs into structured observations. Neo4j stores those observations, claims, sources, places, species candidates, behaviors, uncertainties, and review decisions as a context graph.

Working product name: **Ethogram Graph**. An ethogram is a structured catalog of animal behavior. The name fits the larger thesis: repeated observations across many sources become a graph of behavior, evidence, context, and uncertainty.

## Current status
The prototype scaffold is implemented with:

- TypeScript server and React dashboard
- NPS source probe with explicit stale/live boundary
- PhenoCam cadence probe for permissioned, frequently updating ecological snapshots
- Source-wall intelligence prototype with real source links and permitted PhenoCam imagery
- Groq extraction boundary
- Neo4j graph repository boundary
- Fixture extractor for local development
- Unit tests and Playwright smoke test
- Source-policy, product, technical, context, and test docs

The NPS Peregrine Falcon path is now a known-context Groq benchmark, not a live-source proof. The current build path starts with a source-cadence gate over PhenoCam candidates because cadence, freshness, and permission have to be proven before Groq speed claims mean anything.

Groq and Neo4j remain explicit proof gates: fixture extraction is not a Groq claim, memory graph mode is not a Neo4j claim, and a stale image is not a live-feed claim.

Secret handling and GitHub setup: [Secrets And GitHub Setup](docs/Secrets_And_GitHub_Setup.md)
Agentic product standard: [Agentic Product Development Standard](docs/Agentic_Product_Development_Standard.md)
Credential handling runbook: [Credential Handling Runbook](docs/Credential_Handling_Runbook.md)
Agentic practice comparison: [Agentic Practice Comparison](docs/Agentic_Practice_Comparison.md)
Security policy: [Security Policy](SECURITY.md)
Linear project: [Ethogram Graph](https://linear.app/rahshank/project/ethogram-graph-2f78e7f44301)
Pipeline explainer: [Pipeline Explainer](docs/context/Pipeline_Explainer.md)
Source candidates: [Source Candidate Register](docs/context/Source_Candidate_Register.md)
Personas and UI story: [Personas](docs/context/Personas.md)
Product reference research: [Product Reference Research](docs/context/Product_Reference_Research.md)
Source-wall redesign: [Source Wall Redesign](docs/superpowers/specs/2026-06-28-source-wall-redesign.md)
Persona-led UI design: [Persona-led UI Design](docs/superpowers/specs/2026-06-27-persona-led-ui-design.md)
Glossary: [Glossary](docs/context/Glossary.md)

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

`npm run source:probe` checks PhenoCam cadence candidates and the NPS source path. `NPS_API_KEY` enables the NPS portion; PhenoCam cadence probing does not require the NPS key.

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
| `docs/context/` | Learning notes, source register, and glossary | current |
| `.github/` | Issue and PR templates for public project workflow | current |
| `SECURITY.md` | Credential, verification, and agentic-context security rules | current |

First verification record: [Evidence 2026-06-27](docs/Evidence_2026-06-27.md)

## Source links

- Groq models: https://console.groq.com/docs/models
- Groq vision: https://console.groq.com/docs/vision
- Groq structured outputs: https://console.groq.com/docs/structured-outputs
- Neo4j graph concepts: https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/
- NPS API documentation: https://www.nps.gov/subjects/developer/api-documentation.htm
- NPS API key start: https://www.nps.gov/subjects/developer/get-started.htm
- PhenoCam API: https://phenocam.nau.edu/webcam/tools/api/
- PhenoCam fair-use policy: https://phenocam.nau.edu/webcam/fairuse_statement/
- LILA conservation datasets: https://lila.science/datasets
- GitHub Projects: https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
- Playwright: https://playwright.dev/docs/intro

## Change log
- 2026-06-28: Added the source-wall intelligence prototype with real source links, permitted PhenoCam imagery, and exception-based human review.
- 2026-06-28: Renamed the working product to Ethogram Graph and recentered the thesis on many recurring sources plus observer context.
- 2026-06-27: Switched the default live test path to the NPS Peregrine Falcon Webcam and clarified the UI actions.
- 2026-06-27: Added persona-led UI story and product reference research links.
- 2026-06-27: Added Linear as the operating backlog link.
- 2026-06-27: Added context-layer links and clarified that Bartlett Cove is the next wildlife-likelihood proof source.
- 2026-06-27: Updated project status after the NPS Yosemite Falls source gate passed and added the security policy link.
- 2026-06-27: Created the project scaffold, source gate, dashboard, graph model, tests, and project docs.
