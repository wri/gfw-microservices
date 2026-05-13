# Skill: git-branch-validator

Validates git state and prepares the local branch for PR creation. Skipped when `/open-pr` is invoked with `--skipBranchValidation`.

## Inputs

- Current working directory (must be a git repo)
- Current branch name
- Project standards from [standards.md](standards.md)

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
6. **Single-commit policy** — if the branch has multiple commits, run interactive squash:
   ```bash
   git rebase -i origin/develop
   ```
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
