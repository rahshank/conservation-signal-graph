import type { DashboardState, ExtractedObservation, GraphSnapshot, SignalMetrics, SourceEvent } from "../shared/schema";
import { seededDashboardState } from "./fixtures";
import type { GraphRepository } from "./graph/repository";

export class SignalStore {
  private events: DashboardState["events"];
  private metrics: SignalMetrics;
  private sourceGate: DashboardState["sourceGate"];

  constructor(private graphRepository: GraphRepository) {
    const seeded = seededDashboardState();
    this.events = seeded.events;
    this.metrics = { ...seeded.metrics, graphMode: graphRepository.mode };
    this.sourceGate = seeded.sourceGate;
  }

  async add(source: SourceEvent, observation: ExtractedObservation): Promise<DashboardState> {
    this.events = [{ source, observation }, ...this.events].slice(0, 20);
    await this.graphRepository.writeObservation(source, observation);
    this.recalculateMetrics();
    return this.snapshot();
  }

  setSourceGate(sourceGate: DashboardState["sourceGate"]): void {
    this.sourceGate = sourceGate;
  }

  async snapshot(): Promise<DashboardState> {
    let graph = await this.graphRepository.snapshot();
    if (graph.nodes.length === 0) {
      graph = seededDashboardState().graph;
    }
    return {
      events: this.events,
      graph,
      metrics: this.metrics,
      sourceGate: this.sourceGate
    };
  }

  private recalculateMetrics(): void {
    const totalEvents = this.events.length;
    const liveEvents = this.events.filter((event) => event.source.sourceType === "live_camera").length;
    const fixtureEvents = totalEvents - liveEvents;
    const averageLatencyMs =
      this.events.reduce((total, event) => total + event.observation.latencyMs, 0) / Math.max(totalEvents, 1);
    const validationPassRate =
      this.events.filter((event) => event.observation.validationStatus !== "invalid").length / Math.max(totalEvents, 1);
    const extractionMode = this.events.some((event) => event.observation.validationStatus === "valid") ? "groq" : "fixture";

    this.metrics = {
      totalEvents,
      liveEvents,
      fixtureEvents,
      averageLatencyMs: Math.round(averageLatencyMs),
      validationPassRate,
      graphMode: this.graphRepository.mode,
      extractionMode
    };
  }
}
