# ADR 0001: Live Source Gate

## Decision
The prototype treats live-source access as a hard gate. Fixture replay can support development and tests, but it cannot carry the public proof by itself.

## Reason
The project is meant to test fast inference over incoming field signals. Historical image replay proves the app shape and graph mechanics; it does not prove live-source operation.

## Consequences
- The UI shows source status.
- Source events carry terms status.
- `npm run source:probe` exists before the public build is complete.
- Public writing must state whether the current run used live data or fixture data.

## Change log
- 2026-06-27: Recorded the live-source gate decision.
