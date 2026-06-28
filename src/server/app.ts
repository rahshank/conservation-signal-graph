import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type ProbeResult, probeNpsWebcamSource } from "./adapters/nps-webcam";
import { probePhenoCamSites } from "./adapters/phenocam";
import { extractObservation } from "./extraction/extractor";
import { fixtureSourceEvent } from "./fixtures";
import { createGraphRepository, type GraphRepository } from "./graph/repository";
import { SignalStore } from "./state";
import { sourceEventSchema } from "../shared/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp(options: {
  graphRepository?: GraphRepository;
  npsProbe?: () => Promise<ProbeResult>;
  phenocamProbe?: () => ReturnType<typeof probePhenoCamSites>;
} = {}) {
  const app = express();
  const graphRepository = options.graphRepository ?? createGraphRepository();
  const npsProbe = options.npsProbe ?? (() => probeNpsWebcamSource());
  const phenocamProbe = options.phenocamProbe ?? (() => {
    const sites = (process.env.PHENOCAM_SITES ?? "aguamarga,barrocolorado,alercecosteroforest")
      .split(",")
      .map((site) => site.trim())
      .filter(Boolean);
    return probePhenoCamSites(sites);
  });
  const store = new SignalStore(graphRepository);

  app.use(express.json({ limit: "10mb" }));

  app.get("/api/state", async (_request, response) => {
    response.json(await store.snapshot());
  });

  app.get("/api/events", async (_request, response) => {
    response.json((await store.snapshot()).events);
  });

  app.get("/api/graph", async (_request, response) => {
    response.json((await store.snapshot()).graph);
  });

  app.get("/api/metrics", async (_request, response) => {
    response.json((await store.snapshot()).metrics);
  });

  app.get("/api/sources/probe/nps", async (_request, response) => {
    const result = await npsProbe();
    if (result.ok) {
      store.setSourceGate({
        status: "ready_for_probe",
        label: "Bird camera source ready",
        detail: `Found ${result.source.sourceName}. Use the NPS benchmark action to test Groq on the known-context image.`
      });
    } else {
      store.setSourceGate({
        status: result.status === "missing_key" ? "blocked_missing_key" : "fixture_only",
        label: "Source gate",
        detail: result.detail
      });
    }
    response.json(result);
  });

  app.get("/api/sources/probe/phenocam", async (_request, response) => {
    const result = await phenocamProbe();
    const { totalSources, inferenceEligible, fresh, recent, staleFreshness, unknownFreshness, staleSnapshots, failed } = result.summary;
    if (inferenceEligible > 0) {
      store.setSourceGate({
        status: "ready_for_probe",
        label: "Fresh source candidates found",
        detail: `${inferenceEligible} of ${totalSources} PhenoCam sources are eligible for inference now. ${fresh} fresh, ${recent} recent, ${staleFreshness} stale freshness, ${unknownFreshness} unknown, ${failed} failed.`
      });
    } else {
      store.setSourceGate({
        status: "fixture_only",
        label: "No fresh source passed",
        detail: `${totalSources} PhenoCam sources checked. ${staleFreshness} stale freshness, ${unknownFreshness} unknown freshness, ${staleSnapshots} stale source records, ${failed} failed. Keep the app in fixture or research mode.`
      });
    }
    response.json(result);
  });

  app.post("/api/events/ingest", async (request, response, next) => {
    try {
      const source =
        request.body && Object.keys(request.body).length > 0
          ? sourceEventSchema.parse(request.body)
          : {
              ...fixtureSourceEvent,
              capturedAt: new Date().toISOString()
            };
      const observation = await extractObservation(source);
      response.json(await store.add(source, observation));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/ingest/nps", async (_request, response, next) => {
    try {
      const result = await npsProbe();
      if (!result.ok) {
        response.status(400).json(result);
        return;
      }
      const observation = await extractObservation(result.source);
      await store.add(result.source, observation);
      store.setSourceGate({
        status: "ready_for_probe",
        label: "NPS benchmark analyzed",
        detail: `Analyzed ${result.source.sourceName} with ${observation.validationStatus === "valid" ? "Groq" : "fixture extraction"}.`
      });
      response.json(await store.snapshot());
    } catch (error) {
      store.setSourceGate({
        status: "ingest_failed",
        label: "Source ingest failed",
        detail: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  });

  if (process.env.NODE_ENV === "production") {
    const dist = path.resolve(__dirname, "../../dist");
    app.use(express.static(dist));
    app.get(/.*/, (_request, response) => response.sendFile(path.join(dist, "index.html")));
  }

  return { app, graphRepository };
}
