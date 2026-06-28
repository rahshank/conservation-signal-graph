import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock, Cpu, Database, Eye, FileCheck, GitBranch, Image, Link, ListChecks, Play, RadioTower, RotateCw, ShieldCheck, XCircle } from "lucide-react";
import type { DashboardState, GraphNode, GraphRelationship } from "../shared/schema";
import { seededDashboardState } from "../server/fixtures";

export function App() {
  const [state, setState] = useState<DashboardState>(seededDashboardState());
  const [status, setStatus] = useState("Seeded demo state");
  const [reviewDecision, setReviewDecision] = useState("Awaiting monitor review");

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
    setStatus("Replaying test fixture...");
    const response = await fetch("/api/events/ingest", { method: "POST" });
    if (!response.ok) {
      setStatus(`Ingest failed: HTTP ${response.status}`);
      return;
    }
    setState((await response.json()) as DashboardState);
    setReviewDecision("Awaiting monitor review");
    setStatus("Test fixture replayed");
  }

  async function ingestNps() {
    setStatus("Analyzing bird camera with Groq...");
    const response = await fetch("/api/events/ingest/nps", { method: "POST" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      await refreshState();
      setStatus(body?.detail ? `Bird camera analysis failed: ${body.detail}` : `Bird camera analysis failed: HTTP ${response.status}`);
      return;
    }
    setState((await response.json()) as DashboardState);
    setReviewDecision("Awaiting monitor review");
    setStatus("Bird camera analyzed");
  }

  async function probeNps() {
    setStatus("Checking bird camera source...");
    const response = await fetch("/api/sources/probe/nps");
    if (!response.ok) {
      setStatus(`Source probe failed: HTTP ${response.status}`);
      return;
    }
    await refreshState();
    setStatus("Bird camera source checked");
  }

  const latest = state.events[0];
  const groupedNodes = useMemo(() => groupNodesByKind(state.graph.nodes), [state.graph.nodes]);
  const latestConfidence = Math.round(latest.observation.confidence * 100);
  const isLive = latest.source.sourceType === "live_camera";

  useEffect(() => {
    setReviewDecision("Awaiting monitor review");
  }, [latest.observation.observationId]);

  return (
    <main className="shell">
      <section className="commandBar" aria-label="Project command bar">
        <div className="identity">
          <div className="mark"><RadioTower size={24} /></div>
          <div>
            <p className="eyebrow">Protected-area signal review</p>
            <h1>Conservation Signal Graph</h1>
          </div>
        </div>
        <div className="commandCluster">
          <div className="modeStrip" aria-label="Proof modes">
            <span>Source: {isLive ? "live camera" : "fixture"}</span>
            <span>Extraction: {state.metrics.extractionMode}</span>
            <span>Graph: {state.metrics.graphMode}</span>
            <span>Validation: {latest.observation.validationStatus}</span>
          </div>
          <div className="commandActions">
            <button onClick={probeNps} title="Check which NPS bird camera will be analyzed"><RotateCw size={16} />Check bird camera</button>
            <button className="primary" onClick={ingestNps} title="Fetch the current bird-camera frame and analyze it with Groq"><RadioTower size={16} />Analyze bird camera</button>
            <button onClick={ingestFixture} title="Replay the cartoon fixture used for regression testing"><Play size={16} />Replay test fixture</button>
          </div>
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
        <span className={`pill ${state.sourceGate.status}`}>{displayGateStatus(state.sourceGate.status)}</span>
      </section>

      <section className="workspace reviewWorkspace" aria-label="Monitoring workspace">
        <SignalUnderReview latest={latest} isLive={isLive} latestConfidence={latestConfidence} />
        <AIObservation latest={latest} latestConfidence={latestConfidence} />
        <ReviewDecision decision={reviewDecision} onDecision={setReviewDecision} />
        <ContextGraph nodes={state.graph.nodes} relationships={state.graph.relationships} />
        <EvidenceTrace latest={latest} state={state} latestConfidence={latestConfidence} />
        <SignalQueue events={state.events} status={status} groupedNodes={groupedNodes} />
      </section>
    </main>
  );
}

function SignalUnderReview({ latest, isLive, latestConfidence }: {
  latest: DashboardState["events"][number];
  isLive: boolean;
  latestConfidence: number;
}) {
  return (
    <section className="panel signalPanel" aria-label="Signal under review">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Current camera signal</p>
          <h2>Signal Under Review</h2>
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
    </section>
  );
}

function AIObservation({ latest, latestConfidence }: { latest: DashboardState["events"][number]; latestConfidence: number }) {
  return (
    <section className="panel observationPanel" aria-label="AI observation">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Model read</p>
          <h2>AI Observation</h2>
        </div>
        <span className="confidence">{latestConfidence}%</span>
      </div>
      <div className="observationSummary">
        <h3>{latest.observation.summary}</h3>
        <p>Observed {new Date(latest.observation.observedAt).toLocaleString()}</p>
      </div>
      <div className="evidenceRows">
        <EvidenceList title="Species candidates" items={latest.observation.speciesCandidates.map((item) => `${item.label} - ${Math.round(item.confidence * 100)}% - ${item.evidence}`)} />
        <EvidenceList title="Risks" items={latest.observation.risks.map((item) => `${item.label} - ${item.severity} - ${item.evidence}`)} />
        <EvidenceList title="Actions" items={latest.observation.actions.map((item) => `${item.label} - ${item.ownerHint}`)} />
        <EvidenceList title="Questions" items={latest.observation.questions} />
      </div>
    </section>
  );
}

