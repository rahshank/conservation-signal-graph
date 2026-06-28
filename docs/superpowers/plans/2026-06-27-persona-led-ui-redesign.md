# Persona-led UI Redesign Plan

## Purpose
Track the implementation work that moved the product surface from a pipeline dashboard to a protected-area signal review console.

**Goal:** Redesign the dashboard into a protected-area signal review console.

**Architecture:** Keep the existing React app and API state. Split the single dashboard view into named review-surface components so hierarchy is encoded in code: signal frame, observation review, review decision, context graph, evidence trace, and signal queue. CSS should support a dense, modern operations surface with a clear review order on desktop and mobile.

**Tech Stack:** React, TypeScript, CSS, lucide-react, Playwright, Fieldwork UI wrapper.

---

### Task 1: Test The Review-console Hierarchy

**Files:**
- Modify: `tests/e2e/dashboard.spec.ts`

- [x] **Step 1: Write the failing Playwright assertions**

Update the main dashboard test to expect these visible labels in order:

```ts
await expect(page.getByRole("heading", { name: "Signal Under Review" })).toBeVisible();
await expect(page.getByRole("heading", { name: "AI Observation" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Review Decision" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Context Graph" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Evidence Trace" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Signal Queue" })).toBeVisible();
```

Also assert that the review decision controls exist:

```ts
await expect(page.getByRole("button", { name: "Accept observation" })).toBeVisible();
await expect(page.getByRole("button", { name: "Send to review" })).toBeVisible();
await expect(page.getByRole("button", { name: "Dismiss low confidence" })).toBeVisible();
await expect(page.getByRole("button", { name: "Watch source" })).toBeVisible();
```

- [x] **Step 2: Run test to verify it fails**

Run:

```sh
npm run test:e2e
```

Expected: Playwright fails because the current UI still uses `Signal Feed`, `Run Details`, and equal-weight panels.

### Task 2: Refactor Dashboard Into Review Sections

**Files:**
- Modify: `src/client/App.tsx`

- [x] **Step 1: Create section components**

Split the render into these component functions inside `App.tsx`:

```ts
function SignalUnderReview(...)
function AIObservation(...)
function ReviewDecision(...)
function ContextGraph(...)
function EvidenceTrace(...)
function SignalQueue(...)
```

Each component receives only the state it needs.

- [x] **Step 2: Reorder the desktop surface**

Use this hierarchy:

1. command/status bar
2. signal under review
3. AI observation
4. review decision
5. context graph
6. evidence trace
7. signal queue

- [x] **Step 3: Keep proof modes visible**

The first viewport must show:

```txt
source mode
extraction mode
graph mode
validation
confidence
```

- [x] **Step 4: Run test to verify it passes**

Run:

```sh
npm run test:e2e
```

Expected: Playwright passes with the new section labels and review controls.

### Task 3: Redesign Visual System

**Files:**
- Modify: `src/client/styles.css`

- [x] **Step 1: Replace equal-weight card grid**

Move from generic metric/card layout to an operations console:

- large signal review region
- compact right-side evidence/context area on desktop
- queue and graph below the review decision
- single-column review order on mobile

- [x] **Step 2: Update visual language**

Use:

- quiet off-white/green-gray base
- strong dark text
- restrained source/status colors
- compact labels
- clear table/list rows
- field/source terminology

Avoid:

- decorative gradients
- generic hero styling
- oversized metric cards
- repeated icons that do not clarify action
- graph nodes that dominate the review decision

- [x] **Step 3: Run browser matrix**

Run:

```sh
.tools/bin/fieldwork-web check conservation-signal-graph
```

Expected: six browser/viewport checks pass.

### Task 4: Evidence And Review

**Files:**
- Modify: `docs/Evidence_2026-06-27.md`
- Modify: `docs/context/Personas.md`

- [x] **Step 1: Record UI evidence**

Add:

- screenshot paths
- Playwright result
- browser matrix result
- short note that the screen now follows the protected-area monitor review hierarchy

- [x] **Step 2: Run full verification**

Run:

```sh
npm run check
npm run test:e2e
.tools/bin/fieldwork-web check conservation-signal-graph
```

Expected: all checks pass.

- [x] **Step 3: Request code/design review**

Ask for review against:

- persona-led hierarchy
- visual genericness
- mobile order
- evidence trace clarity
- proof-mode visibility

- [x] **Step 4: Commit and push**

Run:

```sh
git add src/client/App.tsx src/client/styles.css tests/e2e/dashboard.spec.ts docs/Evidence_2026-06-27.md docs/context/Personas.md docs/context/Product_Reference_Research.md docs/superpowers/specs/2026-06-27-persona-led-ui-design.md docs/superpowers/plans/2026-06-27-persona-led-ui-redesign.md README.md docs/Product_Brief.md docs/context/README.md
git commit -m "Define persona-led signal review UI"
git push -u origin rah-13-persona-led-ui-story
```

Expected: branch is pushed for review.

## Self-review

- Spec coverage: covers references, personas, hierarchy, implementation, screenshots, mobile, and evidence.
- Placeholder scan: no placeholders.
- Type consistency: uses current app state and existing test tooling.

## Review Fixes

- Visual order now follows signal, observation, decision, graph, evidence, queue on desktop and mobile.
- Playwright asserts visual reading order, not only heading visibility.
- Review decision state resets when a new signal is ingested.
- Screenshot evidence is copied into a repo-local path under `docs/evidence/screenshots/`.
- The plan no longer opens with internal agent instructions.
