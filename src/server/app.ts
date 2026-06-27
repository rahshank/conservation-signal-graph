import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { probeNpsWebcamSource } from "./adapters/nps-webcam";
import { extractObservation } from "./extraction/extractor";
import { fixtureSourceEvent } from "./fixtures";
import { createGraphRepository } from "./graph/repository";
import { SignalStore } from "./state";
import { sourceEventSchema } from "../shared/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp() {
  const app = express();
  const graphRepository = createGraphRepository();
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
    const result = await probeNpsWebcamSource();
    if (result.ok) {
      store.setSourceGate({
        status: "ready_for_probe",
        label: "NPS webcam source ready",
        detail: `Found ${result.source.sourceName}. A live ingestion run can use this source.`
      });
    } else {
      store.setSourceGate({
        status: result.status === "missing_key" ? "blocked_missing_key" : "fixture_only",
        label: "Live source gate",
        detail: result.detail
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

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  });

  if (process.env.NODE_ENV === "production") {
    const dist = path.resolve(__dirname, "../../dist");
    app.use(express.static(dist));
    app.get("*", (_request, response) => response.sendFile(path.join(dist, "index.html")));
  }

  return { app, graphRepository };
}
