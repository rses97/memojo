---
name: git-auto-init
description: Use when setting up a new project's git tooling, code quality tools, CI/CD pipelines, or when checking what dev tooling is missing — ESLint, Prettier, TypeScript, commitlint, husky, lint-staged, semantic-release, GitHub Actions workflows
---

# git-auto-init

One-time project setup. Detect what's installed, offer to set up what's missing. Includes code quality tools and CI/CD pipeline generation.

## When to Use

- New project needs code quality tools (ESLint, Prettier, TypeScript)
- New project needs git tooling (commitlint, husky, lint-staged, semantic-release)
- Project missing CI/CD workflows
- Checking what tooling is already configured
- Re-running is safe — idempotent detect-and-suggest

---

## Phase 1: Code Quality & Git Tooling

### Detection

Check each tool and show status:

| Tool | Check | Config file |
|---|---|---|
| git | `.git/` exists | — |
| GitHub remote | `git remote -v` | — |
| TypeScript | `devDependencies` has `typescript` | — |
| ESLint | `devDependencies` has `eslint` + `eslint.config.*` exists | `eslint.config.ts` |
| Prettier | `devDependencies` has `prettier` + config file exists | `.prettierrc` / `prettier.config.*` |
| commitlint | `devDependencies` has `@commitlint/cli` | `commitlint.config.ts` |
| husky | `devDependencies` has `husky` + `.husky/` exists | `.husky/` |
| lint-staged | config in `package.json` or `.lintstagedrc` | — |
| semantic-release | `devDependencies` has `semantic-release` | `.releaserc` |
| CHANGELOG.md | file exists | `CHANGELOG.md` |

Display status:

```
Setup Status:
  ✓ git initialized
  ✓ GitHub remote: origin → user/repo
  ✗ TypeScript — not found
  ✗ ESLint — not found
  ✗ Prettier — not found
  ✗ commitlint — not found
  ✗ husky — not found
  ✓ lint-staged — already configured
  ✗ semantic-release — not found
  ✗ CHANGELOG.md — not found
  ✗ CI/CD workflows — not found
```

If all green: "All tools configured. Nothing to do." — stop here.

### Package Manager Detection

Detect from lockfile:

| Lockfile | Package manager |
|---|---|
| `pnpm-lock.yaml` | pnpm |
| `package-lock.json` | npm |
| `yarn.lock` | yarn |

Use `{pm}` for install command (`pnpm add`, `npm install`, `yarn add`).
Use `{pm-exec}` for exec (`pnpm exec`, `npx`, `yarn`).

### Framework Detection

Detect project type from `dependencies`/`devDependencies` in `package.json`:

| Check | Framework |
|---|---|
| `nuxt` in dependencies | Nuxt |
| `vue` in dependencies (no nuxt) | Vue |
| Neither | Plain TypeScript |

Display: `Detected framework: {Nuxt|Vue|Plain TypeScript}`

This drives ESLint package selection and typecheck command.

### Installation

For each missing tool, ask separately before installing. Never batch-install without confirmation.

**TypeScript:**

Ask: "Install TypeScript? [Y/n]"

**Nuxt:**

```bash
{pm} add -D typescript vue-tsc
```

**Vue / Plain TypeScript:**

```bash
{pm} add -D typescript
```

Add typecheck script to `package.json`:
- Nuxt: `"typecheck": "nuxi typecheck"`
- Vue / Plain TS: `"typecheck": "tsc --noEmit"`

**Code quality tools:**

Ask which tools to set up:

```
Code quality tools?
  1. ESLint only
  2. ESLint + Prettier
  3. Prettier only
  4. None — skip
Choice:
```

If None selected: skip ESLint and Prettier sections below.

**ESLint** (if option 1 or 2):

Ask rule strictness:

```
ESLint rule strictness?
  1. Recommended — catches real issues without noise (Recommended)
  2. Strict — more opinionated, catches more issues
Choice:
```

If "ESLint only" (option 1), ask about formatting:

```
Include stylistic/formatting rules in ESLint?
  1. Yes — enforce formatting via @stylistic/eslint-plugin
  2. No — linting only, no formatting
Choice:
```

