# Pipeline Explainer

## Purpose
Explain the Conservation Signal Graph pipeline in working language.

The prototype is a learning artifact and a product proof. Each step should make sense on its own, and each claim should map to evidence.

## The Pipeline

```mermaid
flowchart LR
  A["Permissioned camera source"] --> B["Image frame URL"]
  B --> C["Groq vision inference"]
  C --> D["Structured observation"]
  D --> E["Neo4j context graph"]
  E --> F["Dashboard and graph queries"]
  D --> G["Evidence bundle"]
  E --> G
```

## 1. Source
A source is the place an image comes from. In this project, the first source type is an official NPS webcam record.

The source record needs:

- source name
- park or place
- human review page
- image URL for the current frame
- timestamp
- terms or credit note
- source mode: `live_camera` or `dataset_fixture`

The image URL is the machine-readable frame. The source page is for human review and traceability.

## 2. Groq Inference
Inference means asking a model to produce an answer from an input. Here the input is a camera image and a prompt. Groq returns a structured observation.

The useful output is not a paragraph. The useful output is a validated object:

- species candidates
- risks
- actions
- open questions
- summary
- confidence
- model name
- prompt version
- latency
- validation status

Groq matters here when the workflow depends on many small model calls that need to stay fast: check the frame, identify candidates, name uncertainty, create review questions, and prepare graph writes.

## 3. Structured Observation
The observation is the contract between AI output and the rest of the product.

The schema prevents the model from becoming loose prose. If the output cannot match the schema, it should fail validation instead of entering the graph as if it were reliable.

Current validation states:

- `fixture`: development placeholder
- `valid`: model output matched the schema
- `invalid`: model output failed validation

## 4. Context Graph
The graph stores observations as connected facts.

Core nodes:

- `Source`
- `Frame`
- `Observation`
- `SpeciesCandidate`
- `Place`
- `Risk`
- `Action`
- `Question`
- `Run`

Core relationships:

- `CAPTURED_FROM`
- `OBSERVED_AT`
- `SUGGESTS_SPECIES`
- `RAISES_RISK`
- `REQUIRES_ACTION`
- `RAISES_QUESTION`
- `SUPPORTED_BY`
- `GENERATED_IN_RUN`

The graph lets the product answer relationship questions: which source produced this observation, what model run generated it, which risks are unresolved, which actions need review, and what evidence supports a claim.

## 5. Dashboard
The dashboard is the review surface. It should show the current frame, source status, extraction mode, graph mode, confidence, latency, review queue, and graph relationships.

The UI should never blur fixture proof, Groq proof, and Neo4j proof. Each mode needs to be visible.

## 6. Evidence
Evidence is the record that the pipeline actually ran.

For each proof gate, record:

- source used
- source mode
- model or fixture mode
- graph mode
- prompt version
- latency
- validation status
- observed summary
- test output
- screenshots when UI changed

## Current Read
The project has passed:

- NPS live-source proof with Yosemite Falls
- first real Groq extraction with Yosemite Falls
- GitHub repository, issues, Project board, and CI setup

The next proof should use a more wildlife-likely source, starting with Bartlett Cove Lagoon and Fairweather Range.

## Change Log
- 2026-06-27: Created first pipeline explainer for the learning/context layer.
