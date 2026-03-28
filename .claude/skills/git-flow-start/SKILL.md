---
name: git-flow-start
description: Use when starting new work in a Gitflow project — creates a conventional branch from the correct source (develop for features, main for hotfixes) with optional worktree support
---

# git-flow-start

Create a conventional branch from the correct Gitflow source.

## Steps

1. **Ask branch type:** feat / fix / hotfix / chore / release / docs
2. **Determine source branch:**
   - `feat`, `fix`, `chore`, `docs`, `release` → from `develop`
   - `hotfix` → from `main`
3. **Pull latest** from source branch
4. **Ask for description** + optional issue number
5. **Ask:** regular branch or git worktree?
6. **Generate name, create branch, confirm**

## Branch Naming

Format: `<type>/<description-in-kebab-case>`

With issue: `<type>/issue-<number>-<description-in-kebab-case>`

Rules:
- All lowercase, hyphens only (no underscores/special chars)
- Kebab-case description

Examples:
- `feat/add-leaderboard`
- `fix/issue-42-score-overflow`
- `hotfix/issue-99-auth-bypass`
- `release/v1.1.0`

## Worktree Option

If worktree chosen:
```bash
git worktree add .worktrees/<short-name> -b <branch-name> <source>
```

Directory convention: `.worktrees/<short-name>` (e.g., `.worktrees/leaderboard`)

## Commands

```bash
# Regular branch
git checkout <source>
git pull origin <source>
git checkout -b <branch-name>

# Worktree
git worktree add .worktrees/<short-name> -b <branch-name> <source>
```
