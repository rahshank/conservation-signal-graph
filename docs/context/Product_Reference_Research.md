# Product Reference Research

## Purpose
Ground the Ethogram Graph UI in real conservation, monitoring, moderation, and review workflows.

The product should feel like a credible operating surface for source triage, observation review, and context graph inspection.

## Reference Set

| Reference | Why it matters | Design lesson for this prototype |
| --- | --- | --- |
| [EarthRanger](https://www.earthranger.com/) | Conservation operations platform for real-time field data, sensors, tracked wildlife, teams, and alerts. | Lead with situational awareness and decision state. The UI should answer what happened, where it came from, why it matters, and what response is needed. |
| [SMART Conservation Tools](https://smartconservationtools.org/en-us/) | Protected-area management software for collection, storage, communication, analysis, reporting, and field-to-decision workflows. | Treat camera observations as operational records. Keep source, review state, and actionability visible. |
| [Wildlife Insights](https://www.wildlifeinsights.org/) | Camera-trap platform centered on upload, identification, analysis, discovery, and sharing. | Keep species identification, confidence, and review workflow clear. The researcher lens needs history and evidence, not only a live feed. |
| [Sentry Issues](https://docs.sentry.io/product/issues/) | Modern triage interface for streams of events grouped into issues, with review states, detail views, sorting, and evidence. | The strongest pattern is a review queue plus detail pane: incoming signals should become inspectable cases with status, evidence, and next action. |

## Source Families Under Review

Source choice has two separate tests: product relevance and pipeline usability. A visually compelling animal livestream can fail the pipeline test if frames cannot be captured with permission and freshness evidence. A technically clean source can fail the product test if it does not produce the kind of observation the product claims to understand.

| Source family | What it is | Product value | Technical value | Current read |
| --- | --- | --- | --- | --- |
| [PhenoCam](https://phenocam.nau.edu/webcam/) | A network of fixed digital cameras used to track vegetation phenology through repeated images of the same scene. The usual signal is canopy greenness, seasonal foliage, snow, visibility, and habitat state. | Strong for ecological change, habitat context, weather/visibility, and camera-health observations. Weak as a predictable wildlife source unless a specific site has known recurring animal presence. | Strong. The API exposes camera metadata, active status, daily image counts, latest-image paths, and image headers. The fair-use path supports attribution-based research use. | Use as the cadence and graph-ingestion proving ground, with honest labeling as ecological monitoring. |
| NPS webcam API | Official National Park Service webcam records with image URLs and source pages. Some records are wildlife-relevant, including bear cams, eagle nests, and falcon cams. | Strong names and conservation context. Good for source discovery and negative-gate evidence. | Mixed. Local API sampling found many image records were stale media assets, with wildlife-relevant images last modified in 2024 or earlier. | Keep as source research until a current-frame endpoint passes freshness checks. |
| [Cornell Bird Cams](https://www.allaboutbirds.org/cams/) | Live bird cameras, highlights, species context, and education material from Cornell Lab. | Strong wildlife behavior, known species, public learning context, and observer story. | Capture route still needs permission and technical proof. The public pages point to live cams and YouTube highlights rather than a simple source image API. | Strong product reference and wildlife-source candidate. Do not place on the main wall until ingestion is permissioned. |
| [Explore.org](https://explore.org/livecams) and Big Bear-style cams | Public nature livestreams with active communities, notable events, and observer commentary. | Strongest fit for the wildlife-context story: named animals, nest events, unusual visitors, moderators, recaps, and public attention. | Automated copying or monitoring needs permission or an official route. Embeds and normal viewing are different from frame ingestion. | Keep in the source lab and observer-context research track. |
| LILA camera-trap datasets | Historical wildlife image datasets for conservation machine learning. | Strong for regression tests and known-answer examples. | Strong fixture source. Historical datasets do not prove live or near-live monitoring. | Use for test fixtures and model-quality benchmarks. |

## Source Cadence Concepts

| Concept | Meaning | Why it matters |
| --- | --- | --- |
| Freshness | How old the current source image is when the system checks it. | A source can expose an image URL while the image itself is months or years old. |
| Cadence | How often the source is expected to update. | Groq speed matters when the system handles many repeated frames or many small model calls. |
| Change detection | Whether the source image actually changed since the last check, usually through timestamp, `ETag`, byte size, hash, or archive path. | The system should avoid repeatedly analyzing the same frame and calling it monitoring. |
| Permissioned capture | A source route that allows the intended automated frame or event processing. | A browser-viewable livestream is not automatically an ingestible source. |
| Observer context | Official notes, moderator comments, recaps, or trusted watcher reports that explain what happened around the visual feed. | This is where the context graph can become more valuable than a caption. |

## Current Source Direction

The main source wall should contain working sources only. Candidate wildlife feeds and model benchmarks belong in separate product surfaces.

| Surface | Belongs there | Does not belong there |
| --- | --- | --- |
| Main source wall | Sources the system can check, measure, and ingest now | Promising feeds with unproven capture routes |
| Source lab | Candidate wildlife/video/commentary sources under permission and cadence review | Sources already cleared for active monitoring |
| Test harness | Known-answer images and fixture replay for model validation | Claims about live monitoring |

## Design System References

| Reference | Design lesson |
| --- | --- |
| [Carbon Design System data visualization](https://carbondesignsystem.com/data-visualization/getting-started/) | Data visuals should tell accurate, accessible stories. Graph and metrics views need legibility before decoration. |
| [GOV.UK Design System patterns](https://design-system.service.gov.uk/patterns/) | Patterns should solve specific user tasks and adapt components to context. The UI should be organized around source triage, observation review, and evidence inspection. |
| [Material Design layout guidance](https://m3.material.io/foundations/layout/understanding-layout/overview) | Responsive layout should preserve hierarchy across screen sizes. Mobile should stack the review task in the same order as desktop. |

## Product Direction

The next UI pass should test an **Observation Graph Workbench**.

Primary users: wildlife camera operator, conservation researcher, moderator, and conservation communications lead.

Primary moment: a recurring source updates or trusted observer context reports an event worth linking to visual evidence.

Primary question: What happened, what supports it, how confident is the system, and what should be reviewed before the claim is used?

Secondary users:

- wildlife researcher or field biologist: needs history, context, repeated signals, and uncertainty.
- camera program operator or moderator: needs source quality, commentary, known camera context, and review trace.
- conservation communications lead: needs public trust, visible limits, and evidence-backed claims.
- technical evaluator: needs proof that Groq, Neo4j, tests, source policy, and evidence are real.

## UI Hierarchy To Test

1. Source cadence: currentness, permission, update interval, and next poll.
2. Candidate event: frame or snapshot, source, timestamp, status, source policy.
3. AI observation: species, behavior, risk, action, question, confidence, model trace.
4. Observer context: official notes, moderator updates, trusted observer claims, conflicts.
5. Review decision: accept, needs human review, dismiss as low confidence, watch source.
6. Context graph: connected source, place, species, behavior, risk, action, question, run, and commentary.
7. Evidence drawer: model, prompt, normalization, latency, graph mode, source URL, test status.

## Visual Direction

The interface should feel like a field operations review console:

- dense enough for repeat use
- calmer than a marketing demo
- warmer and more spatial than a generic SaaS admin page
- specific to conservation monitoring through map/source language, observation status, and evidence trace
- restrained in icons and panels
- clear about uncertainty

Avoid:

- equal-weight boxes for every data point
- generic metric cards as the main story
- decorative gradients or abstract backgrounds
- icons that repeat the label without adding meaning
- graph visuals that look impressive while explaining little

## Change Log
- 2026-06-28: Added source-family research notes for PhenoCam, NPS webcams, Cornell Bird Cams, Explore/Big Bear-style cams, and LILA, with source cadence concepts.
- 2026-06-28: Updated product direction from signal review console to observation graph workbench.
- 2026-06-27: Created the first reference set for the persona-led UI pass.
