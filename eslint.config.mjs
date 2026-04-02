// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const tsParser = require('@typescript-eslint/parser')

export default withNuxt({
  files: ['**/*.vue'],
  languageOptions: {
    parserOptions: {
      parser: tsParser,
    },
  },
})
