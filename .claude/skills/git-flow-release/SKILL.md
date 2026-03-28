---
name: git-flow-release
description: Use when ready to cut a release in a Gitflow project — version bump, changelog generation, tagging, and merge ceremony for release or hotfix branches
---

# git-flow-release

Version bump, changelog, tag, and merge ceremony for release/hotfix branches.

## When to Use

- On `release/*` or `hotfix/*` branch, ready to finalize
- On `main` after release merge, need to tag

## Steps

1. **Verify** on `release/*` or `hotfix/*` branch (or `main` after merge)
2. **Run pre-checks:** tests, lint, build (`check:all` or individual scripts)
3. **Dry-run semantic-release** → show proposed version + changelog
4. **Confirm version** (user can override: patch/minor/major/custom)
5. **Generate/update CHANGELOG.md** from conventional commits
6. **Show changelog** for user review/edit
7. **Commit:** `release: v{version}`
8. **Tag:** `v{MAJOR}.{MINOR}.{PATCH}`
9. **Push** commit + tag
10. **Trigger:** CI handles deploy (or offer local publish)

## Pre-Check Commands

```bash
# Run whatever the project has
npm run lint 2>/dev/null || true
npm run typecheck 2>/dev/null || true
npm run test:run 2>/dev/null || true
npm run build
```

Use `check:all` script if available in package.json.

## Semantic Release Dry-Run

```bash
npx semantic-release --dry-run --no-ci
```

Show output:
```
Current: v1.0.0 → Proposed: v1.1.0
Changelog:
  + feat(game): add leaderboard page with score ranking
  + fix(game): prevent score overflow
```

## Version Tag Format

Always `v{MAJOR}.{MINOR}.{PATCH}` — the `v` prefix is required.

Examples: `v1.0.0`, `v1.1.0`, `v2.0.0-beta.1`

## Commands

```bash
# Dry-run
npx semantic-release --dry-run --no-ci

# Commit version bump + changelog
git add CHANGELOG.md package.json
git commit -m "release: v{version}"

# Tag
git tag v{version}

# Push
git push origin <branch> --follow-tags
```

## Modes

- **Manual** (default for local): confirm at each step
- **Auto** (`--ci` flag): fully automated for CI pipeline
