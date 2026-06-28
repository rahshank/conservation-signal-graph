# Personas

## Purpose
Identify who Ethogram Graph is being tested for, so product execution and public narrative stay grounded.

## Primary Product Story

Primary user: wildlife camera operator, conservation researcher, moderator, or conservation communications lead.

Primary moment: one of many watched sources produces a candidate event, or trusted observer context reports an event that should be linked to visual evidence.

Primary question: What happened, which sources support it, how confident is the system, how does it connect to prior context, and what needs human judgment?

The first product surface should optimize for source triage and event review across many feeds. Research, moderation, communications, and technical-evaluator needs all matter because the public claim depends on showing a real pipeline, not a single-caption demo.

## Personas

| Persona | What they care about | What the prototype must prove | Narrative angle |
| --- | --- | --- | --- |
| Wildlife camera program operator | Fast signal from many visual sources without losing source traceability | The system identifies which sources are current, permissioned, and worth model analysis | AI can help manage source coverage without pretending every feed needs constant human watching |
| Wildlife researcher or field biologist | Accurate event history, species behavior, uncertainty, and repeatable evidence | The graph connects frames, observations, species candidates, context notes, and unresolved questions | The graph becomes a research memory, not a one-off caption |
| Camera program operator or moderator | Community knowledge, notable moments, educational context, and source permissions | Official notes or permitted commentary can enrich model output without mixing trusted and untrusted claims | Human observers add context the model may miss |
| Conservation communications lead | Clear story, public trust, and explainable limitations | The UI distinguishes live source, fixture, model output, commentary, confidence, and evidence | The product is honest about what it proves and what still needs review |
| Technical evaluator | Real tools, clean architecture, security posture, and verifiable tests | Groq, Neo4j, source adapters, normalization, tests, and evidence work as a coherent system | This is a real AI-assisted product build, not a static demo |

## Persona-led UI Acceptance Criteria

| Persona | UI must make visible | Design implication |
| --- | --- | --- |
| Wildlife camera program operator | source cadence, source status, permission route, candidate events, review state | The main screen starts with source viability and event triage before model plumbing. |
| Wildlife researcher or field biologist | species candidates, uncertainty, prior related observations, graph links, unresolved questions | The graph view explains relationships and history. It does not act as decoration. |
| Camera program operator or moderator | source quality, source policy, known camera context, commentary provenance | Source and commentary are separate from model inference. Human context is labeled by provenance and trust level. |
| Conservation communications lead | live/fixture/model modes, confidence, evidence, limitations, public-safe wording | The interface does not blur proof levels. Evidence and caveats are easy to inspect. |
| Technical evaluator | Groq model, prompt version, latency, validation, graph mode, tests, source URLs | Technical traceability is available without dominating the monitor's first view. |

## UI Hierarchy To Test

1. Source cadence: which feeds are current, permissioned, and worth inference.
2. Candidate event: frame or snapshot, source, timestamp, status, source policy.
3. AI observation: species, behavior, risk, action, question, confidence, model trace.
4. Observer context: official notes, moderator updates, trusted observer claims, conflicts.
5. Review decision: accept, needs human review, dismiss as low confidence, watch source.
6. Context graph: connected source, place, species, behavior, risk, action, question, run, and commentary.
7. Evidence drawer: model, prompt, normalization, latency, graph mode, source URL, test status.

## Product Test Questions

| Question | Persona lens |
| --- | --- |
| Can a user see where a claim came from? | operator, communications lead |
| Can a user separate model inference from human commentary? | researcher, moderator, communications lead |
| Can the graph answer relationship questions across frames, notes, species, risks, and actions? | researcher, technical evaluator |
| Can the public writeup explain the value without overstating conservation readiness? | communications lead, technical evaluator |
| Can the build show modern product discipline through source policy, tests, issues, and evidence? | technical evaluator |

## Current Read
The current UI pass is being corrected around the multi-source thesis. The first useful action is source-cadence discovery. The next useful surface is event review enriched by observer context, not a human operator staring at one feed.

## Change Log
- 2026-06-28: Recentered personas on multi-source source triage, observer context, and Ethogram Graph.
- 2026-06-27: Updated the current read after implementing the signal review console.
- 2026-06-27: Added primary product story, persona-led UI acceptance criteria, and the first UI hierarchy.
- 2026-06-27: Created first persona set for product and narrative testing.
