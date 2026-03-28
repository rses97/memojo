---
name: git-trunk-release
description: Use when ready to release in a trunk-based project — version bump, changelog, tagging from main using semantic-release with auto or manual mode
---

# git-trunk-release

Version bump + changelog + tag from `main`. Uses semantic-release natively.

## Prerequisites

- On `main`, clean tree, up-to-date with remote
- All checks passing (tests, lint, build)

## Steps

1. **Ensure on `main`**, clean tree, up-to-date with remote
2. **Run pre-checks:** tests, lint, build
3. **Choose mode:**
   - **Auto:** `npx semantic-release` (CI-native, version from commits)
   - **Manual:** `npx semantic-release --no-ci` (local, dry-run preview first)
4. **semantic-release handles:** version bump, changelog, commit, tag, GitHub release
5. **Show result:** version, tag, changelog diff

## Pre-Check Commands

```bash
npm run lint 2>/dev/null || true
npm run typecheck 2>/dev/null || true
npm run test:run 2>/dev/null || true
npm run build
```

Use `check:all` script if available in package.json.

## Release Commands

```bash
# Dry-run preview
npx semantic-release --dry-run --no-ci

# Manual release (local)
npx semantic-release --no-ci

# Auto release (CI)
npx semantic-release
```

## Version Tag Format

Always `v{MAJOR}.{MINOR}.{PATCH}` — the `v` prefix is required.

Configured via `tagFormat: 'v${version}'` in `.releaserc`.

## Post-Release Output

```
Current: v1.0.0 → Released: v1.0.1
Changelog:
  + fix(game): prevent score overflow on rapid card matches
GitHub release: https://github.com/user/repo/releases/tag/v1.0.1
```
