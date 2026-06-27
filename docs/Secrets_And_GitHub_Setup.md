# Secrets And GitHub Setup

## Secret handling
Do not paste API keys into chat, tickets, commits, screenshots, or public notes.

Local keys belong in `.env`, which is ignored by Git:

```sh
NPS_API_KEY=your-key-here
GROQ_API_KEY=your-key-here
```

Committed files should only contain blank examples, such as `.env.example`.

The project scripts load `.env` when it exists:

```sh
npm run source:probe
npm run dev
```

## GitHub repo
The project is prepared for a real GitHub repository:

- CI workflow in `.github/workflows/ci.yml`
- PR template in `.github/pull_request_template.md`
- issue templates in `.github/ISSUE_TEMPLATE/`
- backlog seed in `docs/GitHub_Project_Backlog.md`
- evidence note in `docs/Evidence_2026-06-27.md`

## GitHub Project setup
Create a GitHub Project with these columns:

- Source gate
- Spec
- Build
- Verify
- Evidence

Seed the issues from `docs/GitHub_Project_Backlog.md`.

## Current environment note
The GitHub CLI is not installed in this Codex environment, and no GitHub plugin tool is currently callable. The local repository can still be prepared and committed here. Remote repo creation and project-board setup need either the GitHub plugin, GitHub CLI, or a token-backed API path.

## Change log
- 2026-06-27: Added secret handling and GitHub setup notes.
