# Technical Spec

## Purpose
Define the first implementation shape for the Conservation Signal Graph prototype.

## System flow

```text
source adapter
-> SourceEvent
-> Groq or fixture extractor
-> ExtractedObservation
-> graph mapper
-> Neo4j or memory repository
-> dashboard API
-> operational UI
```

## Interfaces

### `SourceEvent`
Carries source identity, source type, capture time, image URL or blob reference, place label, terms reference, and source status.

### `ExtractedObservation`
Carries species candidates, risks, actions, questions, summary, confidence, model, prompt version, latency, and validation status.

### Graph model
Core nodes:

- `Source`
- `Frame`
- `Observation`
- `SpeciesCandidate`
- `Place`
- `Risk`
- `Action`
- `Question`
- `Run`

Core relationships:

- `CAPTURED_FROM`
- `OBSERVED_AT`
- `SUGGESTS_SPECIES`
- `RAISES_RISK`
- `REQUIRES_ACTION`
- `RAISES_QUESTION`
- `SUPPORTED_BY`
- `GENERATED_IN_RUN`

## API

| Route | Role |
| --- | --- |
| `GET /api/state` | Dashboard state |
| `GET /api/events` | Event stream |
| `GET /api/graph` | Graph snapshot |
| `GET /api/metrics` | Latency, mode, and event metrics |
| `GET /api/sources/probe/nps` | NPS live-source gate |
| `POST /api/events/ingest` | Ingest a source event or fixture event |

## Groq boundary
The extractor calls Groq only when `GROQ_API_KEY` is set, `CSG_FORCE_FIXTURE` is not `1`, and the source has an `imageUrl`.

Default model:

```text
meta-llama/llama-4-scout-17b-16e-instruct
```

The fixture extractor stays explicit in the UI and metrics.

## Neo4j boundary
The graph repository uses Neo4j only when `NEO4J_URI`, `NEO4J_USERNAME`, and `NEO4J_PASSWORD` are set and fixture mode is off.

Memory mode exists for local development and static UI checks.

## Superpowers slot
Superpowers should be used for spec and issue discipline if the plugin becomes callable in this session. Current tool discovery did not expose a Superpowers tool or skill, so the project implements the discipline directly through docs, issue templates, PR template, tests, and acceptance checks.

## Change log
- 2026-06-27: Created first technical spec.
