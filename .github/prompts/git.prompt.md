# Git Workflow Prompt

## How to Use

This is a GitHub Copilot prompt file. Reference it in Copilot Chat using `#git` to get guidance on creating branches, commits, and PRs following the project conventions. Example: "Create a branch and PR for GPV-1234 #git"

---

Create a branch, commit, and open a PR following this workflow.

## Branch Creation

Create a branch using the Jira ticket prefix:

```bash
git checkout develop
git pull origin develop
git checkout -b <JIRA-TICKET-ID>
```

Example: For ticket GPV-5286, the branch name should be `GPV-5286`.

## Make Changes and Stage Files

After making changes, run formatter and linter before staging:

```bash
# Format changed files
npx nx format:write --files="<comma-separated-file-paths>"

# Run linting for affected projects
npx nx affected --target=lint
```

Then stage all modified files:

```bash
git add -A
```

## Rebase with Develop

Ensure the branch is rebased with the latest develop:

```bash
git fetch origin develop
git rebase origin/develop
```

If there are conflicts, resolve them and continue:

```bash
git rebase --continue
```

## Single Commit with Conventional Commits

Squash all commits into a single commit if there are multiple. Use the [Conventional Commits](https://www.conventionalcommits.org/) pattern based on where most changes are located:

**Commit message pattern:** `<type>(<scope>): <description>`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Scope (based on location of most changes):**

- `webserver`: Changes primarily in `apps/webserver/`
- `shared`: Changes primarily in `libs/shared/`
- `sql`: Changes primarily in `libs/sql/`
- `microservices-list-processing`: Changes in `apps/microservices/list-processing/`
- `microservices-list-downloader`: Changes in `apps/microservices/list-downloader/`
- `microservices-externalapi`: Changes in `apps/microservices/externalapi/`
- `constants`: Changes primarily in `libs/constants/`
- `aws`: Changes primarily in `libs/aws/`
- `geo`: Changes primarily in `libs/geo/`
- `gfwpro-e2e`: Changes in `apps/gfwpro-e2e/`
- `externalapi-e2e`: Changes in `apps/microservices/externalapi-e2e/`

**Note:** For shared parts of the system (docs, config, general tooling), use `shared` scope.

**Examples:**

```
feat(webserver): add new account limits endpoint
fix(shared): correct calculation in remaining area usage
refactor(sql): optimize query performance for large datasets
chore(shared): add copilot instructions and documentation
```

## Push and Create PR

Push the branch and create a PR using GitHub CLI:

```bash
git push -u origin <BRANCH-NAME>

gh pr create \
  --title "<JIRA-TICKET-ID>: <type>(<scope>): <description>" \
  --body "## Summary

<bullet points describing changes>

## Testing

<how the changes were tested>

## Related

- Jira: <JIRA-TICKET-ID>" \
  --base develop
```

## Complete Example

```bash
# 1. Create branch from develop
git checkout develop
git pull origin develop
git checkout -b GPV-5286

# 2. Make changes...

# 3. Stage and commit with Conventional Commits pattern
git add -A
git commit -m "fix(sql): change setGlobalAnalysisLimit to INSERT instead of UPDATE

- Change UPDATE query to INSERT query
- Add update_time field with GETDATE() to record current timestamp"

# 4. Rebase with develop (ensure single commit)
git fetch origin develop
git rebase -i origin/develop  # Squash if multiple commits

# 5. Push and create PR
git push -u origin GPV-5286

gh pr create \
  --title "GPV-5286: fix(sql): change setGlobalAnalysisLimit to INSERT instead of UPDATE" \
  --body "## Summary

- Change UPDATE to INSERT query
- Add update_time with GETDATE()

## Testing

- Unit tests pass

## Related

- Jira: GPV-5286" \
  --base develop
```

## Amending Commits

If you need to add formatting changes to an existing commit:

```bash
npx nx format:write --files="<comma-separated-file-paths>"
git add -A
git commit --amend --no-edit
git push --force-with-lease
```
