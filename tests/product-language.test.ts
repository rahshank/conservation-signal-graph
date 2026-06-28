import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const checkedFiles = [
  "src/client/App.tsx",
  "src/client/source-wall.ts",
  "src/server/fixtures.ts",
  "docs/Evidence_2026-06-27.md",
  "docs/superpowers/specs/2026-06-28-source-wall-redesign.md",
  "tests/e2e/dashboard.spec.ts"
];

const bannedPhrases = [
  ["Humans", "review", "exceptions,", "not", "every", "graph", "edge."].join(" "),
  ["not every", "graph edge"].join(" "),
  ["manual edge", "approval"].join(" "),
  ["Ready", "for", "freshness", "probe"].join(" "),
  ["freshness", "probe", "ready"].join(" "),
  ["Find", "updating", "sources"].join(" ")
];

describe("product language guard", () => {
  it("blocks manual moderation language from the product surface and specs", () => {
    const corpus = checkedFiles
      .map((file) => `${file}\n${readFileSync(file, "utf8")}`)
      .join("\n\n");

    for (const phrase of bannedPhrases) {
      expect(corpus).not.toContain(phrase);
    }
  });
});
