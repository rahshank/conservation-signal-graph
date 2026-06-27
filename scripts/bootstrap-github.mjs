import { execFileSync, spawnSync } from "node:child_process";

const OWNER = "rahshank";
const REPO = "conservation-signal-graph";
const FULL_NAME = `${OWNER}/${REPO}`;
const PROJECT_TITLE = "Conservation Signal Graph";
const REMOTE = `https://github.com/${FULL_NAME}.git`;

const labels = [
  { name: "source-gate", color: "1d5f3e", description: "Live or near-live source viability" },
  { name: "design", color: "365d9a", description: "Product design and UI polish" },
  { name: "groq", color: "8d5a2d", description: "Groq extraction and telemetry" },
  { name: "neo4j", color: "4d5650", description: "Neo4j persistence and graph queries" },
  { name: "evidence", color: "a33c30", description: "Public proof, screenshots, and test evidence" },
  { name: "security", color: "b7791f", description: "Secret handling and credential hygiene" }
];

const issues = [
  {
    title: "Source viability: NPS Yosemite Falls webcam",
    labels: ["source-gate", "evidence"],
    status: "Done",
    body: [
      "## Goal",
      "Prove at least one permissioned live-source path is real.",
      "",
      "## Acceptance",
      "- `npm run source:probe` returns Yosemite Falls source metadata with `NPS_PARK_CODE=yose`.",
      "- `POST /api/events/ingest/nps` creates a `live_camera` event.",
      "- Evidence note records source, mode, and limitations.",
      "",
      "## Current result",
      "Passed locally on 2026-06-27. Extraction is still fixture mode until Groq is enabled."
    ].join("\n")
  },
  {
    title: "Run first real Groq vision extraction",
    labels: ["groq", "evidence"],
    status: "In Progress",
    body: [
      "## Goal",
      "Use the configured Groq key to extract a real structured observation from the Yosemite Falls NPS source.",
      "",
      "## Acceptance",
      "- `CSG_FORCE_FIXTURE=0` produces an observation with `validationStatus: valid`.",
      "- UI shows Groq model, prompt version, latency, and confidence.",
      "- Evidence note distinguishes live source, Groq extraction, and graph mode."
    ].join("\n")
  },
  {
    title: "Modern product design pass",
    labels: ["design"],
    status: "In Progress",
    body: [
      "## Goal",
      "Move the UI from developer-console scaffold to a modern field-ops intelligence product.",
      "",
      "## Acceptance",
      "- Desktop and mobile screenshots feel like a designed product surface.",
      "- Status, source proof, model mode, graph mode, and review queue are immediately legible.",
      "- Fieldwork browser checks pass across Chromium, WebKit, and Firefox."
    ].join("\n")
  },
  {
    title: "Persist observation graph in Neo4j",
    labels: ["neo4j"],
    status: "Todo",
    body: [
      "## Goal",
      "Move graph mode from memory fallback to actual Neo4j persistence.",
      "",
      "## Acceptance",
      "- Local Neo4j starts from `docker-compose.yml`.",
      "- `npm run graph:probe` reports `mode: neo4j`.",
      "- Species, risks, actions, and questions persist as queryable nodes and relationships."
    ].join("\n")
  },
  {
    title: "Expand Neo4j relationship writes",
    labels: ["neo4j"],
    status: "Todo",
    body: [
      "## Goal",
      "Persist the full graph, not only source/frame/place/observation basics.",
      "",
      "## Acceptance",
      "- Species candidate relationships are written to Neo4j.",
      "- Risk, action, and question relationships are written to Neo4j.",
      "- Evidence properties include confidence, model, prompt version, and timestamp."
    ].join("\n")
  },
  {
    title: "Create public evidence bundle",
    labels: ["evidence"],
    status: "Todo",
    body: [
      "## Goal",
      "Preserve the proof trail for the public project writeup.",
      "",
      "## Acceptance",
      "- Browser screenshots are attached or linked.",
      "- Test output is summarized.",
      "- Latency, cost, source policy, Groq mode, and graph mode are recorded."
    ].join("\n")
  },
  {
    title: "Source viability: second public camera candidate",
    labels: ["source-gate"],
    status: "Todo",
    body: [
      "## Goal",
      "Avoid overfitting the project to one NPS source.",
      "",
      "## Acceptance",
      "- A second source has terms reviewed.",
      "- Access path is official or permissioned.",
      "- Decision is recorded as approved, needs permission, or rejected."
    ].join("\n")
  },
  {
    title: "Credential hygiene after local GitHub bootstrap",
    labels: ["security"],
    status: "Todo",
    body: [
      "## Goal",
      "Rotate the GitHub token that appeared in local command output during setup.",
      "",
      "## Acceptance",
      "- Token is revoked or rotated in GitHub settings.",
      "- Local GitHub push/auth still works after rotation.",
      "- No credentials are present in repo files, screenshots, or issue text."
    ].join("\n")
  }
];

const token = getToken();

