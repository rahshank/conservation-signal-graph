# Secrets And GitHub Setup

## Secret handling
Do not paste API keys into chat, tickets, commits, screenshots, or public notes.

Local keys belong in `.env`, which is ignored by Git:

```sh
# Put the real values after the equals signs in .env.
NPS_API_KEY=
GROQ_API_KEY=
```

Committed files should only contain blank examples, such as `.env.example`.

The project scripts load `.env` when it exists:

```sh
npm run source:probe
npm run dev
```

## GitHub repo
The project has a real GitHub repository:

- CI workflow in `.github/workflows/ci.yml`
- PR template in `.github/pull_request_template.md`
- issue templates in `.github/ISSUE_TEMPLATE/`
- backlog seed in `docs/GitHub_Project_Backlog.md`
- evidence note in `docs/Evidence_2026-06-27.md`

Repository: https://github.com/rahshank/conservation-signal-graph

## GitHub Project setup
Create or connect a GitHub Project with these status values:

- Source gate
- Spec
- Build
- Verify
- Evidence

The first issue set has been created in GitHub. Project attachment is blocked on the `project` OAuth scope.

## Current environment note
The repo and issues were created through the terminal/API route. GitHub Project creation needs a token or GitHub CLI auth flow with the `project` scope.

## Change log
- 2026-06-27: Updated after creating the actual GitHub repository and issues.
- 2026-06-27: Added secret handling and GitHub setup notes.
