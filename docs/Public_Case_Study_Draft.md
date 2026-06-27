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
- The live-source gate is visible in the product.
- Tests cover schema validation, graph mapping, and dashboard rendering.

## What remains

- Add an NPS API key or another permissioned source.
- Run a real live-source probe.
- Capture latency and extraction quality from real Groq calls.
- Write the first public evidence bundle.

## Change log
- 2026-06-27: Created first public case-study draft.
