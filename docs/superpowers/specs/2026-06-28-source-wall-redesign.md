# Source Wall Redesign

## Purpose
Redesign Ethogram Graph around its actual thesis: many recurring ecological and wildlife sources produce signals, trusted observer context adds meaning, Groq turns visual and text inputs into structured observations, and the graph preserves evidence, uncertainty, and intelligence state.

The first screen should create an immediate sense of a monitored source universe. The current single-signal console hides that idea. The next prototype should open with a cinematic source wall, autonomous graph-building status, emerging patterns, and an exception queue for the few items that need human judgment.

## Research Basis
The design uses these references:

| Reference | Product lesson |
| --- | --- |
| [EarthRanger](https://www.earthranger.com/) | Conservation operations tools combine field observations, sensors, camera traps, real-time updates, alerts, and shared landscape views. Ethogram Graph should lead with situational awareness and decision state. |
| [Wildlife Insights](https://www.wildlifeinsights.org/) | Camera-trap work needs upload, identification, analysis, discovery, and sharing. The UI should preserve source, confidence, review, and history. |
| [Sentry Issues](https://docs.sentry.io/product/issues/) | High-volume event streams become useful when grouped into reviewable issues with status, filters, evidence, and detail panes. Ethogram Graph should convert frames and observer claims into reviewable cases. |
| [Microsoft GraphRAG](https://microsoft.github.io/graphrag/) | GraphRAG extracts entities, relationships, and key claims from source units, then uses graph communities and query modes for reasoning. Ethogram Graph should ingest claims with provenance and use review for exceptions. |
| [Agentic GraphRAG research](https://arxiv.org/abs/2605.18770) | A modern graph pipeline separates deterministic strong nodes, LLM-derived weak nodes, identity resolution, and human audit surfaces. Ethogram Graph should expose traceability and exceptions without turning humans into edge approvers. |
| [Neo4j GraphRAG documentation](https://neo4j.com/docs/neo4j-graphrag-python/current/) | GraphRAG systems can combine vector indexes, graph search, and retrievers. Ethogram Graph should keep embeddings and graph retrieval visible as infrastructure. |
| [Dashboard cooperative-design research](https://arxiv.org/abs/2308.04514) | Dashboards should support monitoring, reporting, interaction, repair, and refinement. The screen should guide a review conversation rather than display disconnected metrics. |
| [Dashboard design patterns research](https://arxiv.org/abs/2205.00757) | Dashboard choices need explicit tradeoffs in screen space, interaction, and information hierarchy. Source triage deserves the primary space. |
| [GOV.UK Design System patterns](https://design-system.service.gov.uk/patterns/) | Patterns should solve specific user tasks. Technical instrumentation should support the task rather than compete with it. |
| [PhenoCam fair-use policy](https://phenocam.nau.edu/webcam/fairuse_statement/) | PhenoCam imagery and data provide a permissioned source-cadence path with attribution. Source tiles must show freshness and inclusion rules clearly. |

## Product Story
Primary persona: conservation intelligence lead.

Primary user story:

> As a conservation intelligence lead, I need to see which monitored sources are changing, what the system has inferred, where observer context supports or challenges those inferences, and which exceptions deserve human attention.

Supporting personas:

| Persona | What the source wall must make easy |
| --- | --- |
| Conservation intelligence lead | See source coverage, emerging patterns, graph-growth status, unresolved exceptions, and throughput. |
| Wildlife researcher or field biologist | See repeated observations, source freshness, species or habitat candidates, uncertainty, and related graph history. |
| Camera program operator or moderator | Keep official source context, moderator notes, and viewer commentary separated by provenance and trust level. |
| Conservation communications lead | Understand what can be said publicly, what remains uncertain, and which evidence supports the claim. |
| Technical evaluator | Verify that source cadence, Groq extraction, Neo4j graph state, latency, prompts, tests, and source policy are real. |

## Visual Direction
The first screen should feel like a modern ecological intelligence room: dark operating-room atmosphere, real source imagery, precise status lights, strong typography, and a clear path from source change to graph insight.

The Watchmen-style multi-monitor reference is useful for the feeling of a monitored universe. The implementation should borrow the idea of separated screens, scale, and surveillance-room drama without copying characters, composition, or panel art.

Design rules:

- Use actual source imagery, permissioned thumbnails, or honest source placeholders. The opening screen must never show the cartoon fixture as the main product image.
- Link every source tile to an actual source page or official source reference.
- Make the source wall the first impression.
- Keep technical metrics available in a trace drawer or secondary rail.
- Use high-contrast source tiles, steady status lights, and a small number of purposeful colors.
- Give every clickable control a visible pressed, loading, success, and failed state.
- Keep source type, freshness, and inference eligibility visible on every tile.
- Separate source facts, observer context, model read, graph intelligence, and exception handling.

## Information Architecture
The prototype should have four layers.

### 1. Source Wall
Large visual grid of six monitored sources.

Each source tile shows:

- latest permitted thumbnail or source image
- source name and place
- source type: periodic snapshot, video candidate, static benchmark, commentary source, or fixture
- freshness: checked time, source age, expected cadence, and status
- inclusion state: eligible, watch, research, blocked, benchmark
- last model or graph outcome
- source-policy cue

Tiles are the primary navigation. Clicking a tile selects it and updates the workbench.

### 2. Selected Source Workbench
The selected source becomes the main review surface.

Workbench sections:

- current source image or honest source placeholder
- source freshness observation
- latest candidate observation
- observer context
- graph relationships
- provisional claims and exception status

The workbench should answer: what changed, what the system believes, what supports it, what conflicts with it, and whether a human exception exists.

### 3. Intelligence Layer
The graph should be presented as a living intelligence layer rather than a manual approval queue.

Intelligence sections:

- graph growth: new observations, claims, entities, relationships, and unresolved conflicts
- emerging patterns: repeated species, behavior, habitat condition, camera health, or observer-reported events
- exception queue: low confidence, source-policy risk, context conflict, identity-resolution ambiguity, or public-claim risk
- query prompts: predefined questions that exercise graph retrieval

### 4. Technical Trace
Technical details live in a secondary rail or drawer.

Trace items:

- source adapter
- source URL and terms reference
- freshness basis
- Groq model and prompt version
- latency
- validation state
- graph mode
- Neo4j write status
- test evidence link

## Six-Source Prototype Set
The prototype should start with six visible sources. These tiles can mix live-measured, research, benchmark, and context candidates as long as the state is honest.

| Tile | Source role | Starting state | Visual treatment |
| --- | --- | --- | --- |
| Aguamarga PhenoCam | Permissioned periodic snapshot | Eligible when freshness probe passes | Use `https://phenocam.nau.edu/data/latest/aguamarga.jpg`. |
| Barro Colorado PhenoCam | Ecological periodic snapshot | Watch or eligible depending on probe | Use `https://phenocam.nau.edu/data/latest/barrocolorado.jpg`. |
| Alerce Costero Forest PhenoCam | Ecological periodic snapshot | Watch or eligible depending on probe | Use `https://phenocam.nau.edu/data/latest/alercecosteroforest.jpg`. |
| Big Bear Eagle Context | Wildlife video and observer-context candidate | Research route | Link to the official Friends of Big Bear Valley or YouTube source. Use an honest source placeholder until image capture is permissioned. |
| Cornell Bird Cams | Wildlife video source family | Research route | Link to Cornell Bird Cams. Use as an example of a source family with strong public context and permission checks still needed. |
| Channel Islands Bird Benchmark | Known-context image benchmark | Benchmark | Label as model-quality benchmark, never live proof. |

## Primary Interaction
1. User opens Ethogram Graph.
2. The source wall shows six real source links with status.
3. User selects Aguamarga PhenoCam.
4. Workbench shows the latest permitted source image, source freshness observation, and graph-intelligence state.
5. User runs `Find updating sources`.
6. Tiles update with fresh, stale, watch, and research states.
7. User selects an eligible source and runs `Run inference batch`.
8. Groq produces structured observations and graph-ready claims.
9. The graph adds provisional evidence with source provenance.
10. Exceptions appear only for low confidence, conflicts, identity ambiguity, source-policy risk, or public-claim risk.

## Human Decision Model
Human action is needed only for exceptions. Source changes, model claims, and observer context enter the graph automatically with provenance, confidence, and status. Human review changes claim status or resolves ambiguity; it does not manually approve every graph edge.

Decision states:

| State | Meaning | User action |
| --- | --- | --- |
| Autonomous | Source is ingesting and graph claims are below exception threshold | Inspect source, graph growth, or query history. |
| Provisional | Model or observer claim is stored with confidence and provenance | Let the graph accumulate more support. |
| Exception | Confidence, context conflict, policy risk, or identity ambiguity needs human judgment | Resolve, assign, or mark as watch. |
| Resolved | A previous exception has a decision and evidence trail | Preserve decision and graph relationship. |
| Public-ready | A claim has enough source support for external use | Export or cite evidence. |

## Data Contract
The UI needs a source-wall model alongside the existing dashboard state.

Required fields:

- `sourceId`
- `sourceName`
- `place`
- `sourceType`
- `sourceMode`
- `thumbnailUrl`
- `sourcePageUrl`
- `termsStatus`
- `freshnessObservation`
- `expectedFramesPerDay`
- `inferenceEligibility`
- `lastCheckedAt`
- `lastObservationSummary`
- `observerContextStatus`
- `graphStatus`
- `exceptionState`
- `throughput`
- `technicalTrace`

The API can start with derived data from existing events and PhenoCam probes. The first prototype can keep source-wall state in memory while preserving the path to Neo4j.

## Visual Acceptance Criteria
- Opening screen communicates “many monitored sources” within five seconds.
- At least six source tiles are visible on desktop.
- The default hero image is a real source image or an honest source placeholder.
- The fixture replay is visible as a development source only.
- Source freshness appears on each tile.
- The selected source workbench explains source, freshness, model read, observer context, graph evidence, and decision state.
- Graph growth and exception state are visible without implying manual approval of every event.
- Groq speed appears as throughput and latency evidence for multi-source processing.
- Technical details do not dominate the first impression.
- Buttons have hover, pressed, loading, success, and failed states.
- Text fits at 1440 px, 1280 px, and mobile widths.
- The page reads as a designed product surface, not generic boxes.

## Test Acceptance Criteria
- Unit tests cover source-wall mapping from seeded state and PhenoCam probe results.
- E2E tests verify six tiles render.
- E2E tests verify selecting a source updates the workbench.
- E2E tests verify `Find updating sources` updates tile freshness.
- E2E tests verify every source tile links to a real source page or official source reference.
- E2E tests verify fixture replay cannot become the opening hero.
- E2E tests verify technical trace is present and secondary.
- Visual checks capture desktop and mobile screenshots.
- Evidence records screenshots, test output, and any remaining source limitations.

## Implementation Boundaries
This pass should build a clickable prototype with real interaction, real source links, real permitted PhenoCam images, and honest data states. It can use memory state for the source wall while the graph repository remains connected through the existing boundary.

Do not add new external feeds without source-policy review. Do not present static benchmark imagery as live source proof. Do not make the observer-context layer look implemented until a permitted context route is proven.

## Change Log
- 2026-06-28: Reframed the prototype around conservation intelligence, autonomous graph-building, exceptions, and actual source links.
- 2026-06-28: Created source-wall redesign spec for the multi-source Ethogram Graph prototype.
