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
The GitHub Project exists and has issues #1-#8 attached:

Project: https://github.com/users/rahshank/projects/1

Current statuses:

- Done: #1, #8
- In Progress: #2, #3
- Todo: #4, #5, #6, #7

## Current environment note
The repo and issues were created through the terminal/API route. GitHub CLI browser authorization succeeded for the `project` scope, but local token persistence failed at the macOS keyring handoff. The Project was created through the signed-in GitHub browser UI instead. Do not solve this by pasting a broad token into chat or shell output.

## Change log
- 2026-06-27: Updated after creating the actual GitHub Project through the browser UI.
- 2026-06-27: Updated after creating the actual GitHub repository and issues.
- 2026-06-27: Added secret handling and GitHub setup notes.
