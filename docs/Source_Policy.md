# Source Policy

## Purpose
Keep the prototype honest about live camera access.

## Current source read
The NPS webcam API should no longer be treated as the first current-source path. It can return machine-readable image URLs, but current evidence shows that those URLs can be stale media records rather than current frames.

The Peregrine Falcon NPS media page also failed the human-review check because the embedded livestream displayed as unavailable. The static image path was useful for testing image normalization and Groq's visual extraction, but it did not prove live or near-live monitoring.

PhenoCam is now the leading source-cadence candidate. Its public API exposes camera metadata, active status, `date_last`, daily image counts, and latest-image URLs. Its fair-use policy makes imagery and data available under CC BY 4.0 with attribution. The tradeoff is product focus: PhenoCam is stronger for ecological change and vegetation/habitat signals than animal behavior.

Explore.org remains a reference source for the shape of live nature-camera products. Its terms allow normal browsing and branded embedding where enabled, but automated copying or monitoring requires permission. The prototype should not scrape Explore frames without a written permission path or official API route.

LILA is useful for fixture and regression data. LILA datasets are historical releases, not daily live feeds, so they support testing but do not prove live ingestion.

## Source acceptance criteria
A source can enter the live prototype when all are true:

- access route is official or permissioned
- terms allow the intended automated frame or event processing
- freshness and update cadence are measured
- content change can be detected through headers, timestamps, image paths, daily counts, or image hashes
- source page, terms reference, and capture timestamp are stored with every event
- captured content stays within the allowed use
- UI labels the source as live, near-live, periodic snapshot, stale snapshot, unavailable stream, or fixture

## Current candidate table

| Candidate | Role | Current decision | Next action |
| --- | --- | --- | --- |
| PhenoCam active sites | Leading cadence candidate | API supports active status, `date_last`, daily counts, metadata, latest image URLs, and CC BY 4.0 attribution path | Build a cadence probe against 3-5 active sites and record freshness, hashes, daily counts, and Groq latency |
| NPS webcam API | Rejected for live proof until a current-frame endpoint is found | API image URLs are machine-readable but can be stale; Peregrine static image was from 2024 and its media page stream was unavailable | Keep as negative source-gate evidence and research only |
| Bartlett Cove Lagoon | Former next proof source | Wildlife context is promising, but NPS image freshness must be measured before use | Revisit only through a freshness probe, not direct Groq ingestion |
| Explore.org live cams | Product reference | Permission needed for automated monitoring | Use for research only unless a permissioned route appears |
| LILA datasets | Fixture and regression source | Approved for development fixtures | Keep public claims clear that fixture replay is not live ingestion |

Detailed candidate register: [Source Candidate Register](context/Source_Candidate_Register.md)
Cadence research trail: [Source Cadence Gate](context/Source_Cadence_Gate.md)

## Change log
- 2026-06-28: Rejected the NPS API as the current live proof path and promoted PhenoCam to cadence-gate research.
- 2026-06-27: Added Bartlett Cove as the next wildlife-likelihood proof source and linked the source candidate register.
- 2026-06-27: Created source policy and first gate decision.
