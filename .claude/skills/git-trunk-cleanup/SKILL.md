---
name: git-trunk-cleanup
description: Use when merged branches or orphaned worktrees need cleaning in a trunk-based project — removes merged branches and stale worktrees with confirmation
---

# git-trunk-cleanup

Remove merged branches and orphaned worktrees. Only `main` is protected.

## Steps

1. **Switch** to `main`, pull latest
2. **Fetch + prune:** `git fetch --prune`
3. **Identify** branches merged into `main` (protect `main` only)
4. **Identify** orphaned worktrees
5. **Show cleanup plan**, confirm
6. **Execute cleanup**

## Commands

```bash
# Switch and update
git checkout main
git pull origin main
git fetch --prune

# Find merged branches (excluding main)
git branch --merged main | grep -v -E '^\s*(main|\*)'

# Find orphaned worktrees
git worktree list --porcelain | grep -A2 'worktree'

# Delete local branch (safe)
git branch -d <branch>

# Delete remote branch (separate confirmation)
git push origin --delete <branch>

# Remove worktree
git worktree remove .worktrees/<name>
```

## Safety

- Never delete `main`
- Use `-d` (safe delete), never `-D` (force delete)
- Skip dirty worktrees — warn user
- Remote deletion requires separate confirmation
