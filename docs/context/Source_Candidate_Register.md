# Source Candidate Register

## Purpose
Track camera sources by product value, machine access, permission risk, and measured cadence.

The prototype needs a source that can produce meaningful recurring observations. Scenic views can prove ingestion. Wildlife-likely views test animal behavior. Ecological time-lapse views can test source cadence, repeated inference, and context-graph accumulation.

Ethogram Graph should eventually combine source cadence with observer context. A source is stronger when it has a permitted visual route and a permitted context route.

Source selection should stay honest about source purpose. PhenoCam sources are designed for vegetation phenology: fixed-scene images over time, usually analyzed for canopy greenness, seasonal foliage, snow, visibility, and habitat condition. They are strong for cadence and ecological context. They are weak for predictable wildlife behavior unless a specific camera has documented recurring animal presence.

## Scoring

| Score | Meaning |
| --- | --- |
| `High` | Strong fit for the current prototype |
| `Medium` | Useful with caveats |
| `Low` | Weak fit or blocked |

## Candidates

| Candidate | Wildlife likelihood | Machine access | Permission status | Review link quality | Current decision |
| --- | --- | --- | --- | --- | --- |
| PhenoCam active sites | Low for animal behavior; high for ecological change | High | PhenoCam fair-use policy exposes imagery and data under CC BY 4.0 with attribution | High; site pages and API metadata are available | Leading cadence-gate candidate |
| Aguamarga PhenoCam | Low for animal behavior; medium for habitat signal | High | PhenoCam CC BY 4.0 path | High | First tactical cadence candidate; latest image and daily counts verified |
| Barro Colorado PhenoCam | Low for animal behavior; high for tropical-forest context | High | PhenoCam CC BY 4.0 path | High | Candidate for ecological context graph |
| Yosemite Falls | Low | Medium | NPS API source; image URL available but freshness unproven | Medium; NPS media page is weak, Yosemite Conservancy page is better | Keep as stale-source lesson unless cadence passes |
| Bartlett Cove Lagoon and Fairweather Range | High | Medium | NPS API source; image URL available but freshness unproven | Medium; NPS page says click preview for live view | Do not use until freshness is measured |
| Lower Glacier Bay | Medium | Medium | NPS API source; image URL available but freshness unproven | Medium | Backup only after freshness probe |
| Katmai Brooks Falls Bearcam | High | Medium | NPS record credits Explore.org partnership; automated monitoring may need permission | High for human interest | Research only unless permission path is clear |
| Katmai River Watch Cam | High | Medium | NPS record credits Explore-style bear camera ecosystem; terms need review | High for wildlife | Research only unless permission path is clear |
| Channel Islands nest cams | High seasonal | Medium with image normalization | NPS image URL available, but current stream can be unavailable and image freshness can fail | Medium | Use as known-context Groq benchmark only |
| Big Bear eagle nest ecosystem | High seasonal | Needs permissioned route | Strong public context, but feed and commentary ingestion terms need review | High; official pages, recaps, and public community context exist | Best observer-context research candidate |
| Elk Prairie at Prairie Creek Redwoods | High | Low now | NPS record did not expose an image URL in first API scan | Medium | Promising, adapter/source route needed |

## Recommended Next Source
Aguamarga PhenoCam is the next source to test because it has current active-site evidence and enough daily frames to create repeated ingestion.

Why it fits:

- The PhenoCam API reports active status and `date_last=2026-06-26`.
- The latest-image URL returned `Last-Modified: Sat, 27 Jun 2026 19:49:02 GMT` during research.
- The daily-count endpoint reported 38 RGB images and 39 infrared images for 2026-06-26.
- Image-list paths include timestamped archive images, so cadence can be measured without guessing.
- The source is licensed through PhenoCam's CC BY 4.0 data policy with attribution.

The product story changes for this source: PhenoCam supports ecological source-cadence and graph-accumulation testing. Wildlife behavior testing needs a permissioned wildlife source with a current visual route.

## Source Selection Rule
Pick sources in this order:

1. wildlife likelihood
2. official or permissioned machine access
3. measured freshness
4. useful refresh behavior
5. clear human review page
6. acceptable source terms

## Current Machine-Readable Candidates

