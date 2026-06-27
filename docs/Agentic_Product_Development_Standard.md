# Agentic Product Development Standard

## Purpose
Define how this project is run when an AI agent is doing real product work.

The standard is simple: product-process claims must correspond to working systems. A GitHub Project means an actual GitHub Project. A CI claim means a workflow that runs. A live-source claim means a verified source. A Groq claim means a real Groq call. A Neo4j claim means Neo4j is running and queried.

## Current Read: June 2026
Agentic development has moved beyond code completion. The current pattern is delegated work across requirements, architecture, implementation, testing, review, operations, and maintenance. That raises the bar: the agent needs a harness around context, permissions, logs, tests, and human approval, not only the ability to write code.

For this project, the harness is:

- GitHub repository
- GitHub issues
- GitHub Project
- spec and ADR docs
- CI
- local and CI verification
- source-policy notes
- credential-handling runbook
- evidence bundle
- human approval for credentials, public publishing, and external side effects

## Operating Rules

### 1. Truth Over Appearance
Do not describe a capability as complete until it has run in the target system.

Examples:

- `fixture` extraction is not Groq extraction.
- `memory` graph mode is not Neo4j.
- local backlog Markdown is not a GitHub Project.
- a generated screenshot is evidence only for the specific build and viewport checked.

### 2. Real Systems Before Simulated Process
Use local files for planning, but promote them into the actual product system quickly.

For this project:

- issues live in GitHub
- project status lives in GitHub Projects
- source decisions live in docs and linked issues
- evidence lives in `docs/` and saved screenshots
- code changes move through commits and CI

### 3. Tool Failure Is Route Failure
If a plugin cannot do something, try the terminal, official CLI, API, browser automation, or a documented auth handoff.

Stop only when the remaining block is a real account, permission, credential, billing, or external-state requirement.

### 4. Least Privilege By Default
Use the narrowest practical credential path:

- prefer GitHub CLI or Git Credential Manager over manually created long-lived tokens
- prefer fine-grained tokens where they support the task
- use classic tokens only when a GitHub feature still requires them
- use short expirations
- store secrets in `.env`, OS keychain, GitHub secrets, or the provider's secret store
- never print secrets to terminal output, logs, issue text, screenshots, or docs

### 5. Every External Action Needs An Audit Trail
External changes should leave a trace:

- repo URL
- issue number
- project URL
- commit SHA
- test output
- source and credential decision

### 6. Verification Is Part Of The Work
Each meaningful change needs the smallest credible verification set:

- unit test for schema, extraction, graph, and source-adapter logic
- integration probe for live source, Groq, or Neo4j when touched
- Playwright for UI behavior
- Fieldwork browser checks for visual surfaces
- evidence update when public claims change

### 7. Design Is A Product Requirement
The UI should look like a serious tool for the audience. A wiring pass is not a product-design pass.

For this project, the UI must make these facts visible without explanation:

- source mode
- extraction mode
- graph mode
- confidence
- latency
- review queue
- source limitations

## Current Project Status

| System | Status |
| --- | --- |
| GitHub repository | Created and pushed |
| GitHub issues | Created |
| GitHub Project | Created at https://github.com/users/rahshank/projects/1; private by GitHub default |
| NPS live source | Passed for Yosemite Falls |
| Groq extraction | Key added locally; real extraction still needs verification |
| Neo4j | Not yet running |
| Design pass | In progress |

Detailed comparison: [Agentic Practice Comparison](Agentic_Practice_Comparison.md)

## Source Links

- AI-driven software development and controlled agentic processes: https://arxiv.org/abs/2606.15283
- Codex usage evidence and agentic work shift: https://arxiv.org/abs/2606.26959
- Coding-agent adoption on GitHub: https://arxiv.org/abs/2601.18341
- Agentic PR testing study: https://arxiv.org/abs/2601.03556
- GitHub personal access token guidance: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- GitHub CLI auth refresh scopes: https://cli.github.com/manual/gh_auth_refresh
- GitHub secret scanning: https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning

## Change log
- 2026-06-27: Updated current status after creating the GitHub Project through the browser UI.
- 2026-06-27: Created first project operating standard after the GitHub/process gap and credential-handling incident.
