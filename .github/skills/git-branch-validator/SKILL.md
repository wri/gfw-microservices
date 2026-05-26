---
name: git-branch-validator
description: Validates git state and prepares the local branch for PR creation — enforces branch naming (<JIRA-TICKET-ID>), formats and lints changed files via Nx, rebases against develop, enforces a single-commit policy (non-interactive squash), and pushes the branch. Use before creating a PR.
---

# Skill: git-branch-validator

Validates git state and prepares the local branch for PR creation. Skipped when `/open-pr` is invoked with `--skipBranchValidation`.

## Inputs

- Current working directory (must be a git repo)
- Current branch name
- Project standards from [../standards/SKILL.md](../standards/SKILL.md)

## Responsibilities

1. **Branch name validation** — must match `<JIRA-TICKET-ID>` (e.g., `GPV-5286`). Reject `develop`, `main`, `master`.
2. **Uncommitted changes** — detect via `git status --porcelain`. If present, ask the user to stage/commit or stash before proceeding.
3. **Format changed files**:
   ```bash
   npx nx format:write --files="<comma-separated-changed-files>"
   ```
4. **Lint affected projects**:
   ```bash
   npx nx affected --target=lint
   ```
   Fail (block) on lint errors.
5. **Rebase against `develop`**:
   ```bash
   git fetch origin develop
   git rebase origin/develop
   ```
   On conflicts: stop and surface them to the user; do not auto-resolve.
6. **Single-commit policy** — if the branch has multiple commits, squash **non-interactively** (no editor required):

   ```bash
   # Preferred: soft-reset to base, re-commit as one
   FIRST_SUBJECT=$(git log --reverse --format=%s origin/develop..HEAD | head -n1)
   git reset --soft origin/develop
   git commit -m "$FIRST_SUBJECT"

   # Alternative when an interactive rebase is unavoidable
   GIT_SEQUENCE_EDITOR=: git rebase -i origin/develop   # picks all commits as-is; pair with reword/fixup beforehand
   ```

   Never use `git rebase -i` in automated contexts without `GIT_SEQUENCE_EDITOR=:` — it blocks waiting for an editor.

7. **Push**:
   ```bash
   # First push
   git push -u origin <branch>
   # Subsequent push after amend/rebase
   git push --force-with-lease
   ```

## Output

Append to `PR-MANIFEST.md` under `## Branch Validation`:

```markdown
## Branch Validation

- **Branch**: <branch-name>
- **Status**: PASS | FAIL
- **Format**: <files formatted or "no changes">
- **Lint**: <PASS/FAIL + summary>
- **Rebase**: <up-to-date with origin/develop / conflicts encountered>
- **Commits**: <single commit SHA + subject>
- **Push**: <pushed to origin/<branch> at <timestamp>>
- **Issues**: <list of blockers, or "none">
```

## Blocking Conditions

- Branch name doesn't match `<JIRA-TICKET-ID>`
- Lint failures
- Unresolved rebase conflicts
- Push rejected
