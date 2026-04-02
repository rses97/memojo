import { createRequire } from 'module'
import withNuxt from './.nuxt/eslint.config.mjs'

// Resolve TypeScript ESLint packages via the nuxt eslint-config package
// (transitive deps, not directly installed at project root)
const _require = createRequire(
  new URL(
    '../node_modules/.pnpm/@nuxt+eslint-config@1.15.2_@typescript-eslint+utils@8.58.0_eslint@10.1.0_jiti@2.6.1__ty_16f99a5a240b9545e5004fbdca62743c/node_modules/@nuxt/eslint-config/dist/flat.mjs',
    import.meta.url,
  ),
)
const tsPlugin = _require('@typescript-eslint/eslint-plugin')
const tsParser = _require('@typescript-eslint/parser')

export default withNuxt(
  // Provide TypeScript parser for Vue SFCs
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
)
  .prepend({
    name: 'app/global-ignores',
    ignores: ['.nuxt/', '.output/', 'node_modules/', 'dist/', 'public/', '.vercel/'],
  })
  .append({
    name: 'app/custom-rules',
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Align with Prettier: allow self-closing void elements (<img />)
      'vue/html-self-closing': ['warn', { html: { void: 'always' } }],
    },
  })
