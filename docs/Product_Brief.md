# Product Brief

## Purpose
Test whether fast multimodal inference plus a graph database can turn protected-area camera signals into an inspectable operating surface.

## Hypothesis
Conservation monitoring becomes more useful when each incoming camera event produces structured observations, linked evidence, graph relationships, and review cues within seconds.

Groq matters if the workflow has many small inference steps: describe the frame, identify candidates, extract risks, normalize the result, create actions, and update a graph while the operator is still watching the stream.

Neo4j matters because the artifact needs traversable context, not only a list of detections. The product should answer questions such as:

- Which unresolved risks are connected to this place?
- Which observations have weak evidence?
- Which species candidates have repeated signals near the same camera?
- Which actions depend on low-confidence observations?

## MVP
The first usable version has:

- one live-source adapter with a documented source-policy decision
- one fixture replay adapter for development and regression tests
- Groq extraction boundary with fixture fallback
- Neo4j graph repository boundary with memory fallback
- dashboard with events, current frame, graph, queries, and metrics
- public evidence bundle with tests, screenshots, source notes, and latency notes

## Public claim
This is a prototype and capability test. It is not a production conservation system.

The claim is strongest only after the live-source gate passes. Until then, the project shows the architecture, workflow, and test harness, with the source constraint clearly visible.

## Change log
- 2026-06-27: Created first product brief.
