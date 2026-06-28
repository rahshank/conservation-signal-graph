# Technical Spec

## Purpose
Define the first implementation shape for the Ethogram Graph prototype.

## System flow

```text
source registry
-> cadence probe
-> source adapter
-> SourceEvent
-> Groq or fixture extractor
-> ExtractedObservation
-> commentary adapter
-> ContextClaim
-> graph mapper
-> Neo4j or memory repository
-> dashboard API
-> observation graph UI
```

## Interfaces

### `SourceEvent`
Carries source identity, source type, capture time, image URL or blob reference, place label, terms reference, source status, source freshness, update cadence evidence, content hash, and source mode.

### `SourceCadenceEvidence`
Carries source identity, source type, probe time, latest image URL, page URL, place label, terms status, API freshness, image headers, source freshness observation, daily frame counts, cadence summary, and recommended action.

### `SourceFreshnessObservation`
Carries the freshness read for an included feed:

- `checkedAt`: when the system inspected the source
- `sourceReportedAt`: freshest timestamp exposed by the source
- `ageMs` and `ageLabel`: source age at check time
- `status`: `fresh`, `recent`, `stale`, or `unknown`
- `basis`: `last_modified`, `api_date_last`, `etag_only`, `daily_counts`, or `none`
- `expectedCadenceSeconds`
- `expectedFramesPerDay`
- `includeForInference`
- `summary`, such as `Fresh: checked 1:31 AM, source image 6 min old, expected ~38 RGB frames/day`

### `ExtractedObservation`
Carries species candidates, risks, actions, questions, summary, confidence, model, prompt version, latency, and validation status.

### `ContextClaim`
Planned interface for observer and operator context. It should carry source text, source URL, source type, trust tier, timestamp or date scope, normalized claim, extraction status, and links to source, frame, observation, species, behavior, or question nodes.

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

Planned context nodes:

- `CommentarySource`
- `CommentaryEvent`
- `ContextClaim`
- `Behavior`

Planned context relationships:

- `CONTEXT_FOR`
- `MENTIONS_SPECIES`
- `DESCRIBES_BEHAVIOR`
- `SUPPORTS_OBSERVATION`
- `CONFLICTS_WITH_OBSERVATION`

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
| `static_image_benchmark` | Known-context image without source freshness proof | Model-quality benchmark only |
| `stale_snapshot` | Image exists but freshness is too old or unchanged | Research evidence only |
| `unavailable_stream` | Human page or embedded stream is unavailable | Rejected for prototype ingestion |
| `dataset_fixture` | Historical or synthetic replay | Development, regression, and demos only |

The adapter records freshness from headers, API metadata, filename timestamps, daily counts, and content-hash changes. A source is not called live from an image URL alone.

Freshness is an observation, not a vague label. A feed should be included for Groq only when access is allowed, a frame is fetchable, and the freshness observation is `fresh` or `recent`.

The source probe summary reports both broad `cadenceCandidates` and stricter `inferenceEligible` counts. Product copy should use `inferenceEligible` when describing feeds that can be analyzed now.

## Multi-source boundary
Groq speed becomes meaningful when the system is running across multiple sources or multiple inference steps per source:

- source freshness classification
- visual description
- species or habitat candidate extraction
- behavior or event extraction
- confidence and uncertainty classification
- comparison against observer context
- graph write and query update

The first concrete implementation path probes PhenoCam sites as permissioned periodic snapshots. Wildlife video feeds remain candidates when access, terms, and frame capture routes are clear.

## Commentary boundary
Observer context is ingested separately from camera frames. Official operator notes, moderator updates, API-accessible live chat, and trusted observer reports can support or challenge model observations. Public chat should be filtered and trust-tiered before it can support a claim.

Every context item must preserve its source URL, source type, timestamp or date scope, retrieval time, and original text reference.

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
- 2026-06-28: Added `SourceFreshnessObservation` as the inclusion measure for source feeds.
- 2026-06-28: Added the Ethogram Graph naming, PhenoCam cadence interface, multi-source boundary, and planned commentary graph layer.
- 2026-06-28: Added source cadence as a first-class boundary and clarified when Groq speed is a valid product metric.
- 2026-06-27: Created first technical spec.
