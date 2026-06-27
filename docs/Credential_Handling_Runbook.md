# Credential Handling Runbook

## Purpose
Prevent credential leaks during AI-assisted product work.

## What Happened
During GitHub setup, a direct credential-helper command printed a GitHub token into local terminal output. The token was not committed to the repo and should not be copied into docs or issues. The affected credential is the GitHub credential stored in macOS Keychain for `github.com` under the `rahshank` account. It had access scopes sufficient to create and push the repo, create issues, labels, and workflows, but not GitHub Projects.

Rotate that GitHub credential.

## Immediate Rotation Guidance
In GitHub:

1. Go to Developer settings.
2. Review personal access tokens and OAuth app authorizations.
3. Revoke or rotate the current GitHub credential used by command-line Git for `rahshank`.
4. Re-authenticate through GitHub CLI or Git Credential Manager.
5. For GitHub Projects automation, grant the `project` scope through `gh auth refresh --scopes project` or an equivalent short-lived credential flow.

## Future Rules

### Do

- Use `.env` for local provider keys.
- Keep `.env` ignored.
- Use `.env.example` with blank values.
- Use GitHub CLI device/browser auth for GitHub scopes.
- Use GitHub secrets for CI secrets.
- Use short-lived or fine-grained credentials when supported.
- Run `npm run secret:scan` before pushing.
- Report only credential status, provider, and scope class, never credential values.

### Do Not

- Do not paste keys into chat.
- Do not print credential-helper output.
- Do not put secrets in GitHub issues, PRs, comments, screenshots, or evidence notes.
- Do not use broad credentials when a narrower route exists.
- Do not proceed after a secret exposure as if rotation is optional.

## Safe Local Commands

Check whether `.env` is ignored:

```sh
git check-ignore -v .env .env.local
```

Run local secret scan:

```sh
npm run secret:scan
```

Refresh GitHub CLI scopes:

```sh
gh auth refresh --scopes project
```

## Token Choice
GitHub recommends fine-grained personal access tokens where possible because they can be limited to a single owner, selected repositories, and specific permissions. Some user-owned Project APIs still require classic-token or OAuth-style scopes. For this project, prefer GitHub CLI OAuth with the minimum additional `project` scope over manually handling a classic token.

## Source Links

- GitHub personal access token guidance: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- GitHub secret scanning remediation: https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning
- GitHub CLI auth refresh: https://cli.github.com/manual/gh_auth_refresh

## Change log
- 2026-06-27: Created the credential-handling runbook after the local terminal token exposure.
