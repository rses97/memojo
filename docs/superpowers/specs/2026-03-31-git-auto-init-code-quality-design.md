# git-auto-init: Code Quality Tools Extension

Add ESLint, Prettier, and TypeScript detection/setup to the existing `git-auto-init` skill, supporting Nuxt, Vue, and plain TypeScript projects.

## Motivation

The skill configures git hooks and CI/CD but has no support for code quality tooling. Projects end up with lint-staged running only `vitest related --run`, and CI workflows skip linting, formatting, and type-checking entirely.

## Decisions

| Decision               | Choice                                                             | Rationale                                                              |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| ESLint config strategy | Framework-specific official configs                                | Each ecosystem's official config gets best maintenance and integration |
| Formatting tool        | User choice (ESLint only / ESLint+Prettier / Prettier only / None) | Different teams have different preferences                             |
| ESLint-only formatting | Ask if user wants `@stylistic/eslint-plugin`                       | Some prefer formatting via ESLint, others want no formatting at all    |
| Rule strictness        | Ask (recommended vs strict)                                        | Recommended is safer default, but strict is better for new projects    |
| TypeScript             | Ask before installing                                              | Consistent with existing per-tool confirmation pattern                 |
| Prettier preset        | Ask, with Vue ecosystem defaults recommended                       | Let user pick style, but suggest what major projects use               |
| Skill scope            | Extend existing `git-auto-init`                                    | Single skill for all project init, avoid skill sprawl                  |
| Approach               | Extend detect-then-ask pattern (Approach A)                        | Consistent with existing skill, maximum user control                   |
| Installation order     | Code quality before git tooling                                    | lint-staged needs to know what ESLint/Prettier are installed           |

## File to Modify

`/.claude/skills/git-auto-init/SKILL.md`

## Design

### Detection Table (expanded)

Add three new rows to the existing detection table:

| Tool       | Check                                                     | Config file                         |
| ---------- | --------------------------------------------------------- | ----------------------------------- |
| TypeScript | `devDependencies` has `typescript`                        | --                                  |
| ESLint     | `devDependencies` has `eslint` + `eslint.config.*` exists | `eslint.config.ts`                  |
| Prettier   | `devDependencies` has `prettier` + config file exists     | `.prettierrc` / `prettier.config.*` |

Updated status display includes: `TypeScript`, `ESLint`, `Prettier` rows between GitHub remote and commitlint.

### Framework Detection (new section, after Package Manager Detection)

Detect project type from `dependencies`/`devDependencies`:

| Check                           | Framework        |
| ------------------------------- | ---------------- |
| `nuxt` in dependencies          | Nuxt             |
| `vue` in dependencies (no nuxt) | Vue              |
| Neither                         | Plain TypeScript |

Display: `Detected framework: {Nuxt|Vue|Plain TypeScript}`

Drives ESLint package selection and typecheck command.

### Installation Order (Phase 1)

New order within Phase 1:

1. Framework Detection (NEW)
2. TypeScript (NEW)
3. Code Quality Menu (NEW) -> ESLint (NEW) -> Prettier (NEW)
4. commitlint (existing)
5. husky (existing)
6. lint-staged (UPDATED)
7. semantic-release (existing)
8. Workflow Selection (existing)
9. CHANGELOG.md (existing)

### TypeScript Installation

Ask: `Install TypeScript? [Y/n]`

**Nuxt:**

```bash
{pm} add -D typescript vue-tsc
```

**Vue / Plain TypeScript:**

```bash
{pm} add -D typescript
```

Add `package.json` script:

- Nuxt: `"typecheck": "nuxi typecheck"`
- Vue / Plain TS: `"typecheck": "tsc --noEmit"`

### Code Quality Tools Menu

```
Code quality tools?
  1. ESLint only
  2. ESLint + Prettier
  3. Prettier only
  4. None -- skip
Choice:
```

### ESLint (if option 1 or 2)

**Sub-question -- strictness:**

```
ESLint rule strictness?
  1. Recommended -- catches real issues without noise (Recommended)
  2. Strict -- more opinionated, catches more issues
Choice:
```

**Sub-question -- if "ESLint only" (option 1):**

```
Include stylistic/formatting rules in ESLint?
  1. Yes -- enforce formatting via @stylistic/eslint-plugin
  2. No -- linting only, no formatting
Choice:
```

#### Nuxt ESLint

```bash
{pm} add -D @nuxt/eslint eslint
```

Add `@nuxt/eslint` to `modules` array in `nuxt.config.ts`.

