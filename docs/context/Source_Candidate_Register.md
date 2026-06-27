# Source Candidate Register

## Purpose
Track camera sources by product value, machine access, and permission risk.

The prototype needs a source that can produce meaningful conservation observations. Scenic views prove ingestion. Wildlife-likely views test the product.

## Scoring

| Score | Meaning |
| --- | --- |
| `High` | Strong fit for the current prototype |
| `Medium` | Useful with caveats |
| `Low` | Weak fit or blocked |

## Candidates

| Candidate | Wildlife likelihood | Machine access | Permission status | Review link quality | Current decision |
| --- | --- | --- | --- | --- | --- |
| Yosemite Falls | Low | High | NPS API source; image URL available | Medium; NPS media page is weak, Yosemite Conservancy page is better | Keep as source-path proof |
| Bartlett Cove Lagoon and Fairweather Range | High | High | NPS API source; image URL available | Medium; NPS page says click preview for live view | Use as next Groq proof |
| Lower Glacier Bay | Medium | High | NPS API source; image URL available | Medium | Keep as backup Glacier Bay candidate |
| Katmai Brooks Falls Bearcam | High | Medium | NPS record credits Explore.org partnership; automated monitoring may need permission | High for human interest | Research only unless permission path is clear |
| Katmai River Watch Cam | High | Medium | NPS record credits Explore-style bear camera ecosystem; terms need review | High for wildlife | Research only unless permission path is clear |
| Channel Islands nest cams | High seasonal | High with image normalization | NPS API image URL available for several nest cams; seasonal sensitivity needs care | Medium | Use as known-context Groq benchmark |
| Elk Prairie at Prairie Creek Redwoods | High | Low now | NPS record did not expose an image URL in first API scan | Medium | Promising, adapter/source route needed |

## Recommended Next Source
Bartlett Cove Lagoon and Fairweather Range is the next best source.

Why it fits:

- NPS describes the site as hosting river otters, harbor seals, waterfowl, moose, and black bears.
- The API exposes an image URL.
- The camera context is ecological, not only scenic.
- A no-wildlife result still teaches useful things about visibility, waterline, habitat state, and confidence.

## Source Selection Rule
Pick sources in this order:

1. wildlife likelihood
2. official or permissioned machine access
3. clear human review page
4. useful refresh behavior
5. acceptable source terms

## Current Machine-Readable Candidates

| NPS title | Park | Targeting hint |
| --- | --- | --- |
| Bartlett Cove Lagoon and Fairweather Range | Glacier Bay National Park & Preserve | `titleIncludes: "Bartlett Cove Lagoon"` |
| Lower Glacier Bay | Glacier Bay National Park & Preserve | `titleIncludes: "Lower Glacier Bay"` |
| Brooks Falls Bearcam | Katmai National Park & Preserve | `titleIncludes: "Brooks Falls Bearcam"` |
| River Watch Cam | Katmai National Park & Preserve | `titleIncludes: "River Watch Cam"` |
| Peregrine Falcon Webcam | Channel Islands National Park | `titleIncludes: "Peregrine Falcon"` |
| Bald Eagle Webcam (Sauces Canyon Nest) | Channel Islands National Park | `titleIncludes: "Sauces Canyon"` |

## Known-Context Benchmark Result

The Channel Islands nest cams are now the best proof set for model extraction quality.

| Source | Expected context | Groq result | Product finding |
| --- | --- | --- | --- |
| Peregrine Falcon Webcam | Peregrine falcon / nest camera | Identified Peregrine Falcon with 0.99 confidence through product image normalization | Strong known-context benchmark; raw image exceeded Groq pixel limit |
| Bald Eagle Webcam (Sauces Canyon Nest) | Bald eagle / nest camera | Identified Bald Eagle and eaglet in nest through product image normalization | Strong known-context benchmark; useful for action and question generation |

Image normalization is now implemented in the product path before Groq vision calls.

## Supporting Context Candidate

Big Bear is the strongest example for commentary context research. Friends of Big Bear Valley maintains official eagle nest pages, livestreams, history, stories, quick references, communities, and recap reports. Public coverage also shows the kind of detail this layer should capture: recurring named animals, nest milestones, and operator explanations around ambiguous behavior.

The current decision is research only until a permitted ingestion route is confirmed.

## Change Log
- 2026-06-27: Added Big Bear as the supporting-context example for future commentary ingestion.
- 2026-06-27: Updated the bird-cam benchmark after product image normalization passed.
- 2026-06-27: Promoted Channel Islands nest cams to known-context benchmark sources after Groq identified falcon and eagle contexts.
- 2026-06-27: Created candidate register and promoted Bartlett Cove Lagoon as the next proof source.
