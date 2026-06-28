# Source Wall Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the RAH-16 clickable source-wall prototype for Ethogram Graph.

**Architecture:** Keep the current Express, React, and Vite app. Add a focused source-wall view model in the React client, derived from seeded dashboard state and PhenoCam probe results. Replace the current single-signal-first layout with a source wall, selected-source intelligence workbench, graph-growth summary, exception queue, source links, and secondary technical trace.

**Tech Stack:** TypeScript, React, lucide-react, Vitest, Playwright, existing Express API, existing PhenoCam probe route.

---

## File Structure

| File | Role |
| --- | --- |
| `src/client/source-wall.ts` | Source-wall types, seeded source tiles with real source links, mapping from PhenoCam probe results to tiles, and selected-source helpers. |
| `src/client/App.tsx` | Render the source wall, selected-source intelligence workbench, graph-growth summary, exception queue, source links, and secondary technical trace. |
| `src/client/styles.css` | Cinematic source-wall visual system, responsive layout, button states, and workbench styling. |
| `tests/source-wall.test.ts` | Unit tests for source-wall mapping and fixture demotion. |
| `tests/e2e/dashboard.spec.ts` | E2E tests for six source tiles, selection, freshness updates, fixture demotion, and trace hierarchy. |
| `docs/Evidence_2026-06-27.md` | Add the screenshot and test evidence after verification. |

## Task 1: Source-Wall View Model

**Files:**
- Create: `src/client/source-wall.ts`
- Test: `tests/source-wall.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/source-wall.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildInitialSourceTiles, mergeCadenceProbeIntoTiles } from "../src/client/source-wall";

describe("source wall model", () => {
  it("starts with six sources and keeps the fixture out of the hero position", () => {
    const tiles = buildInitialSourceTiles();
    expect(tiles).toHaveLength(6);
    expect(tiles[0].sourceId).toBe("phenocam:aguamarga");
    expect(tiles.every((tile) => tile.sourcePageUrl.startsWith("https://"))).toBe(true);
    expect(tiles.find((tile) => tile.sourceId === "benchmark:channel-islands-bird")?.inclusionState).toBe("benchmark");
  });

  it("updates PhenoCam freshness without changing research and benchmark tiles", () => {
    const tiles = buildInitialSourceTiles();
    const updated = mergeCadenceProbeIntoTiles(tiles, {
      results: [
        {
          ok: true,
          evidence: {
            sourceId: "phenocam:aguamarga",
            sourceName: "aguamarga",
            sourceType: "periodic_snapshot",
            status: "cadence_candidate",
            checkedAt: "2026-06-28T05:31:23.000Z",
            latestImageUrl: "https://phenocam.nau.edu/data/latest/aguamarga.jpg",
            sourcePageUrl: "https://phenocam.nau.edu/webcam/sites/aguamarga/",
            locationLabel: "Grassland, Balsa Blanca, Almeria, Spain",
            termsStatus: "permitted",
            licenseOrTermsRef: "PhenoCam fair-use policy; CC BY 4.0 with attribution.",
            freshnessObservation: {
              checkedAt: "2026-06-28T05:31:23.000Z",
              sourceReportedAt: "2026-06-28T05:25:02.000Z",
              ageMs: 381000,
              ageLabel: "6 min old",
              status: "fresh",
              basis: "last_modified",
              expectedCadenceSeconds: 2274,
              expectedFramesPerDay: 38,
              includeForInference: true,
              summary: "Fresh: checked 1:31 AM, source image 6 min old, expected ~38 RGB frames/day"
            },
            dailyCounts: [{ localDate: "2026-06-26", rgbCount: 38, infraredCount: 39 }],
            cadenceSummary: "aguamarga reported 38 RGB frames and 39 infrared frames on 2026-06-26.",
            recommendedAction: "Eligible for timed polling and changed-frame Groq extraction."
          }
        }
      ],
      summary: {
        totalSources: 1,
        cadenceCandidates: 1,
        inferenceEligible: 1,
        fresh: 1,
        recent: 0,
        staleFreshness: 0,
        unknownFreshness: 0,
        staleSnapshots: 0,
        failed: 0
      }
    });

    expect(updated.find((tile) => tile.sourceId === "phenocam:aguamarga")?.inclusionState).toBe("eligible");
    expect(updated.find((tile) => tile.sourceId === "phenocam:aguamarga")?.thumbnailUrl).toBe("https://phenocam.nau.edu/data/latest/aguamarga.jpg");
    expect(updated.find((tile) => tile.sourceId === "wildlife:big-bear-eagle")?.inclusionState).toBe("research");
  });
});
```

