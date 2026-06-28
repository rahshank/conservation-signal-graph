# Source Cadence Gate

## Purpose
Define the tactical source test before more product UI work.

The prototype is trying to prove a pipeline: source signal, Groq inference, structured observation, context graph, review decision, and accumulated evidence. Groq speed matters when the source produces repeated work. A stale image can test image handling, but it cannot test the speed-sensitive product idea.

## Gate Questions

| Question | Pass signal | Fail signal |
| --- | --- | --- |
| Is access allowed? | Official API, explicit permission, or clear license | Scraping blocked pages, restricted terms, or unclear reuse |
| Can a frame be fetched by the system? | Stable HTTPS image path or API payload | Human-only player, unavailable stream, or blocked embed |
| Is freshness measurable? | `Last-Modified`, `ETag`, API `date_last`, filename timestamp, daily count, or hash | Image URL with no currentness signal |
| Does the source change? | New hash, new timestamp, or new archive path across probes | Same image and same metadata across the test window |
| Does cadence justify Groq? | Many frames per day, many sources, or several model calls per frame | One manual image per week or stale media record |
| Does the graph add value? | Observations connect to place, source, history, risks, questions, and review state | A single caption with no useful relationships |

## Current Findings

| Source class | Finding | Decision |
| --- | --- | --- |
| NPS webcam API | Machine-readable image URLs exist, but sampled image headers can be old. The Peregrine Falcon image was last modified in 2024, and the linked human stream showed unavailable. | Research and negative gate evidence. Do not use for live proof until a current-frame endpoint passes freshness checks. |
| PhenoCam | Public API exposes camera metadata, active status, `date_last`, daily counts, latest-image URLs, and image archives. Fair-use policy is CC BY 4.0 with attribution. | Leading candidate for the repeated-ingestion and graph test. Treat as ecological monitoring. |
| Explore.org and YouTube-style animal cams | Strong animal behavior, but automated monitoring needs permission or an official route. | Product reference and permission research only. |
| LILA camera-trap datasets | Good for fixtures and regression tests. Historical, not a live signal. | Use for replay and testing with clear labels. |

## PhenoCam Tactical Candidate

| Candidate | Evidence gathered | Product fit | Next test |
| --- | --- | --- | --- |
| `aguamarga` | API reports active status and `date_last=2026-06-26`; latest image returned `Last-Modified: Sat, 27 Jun 2026 19:49:02 GMT`; daily counts reported 38 RGB images and 39 infrared images for 2026-06-26. | Strong cadence candidate for ecological signal review. Weak animal-behavior candidate. | Poll latest image for 60-90 minutes, store headers and hashes, then run Groq only when the frame changes. |
| `barrocolorado` | Latest image returned `Last-Modified: Sun, 28 Jun 2026 00:25:08 GMT`. | Strong ecological context; tropical forest setting may make graph questions richer. | Check daily counts and image-list cadence. |
| `alercecosteroforest` | Latest image returned `Last-Modified: Sat, 27 Jun 2026 22:01:02 GMT`. | Strong ecological context; national park forest setting. | Check daily counts and image-list cadence. |

## Measurement Protocol

1. Select 3-5 candidate sites.
2. Fetch camera metadata from the source API.
3. Fetch the latest image headers.
4. Store `Last-Modified`, `ETag`, byte size, image URL, and source API dates.
5. Hash the image bytes.
6. Repeat every 5 minutes for 60-90 minutes.
7. Run Groq only when a frame changes or when the first frame establishes the baseline.
8. Write each accepted frame, observation, model run, and review state to the graph.
9. Record latency, validation status, and cost estimate per model call.

## What Someone Reviews

The monitor reviews an observation, not the camera. A review decision answers:

- Did the model correctly describe the current frame?
- Is the confidence acceptable for the intended use?
- Did the observation add a meaningful new graph fact?
- Does the system need an action, follow-up question, or human specialist review?

For PhenoCam, the review might concern habitat state, vegetation change, visibility, weather obstruction, fire/smoke signal, flooding, snow cover, or camera health. For a permissioned wildlife cam, the review could concern species, behavior, nest status, injury, human intrusion, or response cue.

## Source Links

- [PhenoCam API page](https://phenocam.nau.edu/webcam/tools/api/)
- [PhenoCam API root](https://phenocam.nau.edu/api/)
- [PhenoCam fair-use policy](https://phenocam.nau.edu/webcam/fairuse_statement/)
- [PhenoCam site table](https://phenocam.nau.edu/webcam/network/table/)
- [NPS developer API documentation](https://www.nps.gov/subjects/developer/api-documentation.htm)

## Change Log
- 2026-06-28: Created the source-cadence gate after the NPS webcam path failed the current-source proof.
