---
name: git-trunk-ship
description: Use when ready to commit, push, and create a PR in a trunk-based project — handles conventional commits, push with upstream tracking, and PR creation targeting main
---

# git-trunk-ship

Commit, push, PR to `main`. Each step confirmed separately.

## Steps

1. **Analyze changes:** `git status`, `git diff`, `git log`
2. **Generate conventional commit** from diff analysis
3. **Confirm → stage + commit**
4. **Confirm → push** with `-u`
5. **Confirm → create PR** to `main`
6. **Return PR URL**

Always targets `main` — no branch-type routing needed.

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

# PR
gh pr create --base main --title "<message>" --body "<body>"
```

## Safety

- Never stage `.env` or credentials files
- Never use `--no-verify`
- Never force-push
- Refuse to ship from `main` directly
- Stage specific files, never `git add -A` or `git add .`
