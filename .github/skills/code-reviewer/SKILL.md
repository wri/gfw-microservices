---
name: code-reviewer
description: Performs a thorough review of the local branch's diff against develop — checks Conventional Commits compliance, project conventions, test coverage, security (OWASP Top 10), performance, and readability — and appends findings to PR-MANIFEST.md. Supports delta mode (re-evaluates a prior CODE_REVIEW_REPORT.md) and standard full review.
---

# Skill: code-reviewer

Conducts a thorough code review of the local branch and appends the report to `PR-MANIFEST.md`. Skipped when `/open-pr` is invoked with `--skipCodeReview`.

## Invocation Requirements

This skill **must** be invoked with:

- `REVIEW_DEPTH="thorough"`
- `INVOCATION_CONTEXT="PR_CREATION"`

The invocation context is what triggers delta-mode detection.

## Inputs

- Jira ticket ID and summary (from `jira-validator`)
- Current branch + diff against `origin/develop`
- Optional pre-existing `CODE_REVIEW_REPORT.md` at repo root

## Mode Selection

- **Delta mode** — `CODE_REVIEW_REPORT.md` exists at repo root. Re-evaluate each prior finding and classify as:
  - `Fixed` — issue resolved
  - `Partially addressed` — improved but not complete
  - `Accepted as-is` — developer chose not to fix (must include justification reference)
  - `Superseded` — replaced by different changes
    Then report any **new** findings introduced by recent commits.
- **Standard mode** — no prior report. Produce a full review.

## Review Checklist

- **Conventional Commits compliance** — title/commit follow `<type>(<scope>): <description>`; scope matches changed paths
- **Project conventions** — adherence to existing patterns in the touched area
- **Test coverage** — affected projects have adequate test changes
- **Security** — OWASP Top 10 considerations (input validation, authn/authz, injection, secrets, etc.)
- **Performance** — obvious regressions, N+1 queries, etc.
- **Readability & maintainability** — naming, complexity, dead code
- **Lint/format hygiene** — no disabled rules without justification

## Output Rules

- **Append** the report to `PR-MANIFEST.md` under `## Code Review`
- **NEVER** modify `CODE_REVIEW_REPORT.md`
- The `## Code Review` header must appear exactly once in `PR-MANIFEST.md`

## Output Template

```markdown
## Code Review

- **Mode**: Delta | Standard
- **Jira**: <JIRA-TICKET-ID>
- **Branch**: <branch-name>
- **Base**: origin/develop @ <SHA>
- **Verdict**: APPROVE | REQUEST_CHANGES | COMMENT

### Delta Summary (delta mode only)

| Prior Finding | Status                                                    | Notes |
| ------------- | --------------------------------------------------------- | ----- |
| ...           | Fixed / Partially addressed / Accepted as-is / Superseded | ...   |

### Findings

#### 🔴 Blocking

- ...

#### 🟡 Recommended

- ...

#### 🟢 Nits

- ...

### Test Coverage

- ...

### Security

- ...
```

## Example Task Prompt

```
Conduct a comprehensive code review of the current local branch for Jira story <JIRA_STORY>.
Use REVIEW_DEPTH="thorough" and INVOCATION_CONTEXT="PR_CREATION".
If CODE_REVIEW_REPORT.md exists at the repo root, produce a delta report; otherwise a standard full review.
Append the report to PR-MANIFEST.md under "## Code Review". Do not modify CODE_REVIEW_REPORT.md.
```
