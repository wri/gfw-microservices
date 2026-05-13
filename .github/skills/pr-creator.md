# Skill: pr-creator

Generates PR content and creates the PR on GitHub. Runs in Phase 3 of `/open-pr`, after all Phase 2 validations have passed.

## Preconditions

- `git-branch-validator` PASSED (or `--skipBranchValidation` was set and branch is verified pushed/synced)
- `jira-validator` PASSED with a valid ticket ID and summary
- `code-reviewer` PASSED or was skipped (`--skipCodeReview`)
- GitHub CLI authenticated:
  ```bash
  gh auth status
  ```

## Inputs

- Jira ticket ID and summary (from `jira-validator`)
- Squashed commit subject/body (from `git-branch-validator`)
- Pushed branch name

## Title Format

```
<JIRA-TICKET-ID>: <type>(<scope>): <description>
```

The `<type>(<scope>): <description>` part must match the squashed commit subject. See [standards.md](standards.md) for valid types and scopes.

## Body Format

```markdown
## Summary

<bullet points describing what changed and why>

## Testing

<how the changes were tested — unit tests, nx affected results, manual verification, etc.>

## Related

- Jira: <JIRA-TICKET-ID>
```

## Create Command

```bash
gh pr create \
  --title "<JIRA-TICKET-ID>: <type>(<scope>): <description>" \
  --body "$(cat <<'EOF'
## Summary

- ...

## Testing

- ...

## Related

- Jira: <JIRA-TICKET-ID>
EOF
)" \
  --base develop
```

Capture the returned PR URL.

## Out of Scope

`pr-creator` **does NOT post the code review comment**. That is exclusively owned by Phase 4 of `/open-pr` (see [open-pr.md](../prompts/open-pr.prompt.md)).

## Output

Returns to the orchestrator:

- PR URL
- PR number
- Title used
- Branch and base

The orchestrator then proceeds to Phase 4.
