# Project Standards Reference

The single source of truth for git, commit, and PR conventions used by `/open-pr`.

## Branch Naming

- Format: `<JIRA-TICKET-ID>` (e.g., `GPV-5286`)
- Base branch: `develop`
- No forks — branch directly in the project repo

## Commit Message — Conventional Commits

Pattern: `<type>(<scope>): <description>`

### Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Maintenance tasks

### Scopes (based on where most changes live)

- `webserver` — `apps/webserver/`
- `shared` — `libs/shared/`
- `sql` — `libs/sql/`
- `microservices-list-processing` — `apps/microservices/list-processing/`
- `microservices-list-downloader` — `apps/microservices/list-downloader/`
- `microservices-externalapi` — `apps/microservices/externalapi/`
- `constants` — `libs/constants/`
- `aws` — `libs/aws/`
- `geo` — `libs/geo/`
- `gfwpro-e2e` — `apps/gfwpro-e2e/`
- `externalapi-e2e` — `apps/microservices/externalapi-e2e/`

For changes that span multiple areas or affect general tooling/config/docs, use `shared`.

### Examples

```
feat(webserver): add new account limits endpoint
fix(shared): correct calculation in remaining area usage
refactor(sql): optimize query performance for large datasets
chore(shared): add copilot instructions and documentation
```

## PR Title

```
<JIRA-TICKET-ID>: <type>(<scope>): <description>
```

Example: `GPV-5286: fix(sql): change setGlobalAnalysisLimit to INSERT instead of UPDATE`

## PR Body Template

```markdown
## Summary

<bullet points describing changes>

## Testing

<how the changes were tested>

## Related

- Jira: <JIRA-TICKET-ID>
```

## Workflow Rules

- **Single commit per PR** — squash before pushing
- **Rebase, don't merge** — `git fetch origin develop && git rebase origin/develop`
- **Format + lint must pass** before push:
  - `npx nx format:write --files="<changed-files>"`
  - `npx nx affected --target=lint`
- **Force-push** uses `--force-with-lease` only
- **Jira linking** is mandatory — every PR must reference a valid ticket
