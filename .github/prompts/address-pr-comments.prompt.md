# Address PR Comments

Address code review comments on a pull request systematically — categorize feedback, plan changes with user approval, implement, validate, then commit and push. Enforces the same git, commit, and PR conventions as `/open-pr` (Conventional Commits + Jira + Nx, base `develop`).

## Execution Policy

**Run non-destructive `git` commands and `gh` CLI commands directly without asking for user confirmation.** This includes `git fetch`, `git push`, `gh pr view`, `gh pr comment`, and other non-destructive git or GitHub CLI operations required by the workflow. **Before running any destructive or history-rewriting command, require explicit user confirmation.** This includes `git rebase`, `git reset --soft`, `git commit --amend`, and `git push --force-with-lease`.

## How to Use

Reference this prompt in Copilot Chat: "Address PR comments for GPV-5286 #address-pr-comments".

## Variables

| Variable           | Default  | Purpose                                                                                               |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------- |
| `JIRA_STORY`       | —        | Jira ticket ID (e.g., `GPV-5286`). Inferred from branch name or PR title if not provided              |
| `PR_NUMBER`        | —        | GitHub PR number. Inferred from current branch if not provided                                        |
| `COMMIT_STRATEGY`  | `single` | `single` (amend onto existing commit), `individual` (one per logical group), or `ask` (confirm each)  |
| `PREFERRED_REMOTE` | `origin` | Git remote to push to. Ask the user and remember the choice for the session if multiple remotes exist |

## Context

You are a senior software engineer addressing code review feedback on a PR. Your task is to systematically address each review comment while maintaining code quality and following this project's conventions defined in [../skills/standards/SKILL.md](../skills/standards/SKILL.md).

## Prerequisites Validation

Before starting, verify:

- [ ] Current directory is a git repository: `git status`
- [ ] GitHub CLI is authenticated: `gh auth status`
- [ ] Working on the correct branch with a pending PR
- [ ] Node.js + `npx` are available for `nx format:write` / `nx affected --target=lint`

## External Context (optional)

If MCP tools or other integrations are available, use them to enrich the review with external context:

- **Jira** — fetch ticket details, acceptance criteria, and linked documentation
- **Confluence / Notion** — fetch any documentation linked from the ticket or PR
- **Slack / Teams** — fetch related thread context if reviewers reference an off-PR conversation

If none of these are available, ask the user to paste the relevant context.

## Execution Flow

### Phase 1 — Setup and Validation

#### A. Jira Story Analysis

Delegate to the [jira-validator](../skills/jira-validator/SKILL.md) skill to resolve `$JIRA_STORY`, validate the `GPV-<NUMBER>` format, verify accessibility, and capture the ticket summary, status, and assignee. Block on validation failures before proceeding.

From the validated ticket, extract key requirements and acceptance criteria needed to evaluate the review feedback.

#### B. PR Identification and Validation

- If `$PR_NUMBER` is not provided:
  - Find the PR for the current branch: `gh pr view --json number,title,url`
  - If multiple PRs or none found, ask the user to specify the PR number
- Validate the PR exists and is accessible: `gh pr view $PR_NUMBER`
- Confirm the PR title contains `$JIRA_STORY` or ask the user to verify the correct PR

#### C. Current Branch Verification

- **Remote selection**: If `$PREFERRED_REMOTE` is not set:
  - List available remotes: `git remote -v`
  - If only `origin` exists, use it without asking
  - Otherwise ask the user and remember the choice for this session
- Ensure on the correct feature branch: `git branch --show-current`
- If not on the PR branch, ask the user before switching
- Sync with the remote if needed: `git pull --rebase $PREFERRED_REMOTE <branch>`

### Phase 2 — Review Comment Analysis

#### A. Fetch Review Comments

```bash
# Inline review comments (file/line/body)
gh pr view $PR_NUMBER --json reviews

# General PR conversation comments
gh pr view $PR_NUMBER --json comments
```

Extract review comments with full context (file, line, comment body, author).

#### B. Comment Categorization

Organize comments by:

- **Critical** — security issues, bugs, breaking changes
- **Major** — design improvements, performance issues, maintainability
- **Minor** — style, naming, documentation
- **Questions** — requests for clarification or explanation
- **Suggestions** — optional improvements

#### C. Comment Context Gathering

For each comment:

- Identify affected file and line numbers
- Read surrounding code context
- If the comment references external docs/links, fetch additional context using available tools
- Note any conflicting feedback between reviewers

### Phase 3 — Implementation Planning

#### A. Dependency Analysis

- Identify comments that depend on others (e.g., refactoring that affects multiple files)
- Group related changes that should be implemented together
- Flag potential conflicts between different reviewer suggestions

#### B. Implementation Sequence

- **Phase A**: Critical security/bug fixes
- **Phase B**: Major architectural/design changes
- **Phase C**: Minor improvements and style fixes
- **Phase D**: Documentation and clarification responses

#### C. Change Impact Assessment

For each planned change:

- Estimate complexity and time required
- Identify potential side effects
- Note testing requirements
- Plan a rollback strategy if needed

### Phase 4 — User Collaboration and Approval

#### A. Present Comprehensive Plan

Show the user:

- Summary of all review comments by category
- Proposed implementation sequence
- Estimated effort and complexity
- Any conflicts or concerns identified

#### B. Individual Comment Review

For each comment (starting with Critical):

- **Show**: original comment with file/line context
- **Propose**: specific solution approach
- **Ask**: "Approve this approach? Alternative suggestions?"
- **Wait**: for explicit user approval before proceeding
- **Document**: user's decision (approve / modify / reject / defer)

