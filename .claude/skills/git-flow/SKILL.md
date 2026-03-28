---
name: git-flow
description: Use when working in a Gitflow repository and unsure what git action to take next — detects current branch, working tree state, and PR status to route to the correct phase (start, ship, release, cleanup)
---

# git-flow

Gitflow orchestrator. Detects git state and suggests the next action.

## When to Use

- On any branch in a Gitflow project, wondering "what's next?"
- After completing work, to determine the right shipping step
- To get an overview of current git state

Do NOT use for trunk-based projects — use git-trunk instead.

## Branch Model

| Branch | Created from | Merges into | Version impact |
|---|---|---|---|
| `main` | — | — (production) | Tagged releases |
| `develop` | `main` | — (integration) | Pre-release |
| `feat/*` | `develop` | `develop` (PR) | minor |
| `fix/*` | `develop` | `develop` (PR) | patch |
| `hotfix/*` | `main` | `main` + `develop` (2 PRs) | patch |
| `release/*` | `develop` | `main` + `develop` (2 PRs) | minor/major |
| `chore/*` | `develop` | `develop` (PR) | — |
| `docs/*` | `develop` | `develop` (PR) | — |

## Routing Logic

| Condition | Action |
|---|---|
| On `main` or `develop`, no merged branches | → git-flow-start |
| On `main` or `develop`, merged branches exist | → git-flow-cleanup |
| On feature/fix/chore/docs branch, dirty tree | → git-flow-ship |
| On feature/fix branch, clean, not pushed | → git-flow-ship |
| On feature/fix branch, pushed, no PR | → git-flow-ship |
| On feature/fix branch, PR exists | → git-flow-cleanup |
| On `hotfix/*` branch | → git-flow-ship (targets both `main` + `develop`) |
| On `release/*` branch, work in progress | → git-flow-ship |
| On `release/*` branch, ready to merge | → git-flow-release |
| On `main`, after release merge | → git-flow-release (tag + changelog) |

## How to Detect State

```bash
# Current branch
git branch --show-current

# Dirty tree?
git status --porcelain

# Pushed to remote?
git log @{u}..HEAD 2>/dev/null  # fails if no upstream

# PR exists?
gh pr list --head $(git branch --show-current) --json number --jq '.[0].number'

# Merged branches (into develop)?
git branch --merged develop | grep -v -E '^\s*(main|develop|\*)'
```

Show state overview, then suggest the next skill to invoke.
