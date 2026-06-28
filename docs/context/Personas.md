# Personas

## Purpose
Identify who the Conservation Signal Graph is being tested for, so product execution and public narrative stay grounded.

## Primary Product Story

Primary user: protected-area monitor.

Primary moment: a new camera signal arrives and needs review.

Primary question: Is this signal credible, what supports it, what should happen next, and what remains uncertain?

The first product surface should optimize for this review moment. Research, moderation, communications, and technical-evaluator needs still matter, but they should support the monitor's decision rather than compete with it.

## Personas

| Persona | What they care about | What the prototype must prove | Narrative angle |
| --- | --- | --- | --- |
| Protected-area monitor | Fast signal from many visual sources without losing source traceability | The system turns a camera frame into a structured observation with model, confidence, source, and review status | AI can help triage monitoring signals while keeping evidence visible |
| Wildlife researcher or field biologist | Accurate event history, species behavior, uncertainty, and repeatable evidence | The graph connects frames, observations, species candidates, context notes, and unresolved questions | The graph becomes a research memory, not a one-off caption |
| Camera program operator or moderator | Community knowledge, notable moments, educational context, and source permissions | Official notes or permitted commentary can enrich model output without mixing trusted and untrusted claims | Human observers add context the model may miss |
| Conservation communications lead | Clear story, public trust, and explainable limitations | The UI distinguishes live source, fixture, model output, commentary, confidence, and evidence | The product is honest about what it proves and what still needs review |
| Technical evaluator | Real tools, clean architecture, security posture, and verifiable tests | Groq, Neo4j, source adapters, normalization, tests, and evidence work as a coherent system | This is a real AI-assisted product build, not a static demo |

## Persona-led UI Acceptance Criteria

| Persona | UI must make visible | Design implication |
| --- | --- | --- |
| Protected-area monitor | signal status, source, timestamp, confidence, review decision, next action | The main screen is a review console, not a generic dashboard. The current signal and decision controls sit above model plumbing. |
| Wildlife researcher or field biologist | species candidates, uncertainty, prior related observations, graph links, unresolved questions | The graph view explains relationships and history. It does not act as decoration. |
| Camera program operator or moderator | source quality, source policy, known camera context, commentary provenance | Source and commentary are separate from model inference. Human context is labeled by provenance and trust level. |
| Conservation communications lead | live/fixture/model modes, confidence, evidence, limitations, public-safe wording | The interface does not blur proof levels. Evidence and caveats are easy to inspect. |
| Technical evaluator | Groq model, prompt version, latency, validation, graph mode, tests, source URLs | Technical traceability is available without dominating the monitor's first view. |

## UI Hierarchy To Test

1. Signal under review: frame, source, timestamp, status, source policy.
2. AI observation: species, risk, action, question, confidence, model trace.
3. Review decision: accept, needs human review, dismiss as low confidence, watch source.
4. Context graph: connected source, place, species, risk, action, question, run, and commentary.
5. Evidence drawer: model, prompt, normalization, latency, graph mode, source URL, test status.

## Product Test Questions

| Question | Persona lens |
| --- | --- |
| Can a user see where a claim came from? | protected-area monitor, communications lead |
| Can a user separate model inference from human commentary? | researcher, moderator, communications lead |
| Can the graph answer relationship questions across frames, notes, species, risks, and actions? | researcher, technical evaluator |
| Can the public writeup explain the value without overstating conservation readiness? | communications lead, technical evaluator |
| Can the build show modern product discipline through source policy, tests, issues, and evidence? | technical evaluator |

## Current Read
The current UI pass treats the protected-area monitor as the primary user and uses the other personas as review lenses. The product surface is now a signal review console: current signal, model read, review decision, evidence trace, context graph, and queue.

## Change Log
- 2026-06-27: Updated the current read after implementing the signal review console.
- 2026-06-27: Added primary product story, persona-led UI acceptance criteria, and the first UI hierarchy.
- 2026-06-27: Created first persona set for product and narrative testing.
