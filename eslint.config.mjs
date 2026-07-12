// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt(
  eslintConfigPrettier,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    // Vendored shadcn-vue components — kept as close to upstream as
    // possible so they stay easy to diff against future `shadcn-vue add`
    // output, rather than being edited to satisfy our lint rules.
    files: ['shared/ui/**'],
    rules: {
      'vue/require-default-prop': 'off',
    },
  },
)
