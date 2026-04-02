---
name: git-trunk
description: Use when working in a trunk-based repository and unsure what git action to take next — detects current branch, working tree state, and PR status to route to the correct phase (start, ship, release, cleanup)
---

# git-trunk

Trunk-based orchestrator. Detects git state and suggests the next action.

## When to Use

- On any branch in a trunk-based project, wondering "what's next?"
- After completing work, to determine the right shipping step
- To get an overview of current git state

Do NOT use for Gitflow projects — use git-flow instead.

## Branch Model

| Branch    | Created from | Merges into                  | Lifetime                |
| --------- | ------------ | ---------------------------- | ----------------------- |
| `main`    | —            | — (production + integration) | Permanent               |
| `feat/*`  | `main`       | `main` (PR)                  | Short-lived (<1-2 days) |
| `fix/*`   | `main`       | `main` (PR)                  | Short-lived             |
| `chore/*` | `main`       | `main` (PR)                  | Short-lived             |
| `docs/*`  | `main`       | `main` (PR)                  | Short-lived             |

No `develop`, no `release/*`, no `hotfix/*`. Everything goes to `main` via PR.

## Routing Logic

| Condition                            | Action              |
| ------------------------------------ | ------------------- |
| On `main`, no merged branches        | → git-trunk-start   |
| On `main`, merged branches exist     | → git-trunk-cleanup |
| On `main`, tagged, ready for release | → git-trunk-release |
| On feature branch, dirty tree        | → git-trunk-ship    |
| On feature branch, clean, not pushed | → git-trunk-ship    |
| On feature branch, pushed, no PR     | → git-trunk-ship    |
| On feature branch, PR exists         | → git-trunk-cleanup |

## How to Detect State

```bash
# Current branch
git branch --show-current

# Dirty tree?
git status --porcelain

# Pushed to remote?
git log @{u}..HEAD 2>/dev/null

# PR exists?
gh pr list --head $(git branch --show-current) --json number --jq '.[0].number'

# Merged branches?
git branch --merged main | grep -v -E '^\s*(main|\*)'
```

Show state overview, then suggest the next skill to invoke.
