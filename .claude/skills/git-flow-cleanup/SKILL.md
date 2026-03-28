---
name: git-flow-cleanup
description: Use when merged branches or orphaned worktrees need cleaning in a Gitflow project — removes merged feature/fix branches and stale worktrees with confirmation
---

# git-flow-cleanup

Remove merged branches and orphaned worktrees.

## Steps

1. **Switch** to `develop`, pull latest
2. **Fetch + prune:** `git fetch --prune`
3. **Identify** branches merged into `develop` (protect `main`, `develop`)
4. **Identify** orphaned worktrees
5. **Show cleanup plan**, confirm
6. **Delete branches** (`-d`), remove worktrees
7. **Optionally** delete remote branches (separate confirmation)
8. **Show final state**

## Commands

```bash
# Switch and update
git checkout develop
git pull origin develop
git fetch --prune

# Find merged branches (excluding protected)
git branch --merged develop | grep -v -E '^\s*(main|develop|\*)'

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

- Never delete `main` or `develop`
- Use `-d` (safe delete), never `-D` (force delete)
- Skip dirty worktrees — warn user
- Remote deletion requires separate confirmation
