import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const allowlist = new Set([
  ".env.example",
  "docs/Credential_Handling_Runbook.md"
]);

const patterns = [
  { name: "GitHub token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { name: "OpenAI or Groq style key", regex: /\b(?:sk|gsk)_[A-Za-z0-9_-]{20,}\b/g },
  { name: "NPS API key assignment", regex: /^NPS_API_KEY=.+/gm },
  { name: "Groq API key assignment", regex: /^GROQ_API_KEY=.+/gm },
  { name: "Generic secret assignment", regex: /\b(?:token|secret|password|api[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9_./+=-]{24,}/gi }
];

const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => !allowlist.has(file));

const findings = [];

for (const file of tracked) {
  const content = readFileSync(file, "utf8");
  for (const pattern of patterns) {
    const matches = (content.match(pattern.regex) ?? []).filter((match) => {
      if (pattern.name === "Generic secret assignment" && /^\s*password\s*=/i.test(match)) return false;
      return true;
    });
    if (matches.length > 0) findings.push({ file, pattern: pattern.name, count: matches.length });
  }
}

if (findings.length > 0) {
  console.error("Potential secrets found in tracked files:");
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.pattern} (${finding.count})`);
  }
  process.exit(1);
}

console.log(`Secret scan passed for ${tracked.length} tracked files.`);
