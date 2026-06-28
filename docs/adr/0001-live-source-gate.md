# ADR 0001: Source Cadence Gate

## Decision
The prototype treats source cadence as a hard gate. Fixture replay can support development and tests, and static images can test model extraction, but neither carries the public proof by itself.

## Reason
The project is meant to test fast inference over incoming field signals. The source must prove access, permission, freshness, and change before the product can claim live, near-live, or speed-sensitive monitoring.

## Consequences
- The UI shows source status.
- Source events carry terms status, freshness evidence, cadence evidence, and source mode.
- `npm run source:probe` exists before the public build is complete.
- Public writing must state whether the current run used measured source data, stale source data, or fixture data.

## Change log
- 2026-06-28: Reframed the ADR from API access to source cadence after the NPS image path failed current-signal proof.
- 2026-06-27: Recorded the original source-gate decision.
