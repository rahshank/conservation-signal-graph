# Security Policy

## Scope

This prototype connects live public-source metadata, Groq API calls, local environment secrets, and a graph database. Treat it as a real software project even while the product claim remains “prototype / capability test.”

## Credential Rules

- Store local provider keys in `.env`.
- Keep `.env` ignored by Git.
- Commit only blank examples in `.env.example`.
- Do not paste credentials into chat, issues, pull requests, comments, screenshots, or evidence notes.
- Use GitHub CLI, Git Credential Manager, OS keychain, provider secret stores, or GitHub Actions secrets for stored credentials.
- Prefer fine-grained, short-lived credentials when the API supports the work.
- Use OAuth/device-browser auth for GitHub Project setup rather than manually handling a broad token.

## Required Local Checks

Run these before pushing a change:

```sh
npm run secret:scan
npm run build
npm run test
```

For UI or behavior changes, also run:

```sh
npm run test:e2e
```

For source, Groq, or Neo4j claims, add the relevant evidence to `docs/Evidence_2026-06-27.md`.

## Secret Exposure Response

If a credential appears in terminal output, chat, issue text, logs, screenshots, docs, or commit history:

1. Stop using that credential.
2. Revoke or rotate it in the provider account.
3. Re-authenticate through a safer path.
4. Run the local secret scan.
5. Document the incident without repeating the secret value.

Current rotation guidance lives in `docs/Credential_Handling_Runbook.md`.

## Agentic Context Risk

Inputs from camera sources, metadata feeds, datasets, documents, and issue text are untrusted. They must not be allowed to override system instructions, credential rules, source policy, or graph-write validation.

The project should add regression tests for context-poisoning cases before any public demo that accepts arbitrary live-source metadata or external text.

## Reporting

This is a personal research prototype. For now, report issues by opening a GitHub issue without including secrets or private credentials.

## Change log
- 2026-06-27: Added initial security policy after the agentic-practice audit and credential-handling incident.