- [ ] **Step 2: Run the failing unit test**

Run: `npm run test -- tests/source-wall.test.ts`

Expected: FAIL because `src/client/source-wall.ts` does not exist.

- [ ] **Step 3: Implement the view model**

Create `src/client/source-wall.ts` with exported `SourceTile`, `CadenceProbeResult`, `buildInitialSourceTiles`, and `mergeCadenceProbeIntoTiles`.

- [ ] **Step 4: Run the unit test**

Run: `npm run test -- tests/source-wall.test.ts`

Expected: PASS.

## Task 2: Source-Wall E2E Contract

**Files:**
- Modify: `tests/e2e/dashboard.spec.ts`

- [ ] **Step 1: Replace the first dashboard E2E expectations**

Assert that:

- heading `Ethogram Graph` is visible
- region `Source wall` is visible
- at least six source cards are visible
- `Aguamarga PhenoCam`, `Big Bear Eagle Context`, and `Cornell Bird Cams` are visible
- default selected source is `Aguamarga PhenoCam`
- every source card has a source link
- technical trace appears after source wall and workbench

- [ ] **Step 2: Run the failing E2E test**

Run: `npm run test:e2e -- tests/e2e/dashboard.spec.ts`

Expected: FAIL because the current UI still opens on the single-signal console.

## Task 3: Build the Clickable Prototype

**Files:**
- Modify: `src/client/App.tsx`
- Modify: `src/client/styles.css`

- [ ] **Step 1: Implement source-wall state**

Use `buildInitialSourceTiles()` for initial tiles. Track `selectedSourceId`, `busyAction`, `status`, and `reviewDecision`.

- [ ] **Step 2: Render the source wall**

Render six source cards with real permitted imagery or honest source placeholders, source type, place, freshness, inclusion state, policy cue, and actual source link. Cards update selection on click.

- [ ] **Step 3: Render the selected-source workbench**

Render image, source facts, freshness, observer context, graph state, model read, graph-growth status, and exception state.

- [ ] **Step 4: Move technical trace into a secondary panel**

Keep model, prompt, latency, validation, graph mode, extraction mode, and source URL visible.

- [ ] **Step 5: Style the cinematic layout**

Use dark source-wall treatment, real-image tiles, tactile button states, responsive grid, and a clear mobile sequence.

- [ ] **Step 6: Run E2E**

Run: `npm run test:e2e -- tests/e2e/dashboard.spec.ts`

Expected: PASS.

## Task 4: Verification And Evidence

**Files:**
- Modify: `docs/Evidence_2026-06-27.md`
- Modify: `README.md`

- [ ] **Step 1: Run full checks**

Run: `npm run check`

Expected: secret scan, build, unit tests pass.

- [ ] **Step 2: Run browser checks**

Run: `npm run test:e2e`

Expected: Playwright passes.

- [ ] **Step 3: Capture screenshots**

Use the Fieldwork UI wrapper or Playwright evidence output for desktop and mobile screenshots.

- [ ] **Step 4: Record evidence**

Add evidence row with test output, screenshot paths, and source-wall limitations.

## Self-Review

Spec coverage: source wall, six sources, selected workbench, human decision, technical trace, fixture demotion, source freshness, and tests are covered.

Placeholder scan: no open placeholders remain.

Type consistency: `SourceTile`, `CadenceProbeResult`, and `SourceCadenceEvidence` names match existing project types.