#### C. Conflict Resolution

If reviewer feedback conflicts:

- Present both perspectives clearly
- Suggest a resolution approach
- Ask the user to choose a direction or request reviewer clarification
- Document the resolution for the PR response

### Phase 5 — Implementation

#### A. Setup Change Tracking

- Create a checklist of approved changes (use TodoWrite if running in Claude Code)
- Track completion status as you work
- Note any implementation challenges encountered

#### B. Implement Changes by Priority

For each approved change:

- **Before**: show the current code
- **Implement**: make the change following project patterns
- **Validate**: ensure the change compiles and basic functionality works
- **Test**: run relevant tests if quick validation is possible
- **Mark Complete**: update the tracking checklist

#### C. Handle Implementation Issues

If implementation problems arise:

- Document the specific issue
- Present alternative approaches
- Ask the user for guidance: continue, modify approach, or defer
- Update the implementation plan accordingly

### Phase 6 — Testing and Validation

Use this project's Nx scripts.

#### A. Format + Lint Gates

```bash
npx nx format:write --files="<comma-separated-changed-files>"
npx nx affected --target=lint
```

Block on lint failures. Fix iteratively.

#### B. Test Suite

```bash
npx nx affected --target=test
```

If tests fail: **STOP** and present failure details to the user.

#### C. Build Verification (when applicable)

```bash
npx nx affected --target=build
```

Verify no regressions are introduced in affected projects.

#### D. Code Quality Self-Review

- Self-review all changes for consistency
- Ensure changes follow existing patterns in the touched area
- Verify documentation is updated if needed
- Check for any TODO comments or incomplete implementations

### Phase 7 — Response Preparation

#### A. Change Summary

- Document what was changed for each comment
- Note any alternative approaches taken
- Explain the rationale for design decisions
- Identify any suggestions not implemented and why

#### B. Reviewer Communication

- Prepare a response for each individual comment
- Address questions with clear explanations
- Thank reviewers for valuable feedback
- Request re-review of specific areas if needed

### Phase 8 — Commit and Push

All commit messages — and, if the PR title needs updating, the PR title — **must follow** the conventions defined in [../skills/standards/SKILL.md](../skills/standards/SKILL.md): Conventional Commits, Jira-prefixed PR titles, single commit per PR.

#### A. Commit Strategy

Based on `$COMMIT_STRATEGY`:

**`single` (default)** — amend onto the existing single PR commit:

```bash
git add -A
git commit --amend --no-edit
```

**`individual`** — for each logical group:

```bash
git add <files>
git commit -m "<type>(<scope>): <specific change description>"
```

Then, before push, squash back into a single commit (see [../skills/git-branch-validator/SKILL.md](../skills/git-branch-validator/SKILL.md) for non-interactive squash):

```bash
FIRST_SUBJECT=$(git log --reverse --format=%s origin/develop..HEAD | head -n1)
git reset --soft origin/develop
git commit -m "$FIRST_SUBJECT"
```

**`ask`** — present commit options for each change group and let the user decide.

#### B. Pre-Push Validation

```bash
git diff --cached            # show staged changes (when individual mode mid-stream)
git log origin/develop..HEAD # confirm single commit
```

Confirm commit messages are descriptive. Ask: "Push changes and notify reviewers?" — **require explicit confirmation** before force-pushing.

### Phase 9 — Push and Notify

```bash
git push --force-with-lease $PREFERRED_REMOTE <branch>
```

After push:

1. Post a PR comment summarizing what was addressed, using `--body-file` (robust against shell metacharacters):

   ```bash
   BODY_FILE=$(mktemp -t pr-reply.XXXXXX.md)
   trap 'rm -f "$BODY_FILE"' EXIT
   cat > "$BODY_FILE" <<'EOF'
   Thanks for the review! Addressed in the latest push:

   - <comment 1>: <what was changed>
   - <comment 2>: <what was changed>
   - <comment N>: <accepted as-is, justification>

   Ready for re-review.
   EOF
   gh pr comment $PR_NUMBER --body-file "$BODY_FILE"
   ```

2. Request re-review from the original reviewers:
   ```bash
   gh pr ready $PR_NUMBER          # if it was draft
   gh api -X POST repos/:owner/:repo/pulls/$PR_NUMBER/requested_reviewers \
     -f reviewers='["<reviewer-1>","<reviewer-2>"]'
   ```

## Error Recovery Strategies

- **Issue tracker unavailable**: continue with user-provided context if the MCP/integration fails
- **PR access issues**: verify permissions and `gh auth status`
- **Git conflicts**: guide the user through resolution; do not auto-resolve
- **Test failures**: present clear error details and suggested fixes
- **Build issues**: identify specific problems and provide solutions
- **Reviewer conflicts**: facilitate communication and decision-making

## Success Criteria

- [ ] All review comments systematically addressed or documented why not
- [ ] User approved each significant change before implementation
- [ ] `nx format:write`, `nx affected --target=lint`, and (when applicable) test/build are green
- [ ] Code follows project conventions and quality standards
- [ ] Single commit on branch (per project standards)
- [ ] Reviewers notified with a comprehensive response
- [ ] No regressions introduced by changes

## Implementation Notes

- This prompt does **not** reset `PR-MANIFEST.md` — that scratchpad is owned by `/open-pr`.
- Re-running `/open-pr` after this prompt completes will produce a delta review against any existing `CODE_REVIEW_REPORT.md`.
- The `code-reviewer` skill is **not** invoked here; this prompt focuses on responding to _existing_ human/automation review feedback, not generating a new review.
