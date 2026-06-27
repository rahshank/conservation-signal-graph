import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Clock, Cpu, Database, FileCheck, GitBranch, Image, Link, Play, RadioTower, RotateCw, ShieldCheck } from "lucide-react";
import type { DashboardState, GraphNode } from "../shared/schema";
import { seededDashboardState } from "../server/fixtures";

export function App() {
  const [state, setState] = useState<DashboardState>(seededDashboardState());
  const [status, setStatus] = useState("Seeded demo state");

  useEffect(() => {
    void refreshState();
  }, []);

  async function refreshState() {
    try {
      const response = await fetch("/api/state");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setState((await response.json()) as DashboardState);
      setStatus("Connected to local API");
    } catch {
      setState(seededDashboardState());
      setStatus("Static preview using seeded demo state");
    }
  }

  async function ingestFixture() {
    setStatus("Ingesting signal...");
    const response = await fetch("/api/events/ingest", { method: "POST" });
    if (!response.ok) {
      setStatus(`Ingest failed: HTTP ${response.status}`);
      return;
    }
    setState((await response.json()) as DashboardState);
    setStatus("Signal ingested");
  }

  async function ingestNps() {
    setStatus("Ingesting NPS source...");
    const response = await fetch("/api/events/ingest/nps", { method: "POST" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setStatus(body?.detail ? `NPS ingest blocked: ${body.detail}` : `NPS ingest failed: HTTP ${response.status}`);
      return;
    }
    setState((await response.json()) as DashboardState);
    setStatus("NPS source ingested");
  }

  async function probeNps() {
    setStatus("Checking NPS webcam source...");
    const response = await fetch("/api/sources/probe/nps");
    if (!response.ok) {
      setStatus(`Source probe failed: HTTP ${response.status}`);
      return;
    }
    await refreshState();
  }

  const latest = state.events[0];
  const groupedNodes = useMemo(() => groupNodesByKind(state.graph.nodes), [state.graph.nodes]);
  const latestConfidence = Math.round(latest.observation.confidence * 100);
  const isLive = latest.source.sourceType === "live_camera";

  return (
    <main className="shell">
      <section className="commandBar" aria-label="Project command bar">
        <div className="identity">
          <div className="mark"><RadioTower size={24} /></div>
          <div>
            <p className="eyebrow">Protected-area signal intelligence</p>
            <h1>Conservation Signal Graph</h1>
          </div>
        </div>
        <div className="commandActions">
          <button onClick={probeNps}><RotateCw size={16} />Probe</button>
          <button onClick={ingestNps}><RadioTower size={16} />Ingest NPS</button>
          <button className="primary" onClick={ingestFixture}><Play size={16} />Fixture run</button>
        </div>
      </section>

      <section className="statusRail" aria-label="System status">
        <Metric icon={<Activity size={17} />} label="Events" value={state.metrics.totalEvents.toString()} />
        <Metric icon={<RadioTower size={17} />} label="Live source" value={state.metrics.liveEvents.toString()} />
        <Metric icon={<GitBranch size={17} />} label="Graph" value={state.metrics.graphMode} />
        <Metric icon={<Cpu size={17} />} label="Extraction" value={state.metrics.extractionMode} />
        <Metric icon={<Database size={17} />} label="Latency" value={`${state.metrics.averageLatencyMs} ms`} />
      </section>

      <section className="gate" aria-label="Live source gate">
        <div className="gateCopy">
          <ShieldCheck size={20} />
          <div>
          <strong>{state.sourceGate.label}</strong>
          <p>{state.sourceGate.detail}</p>
          </div>
        </div>
        <span className={`pill ${state.sourceGate.status}`}>{state.sourceGate.status.replace(/_/g, " ")}</span>
      </section>

      <section className="workspace" aria-label="Monitoring workspace">
        <div className="panel framePanel heroPanel">
          <div className="panelHeader">
            <div>
              <h2>{latest.source.sourceName}</h2>
              <p>{latest.source.locationLabel}</p>
            </div>
            <span className={isLive ? "sourceBadge live" : "sourceBadge fixture"}>{latest.source.sourceType.replace("_", " ")}</span>
          </div>
          <div className="frame">
            <img src={latest.source.imageUrl ?? "/fixture-frame.svg"} alt={latest.source.sourceName} />
            <div className="frameOverlay">
              <span>{new Date(latest.source.capturedAt).toLocaleTimeString()}</span>
              <strong>{latestConfidence}%</strong>
            </div>
          </div>
          <dl className="sourceFacts">
            <div><dt>Source</dt><dd>{latest.source.sourceName}</dd></div>
            <div><dt>Place</dt><dd>{latest.source.locationLabel}</dd></div>
            <div><dt>Terms</dt><dd>{latest.source.termsStatus.replace("_", " ")}</dd></div>
            <div>
              <dt>Review</dt>
              <dd>{latest.source.sourcePageUrl ? <a href={latest.source.sourcePageUrl}>{displayUrl(latest.source.sourcePageUrl)}</a> : "No review URL"}</dd>
            </div>
          </dl>
        </div>

        <div className="panel eventPanel">
          <div className="panelHeader">
            <div>
              <h2>Signal Feed</h2>
              <p>{status}</p>
            </div>
            <span>{state.events.length} retained</span>
          </div>
          <div className="eventList">
            {state.events.map((event) => (
              <article className="event" key={event.observation.observationId}>
                <div>
                  <h3>{event.observation.summary}</h3>
                  <p>{new Date(event.source.capturedAt).toLocaleString()}</p>
                </div>
                <span className="confidence">{Math.round(event.observation.confidence * 100)}%</span>
              </article>
            ))}
          </div>
        </div>

        <div className="panel graphPanel">
          <div className="panelHeader">
            <div>
              <h2>Context Graph</h2>
              <p>Evidence, uncertainty, actions, and questions</p>
            </div>
            <span>{state.graph.nodes.length} nodes / {state.graph.relationships.length} edges</span>
          </div>
          <div className="graphCanvas" aria-label="Graph nodes">
            {state.graph.nodes.slice(0, 14).map((node, index) => (
              <GraphDot key={node.id} node={node} index={index} />
            ))}
          </div>
        </div>

        <div className="panel runPanel" aria-label="Model run details">
          <div className="panelHeader">
            <div>
              <h2>Run Details</h2>
              <p>Model, validation, source trace, and submitted frame</p>
            </div>
            <FileCheck size={18} />
          </div>
          <dl className="detailGrid">
            <DetailItem icon={<Cpu size={15} />} label="Model" value={latest.observation.model} />
            <DetailItem icon={<FileCheck size={15} />} label="Prompt" value={latest.observation.promptVersion} />
            <DetailItem icon={<Clock size={15} />} label="Latency" value={`${latest.observation.latencyMs} ms`} />
            <DetailItem icon={<ShieldCheck size={15} />} label="Validation" value={latest.observation.validationStatus} />
            <DetailItem icon={<Activity size={15} />} label="Confidence" value={`${latestConfidence}%`} />
            <DetailItem icon={<Database size={15} />} label="Graph mode" value={state.metrics.graphMode} />
            <DetailItem icon={<RadioTower size={15} />} label="Extraction mode" value={state.metrics.extractionMode} />
            <DetailItem
              icon={<Link size={15} />}
              label="Source URL"
              value={latest.source.imageUrl ?? "Fixture asset"}
              href={latest.source.imageUrl}
            />
          </dl>

          <section className="frameProcessing" aria-label="Frame processing metadata">
            <div className="subhead">
              <Image size={16} />
              <h3>Frame Processing</h3>
            </div>
            {latest.observation.frameProcessing ? (
              <dl className="detailGrid compact">
                <DetailItem label="Original" value={formatDimensions(latest.observation.frameProcessing.originalWidth, latest.observation.frameProcessing.originalHeight)} />
                <DetailItem label="Original bytes" value={formatBytes(latest.observation.frameProcessing.originalBytes)} />
                <DetailItem label="Submitted" value={formatDimensions(latest.observation.frameProcessing.submittedWidth, latest.observation.frameProcessing.submittedHeight)} />
                <DetailItem label="Submitted bytes" value={formatBytes(latest.observation.frameProcessing.submittedBytes)} />
                <DetailItem label="Resized" value={latest.observation.frameProcessing.resized ? "Yes" : "No"} />
                <DetailItem label="Reason" value={latest.observation.frameProcessing.reason.replace("_", " ")} />
              </dl>
            ) : (
              <p className="emptyDetail">No frame-normalization record for fixture mode.</p>
            )}
          </section>
        </div>

        <div className="panel queryPanel">
          <div className="panelHeader">
            <div>
              <h2>Review Queue</h2>
              <p>Predefined graph checks</p>
            </div>
            <AlertTriangle size={18} />
          </div>
          <QueryResult label="Unresolved risks" nodes={groupedNodes.Risk ?? []} />
          <QueryResult label="Actions needing review" nodes={groupedNodes.Action ?? []} />
          <QueryResult label="Open questions" nodes={groupedNodes.Question ?? []} />
        </div>
      </section>
    </main>
  );
}

function DetailItem({ icon, label, value, href }: { icon?: ReactNode; label: string; value: string; href?: string }) {
  return (
    <div>
      <dt>{icon}{label}</dt>
      <dd>{href ? <a href={href}>{value}</a> : value}</dd>
    </div>
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

function GraphDot({ node, index }: { node: GraphNode; index: number }) {
  const radius = 32 + (node.confidence ?? 0.5) * 18;
  const angle = (index / 14) * Math.PI * 2;
  const x = 44 + Math.cos(angle) * 34;
  const y = 46 + Math.sin(angle) * 28;
  return (
    <div
      className={`graphDot ${node.kind}`}
      style={{
        width: `${radius}px`,
        height: `${radius}px`,
        left: `${x}%`,
        top: `${y}%`
      }}
      title={`${node.kind}: ${node.label}`}
    >
      <span>{node.kind.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
    </div>
  );
}

function QueryResult({ label, nodes }: { label: string; nodes: GraphNode[] }) {
  return (
    <div className="queryResult">
      <strong>{label}</strong>
      {nodes.length === 0 ? (
        <p>No matching nodes yet.</p>
      ) : (
        <ul>
          {nodes.slice(0, 3).map((node) => (
            <li key={node.id}>{node.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function displayUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return value;
  }
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function formatDimensions(width: number, height: number) {
  return `${width} x ${height}`;
}

function groupNodesByKind(nodes: GraphNode[]): Partial<Record<GraphNode["kind"], GraphNode[]>> {
  return nodes.reduce<Partial<Record<GraphNode["kind"], GraphNode[]>>>((groups, node) => {
    groups[node.kind] = [...(groups[node.kind] ?? []), node];
    return groups;
  }, {});
}
