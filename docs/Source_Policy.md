# Source Policy

## Purpose
Keep the prototype honest about live camera access.

## Current source read
The prototype starts with the NPS webcam API as the first live-source candidate. The API endpoint is reachable, but unauthenticated requests return `API_KEY_MISSING`. That is a useful gate: a real live-source proof needs an API key and a source-specific check before public claims.

Explore.org remains a reference source for the shape of live nature-camera products. Its terms allow normal browsing and branded embedding where enabled, but automated copying or monitoring requires permission. The prototype should not scrape Explore frames without a written permission path or official API route.

LILA is useful for fixture and regression data. LILA datasets are historical releases, not daily live feeds, so they support testing but do not prove live ingestion.

## Source acceptance criteria
A source can enter the live prototype when all are true:

- access route is official or permissioned
- terms allow the intended automated frame or event processing
- source page, terms reference, and capture timestamp are stored with every event
- captured content is not redistributed beyond the allowed use
- UI labels the source as live, near-live, or fixture

## Current candidate table

| Candidate | Role | Current decision | Next action |
| --- | --- | --- | --- |
| NPS webcam API | First live-source adapter | Yosemite passes with `NPS_PARK_CODE=yose`; Yellowstone, Grand Canyon, Acadia, and Glacier returned no image URL in the first probe | Run the live-source proof with `NPS_PARK_CODE=yose`, then inspect source-specific credits before public redistribution |
| Explore.org live cams | Product reference | Permission needed for automated monitoring | Use for research only unless a permissioned route appears |
| LILA datasets | Fixture and regression source | Approved for development fixtures | Keep public claims clear that fixture replay is not live ingestion |

## Change log
- 2026-06-27: Created source policy and first gate decision.