Create `eslint.config.ts`:

```ts
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
// Your custom rules here
```

`@nuxt/eslint` bundles typescript-eslint, eslint-plugin-vue, and @stylistic. If user chose strict, configure via Nuxt module options in `nuxt.config.ts`.

#### Vue ESLint (non-Nuxt)

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
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  pluginVue.configs['flat/recommended'], // or 'flat/strongly-recommended' for strict
  vueTsConfigs.recommended, // or vueTsConfigs.strict
)
```

Create `eslint.config.ts` (with stylistic):

```ts
import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfigWithVueTs(
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  stylistic.configs['recommended-flat'],
)
```

#### Plain TypeScript ESLint

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
  tseslint.configs.recommended, // or .strict
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

#### All frameworks

Add scripts to `package.json`:

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

### Prettier (if option 2 or 3)

**Sub-question -- style preset:**

```
Prettier style preset?
  1. Vue ecosystem (no semi, single quotes, trailing commas) -- used by Vue, Nuxt, Vite (Recommended)
  2. Prettier defaults (semi, double quotes, trailing commas)
  3. Airbnb-ish (semi, single quotes, trailing commas)
Choice:
```

Install:

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
No `.prettierrc` file created -- use Prettier's built-in defaults.

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

No `eslint-config-prettier` or `eslint-plugin-prettier` needed -- modern ESLint configs don't include formatting rules that conflict with Prettier.

### lint-staged (updated)

Adapt config based on installed code quality tools:

**ESLint only (with or without stylistic):**

```json
"lint-staged": {
  "*.{ts,vue}": ["eslint --fix"]
}
```

**ESLint + Prettier:**

```json
"lint-staged": {
  "*.{ts,vue}": ["eslint --fix"],
  "*.{ts,vue,css,md,json}": ["prettier --write"]
}
```

**Prettier only:**

```json
"lint-staged": {
  "*.{ts,vue,css,md,json}": ["prettier --write"]
}
```

**None (no code quality tools):**
Fall back to test runner:

```json
"lint-staged": {
  "*.{ts,vue}": ["vitest related --run"]
}
```

Adapt glob patterns: use `*.{ts,vue}` for Nuxt/Vue, `*.ts` for plain TypeScript.

### CI Workflow Updates

Steps resolve based on what's installed. Omit steps for tools not installed:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: '22'
      cache: '{detected-pm}'
  - uses: pnpm/action-setup@v4 # if pnpm
    with:
      run_install: false
  - run: { install-cmd }
  - run: pnpm run lint # if ESLint
  - run: pnpm run format:check # if Prettier
  - run: pnpm run typecheck # if TypeScript
  - run: pnpm run test:run # if test script exists
  - run: pnpm run build
```

Resolution rules:

| Placeholder          | Condition              | Value                   |
| -------------------- | ---------------------- | ----------------------- |
| `{lint-cmd}`         | ESLint installed       | `{pm} run lint`         |
| `{format-check-cmd}` | Prettier installed     | `{pm} run format:check` |
| `{typecheck-cmd}`    | TypeScript installed   | `{pm} run typecheck`    |
| `{test-cmd}`         | test:run script exists | `{pm} run test:run`     |

### Skill Frontmatter Update

```yaml
description: Use when setting up a new project's git tooling, CI/CD pipelines, or code quality tools -- ESLint, Prettier, TypeScript, commitlint, husky, lint-staged, semantic-release, GitHub Actions workflows
```

## Scope Boundaries

**In scope:**

- TypeScript detection and devDependency install
- ESLint with framework-specific configs (Nuxt, Vue, plain TS)
- Prettier with style presets
- @stylistic/eslint-plugin as optional ESLint formatting
- Updated lint-staged configs
- Updated CI workflow step resolution

**Out of scope:**

- tsup (library-only bundler, not relevant for app init)
- @antfu/eslint-config (decided against -- using framework-specific official configs)
- eslint-config-prettier / eslint-plugin-prettier (not needed with modern configs)
- Custom ESLint rule authoring
- EditorConfig or `.vscode/settings.json` generation

## Verification

After implementation:

1. Read final `SKILL.md` end-to-end for consistency
2. Verify detection table covers all new tools (TypeScript, ESLint, Prettier)
3. Verify lint-staged adapts correctly for all 4 code quality choices
4. Verify CI templates include correct conditional steps
5. Verify framework detection drives correct ESLint packages for all 3 project types
6. Verify `eslint.config.ts` is used (not `.mjs`) for config creation
