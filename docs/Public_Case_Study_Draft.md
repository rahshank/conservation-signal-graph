# Public Case Study Draft

## Working title
Ethogram Graph: testing fast AI inference across wildlife and ecological observation sources

## Current argument
Most AI demos stop at recognition: here is an image, here is a label. Wildlife and ecological monitoring need the next layer. A visual event or trusted observer claim should become evidence, context, uncertainty, review work, and an inspectable relationship graph.

This prototype tests that path with Groq and Neo4j. Groq handles the fast inference boundary across frames and text claims. Neo4j holds the context graph. The UI makes source cadence, confidence, evidence, and unresolved questions visible.

## What works now

- The dashboard runs locally.
- Fixture events become structured observations.
- Observations become graph nodes and relationships.
- PhenoCam source-cadence probing works across three permissioned periodic snapshot sources.
- NPS bird imagery is labeled as a known-context benchmark, not a live-source proof.
- Tests cover schema validation, graph mapping, source-cadence probing, and dashboard rendering.

## What remains

- Add timed polling and changed-frame detection.
- Capture latency and extraction quality from real Groq calls.
- Prove Neo4j persistence with write/read/query evidence.
- Research a permitted observer-context route for a Big Bear-style source family.
- Write the first public evidence bundle.

## Change log
- 2026-06-28: Renamed the draft around Ethogram Graph and updated the claim after PhenoCam cadence probing passed.
- 2026-06-28: Updated the case-study draft after the NPS path failed the current-source proof.
- 2026-06-27: Created first public case-study draft.
