---
name: git-flow-ship
description: Use when ready to commit, push, and create PRs in a Gitflow project — handles conventional commits, push with upstream tracking, and PR creation with correct targets based on branch type (single PR for features, dual PR for hotfixes/releases)
---

# git-flow-ship

Commit, push, and create PR(s). Each step confirmed separately.

## Steps

1. **Analyze changes:** `git status`, `git diff`, `git log`
2. **Generate conventional commit** from diff analysis
3. **Confirm → stage + commit**
4. **Confirm → push** with `-u` (set upstream tracking)
5. **Confirm → create PR(s)** based on branch type:

### PR Targets by Branch Type

| Branch | PR target(s) |
|---|---|
| `feat/*`, `fix/*`, `chore/*`, `docs/*` | 1 PR → `develop` |
| `release/*` | 2 PRs → `main` + `develop` |
| `hotfix/*` | 2 PRs → `main` + `develop` |

## Conventional Commit Format

`<type>[optional scope]: <description>`

- Lowercase imperative mood, no trailing period
- Optional scope in parentheses: `feat(game):`
- Breaking changes: `feat(api)!: remove v1 endpoints`
- Body wraps at 72 chars, explains what/why (not how)

Types: feat, fix, docs, style, refactor, perf, test, build, chore, ci

## Confirmation Gates (each separate)

1. Commit message — show proposed message, allow edit
2. Push — confirm before pushing
3. PR creation — confirm before creating

## Commands

```bash
# Analyze
git status
git diff --staged
git log --oneline -5

# Commit
git add <files>  # Never git add -A
git commit -m "<conventional message>"

# Push
git push -u origin <branch>

# PR (single target)
gh pr create --base develop --title "<message>" --body "<body>"

# PR (dual target — hotfix/release)
gh pr create --base main --title "<message>" --body "<body>"
gh pr create --base develop --title "<message>" --body "<body>"
```

## Safety

- Never stage `.env` or credentials files
- Never use `--no-verify`
- Never force-push
- Refuse to ship from `main` or `develop` directly
- Stage specific files, never `git add -A` or `git add .`
