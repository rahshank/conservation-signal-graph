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
| Channel Islands nest cams | High seasonal | High | NPS API image URL available for several nest cams; seasonal sensitivity needs care | Medium | Useful for seasonal behavior tests |
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

## Change Log
- 2026-06-27: Created candidate register and promoted Bartlett Cove Lagoon as the next proof source.
