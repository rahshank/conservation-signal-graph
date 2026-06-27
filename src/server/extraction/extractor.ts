import { extractedObservationSchema, type ExtractedObservation, type SourceEvent } from "../../shared/schema";
import { fixtureObservation } from "../fixtures";

const PROMPT_VERSION = "csg-v0.1";

export async function extractObservation(source: SourceEvent): Promise<ExtractedObservation> {
  if (process.env.CSG_FORCE_FIXTURE === "1" || !process.env.GROQ_API_KEY || !source.imageUrl) {
    return {
      ...fixtureObservation,
      observationId: `obs-${Date.now()}`,
      sourceId: source.sourceId,
      frameId: `frame-${Date.now()}`,
      observedAt: source.capturedAt,
      model: "fixture-extractor",
      validationStatus: "fixture"
    };
  }

  const startedAt = Date.now();
  const model = process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract conservation monitoring observations from camera frames. Return only JSON that matches the requested shape. Mark uncertainty plainly."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Analyze this frame for protected-area monitoring. Return JSON with speciesCandidates, risks, actions, questions, summary, and confidence. Use confidence values from 0 to 1."
            },
            {
              type: "image_url",
              image_url: { url: source.imageUrl }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Groq extraction failed with HTTP ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq extraction returned no content.");

  const parsed = JSON.parse(content) as Partial<ExtractedObservation>;
  return extractedObservationSchema.parse({
    observationId: parsed.observationId ?? `obs-${Date.now()}`,
    sourceId: source.sourceId,
    frameId: parsed.frameId ?? `frame-${Date.now()}`,
    observedAt: source.capturedAt,
    speciesCandidates: parsed.speciesCandidates ?? [],
    risks: parsed.risks ?? [],
    actions: parsed.actions ?? [],
    questions: parsed.questions ?? [],
    summary: parsed.summary ?? "Groq returned a valid but sparse observation.",
    confidence: parsed.confidence ?? 0.5,
    model,
    promptVersion: PROMPT_VERSION,
    latencyMs: Date.now() - startedAt,
    validationStatus: "valid"
  });
}
