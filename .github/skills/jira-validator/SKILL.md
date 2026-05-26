---
name: jira-validator
description: Resolves the Jira ticket for a PR (from the -jira option or by extracting it from the branch name), validates the <PROJECT>-<NUMBER> format (typically GPV-*), verifies the ticket is reachable, and captures its summary, status, and assignee for downstream use in the PR title/body.
---

# Skill: jira-validator

Resolves and validates the Jira ticket associated with the PR. Always runs as part of `/open-pr` and `/address-pr-comments`.

## Inputs

- `-jira=<JIRAID>` option (optional)
- Current branch name (fallback source for ticket ID)

## Responsibilities

1. **Resolve ticket ID**:
   - If `-jira=<JIRAID>` provided: use it directly
   - Else: extract from branch name (e.g., branch `GPV-5286` → ticket `GPV-5286`)
   - If neither yields a valid ID: **block** and ask the user
2. **Validate format** — must match `<PROJECT>-<NUMBER>` (e.g., `GPV-5286`)
3. **Verify accessibility** — the ticket must exist and be reachable; capture its summary, status, and assignee
4. **Status check** — warn (but do not block) if the ticket is `Done`/`Closed`; block if no ticket exists
5. **Capture summary** for downstream use in PR title/body

## Output

Append to `PR-MANIFEST.md` under `## Jira Validation`:

```markdown
## Jira Validation

- **Ticket**: <JIRA-TICKET-ID>
- **Status**: PASS | FAIL
- **Source**: -jira option | branch name
- **Summary**: <ticket summary>
- **Jira Status**: <Open | In Progress | Done | ...>
- **Assignee**: <assignee>
- **URL**: <ticket URL>
- **Issues**: <list of blockers, or "none">
```

## Blocking Conditions

- No ticket ID resolvable from option or branch
- Ticket ID format invalid
- Ticket not accessible / does not exist
