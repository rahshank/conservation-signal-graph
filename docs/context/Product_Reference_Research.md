# Product Reference Research

## Purpose
Ground the Conservation Signal Graph UI in real conservation, monitoring, and review workflows.

The product should feel like a credible operating surface for reviewing camera signals, not a generic AI dashboard.

## Reference Set

| Reference | Why it matters | Design lesson for this prototype |
| --- | --- | --- |
| [EarthRanger](https://www.earthranger.com/) | Conservation operations platform for real-time field data, sensors, tracked wildlife, teams, and alerts. | Lead with situational awareness and decision state. The UI should answer what happened, where it came from, why it matters, and what response is needed. |
| [SMART Conservation Tools](https://smartconservationtools.org/en-us/) | Protected-area management software for collection, storage, communication, analysis, reporting, and field-to-decision workflows. | Treat camera observations as operational records. Keep source, review state, and actionability visible. |
| [Wildlife Insights](https://www.wildlifeinsights.org/) | Camera-trap platform centered on upload, identification, analysis, discovery, and sharing. | Keep species identification, confidence, and review workflow clear. The researcher lens needs history and evidence, not only a live feed. |
| [Sentry Issues](https://docs.sentry.io/product/issues/) | Modern triage interface for streams of events grouped into issues, with review states, detail views, sorting, and evidence. | The strongest pattern is a review queue plus detail pane: incoming signals should become inspectable cases with status, evidence, and next action. |

## Design System References

| Reference | Design lesson |
| --- | --- |
| [Carbon Design System data visualization](https://carbondesignsystem.com/data-visualization/getting-started/) | Data visuals should tell accurate, accessible stories. Graph and metrics views need legibility before decoration. |
| [GOV.UK Design System patterns](https://design-system.service.gov.uk/patterns/) | Patterns should solve specific user tasks and adapt components to context. The UI should be organized around the protected-area monitor's task, not component variety. |
| [Material Design layout guidance](https://m3.material.io/foundations/layout/understanding-layout/overview) | Responsive layout should preserve hierarchy across screen sizes. Mobile should stack the review task in the same order as desktop. |

## Product Direction

The next UI pass should test a **Protected-area Signal Review Console**.

Primary user: protected-area monitor.

Primary moment: a new camera signal arrives and needs review.

Primary question: Is this signal credible, what supports it, what should happen next, and what remains uncertain?

Secondary users:

- wildlife researcher or field biologist: needs history, context, repeated signals, and uncertainty.
- camera program operator or moderator: needs source quality, commentary, known camera context, and review trace.
- conservation communications lead: needs public trust, visible limits, and evidence-backed claims.
- technical evaluator: needs proof that Groq, Neo4j, tests, source policy, and evidence are real.

## UI Hierarchy To Test

1. Signal under review: frame, source, timestamp, status, source policy.
2. AI observation: species, risk, action, question, confidence, model trace.
3. Review decision: accept, needs human review, dismiss as low confidence, watch source.
4. Context graph: connected source, place, species, risk, action, question, run, and commentary.
5. Evidence drawer: model, prompt, normalization, latency, graph mode, source URL, test status.

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
- 2026-06-27: Created the first reference set for the persona-led UI pass.
