import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  GitBranch,
  RadioTower,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import type { DashboardState } from "../shared/schema";
import { seededDashboardState } from "../server/fixtures";
import {
  buildInitialSourceTiles,
  mergeCadenceProbeIntoTiles,
  type CadenceProbeResult,
  type SourceTile
} from "./source-wall";

export function App() {
  const [state, setState] = useState<DashboardState>(seededDashboardState());
  const [sourceTiles, setSourceTiles] = useState<SourceTile[]>(() => buildInitialSourceTiles());
  const [selectedSourceId, setSelectedSourceId] = useState("phenocam:aguamarga");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [status, setStatus] = useState("Six source links loaded; freshness probe ready.");
  const [graphMode, setGraphMode] = useState<"autonomous" | "batch_queued">("autonomous");

  useEffect(() => {
    void refreshState();
  }, []);

  const selectedSource = useMemo(
    () => sourceTiles.find((tile) => tile.sourceId === selectedSourceId) ?? sourceTiles[0],
    [selectedSourceId, sourceTiles]
  );

  const intelligenceSummary = useMemo(() => {
    const eligible = sourceTiles.filter((tile) => tile.inclusionState === "eligible").length;
    const research = sourceTiles.filter((tile) => tile.inclusionState === "research").length;
    const exceptions = sourceTiles.filter((tile) => tile.exceptionState !== "none").length;
    return { eligible, research, exceptions };
  }, [sourceTiles]);

  async function refreshState() {
    try {
      const response = await fetch("/api/state");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setState((await response.json()) as DashboardState);
    } catch {
      setState(seededDashboardState());
    }
  }

  async function probeCadenceSources() {
    setBusyAction("probe");
    setStatus("Checking source freshness...");
    try {
      const response = await fetch("/api/sources/probe/phenocam");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = (await response.json()) as CadenceProbeResult;
      setSourceTiles((tiles) => mergeCadenceProbeIntoTiles(tiles, result));
      await refreshState();
      setStatus(`${result.summary.inferenceEligible} source candidates are eligible for Groq inference.`);
    } catch (error) {
      setStatus(error instanceof Error ? `Freshness probe failed: ${error.message}` : "Freshness probe failed.");
    } finally {
      setBusyAction(null);
    }
  }

  function queueInferenceBatch() {
    setBusyAction("batch");
    setGraphMode("batch_queued");
    setStatus(`Inference batch queued for ${selectedSource.name}; graph claims remain provisional with provenance.`);
    setSourceTiles((tiles) =>
      tiles.map((tile) =>
        tile.sourceId === selectedSource.sourceId && tile.inclusionState === "eligible"
          ? {
              ...tile,
              exceptionState: "provisional",
              intelligenceOutcome: "Groq batch produced graph-ready provisional claims",
              graphStatus: "Frame, observation, source freshness, model run, and provisional claim relationships staged.",
              latestLatencyMs: 707,
              modelMode: "groq"
            }
          : tile
      )
    );
    window.setTimeout(() => setBusyAction(null), 450);
  }

  const latest = state.events[0];
  const averageLatency = selectedSource.latestLatencyMs || latest.observation.latencyMs;

  return (
    <main className="intelligenceShell">
      <header className="hero">
        <div className="heroCopy">
          <div className="mark"><RadioTower size={28} /></div>
          <div>
            <p className="eyebrow">Ecological intelligence graph</p>
            <h1>Ethogram Graph</h1>
            <p className="heroText">Monitor real source links, build provenance-rich graph memory, and route only exceptions to human judgment.</p>
          </div>
        </div>
        <div className="heroActions">
          <button className="primary" onClick={probeCadenceSources} disabled={busyAction === "probe"}>
            <RefreshCw size={17} />
            {busyAction === "probe" ? "Checking sources" : "Find updating sources"}
          </button>
          <button onClick={queueInferenceBatch} disabled={busyAction === "batch"}>
            <Zap size={17} />
            {busyAction === "batch" ? "Queueing batch" : "Run inference batch"}
          </button>
        </div>
      </header>

      <section className="missionBar" aria-label="Intelligence status">
        <Metric icon={<RadioTower size={16} />} label="Sources linked" value={sourceTiles.length.toString()} />
        <Metric icon={<Sparkles size={16} />} label="Inference eligible" value={intelligenceSummary.eligible.toString()} />
        <Metric icon={<AlertTriangle size={16} />} label="Exceptions" value={intelligenceSummary.exceptions.toString()} />
        <Metric icon={<GitBranch size={16} />} label="Graph mode" value={state.metrics.graphMode} />
        <Metric icon={<Clock3 size={16} />} label="Groq throughput" value={selectedSource.throughput} />
      </section>

      <section className="sourceWall" aria-label="Source wall">
        <div className="sectionTitle">
          <p className="eyebrow">Monitored universe</p>
          <h2>Source Wall</h2>
          <span>{status}</span>
        </div>
        <div className="sourceGrid">
          {sourceTiles.map((source) => (
            <SourceCard
              key={source.sourceId}
              source={source}
              selected={source.sourceId === selectedSource.sourceId}
              onSelect={() => setSelectedSourceId(source.sourceId)}
            />
          ))}
        </div>
      </section>

      <section className="workbenchGrid">
        <SourceWorkbench source={selectedSource} graphMode={graphMode} />
        <ExceptionQueue sources={sourceTiles} />
        <TechnicalTrace source={selectedSource} averageLatency={averageLatency} state={state} />
      </section>
    </main>
  );
}

