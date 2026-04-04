// @ts-check
import { createRequire } from 'module'
import withNuxt from './.nuxt/eslint.config.mjs'

const require = createRequire(import.meta.url)

// Resolve TypeScript ESLint packages from node_modules
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')

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
      'vue/html-self-closing': ['warn', { html: { void: 'always' } }],
    },
  })
