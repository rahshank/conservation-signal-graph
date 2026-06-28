# Agentic Practice Comparison

## Purpose
Compare Ethogram Graph against current agentic product-development practice as of June 2026.

The standard here is concrete: the project should have visible work tracking, safe credential handling, repeatable verification, source-policy evidence, and public claims that match what actually ran.

## Source Read

| Source | Useful pattern | Confidence |
| --- | --- | --- |
| [OpenClaw repository](https://github.com/openclaw/openclaw) | A real agentic product has a harness: workspace rules, skills, tools, sessions, sandboxing, security policy, QA folders, scripts, hooks, CI, docs, and user-visible status. | High |
| [OpenClaw README security model](https://github.com/openclaw/openclaw) | Remote and channel-connected agents require pairing, allowlists, sandbox defaults, and explicit exposure runbooks. | High |
| [Red-Teaming Agent Execution Contexts](https://arxiv.org/abs/2605.11047) | Final-answer quality is not enough; agent systems need execution-context security testing because files, tools, memory, and skills can be compromised while the visible task still succeeds. | High |
| [Security of OpenClaw Agents](https://arxiv.org/abs/2605.25435) | Persistent memory, external tools, multi-channel access, and high autonomy expand the attack surface. Skill poisoning, cognitive manipulation, cascading failures, and supply-chain risk must be treated as product risks. | High |
| [HERMES verification paper](https://arxiv.org/abs/2511.18760) | Exploratory reasoning should be interrupted by checked steps. The useful translation for software work is deterministic verification after each important claim. | High |
| [HERMES repository](https://github.com/aziksh-ospanov/HERMES) | The system exposes a reasoner as a tool, uses a verifier, supports timeouts/concurrency limits, and can store verified steps for later retrieval. | High |
| [GitHub Projects docs](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) | Planning belongs in the actual issue/project system, with views, metadata, automation, and links to issues/PRs. | High |
| [GitHub token guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) | Tokens are password-equivalent; prefer GitHub CLI/Git Credential Manager, fine-grained permissions where possible, expiration, and minimum required scopes. | High |
| [GitHub secret scanning docs](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning) | Secret prevention has to cover code, issues, pull requests, comments, wikis, gists, and command-line push paths. | High |
| Hermes Agent secondary reporting | Reported pattern is reusable task refinement and self-improving skills. Treat as a signal to investigate, not as a primary standard until official docs or code are found. | Medium-low |

## Modern Bar

| Area | Modern bar | Current project state | Required change |
| --- | --- | --- | --- |
| External work tracking | Repo, issues, project board, CI, and PR discipline exist in GitHub and Linear as appropriate, with Markdown as the durable local record. | Repo, issues, GitHub Project, and Linear project exist. | Keep implementation issues tied to spec sections and acceptance criteria. |
| Harness discipline | Agent work runs through explicit context, permissions, tools, logs, and verification. | Workspace rules and project docs exist. Enforcement is partial. | Add pre-commit/pre-push checks and keep evidence for every external-system action. |
| Credential handling | Secrets stay in `.env`, OS keychain, GitHub secrets, or provider stores. No helper output or token values appear in logs/docs/issues. | `.env` is ignored and a runbook exists. A local GitHub token exposure occurred during setup. | Rotate the affected GitHub credential, re-auth through GitHub CLI/Git Credential Manager, and use scoped device/browser auth for Projects. |
| Security testing | Agentic systems are tested for execution-context risk and successful final output. | Basic secret scanner added. No third-party scanner, no SECURITY.md, no context-poisoning checks. | Add Gitleaks or TruffleHog, SECURITY.md, and a small malicious-context regression test for docs/prompts/source metadata. |
| Source-policy claims | Public claims distinguish measured source data, stale source data, fixture replay, and blocked source attempts. | NPS image access is now treated as stale-source risk; PhenoCam is the leading cadence candidate. Explore.org is documented as restricted unless permission exists. | Build the source-cadence probe and make source mode visible in UI and evidence. |
| Groq claim | A Groq claim requires an actual Groq call with model, prompt version, latency, validation status, and saved output shape. | Real extraction has passed on image inputs. Speed claim still needs measured cadence. | Record Groq latency only after source cadence proves repeated work. |
| Neo4j claim | A graph claim requires Neo4j running, writes succeeding, and a query proving relationships. | Repository boundary exists; memory graph mode is active. | Start Neo4j locally, write observations, and capture query evidence. |
| Verification loop | Important claims are checked by deterministic tools, inspired by HERMES-style interleaving of reasoning and verification. | Unit tests and Playwright tests exist. Design pass needs visual evidence. | Run secret scan, build, unit tests, e2e tests, source probe, graph probe, and screenshot checks before public-case-study updates. |
| Memory and skill loop | Repeated work becomes a reusable runbook or skill. | Credential runbook and product standard exist. | Convert source probing, Groq extraction evidence, Neo4j proof, and GitHub bootstrap into stable routines. |
| Information barriers | Planning, implementation, and validation can be separated for higher-risk work. | Same agent is doing most work. | Use Superpowers review/verification practices and independent review where risk is high. |

## Comparison To OpenClaw

OpenClaw sets a high bar because it treats the agent as an operating system surface, not as chat wrapped around scripts. The repository exposes the real shape of the work: `.agents`, `.github`, `docs`, `git-hooks`, `qa`, `scripts`, `security`, `skills`, `test`, CI badges, a security policy, onboarding, daemon/gateway behavior, and explicit sandbox guidance.

Ethogram Graph now has the beginning of that shape: a repo, issues, CI, tests, source gate, project docs, a credential runbook, and an evidence file. It does not yet meet the OpenClaw bar because the GitHub Project is incomplete, security enforcement is thin, the Groq and Neo4j claims still need live proof, and the design pass has not been visually verified.

The practical lesson is enforcement. More process prose will not fix the gap. The project needs checks that fail when the work is incomplete.

## Comparison To HERMES

The HERMES paper is about mathematical reasoning, but the product-development lesson transfers cleanly: exploration is useful only when critical steps are verified before the chain continues. HERMES combines informal reasoning with checked Lean steps and uses memory to preserve continuity across long work.

For this project, the equivalent is:

| Claim | Required verifier |
| --- | --- |
| “Measured source works” | Source probe output, source-policy note, and UI source-mode label |
| “Groq is used” | Real API call, structured validation, model name, prompt version, latency, and extraction mode |
| “Neo4j is used” | Running Neo4j instance, graph write, graph read, and relationship query |
| “Design improved” | Desktop and mobile screenshots from the approved Fieldwork UI lane |
| “Credential handling is safe” | Rotation completed, secret scan passes, and no token values in tracked files/issues |
| “Project is run professionally” | GitHub Project, linked issues, PR template, CI, test evidence, and public limitations |

## Immediate Remediation Backlog

| Priority | Item | Acceptance evidence |
| --- | --- | --- |
| P0 | Rotate the exposed GitHub command-line credential. | Credential revoked/replaced; new auth path uses GitHub CLI or Git Credential Manager. |
| P0 | Complete GitHub Project setup with `project` scope. | Project URL exists; issues #1-#8 are added with status fields. |
| P0 | Run the local verification chain after the current changes. | `npm run secret:scan`, `npm run build`, `npm run test`, and e2e/Fieldwork UI checks pass or have documented failures. |
| P1 | Add SECURITY.md and third-party secret scanning. | SECURITY.md exists; Gitleaks or TruffleHog runs locally and in CI. |
| P1 | Run real Groq extraction. | Evidence note includes model, prompt version, latency, extraction mode, validation status, and structured observation summary. |
| P1 | Start Neo4j and prove graph persistence. | Evidence note includes successful write/read query and relationship counts. |
| P1 | Add source/context poisoning regression. | Test fixture proves untrusted source metadata cannot override extraction or credential rules. |
| P2 | Convert repeated routines into project runbooks. | Stable commands exist for source proof, Groq proof, Neo4j proof, evidence capture, and GitHub bootstrap. |

## Current Verdict

The project is past a throwaway demo, but it is not yet at the “best-in-class agentic product effort” standard. The credible path is visible:

1. Finish the real GitHub Project.
2. Rotate and harden credentials.
3. Prove Groq and Neo4j with saved evidence.
4. Add security enforcement with a third-party scanner and prompt/source-metadata regression checks.
5. Ship only the claims the evidence supports.

## Change log
- 2026-06-28: Updated the project name to Ethogram Graph.
- 2026-06-27: Rewrote the comparison as an audit against OpenClaw, HERMES, GitHub Projects, token guidance, secret scanning, and current agentic-security research.
- 2026-06-27: Created first comparison against OpenClaw, Hermes-style verification patterns, and agentic product-development practice.
