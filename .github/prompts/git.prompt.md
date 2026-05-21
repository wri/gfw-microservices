# Git Workflow Prompt

Short pointer to the project's git/PR workflow. The full workflow lives in [`open-pr.prompt.md`](open-pr.prompt.md) and is composed from the skills in [`../skills/`](../skills/) — this file just tells you where to look.

## How to Use

Reference this prompt in Copilot Chat with `#git` for a quick workflow reminder. For an actual end-to-end PR run, use `#open-pr`. To respond to review feedback, use `#address-pr-comments`.

## Entry Points

| You want to…                              | Use                                                       |
| ----------------------------------------- | --------------------------------------------------------- |
| Create a branch, commit, and open a PR    | [#open-pr](open-pr.prompt.md)                             |
| Address review feedback on an existing PR | [#address-pr-comments](address-pr-comments.prompt.md)     |
| Look up branch/commit/PR conventions      | [skills/standards/SKILL.md](../skills/standards/SKILL.md) |

## Cheat Sheet

The canonical workflow — kept here as a one-screen reminder. **For full details, follow the linked skill.**

### 1. Branch from `develop`

```bash
git checkout develop
git pull origin develop
git checkout -b <JIRA-TICKET-ID>   # e.g., GPV-5286
```

See [git-branch-validator](../skills/git-branch-validator/SKILL.md) for branch-name validation rules.

### 2. Make changes, format + lint

```bash
npx nx format:write --files="<comma-separated-changed-files>"
npx nx affected --target=lint
git add -A
```

### 3. Single commit, Conventional Commits

```bash
git commit -m "<type>(<scope>): <description>"
```

Valid types and scopes: [standards/SKILL.md](../skills/standards/SKILL.md).

### 4. Rebase + squash to one commit

```bash
git fetch origin develop
git rebase origin/develop

# If you ended up with >1 commit, squash non-interactively:
FIRST_SUBJECT=$(git log --reverse --format=%s origin/develop..HEAD | head -n1)
git reset --soft origin/develop
git commit -m "$FIRST_SUBJECT"
```

### 5. Push + open PR

```bash
git push -u origin <JIRA-TICKET-ID>
```

Then either run `/open-pr` (recommended — handles title/body, validation, code review, and posting in one shot) or open manually following the title/body template in [standards/SKILL.md](../skills/standards/SKILL.md).

### 6. Amend after review

```bash
npx nx format:write --files="<changed-files>"
git add -A
git commit --amend --no-edit
git push --force-with-lease
```

Or run `/address-pr-comments` to walk through reviewer feedback systematically.
