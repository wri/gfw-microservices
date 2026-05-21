---
name: pr-manifest
description: Manages PR-MANIFEST.md — the shared scratchpad that coordinates output across /open-pr sub-agents. Defines the lifecycle (reset, append, read) and the exact ## section headers each sub-agent must use so Phase 4 can extract the code review for posting.
---

# Skill: PR Manifest

Manages the `PR-MANIFEST.md` file used to coordinate output across the `/open-pr` sub-agents.

## Purpose

`PR-MANIFEST.md` is the **shared scratchpad** for a single `/open-pr` run. Sub-agents append their results to it; Phase 4 reads it to post the review comment.

## Lifecycle

| Phase | Action                                              |
| ----- | --------------------------------------------------- |
| 1     | Reset (delete + recreate)                           |
| 2     | Each agent appends its section                      |
| 3     | Not touched                                         |
| 4     | Read `## Code Review` section to post as PR comment |

The file is reset every run — **never accumulated** across runs — and **never committed**.

## Phase 1 Steps

1. If `PR-MANIFEST.md` exists, delete it:
   ```bash
   rm -f PR-MANIFEST.md
   ```
2. Create it with a metadata header:

   ```markdown
   # PR Manifest

   - **Path**: <absolute-path-to-file>
   - **Created**: <ISO-8601-UTC-timestamp>
   - **Session**: <session-identifier>
   - **Branch**: <current-branch>
   ```

3. Ensure `.gitignore` contains the root-anchored entry `/PR-MANIFEST.md` (the leading slash matters on case-insensitive filesystems so it does not also mask `pr-manifest.md` skill docs):
   ```bash
   grep -qxF '/PR-MANIFEST.md' .gitignore || echo '/PR-MANIFEST.md' >> .gitignore
   ```

## Section Marker Contract

Each agent **must** begin its appended output with one of these exact `##` headers:

| Agent                  | Header                 |
| ---------------------- | ---------------------- |
| `git-branch-validator` | `## Branch Validation` |
| `jira-validator`       | `## Jira Validation`   |
| `code-reviewer`        | `## Code Review`       |

Phase 4 extracts the code review by reading from `## Code Review` to end of file, so this header **must be unique** in the manifest and must appear **once**.

## Append Pattern

Agents append (never overwrite) using:

```bash
cat >> PR-MANIFEST.md <<'EOF'

## <Section Header>

<agent output...>
EOF
```