await ensureRepo();
await ensureRemoteAndPush();
await ensureLabels();
const createdIssues = await ensureIssues();
const project = await ensureProject();
await addIssuesToProject(project.id, createdIssues);

console.log(JSON.stringify({
  repository: `https://github.com/${FULL_NAME}`,
  project: project.url,
  issues: createdIssues.map((issue) => ({ number: issue.number, title: issue.title, url: issue.html_url }))
}, null, 2));

function getToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  const input = "protocol=https\nhost=github.com\n\n";
  const result = spawnSync("git", ["credential", "fill"], { input, encoding: "utf8" });
  if (result.status !== 0) throw new Error("Could not read GitHub credential from Git.");
  const passwordLine = result.stdout.split("\n").find((line) => line.startsWith("password="));
  const value = passwordLine?.slice("password=".length).trim();
  if (!value) throw new Error("Git credential helper did not return a GitHub token.");
  return value;
}

async function ensureRepo() {
  const existing = await github(`/repos/${FULL_NAME}`, { allow404: true });
  if (existing) return existing;
  return github("/user/repos", {
    method: "POST",
    body: {
      name: REPO,
      description: "Groq + Neo4j protected-area monitoring prototype with a live-source gate.",
      private: false,
      has_issues: true,
      has_projects: true,
      auto_init: false
    }
  });
}

async function ensureRemoteAndPush() {
  const remotes = execFileSync("git", ["remote"], { encoding: "utf8" }).split("\n").filter(Boolean);
  if (!remotes.includes("origin")) execFileSync("git", ["remote", "add", "origin", REMOTE], { stdio: "inherit" });
  else execFileSync("git", ["remote", "set-url", "origin", REMOTE], { stdio: "inherit" });
  execFileSync("git", ["push", "-u", "origin", "main"], { stdio: "inherit" });
}

async function ensureLabels() {
  for (const label of labels) {
    const existing = await github(`/repos/${FULL_NAME}/labels/${encodeURIComponent(label.name)}`, { allow404: true });
    if (existing) continue;
    await github(`/repos/${FULL_NAME}/labels`, { method: "POST", body: label });
  }
}

async function ensureIssues() {
  const existing = await github(`/repos/${FULL_NAME}/issues?state=all&per_page=100`);
  const byTitle = new Map(existing.filter((item) => !item.pull_request).map((issue) => [issue.title, issue]));
  const output = [];

  for (const issue of issues) {
    let current = byTitle.get(issue.title);
    if (!current) {
      current = await github(`/repos/${FULL_NAME}/issues`, {
        method: "POST",
        body: {
          title: issue.title,
          body: issue.body,
          labels: issue.labels
        }
      });
    }
    if (issue.status === "Done" && current.state !== "closed") {
      current = await github(`/repos/${FULL_NAME}/issues/${current.number}`, {
        method: "PATCH",
        body: { state: "closed" }
      });
    }
    output.push({ ...current, desiredStatus: issue.status });
  }

  return output;
}

async function ensureProject() {
  const viewer = await graphql("query { viewer { id login projectsV2(first: 20) { nodes { id title url } } } }");
  const existing = viewer.viewer.projectsV2.nodes.find((project) => project.title === PROJECT_TITLE);
  if (existing) return existing;
  const created = await graphql(
    "mutation($ownerId: ID!, $title: String!) { createProjectV2(input: {ownerId: $ownerId, title: $title}) { projectV2 { id title url } } }",
    { ownerId: viewer.viewer.id, title: PROJECT_TITLE }
  );
  return created.createProjectV2.projectV2;
}

async function addIssuesToProject(projectId, projectIssues) {
  const fields = await graphql(
    `query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 20) {
            nodes {
              ... on ProjectV2SingleSelectField { id name options { id name } }
            }
          }
        }
      }
    }`,
    { projectId }
  );
  const statusField = fields.node.fields.nodes.find((field) => field?.name === "Status");
  const statusOptions = new Map((statusField?.options ?? []).map((option) => [option.name, option.id]));

  for (const issue of projectIssues) {
    const added = await graphql(
      "mutation($projectId: ID!, $contentId: ID!) { addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) { item { id } } }",
      { projectId, contentId: issue.node_id }
    ).catch((error) => {
      if (String(error.message).includes("already exists")) return null;
      throw error;
    });

    const itemId = added?.addProjectV2ItemById?.item?.id;
    const optionId = statusOptions.get(issue.desiredStatus);
    if (itemId && statusField?.id && optionId) {
      await graphql(
        "mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) { updateProjectV2ItemFieldValue(input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $optionId}}) { projectV2Item { id } } }",
        { projectId, itemId, fieldId: statusField.id, optionId }
      );
    }
  }
}

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method: options.method ?? "GET",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(options.body ? { "content-type": "application/json" } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (options.allow404 && response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub REST ${path} failed with HTTP ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

async function graphql(query, variables = {}) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({ query, variables })
  });
  const payload = await response.json();
  if (!response.ok || payload.errors) {
    throw new Error(`GitHub GraphQL failed: ${JSON.stringify(payload.errors ?? payload)}`);
  }
  return payload.data;
}
