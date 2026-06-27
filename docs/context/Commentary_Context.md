# Commentary Context

## Purpose
Define the context layer that can turn a camera-only graph into a context graph.

## Product Idea
Camera frames show what the model can see at a moment. Commentary adds what people around the camera already know: species names, recurring animals, seasonal milestones, moderator notes, incident reports, and educational context.

The product should ingest trusted commentary only when the source route is permitted and traceable.

## Candidate Context Sources

| Source type | Example | Product value | Constraint |
| --- | --- | --- | --- |
| Official camera-operator pages | Friends of Big Bear Valley eagle nest pages | Baseline source facts, named animals, camera purpose, habitat context | Confirm reuse and automated access terms |
| Official recaps or stories | Big Bear eagle stories, quick references, recap reports | Time-based events and seasonal history | Prefer source-owned pages over third-party summaries |
| Moderator or operator social posts | Official Facebook, Instagram, YouTube community posts | Human-observed events the frame may miss | Platform terms and rate limits apply |
| YouTube live chat via API | Live chat messages when enabled and accessible | Viewer observations and event reports around exact moments | Requires official API path, quota handling, and trust filtering |
| Third-party articles | Country Living example naming Fiona the flying squirrel and Dash the mouse | Research context and public narrative cues | Useful for background; avoid treating as operational telemetry |

## Big Bear Example
Big Bear is the right mental model for the context layer. The camera may show an eagle nest, while supporting commentary explains that Jackie and Shadow are the resident bald eagles, the site has recurring non-eagle visitors such as Fiona the flying squirrel and Dash the mouse, and the camera operator maintains public educational context around the nest.

That context should become graph data only when it is source-linked, timestamped or date-scoped, permissioned, and labeled by source type.

## Graph Shape

| Node | Role |
| --- | --- |
| `CommentarySource` | Site, API, recap page, social account, or official note source |
| `CommentaryEvent` | A specific note, chat message, recap item, or dated context claim |
| `ContextClaim` | Normalized claim extracted from commentary |
| `Actor` | Named animal, moderator, organization, or observer source |

| Relationship | Meaning |
| --- | --- |
| `CONTEXT_FOR` | Commentary supports a camera source, frame, or observation |
| `MENTIONS_SPECIES` | Commentary names a species or animal candidate |
| `MENTIONS_ACTOR` | Commentary names a known individual or source actor |
| `DESCRIBES_EVENT` | Commentary describes an egg, visitor, feeding, attack, weather event, or milestone |
| `SUPPORTS_OBSERVATION` | Commentary supports a model observation |
| `CONFLICTS_WITH_OBSERVATION` | Commentary disagrees with a model observation and needs review |

## Acceptance Gate
A commentary source can enter the product path when all are true:

- access route is official, API-based, or clearly permitted
- terms allow the intended collection and display
- every item stores source URL, source type, timestamp or date scope, and retrieval time
- model-extracted claims remain linked to the original text
- UI separates model inference, official commentary, viewer commentary, and third-party context

## Change Log
- 2026-06-27: Created first commentary context backlog note with Big Bear as the reference example.
