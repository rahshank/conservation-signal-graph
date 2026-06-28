# Product Brief

## Purpose
Test whether fast multimodal inference plus a graph database can turn protected-area camera signals into an inspectable operating surface.

This is a pipeline test. Groq is one layer in the pipeline, not the product by itself. The product claim depends on a changing source signal, structured extraction, graph persistence, and a human review loop that can explain what changed and why it matters.

## Hypothesis
Conservation monitoring becomes more useful when repeated camera events produce structured observations, linked evidence, graph relationships, and review cues within seconds.

Groq matters when cadence or source volume creates repeated inference: describe the frame, identify candidates, extract risks, normalize the result, create actions, and update a graph while the operator is still close to the event.

Neo4j matters because the artifact needs traversable context alongside detection records. The product should answer questions such as:

- Which unresolved risks are connected to this place?
- Which observations have weak evidence?
- Which species candidates have repeated signals near the same camera?
- Which actions depend on low-confidence observations?

## Product Story

Primary user: protected-area monitor.

Primary moment: a new camera signal arrives and needs review.

Primary question: Is this signal credible, what supports it, what should happen next, and what remains uncertain?

The product should behave like a signal review console. Pipeline telemetry, graph state, and model metadata remain visible, but they support the review decision rather than becoming the main UI story.

## Source-cadence gate
The project cannot make a meaningful speed claim from a stale image, unavailable livestream, or one-off screenshot. The first product gate is source cadence:

- Is the source official, permissioned, or clearly licensed for this use?
- Can the system fetch a machine-readable image or frame?
- Does the source expose `Last-Modified`, `ETag`, image path timestamps, daily counts, or another freshness signal?
- How often does the source update?
- Does the image content actually change across probes?
- Does the source produce enough recurring events to justify fast inference and graph accumulation?

A slow source can still be useful if many sources run in parallel or each frame requires several model calls. A single stale source should stay in research or fixture mode.

## MVP
The first usable version has:

- one measured source adapter with a documented source-policy and cadence decision
- one fixture replay adapter for development and regression tests
- Groq extraction boundary with fixture fallback
- Neo4j graph repository boundary with memory fallback
- signal review console with current frame, observation, review decision, graph context, and evidence trace
- public evidence bundle with tests, screenshots, source notes, and latency notes

## Public claim
This is a prototype and capability test. It is not a production conservation system.

The claim is strongest only after the source-cadence gate passes. Until then, the project shows the architecture, workflow, and test harness, with the source constraint clearly visible.

## Change log
- 2026-06-28: Recentered the brief on the full source-to-inference-to-graph pipeline and added the source-cadence gate.
- 2026-06-27: Added the persona-led product story and review-console direction.
- 2026-06-27: Created first product brief.
