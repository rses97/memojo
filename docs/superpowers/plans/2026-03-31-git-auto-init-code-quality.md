# git-auto-init Code Quality Extension — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the `git-auto-init` skill to detect and configure ESLint, Prettier, and TypeScript for Nuxt, Vue, and plain TypeScript projects.

**Architecture:** Single-file edit to `SKILL.md`. New sections are inserted into Phase 1 (before existing git tooling sections). The CI workflow templates in Phase 2 get updated placeholder resolution rules. The lint-staged section is rewritten to adapt based on installed code quality tools.

**Tech Stack:** Markdown skill file, ESLint flat config (`eslint.config.ts`), Prettier, TypeScript, @stylistic/eslint-plugin

**Spec:** `docs/superpowers/specs/2026-03-31-git-auto-init-code-quality-design.md`

---

## File Map

- Modify: `/.claude/skills/git-auto-init/SKILL.md` — the only file changed

Sections affected (by line ranges in current file):
- Lines 1-4: Frontmatter (update description)
- Lines 10-15: When to Use (add bullets)
- Lines 19: Phase 1 heading (rename)
- Lines 25-33: Detection table (add rows)
- Lines 37-47: Status display (add rows)
- Lines 51-62: Package Manager Detection (unchanged, insert new section after)
- Lines 64-66: Installation intro (unchanged)
- Lines 68-81: commitlint (unchanged, but moved down — new sections inserted before)
- Lines 103-120: lint-staged (rewritten)
- Lines 257-286: CI workflow templates (add resolution rules and `{format-check-cmd}`)

---

### Task 1: Update frontmatter and "When to Use"

**Files:**
- Modify: `/.claude/skills/git-auto-init/SKILL.md:1-15`

- [ ] **Step 1: Update frontmatter description**

Change line 3 from:
```
description: Use when setting up a new project's git tooling, CI/CD pipelines, or when checking what dev tooling is missing — commitlint, husky, lint-staged, semantic-release, GitHub Actions workflows
```
to:
```
description: Use when setting up a new project's git tooling, code quality tools, CI/CD pipelines, or when checking what dev tooling is missing — ESLint, Prettier, TypeScript, commitlint, husky, lint-staged, semantic-release, GitHub Actions workflows
```

- [ ] **Step 2: Update summary line**

Change line 8 from:
```
One-time project setup. Detect what's installed, offer to set up what's missing. Includes CI/CD pipeline generation.
```
to:
```
One-time project setup. Detect what's installed, offer to set up what's missing. Includes code quality tools and CI/CD pipeline generation.
```

- [ ] **Step 3: Update "When to Use" bullets**

Change lines 12-13 from:
```markdown
- New project needs git tooling (commitlint, husky, lint-staged, semantic-release)
- Project missing CI/CD workflows
```
to:
```markdown
- New project needs code quality tools (ESLint, Prettier, TypeScript)
- New project needs git tooling (commitlint, husky, lint-staged, semantic-release)
- Project missing CI/CD workflows
```

- [ ] **Step 4: Update Phase 1 heading**

Change line 19 from:
```markdown
## Phase 1: Git & Tooling
```
to:
```markdown
## Phase 1: Code Quality & Git Tooling
```

- [ ] **Step 5: Verify changes**

Read lines 1-20 of the file to confirm all four edits are correct.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): update git-auto-init frontmatter and headings for code quality tools"
```

---

### Task 2: Expand detection table and status display

**Files:**
- Modify: `/.claude/skills/git-auto-init/SKILL.md:25-47`

- [ ] **Step 1: Add new rows to detection table**

Replace the detection table (lines 25-33) with:

```markdown
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
```

- [ ] **Step 2: Update status display example**

Replace the status display block (lines 37-47) with:

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

- [ ] **Step 3: Verify changes**

Read lines 23-50 to confirm table and status display are correct.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): expand detection table with TypeScript, ESLint, Prettier"
```

---

### Task 3: Add Framework Detection section

**Files:**
- Modify: `/.claude/skills/git-auto-init/SKILL.md` — insert after Package Manager Detection section (after line 62)

- [ ] **Step 1: Insert Framework Detection section**

After the line `Use `{pm-exec}` for exec (`pnpm exec`, `npx`, `yarn`).` (end of Package Manager Detection), insert:

```markdown

### Framework Detection

Detect project type from `dependencies`/`devDependencies` in `package.json`:

| Check | Framework |
|---|---|
| `nuxt` in dependencies | Nuxt |
| `vue` in dependencies (no nuxt) | Vue |
| Neither | Plain TypeScript |

Display: `Detected framework: {Nuxt|Vue|Plain TypeScript}`

This drives ESLint package selection and typecheck command.
```

- [ ] **Step 2: Verify changes**

Read the section to confirm it appears between Package Manager Detection and Installation.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): add framework detection section for ESLint config selection"
```

---

### Task 4: Add TypeScript installation section

**Files:**
- Modify: `/.claude/skills/git-auto-init/SKILL.md` — insert after the Installation intro line ("For each missing tool, ask separately...") and before the commitlint section

- [ ] **Step 1: Insert TypeScript section**

After the line `For each missing tool, ask separately before installing. Never batch-install without confirmation.`, insert:

```markdown

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
```

- [ ] **Step 2: Verify changes**

Read the Installation section to confirm TypeScript appears before commitlint.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): add TypeScript installation section"
```