| Source | Place | Targeting hint |
| --- | --- | --- |
| Aguamarga | Grassland, Balsa Blanca, Almeria, Spain | PhenoCam `Sitename=aguamarga` |
| Barro Colorado | Smithsonian Tropical Research Institute, Panama | PhenoCam `Sitename=barrocolorado` |
| Alerce Costero Forest | Alerce Costero National Park Forest, Chile | PhenoCam `Sitename=alercecosteroforest` |
| Bartlett Cove Lagoon and Fairweather Range | Glacier Bay National Park & Preserve | `titleIncludes: "Bartlett Cove Lagoon"` |
| Lower Glacier Bay | Glacier Bay National Park & Preserve | `titleIncludes: "Lower Glacier Bay"` |
| Brooks Falls Bearcam | Katmai National Park & Preserve | `titleIncludes: "Brooks Falls Bearcam"` |
| River Watch Cam | Katmai National Park & Preserve | `titleIncludes: "River Watch Cam"` |
| Peregrine Falcon Webcam | Channel Islands National Park | `titleIncludes: "Peregrine Falcon"` |
| Bald Eagle Webcam (Sauces Canyon Nest) | Channel Islands National Park | `titleIncludes: "Sauces Canyon"` |

## Known-Context Benchmark Result

The Channel Islands nest cams are useful for model extraction quality because the expected animal context is known. They are not proof of a live signal.

| Source | Expected context | Groq result | Product finding |
| --- | --- | --- | --- |
| Peregrine Falcon Webcam | Peregrine falcon / nest camera | Identified Peregrine Falcon with 0.99 confidence through product image normalization | Strong known-context benchmark; raw image exceeded Groq pixel limit |
| Bald Eagle Webcam (Sauces Canyon Nest) | Bald eagle / nest camera | Identified Bald Eagle and eaglet in nest through product image normalization | Strong known-context benchmark; useful for action and question generation |

Image normalization is now implemented in the product path before Groq vision calls.

## Current Source-Gate Finding

NPS image URLs are not enough for the product claim. A local scan of image-bearing NPS webcam records found stale image headers, including the Peregrine Falcon image last modified in 2024. The human review page for the Peregrine Falcon stream also showed the live stream recording as unavailable.

PhenoCam is the strongest current candidate for the repeated-ingestion and context-graph portion of the test. It should be treated as ecological monitoring unless a wildlife-focused, permissioned, current source is found. A PhenoCam-only wall would prove cadence and graph ingestion, not the wildlife-monitoring thesis.

## Source Surface Rule

The main source wall should show working sources. Candidate and benchmark material belongs elsewhere.

| Surface | Role | Examples |
| --- | --- | --- |
| Main source wall | Sources with measurable currentness and an allowed capture route | cleared PhenoCam sites; future permissioned wildlife image/video sources |
| Source lab | Promising sources still under permission, freshness, or capture review | Big Bear, Cornell Bird Cams, Explore.org, NPS wildlife webcams |
| Test harness | Known-answer images and fixture replay | Channel Islands bird images, LILA-style fixtures |

Operational labels on the main wall should describe source state: `Active`, `Stale`, `Blocked`, `Quiet`, or `Attention`. Research and benchmark labels are still useful, but they should describe source-lab and test-harness material, not primary monitored sources.

## Supporting Context Candidate

Big Bear is the strongest example for commentary context research. Friends of Big Bear Valley maintains official eagle nest pages, livestreams, history, stories, quick references, communities, and recap reports. Public coverage also shows the kind of detail this layer should capture: recurring named animals, nest milestones, unusual visitors, and operator explanations around ambiguous behavior.

The current decision is research only until a permitted ingestion route is confirmed.

## Change Log
- 2026-06-28: Added the source-surface rule and clarified that PhenoCam proves ecological cadence rather than predictable wildlife monitoring.
- 2026-06-28: Added Big Bear as a source-family candidate for observer-context ingestion.
- 2026-06-28: Added source cadence to candidate scoring, rejected NPS image URLs as live proof, and promoted PhenoCam active sites for the next gate.
- 2026-06-27: Added Big Bear as the supporting-context example for future commentary ingestion.
- 2026-06-27: Updated the bird-cam benchmark after product image normalization passed.
- 2026-06-27: Promoted Channel Islands nest cams to known-context benchmark sources after Groq identified falcon and eagle contexts.
- 2026-06-27: Created candidate register and promoted Bartlett Cove Lagoon as the next proof source.
