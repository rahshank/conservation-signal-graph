# Public Case Study Draft

## Working title
Conservation Signal Graph: testing fast AI inference as an operating layer for field monitoring

## Current argument
Most AI demos stop at recognition: here is an image, here is a label. Conservation work needs the next layer. A field signal should become evidence, context, uncertainty, review work, and an inspectable relationship graph.

This prototype tests that path with Groq and Neo4j. Groq handles the fast inference boundary. Neo4j holds the context graph. The UI makes the source, confidence, and unresolved questions visible.

## What works now

- The dashboard runs locally.
- Fixture events become structured observations.
- Observations become graph nodes and relationships.
- The source gate is documented, and the product needs a cadence probe before a public source claim.
- Tests cover schema validation, graph mapping, and dashboard rendering.

## What remains

- Build and run the source-cadence probe against permissioned candidates.
- Record freshness, update cadence, image hashes, and source terms.
- Capture latency and extraction quality from real Groq calls.
- Write the first public evidence bundle.

## Change log
- 2026-06-28: Updated the case-study draft after the NPS path failed the current-source proof.
- 2026-06-27: Created first public case-study draft.
