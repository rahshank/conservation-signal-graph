# Personas

## Purpose
Identify who the Conservation Signal Graph is being tested for, so product execution and public narrative stay grounded.

## Primary Personas

| Persona | What they care about | What the prototype must prove | Narrative angle |
| --- | --- | --- | --- |
| Protected-area monitor | Fast signal from many visual sources without losing source traceability | The system turns a camera frame into a structured observation with model, confidence, source, and review status | AI can help triage monitoring signals while keeping evidence visible |
| Wildlife researcher or field biologist | Accurate event history, species behavior, uncertainty, and repeatable evidence | The graph connects frames, observations, species candidates, context notes, and unresolved questions | The graph becomes a research memory, not a one-off caption |
| Camera program operator or moderator | Community knowledge, notable moments, educational context, and source permissions | Official notes or permitted commentary can enrich model output without mixing trusted and untrusted claims | Human observers add context the model may miss |
| Conservation communications lead | Clear story, public trust, and explainable limitations | The UI distinguishes live source, fixture, model output, commentary, confidence, and evidence | The product is honest about what it proves and what still needs review |
| Technical evaluator | Real tools, clean architecture, security posture, and verifiable tests | Groq, Neo4j, source adapters, normalization, tests, and evidence work as a coherent system | This is a real AI-assisted product build, not a static demo |

## Product Test Questions

| Question | Persona lens |
| --- | --- |
| Can a user see where a claim came from? | protected-area monitor, communications lead |
| Can a user separate model inference from human commentary? | researcher, moderator, communications lead |
| Can the graph answer relationship questions across frames, notes, species, risks, and actions? | researcher, technical evaluator |
| Can the public writeup explain the value without overstating conservation readiness? | communications lead, technical evaluator |
| Can the build show modern product discipline through source policy, tests, issues, and evidence? | technical evaluator |

## Current Read
The next product pass should keep these personas visible in issue acceptance criteria, UI labels, evidence screenshots, and the public case-study narrative.

## Change Log
- 2026-06-27: Created first persona set for product and narrative testing.
