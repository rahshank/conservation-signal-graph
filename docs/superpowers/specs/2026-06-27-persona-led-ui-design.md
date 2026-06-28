# Persona-led UI Design

## Purpose
Redesign the Conservation Signal Graph UI around a specific review moment: a protected-area monitor inspecting a new camera signal.

The current UI proves the pipeline. The next UI should prove the product idea.

## Product Story

Primary user: protected-area monitor.

Primary moment: a camera signal arrives and needs review.

Primary question: Is this signal credible, what supports it, what should happen next, and what remains uncertain?

Secondary lenses:

- wildlife researcher or field biologist: history, graph context, uncertainty, repeated signals
- camera program operator or moderator: source quality, source policy, commentary provenance
- conservation communications lead: public-safe evidence, limitations, trust
- technical evaluator: Groq, Neo4j, tests, source trace, model metadata

## Reference Principles

EarthRanger and SMART point toward field operations: real-time signals, shared landscape view, alerts, field records, and decisions. Wildlife Insights points toward camera-trap review: identification, confidence, analysis, and sharing. Sentry points toward modern triage: event stream, issue detail, review states, evidence, and action.

The redesign should combine those patterns into a review console:

- current signal first
- review decision second
- evidence always available
- graph context used to explain relationships
- technical trace visible without dominating the first screen

## Information Hierarchy

### 1. Signal Under Review

The first viewport should make the current signal legible:

- current frame
- source name
- place
- timestamp
- live/fixture mode
- source policy state
- signal status

The source frame should feel like the artifact under review, not a decorative image inside a generic card.

### 2. AI Observation

The observation area should show what the model believes and how strongly:

- species or object candidates
- confidence
- risks
- recommended action
- open questions
- validation status

This section should use compact evidence rows and decision language. It should not read like an AI summary pasted into a dashboard.

### 3. Review Decision

The monitor needs clear actions:

- accept as observation
- send to human review
- dismiss as low-confidence
- watch source

For the prototype, these can be non-persistent controls or a local interaction state, but the UI should show the intended workflow.

### 4. Context Graph

The graph should explain relationships:

- source to frame
- frame to place
- observation to species, risks, actions, questions
- observation to model run
- future commentary nodes when available

The graph view should support inspection. A node list or relationship table may be more useful than a decorative node cloud until graph interaction exists.

### 5. Evidence Drawer

Technical trace belongs in an evidence surface:

- model
- prompt version
- latency
- validation state
- extraction mode
- graph mode
- source URL
- frame normalization
- test/evidence links

This keeps the prototype honest for a technical evaluator without forcing every user to read infrastructure details first.

## Visual Direction

The interface should feel like a modern field operations console:

- clear hierarchy
- dense but readable
- restrained palette
- domain-specific labels
- strong source trace
- compact review controls
- graph and metrics used only where they help a decision

Avoid:

- equal-weight cards for every concept
- generic metric rail as the main story
- decorative charts
- repeated icons that do not clarify action
- oversized hero typography
- vague AI assistant copy

## Proposed Screen Structure

Desktop:

1. Top bar: product name, source mode, graph mode, extraction mode, proof status.
2. Main review area:
   - left: current frame and source trace
   - center: AI observation and review decision
   - right: source/context/evidence tabs
3. Lower area:
   - signal queue
   - relationship graph or relationship table
   - unresolved questions and actions

Mobile:

1. signal status
2. current frame
3. review decision
4. AI observation
5. source/evidence details
6. context graph
7. queue

## Acceptance Criteria

- The first screen clearly communicates that a camera signal is under review.
- The primary action area supports the protected-area monitor's decision.
- Fixture, Groq, memory, and Neo4j modes remain visible.
- Model metadata and normalization data move into an evidence surface.
- The graph view explains relationships or uses a clearer tabular fallback.
- UI copy is domain-specific and short.
- Desktop and mobile layouts preserve the same review order.
- Playwright screenshots show the review hierarchy at desktop and mobile sizes.
- The public case-study screenshots can be understood without reading the code.

## Implementation Notes

- Keep the existing React app and API.
- This pass can use the existing fixture state first.
- Add local interaction state for review status if needed.
- Split large UI sections into focused components before the redesign grows further.
- Do not add a design system dependency unless the local CSS becomes unmanageable.

## Open Decisions

- Whether review actions should be persisted in the API during this pass.
- Whether the graph should stay as a visual node map or become a relationship table first.
- Whether the first public screenshot should use a bird-cam known-context state rather than the generic fixture frame.

## Change Log
- 2026-06-27: Created first persona-led UI design spec.