**Nuxt ESLint:**

```bash
{pm} add -D @nuxt/eslint eslint
```

Add `@nuxt/eslint` to `modules` array in `nuxt.config.ts`.

Create `eslint.config.ts`:

```ts
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom rules here
)
```

`@nuxt/eslint` bundles typescript-eslint, eslint-plugin-vue, and @stylistic — no separate installs needed. If user chose strict, configure via Nuxt module options in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  eslint: {
    config: {
      stylistic: true, // if user chose stylistic formatting
    },
  },
})
```

**Vue ESLint (non-Nuxt):**

```bash
{pm} add -D eslint eslint-plugin-vue @vue/eslint-config-typescript
```

If user wants stylistic rules:

```bash
{pm} add -D @stylistic/eslint-plugin
```

Create `eslint.config.ts` (without stylistic):

```ts
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  pluginVue.configs['flat/recommended'],   // or 'flat/strongly-recommended' for strict
  vueTsConfigs.recommended,                // or vueTsConfigs.strict
)
```

Create `eslint.config.ts` (with stylistic):

```ts
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfigWithVueTs(
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  stylistic.configs['recommended-flat'],
)
```

**Plain TypeScript ESLint:**

```bash
{pm} add -D eslint @eslint/js typescript-eslint
```

If user wants stylistic rules:

```bash
{pm} add -D @stylistic/eslint-plugin
```

Create `eslint.config.ts` (without stylistic):

```ts
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,   // or .strict
)
```

Create `eslint.config.ts` (with stylistic):

```ts
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs['recommended-flat'],
)
```

**All frameworks — add scripts to `package.json`:**

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

**Prettier** (if option 2 or 3):

Ask style preset:

```
Prettier style preset?
  1. Vue ecosystem (no semi, single quotes, trailing commas) — used by Vue, Nuxt, Vite (Recommended)
  2. Prettier defaults (semi, double quotes, trailing commas)
  3. Airbnb-ish (semi, single quotes, trailing commas)
Choice:
```

```bash
{pm} add -D prettier
```

Create `.prettierrc` based on chosen preset:

**Vue ecosystem (recommended):**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all"
}
```

**Prettier defaults:**

No `.prettierrc` file created — use Prettier's built-in defaults.

**Airbnb-ish:**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

Add scripts to `package.json`:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

No `eslint-config-prettier` or `eslint-plugin-prettier` needed — modern ESLint configs don't include formatting rules that conflict with Prettier.

**commitlint:**

Ask: "Install commitlint + @commitlint/config-conventional? [Y/n]"

```bash
{pm} add -D @commitlint/cli @commitlint/config-conventional
```

Create `commitlint.config.ts`:

```ts
export default { extends: ['@commitlint/config-conventional'] };
```

**husky:**

Ask: "Install husky? [Y/n]"

```bash
{pm} add -D husky
{pm-exec} husky init
```

Create `.husky/commit-msg`:

```bash
npx --no -- commitlint --edit $1
```

Create `.husky/pre-commit`:

```bash
npx lint-staged
```

**lint-staged:**

Ask: "Install lint-staged? [Y/n]"

```bash
{pm} add -D lint-staged
```

Add to `package.json` — adapt based on installed code quality tools:

**ESLint only (with or without stylistic):**

```json
{
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix"]
  }
}
```

**ESLint + Prettier:**

```json
{
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix"],
    "*.{ts,vue,css,md,json}": ["prettier --write"]
  }
}
```

**Prettier only:**

```json
{
  "lint-staged": {
    "*.{ts,vue,css,md,json}": ["prettier --write"]
  }
}
```

**None (no code quality tools):**

Fall back to test runner if available:

```json
{
  "lint-staged": {
    "*.{ts,vue}": ["vitest related --run"]
  }
}
```

Adapt glob patterns to detected framework: use `*.{ts,vue}` for Nuxt/Vue, `*.ts` for plain TypeScript.

**semantic-release:**

Ask: "Install semantic-release + plugins? [Y/n]"

```bash
{pm} add -D semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github
```

### Workflow Selection

Ask which git workflow:

```
Which workflow will this project use?
  1. Gitflow (main + develop, release branches)
  2. Trunk-based (main only, short-lived branches)
Choice:
```

Generate `.releaserc` based on choice:

**Gitflow `.releaserc`:**

```json
{
  "branches": [
    "main",
    { "name": "develop", "prerelease": "next" },
    { "name": "release/*", "prerelease": "rc" }
  ],
  "tagFormat": "v${version}",
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

**Trunk-based `.releaserc`:**

```json
{
  "branches": ["main"],
  "tagFormat": "v${version}",
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

**For Gitflow only:** Check if `develop` branch exists.

```bash
git branch --list develop
```

If not found: "Create develop branch from main? [Y/n]"

```bash
git checkout main && git pull origin main
git checkout -b develop
git push -u origin develop
```

### CHANGELOG.md

Ask: "Create CHANGELOG.md? [Y/n]"

Create with Keep a Changelog header:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

---

## Phase 2: CI/CD Pipeline

Ask: "Set up GitHub Actions CI/CD? [Y/n]"

If no: skip Phase 2.

### Step 1: Deploy Target

```
Deploy target?
  1. Vercel
  2. AWS (S3 + CloudFront)
  3. Netlify
  4. Docker registry
  5. Custom VPS (SSH)
  6. None (CI checks only)
Choice:
```

### Step 2: Production Deploy Mode

(Skip if None selected)

```
Production deploy mode?
  1. Auto on tag — push v* tag → deploys immediately
  2. Manual only — tag records version, deploy via GitHub UI
  3. Auto + approval gate — push v* tag → requires approval, then deploys
Choice:
```

### Layered Architecture

The system separates concerns into three layers:

```
Layer 1: WHEN to deploy  →  GitHub Actions triggers (same for all platforms)
Layer 2: WHAT to deploy  →  Build step (project-specific, resolved from package.json)
Layer 3: WHERE to deploy →  Platform-specific deploy command (swappable)
```

Trigger logic (auto vs manual, approval gates) is identical regardless of platform. Only the deploy step changes.

### Generated Workflow Files

#### ci.yml — lint, test, typecheck on PRs

Resolve `{detected-pm}`, `{install-cmd}`, `{lint-cmd}`, `{typecheck-cmd}`, `{test-cmd}`, `{build-cmd}` from the project's detected package manager and `package.json` scripts.

**Trunk-based ci.yml:**

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: '{detected-pm}'
      - run: {install-cmd}
      - run: {lint-cmd}
      - run: {typecheck-cmd}
      - run: {test-cmd}
      - run: {build-cmd}
```

**Gitflow ci.yml** (branches differ):

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main, 'release/**']

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: '{detected-pm}'
      - run: {install-cmd}
      - run: {lint-cmd}
      - run: {typecheck-cmd}
      - run: {test-cmd}
      - run: {build-cmd}
```

#### deploy.yml — auto-deploy to staging/dev on push

(Skip if None selected)

**Trunk-based deploy.yml** (main → staging):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: '{detected-pm}'
      - run: {install-cmd}
      - run: {build-cmd}
      # Platform-specific deploy step inserted here
```

**Gitflow deploy.yml** (develop → dev, release/* → staging):

```yaml
name: Deploy

on:
  push:
    branches: [develop, 'release/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: ${{ github.ref == 'refs/heads/develop' && 'development' || 'staging' }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: '{detected-pm}'
      - run: {install-cmd}
      - run: {build-cmd}
      # Platform-specific deploy step inserted here
```

#### release.yml — production deploy (three mode variants)

(Skip if None selected)

**Mode 1: Auto on tag**

```yaml
name: Release

on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      tag:
        description: 'Version to deploy (e.g. v1.2.3)'
        required: true
      environment:
        type: choice
        options: [staging, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production    # No reviewers required
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.tag || github.ref }}
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: '{detected-pm}'
      - run: {install-cmd}
      - run: {build-cmd}
      # Platform-specific deploy step inserted here
```

**Mode 2: Manual only**

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Version to deploy (e.g. v1.2.3)'
        required: true
      environment:
        type: choice
        options: [staging, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.tag }}
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: '{detected-pm}'
      - run: {install-cmd}
      - run: {build-cmd}
      # Platform-specific deploy step inserted here
```

**Mode 3: Auto + approval gate (recommended)**

```yaml
name: Release

on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      tag:
        description: 'Version to deploy (e.g. v1.2.3)'
        required: true
      environment:
        type: choice
        options: [staging, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production    # Requires reviewer approval in GitHub settings
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.tag || github.ref }}
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: '{detected-pm}'
      - run: {install-cmd}
      - run: {build-cmd}
      # Platform-specific deploy step inserted here
```

> GitHub Environment setup for approval gate: Settings → Environments → `production` → Required reviewers → select approvers.

### Platform-Specific Deploy Steps

Insert the matching step into `deploy.yml` and `release.yml`:

```yaml
# --- Vercel ---
- name: Deploy to Vercel
  run: |
    npx vercel pull --yes --environment=${{ env.DEPLOY_ENV }} --token=${{ secrets.VERCEL_TOKEN }}
    npx vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
    npx vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

# --- AWS S3 + CloudFront ---
- name: Deploy to AWS
  run: |
    aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}/ --delete
    aws cloudfront create-invalidation \
      --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"

# --- Netlify ---
- name: Deploy to Netlify
  run: npx netlify deploy --prod --dir=dist

# --- Docker registry ---
- name: Deploy Docker image
  run: |
    docker build -t ${{ secrets.REGISTRY }}/app:${{ github.ref_name }} .
    docker push ${{ secrets.REGISTRY }}/app:${{ github.ref_name }}

# --- Custom VPS (SSH) ---
- name: Deploy to VPS
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /app && git fetch --tags
      git checkout ${{ github.ref_name }}
      npm ci && npm run build
      pm2 restart app
```

### Required Secrets by Platform

| Platform | Required GitHub Secrets |
|---|---|
| Vercel | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| AWS | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `CLOUDFRONT_ID` |
| Netlify | `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` |
| Docker | `REGISTRY`, `REGISTRY_USERNAME`, `REGISTRY_PASSWORD` |
| VPS | `VPS_HOST`, `VPS_USER`, `SSH_PRIVATE_KEY` |

### Disabling Platform Auto-Deploy

When using Vercel or Netlify, GitHub Actions becomes the single deploy orchestrator. Ask: "Disable platform git auto-deploy so GitHub Actions controls all deployments? [Y/n]"

**Vercel — `vercel.json`:**

```json
{
  "git": { "deploymentEnabled": false }
}
```

**Netlify — `netlify.toml`:**

```toml
[build]
  stopBuilds = true
```

### None (CI Checks Only)

If "None" selected: generate only `ci.yml`. Skip `deploy.yml` and `release.yml`.

After setup, show:

```
CI/CD setup complete.
  PRs → CI checks (gate merge)
  No deployment configured. Add deploy target later by re-running /git-auto-init.
```

### Rollbacks

All modes support rollback via `workflow_dispatch`:

```
GitHub UI → Actions → release.yml → Run workflow
  Tag: v1.0.0          ← previous known-good version
  Environment: production
  → [Run workflow]
```

Re-deploys the tagged version without creating new tags or commits.

### Summary Output

After CI/CD setup, show what was configured:

**Trunk-based example:**

```
CI/CD setup complete.
  PRs to main         → CI checks (gate merge)
  Push to main        → auto-deploy to staging
  Tag v*              → deploy to production (after approval)
  Manual trigger      → deploy any version via GitHub Actions UI
```

**Gitflow example:**

```
CI/CD setup complete.
  PRs to develop      → CI checks (gate merge)
  Push to develop     → auto-deploy to dev environment
  Push to release/*   → auto-deploy to staging
  Tag v*              → deploy to production (after approval)
  Manual trigger      → deploy any version via GitHub Actions UI
```

List required GitHub Secrets the user must set in repo Settings → Secrets.

---

## Safety

- Never install without asking
- Each missing tool is a separate confirmation
- Idempotent — safe to re-run at any time
- If all tools already configured: "All tools configured. Nothing to do." — stop