---

### Task 5: Add Code Quality Menu and ESLint section

**Files:**
- Modify: `/.claude/skills/git-auto-init/SKILL.md` — insert after TypeScript section, before commitlint section

- [ ] **Step 1: Insert Code Quality Menu**

After the TypeScript section (added in Task 4), insert:

````markdown

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
````

- [ ] **Step 2: Verify changes**

Read the ESLint section to confirm all three framework variants are present with both stylistic/non-stylistic configs.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): add code quality menu and ESLint section with framework-specific configs"
```

---

### Task 6: Add Prettier section

**Files:**
- Modify: `/.claude/skills/git-auto-init/SKILL.md` — insert after ESLint section, before commitlint section

- [ ] **Step 1: Insert Prettier section**

After the ESLint section (added in Task 5), insert:

````markdown

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
````

- [ ] **Step 2: Verify changes**

Read the Prettier section to confirm all three presets are shown.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): add Prettier section with style presets"
```

---

### Task 7: Rewrite lint-staged section

**Files:**
- Modify: `/.claude/skills/git-auto-init/SKILL.md` — replace the existing lint-staged section

- [ ] **Step 1: Replace lint-staged section**

Find and replace the existing lint-staged section:

```markdown
**lint-staged:**

Ask: "Install lint-staged? [Y/n]"

```bash
{pm} add -D lint-staged
```

Add to `package.json` (adapt patterns to project's actual linter/formatter):

```json
{
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix"],
    "*.{ts,vue,css,md}": ["prettier --write"]
  }
}
```
```

Replace with:

````markdown
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
````

- [ ] **Step 2: Verify changes**

Read the lint-staged section to confirm all four variants are present.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): rewrite lint-staged section to adapt based on installed code quality tools"
```

---

### Task 8: Update CI workflow templates

**Files:**
- Modify: `/.claude/skills/git-auto-init/SKILL.md` — update the ci.yml section in Phase 2

- [ ] **Step 1: Add placeholder resolution rules**

Find the line:
```
Resolve `{detected-pm}`, `{install-cmd}`, `{lint-cmd}`, `{typecheck-cmd}`, `{test-cmd}`, `{build-cmd}` from the project's detected package manager and `package.json` scripts.
```

Replace with:

```markdown
Resolve placeholders from the project's detected package manager and `package.json` scripts. Include `{format-check-cmd}` if Prettier is installed. Omit steps for tools that are not installed.

**Placeholder resolution:**

| Placeholder | Condition | Value |
|---|---|---|
| `{detected-pm}` | Always | Detected package manager name |
| `{install-cmd}` | Always | `{pm} install --frozen-lockfile` |
| `{lint-cmd}` | ESLint installed | `{pm} run lint` |
| `{format-check-cmd}` | Prettier installed | `{pm} run format:check` |
| `{typecheck-cmd}` | TypeScript installed | `{pm} run typecheck` |
| `{test-cmd}` | test:run script exists | `{pm} run test:run` |
| `{build-cmd}` | Always | `{pm} run build` |

If a tool is not installed, omit the corresponding `- run:` step entirely.
```

- [ ] **Step 2: Update Trunk-based ci.yml template**

Find the Trunk-based ci.yml template and replace its steps with:

```yaml
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: '{detected-pm}'
      - run: {install-cmd}
      - run: {lint-cmd}
      - run: {format-check-cmd}
      - run: {typecheck-cmd}
      - run: {test-cmd}
      - run: {build-cmd}
```

- [ ] **Step 3: Update Gitflow ci.yml template**

Apply the same step changes to the Gitflow ci.yml template (add `{format-check-cmd}` between `{lint-cmd}` and `{typecheck-cmd}`).

- [ ] **Step 4: Verify changes**

Read the CI workflow section to confirm both templates include `{format-check-cmd}` and the resolution table is present.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): update CI templates with format-check and placeholder resolution rules"
```

---

### Task 9: Final verification

**Files:**
- Read: `/.claude/skills/git-auto-init/SKILL.md` (full file)

- [ ] **Step 1: Read entire file end-to-end**

Read the full `SKILL.md` and verify:
1. Frontmatter description mentions ESLint, Prettier, TypeScript
2. Detection table has 10 rows (git, GitHub remote, TypeScript, ESLint, Prettier, commitlint, husky, lint-staged, semantic-release, CHANGELOG.md)
3. Status display has 11 lines (10 tools + CI/CD workflows)
4. Framework Detection section exists between Package Manager Detection and Installation
5. Installation order is: TypeScript → Code Quality Menu → ESLint → Prettier → commitlint → husky → lint-staged → semantic-release
6. ESLint has three framework variants (Nuxt, Vue, Plain TS), each with stylistic/non-stylistic configs
7. Prettier has three presets (Vue ecosystem, defaults, Airbnb-ish)
8. lint-staged has four variants (ESLint only, ESLint+Prettier, Prettier only, None)
9. CI templates include `{format-check-cmd}` placeholder and resolution table
10. No broken markdown formatting, unclosed code blocks, or orphaned sections

- [ ] **Step 2: Fix any issues found**

If any inconsistencies found in Step 1, fix them.

- [ ] **Step 3: Final commit (if fixes were made)**

```bash
git add .claude/skills/git-auto-init/SKILL.md
git commit -m "docs(skill): fix inconsistencies in git-auto-init code quality sections"
```