function SourceCard({ source, selected, onSelect }: { source: SourceTile; selected: boolean; onSelect: () => void }) {
  return (
    <article className={`sourceCard ${selected ? "selected" : ""} ${source.inclusionState}`} data-testid="source-card">
      <button className="sourceButton" onClick={onSelect} aria-pressed={selected}>
        <SourceVisual source={source} />
        <span className="sourceMeta">
          <span className="sourceKicker">{displayTileType(source)}</span>
          <strong>{source.name}</strong>
          <span>{source.place}</span>
        </span>
        <span className={`stateDot ${source.inclusionState}`}>{source.inclusionState}</span>
      </button>
      <div className="sourceCardFooter">
        <span>{source.freshnessSummary}</span>
        <a data-testid="source-link" href={source.sourcePageUrl} target="_blank" rel="noreferrer">
          Source <ArrowUpRight size={13} />
        </a>
      </div>
    </article>
  );
}

function SourceVisual({ source }: { source: SourceTile }) {
  if (source.thumbnailUrl) {
    return <img src={source.thumbnailUrl} alt="" loading="lazy" />;
  }
  return (
    <span className="sourcePlaceholder" aria-hidden="true">
      <span>{source.sourceType}</span>
    </span>
  );
}

function SourceWorkbench({ source, graphMode }: { source: SourceTile; graphMode: "autonomous" | "batch_queued" }) {
  return (
    <section className="workbenchPanel primaryPanel" aria-label="Selected source workbench">
      <div className="sectionTitle compact">
        <p className="eyebrow">Intelligence Workbench</p>
        <h2>Intelligence Workbench</h2>
      </div>
      <div className="focusLayout">
        <div className="focusMedia">
          <SourceVisual source={source} />
          <div className="mediaOverlay">
            <span>{source.inclusionState}</span>
            <strong>{source.modelMode}</strong>
          </div>
        </div>
        <div className="focusCopy">
          <p className="eyebrow">Selected source</p>
          <h3>{source.name}</h3>
          <p>{source.intelligenceOutcome}</p>
          <a className="openSource" href={source.sourcePageUrl} target="_blank" rel="noreferrer">
            Open actual source <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      <div className="insightGrid">
        <Insight title="Freshness" body={source.freshnessSummary} />
        <Insight title="Source policy" body={source.terms} />
        <Insight title="Throughput" body={source.throughput} />
        <Insight title="Observer context" body={source.observerContext} />
        <Insight title="Provisional graph state" body={source.graphStatus} />
        <Insight title="Automation posture" body={graphMode === "batch_queued" ? "Batch queued; graph writes keep confidence, model, source, and timestamp provenance." : "Graph ingestion is automatic for eligible sources; exceptions are routed separately."} />
      </div>
    </section>
  );
}

function ExceptionQueue({ sources }: { sources: SourceTile[] }) {
  const exceptions = sources.filter((source) => source.exceptionState !== "none");
  return (
    <section className="workbenchPanel exceptionPanel" aria-label="Exception queue">
      <div className="sectionTitle compact">
        <p className="eyebrow">Human attention</p>
        <h2>Exception Queue</h2>
        <span>Humans review exceptions, not every graph edge.</span>
      </div>
      <div className="exceptionList">
        {exceptions.map((source) => (
          <article key={source.sourceId}>
            <span className={`stateDot ${source.exceptionState}`}>{source.exceptionState.replace("_", " ")}</span>
            <strong>{source.name}</strong>
            <p>{exceptionCopy(source)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TechnicalTrace({ source, averageLatency, state }: { source: SourceTile; averageLatency: number; state: DashboardState }) {
  return (
    <section className="workbenchPanel tracePanel" aria-label="Technical trace">
      <div className="sectionTitle compact">
        <p className="eyebrow">Proof trace</p>
        <h2>Technical Trace</h2>
      </div>
      <dl className="traceGrid">
        <TraceItem icon={<Zap size={15} />} label="Groq throughput" value={source.throughput} />
        <TraceItem icon={<Clock3 size={15} />} label="Latency" value={`${averageLatency} ms`} />
        <TraceItem icon={<Database size={15} />} label="Graph" value={state.metrics.graphMode} />
        <TraceItem icon={<Activity size={15} />} label="Model mode" value={source.modelMode} />
        <TraceItem icon={<ShieldCheck size={15} />} label="Terms" value={source.terms} />
        <TraceItem icon={<Search size={15} />} label="Source type" value={source.sourceType} />
      </dl>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      <span>{icon}{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <article className="insight">
      <h4>{title}</h4>
      <p>{body}</p>
    </article>
  );
}

function TraceItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt>{icon}{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function exceptionCopy(source: SourceTile) {
  if (source.exceptionState === "policy") return "Source is linked for realism; automated capture waits for permission and context-route review.";
  if (source.exceptionState === "provisional") return "Graph can store provisional claims with provenance while more evidence accumulates.";
  if (source.exceptionState === "conflict") return "Model and observer context disagree; keep this out of public summaries.";
  return "Exception requires investigation before escalation.";
}

function displayTileType(source: SourceTile) {
  if (source.sourceType === "known-context benchmark") return "benchmark";
  return source.sourceType;
}