function ReviewDecision({ decision, onDecision }: { decision: string; onDecision: (decision: string) => void }) {
  return (
    <section className="panel decisionPanel" aria-label="Review decision">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Monitor action</p>
          <h2>Review Decision</h2>
        </div>
        <span className="decisionState">{decision}</span>
      </div>
      <div className="decisionActions">
        <button onClick={() => onDecision("Accepted as observation")}><CheckCircle2 size={16} />Accept observation</button>
        <button onClick={() => onDecision("Sent to human review")}><AlertTriangle size={16} />Send to review</button>
        <button onClick={() => onDecision("Dismissed as low confidence")}><XCircle size={16} />Dismiss low confidence</button>
        <button onClick={() => onDecision("Watching source")}><Eye size={16} />Watch source</button>
      </div>
    </section>
  );
}

function ContextGraph({ nodes, relationships }: { nodes: GraphNode[]; relationships: GraphRelationship[] }) {
  return (
    <section className="panel graphPanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Connected evidence</p>
          <h2>Context Graph</h2>
        </div>
        <span>{nodes.length} nodes / {relationships.length} edges</span>
      </div>
      <div className="graphBody">
        <div className="graphCanvas" aria-label="Graph nodes">
          {nodes.slice(0, 14).map((node, index) => (
            <GraphDot key={node.id} node={node} index={index} />
          ))}
        </div>
        <div className="relationshipList" aria-label="Graph relationships">
          {relationships.slice(0, 8).map((relationship) => (
            <RelationshipRow key={`${relationship.from}-${relationship.type}-${relationship.to}`} relationship={relationship} nodes={nodes} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EvidenceTrace({ latest, state, latestConfidence }: {
  latest: DashboardState["events"][number];
  state: DashboardState;
  latestConfidence: number;
}) {
  return (
    <section className="panel evidencePanel" aria-label="Evidence trace">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Technical trace</p>
          <h2>Evidence Trace</h2>
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
    </section>
  );
}

function SignalQueue({ events, status, groupedNodes }: {
  events: DashboardState["events"];
  status: string;
  groupedNodes: Partial<Record<GraphNode["kind"], GraphNode[]>>;
}) {
  return (
    <section className="panel queuePanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Review queue</p>
          <h2>Signal Queue</h2>
        </div>
        <span>{events.length} retained</span>
      </div>
      <p className="queueStatus">{status}</p>
      <div className="eventList">
        {events.map((event) => (
          <article className="event" key={event.observation.observationId}>
            <div>
              <h3>{event.observation.summary}</h3>
              <p>{event.source.sourceName} - {new Date(event.source.capturedAt).toLocaleString()}</p>
            </div>
            <span className="confidence">{Math.round(event.observation.confidence * 100)}%</span>
          </article>
        ))}
      </div>
      <div className="queueChecks">
        <QueryResult label="Unresolved risks" nodes={groupedNodes.Risk ?? []} />
        <QueryResult label="Actions needing review" nodes={groupedNodes.Action ?? []} />
        <QueryResult label="Open questions" nodes={groupedNodes.Question ?? []} />
      </div>
    </section>
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

function EvidenceList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="evidenceList">
      <div className="evidenceListTitle">
        <ListChecks size={15} />
        <h3>{title}</h3>
      </div>
      {items.length === 0 ? (
        <p>No signal yet.</p>
      ) : (
        <ul>
          {items.slice(0, 4).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
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

function RelationshipRow({ relationship, nodes }: { relationship: GraphRelationship; nodes: GraphNode[] }) {
  const from = nodes.find((node) => node.id === relationship.from)?.label ?? relationship.from;
  const to = nodes.find((node) => node.id === relationship.to)?.label ?? relationship.to;
  return (
    <div className="relationshipRow">
      <span>{relationship.type.replace(/_/g, " ")}</span>
      <p>{from} -&gt; {to}</p>
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

function displayGateStatus(status: DashboardState["sourceGate"]["status"]) {
  const labels: Record<DashboardState["sourceGate"]["status"], string> = {
    blocked_missing_key: "missing key",
    fixture_only: "fixture only",
    ingest_failed: "failed",
    ready_for_probe: "ready"
  };
  return labels[status];
}

function groupNodesByKind(nodes: GraphNode[]): Partial<Record<GraphNode["kind"], GraphNode[]>> {
  return nodes.reduce<Partial<Record<GraphNode["kind"], GraphNode[]>>>((groups, node) => {
    groups[node.kind] = [...(groups[node.kind] ?? []), node];
    return groups;
  }, {});
}
