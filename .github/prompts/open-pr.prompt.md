# Open PR

Orchestrates pull request creation using specialized sub-agents (skills) for maximum parallel processing and comprehensive validation. Enforces this project's git, commit, and PR standards (Conventional Commits + Jira + Nx, base branch `develop`).

## Execution Policy

**Run non-destructive `git` commands and `gh` CLI commands directly without asking for user confirmation.** This includes commands such as `git fetch`, `git push`, `gh pr create`, `gh pr comment`, and other non-destructive git or GitHub CLI operations required by the workflow. **Before running any destructive or history-rewriting command, require explicit user confirmation.** This includes `git rebase`, `git push --force-with-lease`, and any equivalent operation that rewrites local or remote history.

## How to Use

Reference this prompt in Copilot Chat: "Open a PR for GPV-5286 #open-pr".

## Features

- Parallel execution of git validation, Jira validation, and code review
- Enforces Conventional Commits, single-commit policy, and rebase against `develop`
- Automated quality gates (`nx format:write`, `nx affected --target=lint`)
- Jira-linked PR title/body generation
- Delta-aware code review (compares against prior `CODE_REVIEW_REPORT.md` when present)

## Project Standards Enforced

- **Branch**: `<JIRA-TICKET-ID>` (e.g., `GPV-5286`), base `develop`
- **Commit**: Conventional Commits — `<type>(<scope>): <description>` (single commit per PR)
- **PR title**: `<JIRA-TICKET-ID>: <type>(<scope>): <description>`
- **PR body**: `## Summary`, `## Testing`, `## Related` (Jira)
- **Quality gates**: format + lint must pass before push

See [skills/standards/SKILL.md](../skills/standards/SKILL.md) for the full standards reference (types, scopes, examples).

## Usage

- `/open-pr` — Full guided workflow
- `/open-pr -jira=GPV-1234` — Specify Jira ticket directly (skip branch extraction)
- `/open-pr --skipCodeReview` — Skip code review (docs/trivial changes only)
- `/open-pr --skipBranchValidation` — Skip git validation (branch already pushed and synced)
- `/open-pr -jira=GPV-1234 --skipCodeReview --skipBranchValidation` — Maximum speed

## Options

| Option                   | Effect                                                          |
| ------------------------ | --------------------------------------------------------------- |
| `-jira=<JIRAID>`         | Use the provided Jira ID instead of extracting from branch name |
| `--skipCodeReview`       | Skip the `code-reviewer` agent                                  |
| `--skipBranchValidation` | Skip the `git-branch-validator` agent                           |

## Execution Flow

### Phase 1 — Initialize PR Manifest

See [skills/pr-manifest/SKILL.md](../skills/pr-manifest/SKILL.md).

1. Reset `PR-MANIFEST.md` at the repo root (delete if present, recreate with metadata header).
2. Ensure `.gitignore` contains `PR-MANIFEST.md`.
3. Establish the section-marker contract (`## Branch Validation`, `## Jira Validation`, `## Code Review`).

### Phase 2 — Conditional Validation & Review (Parallel)

Parse options, then launch the required agents **in a single message** with multiple sub-agent calls so they run in parallel:

- [skills/git-branch-validator/SKILL.md](../skills/git-branch-validator/SKILL.md) — unless `--skipBranchValidation`
- [skills/jira-validator/SKILL.md](../skills/jira-validator/SKILL.md) — always runs (uses `-jira=` if provided, else extracts from branch)
- [skills/code-reviewer/SKILL.md](../skills/code-reviewer/SKILL.md) — unless `--skipCodeReview`. Must receive `REVIEW_DEPTH="thorough"` and `INVOCATION_CONTEXT="PR_CREATION"`.

Each agent appends its result to `PR-MANIFEST.md` under its fixed `##` header. Block on any non-skipped agent reporting failures before proceeding.

### Phase 3 — PR Creation

See [skills/pr-creator/SKILL.md](../skills/pr-creator/SKILL.md).

Builds the title/body from validated Jira data and the squashed commit, then runs `gh pr create --base develop`. Does **not** post the review comment.

### Phase 4 — Post Code Review Comment

1. Extract everything under `## Code Review` from `PR-MANIFEST.md` to end of file.
2. If present, post it as a PR comment:
   ```bash
   gh pr comment <PR_NUMBER_OR_URL> --body-file <(awk '/^## Code Review/{flag=1} flag' PR-MANIFEST.md)
   ```
3. Return the final PR URL plus a confirmation (or note that review was skipped).

> Phase 4 is the **sole owner** of posting the review comment. `pr-creator` must never post it.

## Performance Benefits

- **Maximum parallelization** — independent agents run simultaneously
- **~60–70% faster** than sequential processing (up to ~90% with skip options)
- **Consolidated feedback** — everything lands in one `PR-MANIFEST.md`
- **Delta re-runs** — only affected agents re-execute after fixes; code review produces a delta report when a prior `CODE_REVIEW_REPORT.md` exists

## Implementation Notes

- `PR-MANIFEST.md` is reset in Phase 1, appended in Phase 2, read in Phase 4 — never accumulated across runs, never committed.
- Section markers are exact: `## Branch Validation`, `## Jira Validation`, `## Code Review`.
- Jira ticket ID is mandatory; the workflow blocks without a valid ticket.
- Validation and review failures must be resolved before Phase 3 (unless explicitly skipped).
- `gh auth status` is verified before PR creation.
- **CRITICAL**: All Phase 2 agents must be launched in a single message for true parallelism.
- `code-reviewer` MUST be invoked with `REVIEW_DEPTH="thorough"` and `INVOCATION_CONTEXT="PR_CREATION"` — the context is what triggers delta-mode detection.

## Amending After Review

```bash
# Apply fixes, then:
npx nx format:write --files="<comma-separated-file-paths>"
git add -A
git commit --amend --no-edit
git push --force-with-lease

# Re-run /open-pr — code-reviewer will produce a delta report
# against any existing CODE_REVIEW_REPORT.md.
```
