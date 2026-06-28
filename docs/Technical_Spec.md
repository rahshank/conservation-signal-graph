# Technical Spec

## Purpose
Define the first implementation shape for the Conservation Signal Graph prototype.

## System flow

```text
source cadence gate
-> source adapter
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
Carries source identity, source type, capture time, image URL or blob reference, place label, terms reference, source status, source freshness, update cadence evidence, content hash, and source mode.

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
| `GET /api/sources/probe/nps` | NPS source probe |
| `GET /api/sources/probe/phenocam` | PhenoCam cadence and latest-image gate |
| `POST /api/events/ingest` | Ingest a source event or fixture event |
| `POST /api/events/ingest/nps` | Probe and ingest the configured NPS source |

## Source cadence boundary
A source adapter must classify the source before ingestion:

| Source mode | Meaning | Product use |
| --- | --- | --- |
| `live_or_near_live` | Freshness and update behavior are measured | Eligible for the public speed test |
| `periodic_snapshot` | Source updates on a documented interval | Eligible if cadence creates repeated work |
| `stale_snapshot` | Image exists but freshness is too old or unchanged | Research evidence only |
| `unavailable_stream` | Human page or embedded stream is unavailable | Rejected for prototype ingestion |
| `dataset_fixture` | Historical or synthetic replay | Development, regression, and demos only |

The adapter records freshness from headers, API metadata, filename timestamps, daily counts, and content-hash changes. A source is not called live from an image URL alone.

## Groq boundary
The extractor calls Groq only when `GROQ_API_KEY` is set, `CSG_FORCE_FIXTURE` is not `1`, and the source has an `imageUrl`.

Default model:

```text
meta-llama/llama-4-scout-17b-16e-instruct
```

The fixture extractor stays explicit in the UI and metrics.

Groq latency becomes a product metric only after the source cadence gate passes or the experiment runs enough parallel sources to create repeated inference. A one-off frame can test model capability, but it does not test Groq's speed value.

## Neo4j boundary
The graph repository uses Neo4j only when `NEO4J_URI`, `NEO4J_USERNAME`, and `NEO4J_PASSWORD` are set and fixture mode is off.

Memory mode exists for local development and static UI checks.

## Superpowers workflow
Use Superpowers for implementation discipline where it fits the task: systematic debugging when behavior is wrong, test-driven development for code changes, writing plans for multi-step implementation, and verification before completion. The project still keeps the durable record in specs, issue templates, PR templates, tests, evidence notes, and acceptance checks.

## Change log
- 2026-06-28: Added source cadence as a first-class boundary and clarified when Groq speed is a valid product metric.
- 2026-06-27: Created first technical spec.
