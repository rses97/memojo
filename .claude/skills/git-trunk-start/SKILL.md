---
name: git-trunk-start
description: Use when starting new work in a trunk-based project — creates a short-lived conventional branch from main with optional worktree support
---

# git-trunk-start

Create a short-lived feature branch from `main`.

## Steps

1. **Ensure on `main`**, pull latest
2. **Ask branch type:** feat / fix / chore / docs
3. **Ask for description** + optional issue number
4. **Ask:** regular branch or worktree?
5. **Generate name, create, confirm**

No `hotfix` or `release` types — in trunk-based, everything is a feature branch.

## Branch Naming

Format: `<type>/<description-in-kebab-case>`

With issue: `<type>/issue-<number>-<description-in-kebab-case>`

Rules: all lowercase, hyphens only, kebab-case

Examples:

- `feat/add-leaderboard`
- `fix/issue-18-score-overflow-bug`
- `chore/update-deps`

## Commands

```bash
# Regular branch
git checkout main
git pull origin main
git checkout -b <branch-name>

# Worktree
git worktree add .worktrees/<short-name> -b <branch-name> main
```

Worktree directory convention: `.worktrees/<short-name>` (e.g., `.worktrees/leaderboard`)
