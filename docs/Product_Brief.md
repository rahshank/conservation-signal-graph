# Product Brief

## Purpose
Test whether fast multimodal inference plus a graph database can turn many ecological and wildlife sources into an inspectable context graph.

Working product name: **Ethogram Graph**.

This is a pipeline test. Groq is one layer in the pipeline. The product claim depends on recurring source signals, trusted observer context, structured extraction, graph persistence, and a review loop that can explain what changed, what supports it, and what remains uncertain.

## Hypothesis
Ecological and wildlife monitoring becomes more useful when repeated visual events and trusted observer claims produce structured observations, linked evidence, graph relationships, and review cues within seconds.

Groq matters when cadence or source volume creates repeated inference: describe frames, identify species or habitat candidates, extract behavior and risk signals, normalize observer claims, compare against known context, and update a graph while the event is still current.

Neo4j matters because the artifact needs traversable context across sources, frames, claims, places, species, behaviors, uncertainty, and review decisions. The product should answer questions such as:

- Which sources are producing current signals?
- Which observations are supported by observer commentary?
- Which species or behavior candidates repeat across sources?
- Which model outputs conflict with trusted observer context?
- Which claims need human review before public or operational use?

## Product Story

Primary user: wildlife camera operator, conservation researcher, moderator, or conservation communications lead.

Primary moment: one of many watched sources produces a candidate event, or a trusted observer reports an event that should be linked to visual evidence.

Primary question: What happened, which sources support it, how confident is the system, how does it connect to prior context, and what needs human judgment?

The product should behave like an observation graph workbench. Source cadence, model metadata, graph state, and review decisions stay visible because they determine whether the system is making a real claim or only running a benchmark.

## Source-cadence gate
The project cannot make a meaningful speed claim from a stale image, unavailable livestream, or one-off screenshot. The first product gate is source cadence:

- Is the source official, permissioned, or clearly licensed for this use?
- Can the system fetch a machine-readable image or frame?
- Does the source expose `Last-Modified`, `ETag`, image path timestamps, daily counts, or another freshness signal?
- How often does the source update?
- Does the image content actually change across probes?
- Does the source produce enough recurring events to justify fast inference and graph accumulation?

A slow source can still be useful if many sources run in parallel or each frame requires several model calls. A single stale source should stay in research or fixture mode.

## Context layer
The graph becomes useful when it combines model observations with trusted human context.

For a Big Bear-style eagle source, the visual feed might show a nest, bird, egg, feeding, visitor, weather condition, or empty frame. Observer context can add the known pair, nest history, recent milestones, moderator notes, named recurring visitors, and timestamped reports from experienced watchers.

The product should ingest observer context only through permitted and traceable routes. Each claim needs source URL, source type, timestamp or date scope, retrieval time, trust tier, and a link back to the original text.

## MVP
The first usable version has:

- several measured source adapters with documented source-policy and cadence decisions
- one fixture replay adapter for development and regression tests
- Groq extraction boundary with fixture fallback
- Neo4j graph repository boundary with memory fallback
- observation graph workbench with source cadence, current frame or snapshot, model observation, observer context, review decision, graph context, and evidence trace
- public evidence bundle with tests, screenshots, source notes, and latency notes

## Public claim
This is a prototype and capability test. It is not a production conservation system.

The claim is strongest only after the source-cadence gate passes. Until then, the project shows the architecture, workflow, and test harness, with the source constraint clearly visible.

## Change log
- 2026-06-28: Renamed the working product to Ethogram Graph and recentered the brief on many recurring sources plus observer context.
- 2026-06-28: Recentered the brief on the full source-to-inference-to-graph pipeline and added the source-cadence gate.
- 2026-06-27: Added the persona-led product story and review-console direction.
- 2026-06-27: Created first product brief.
