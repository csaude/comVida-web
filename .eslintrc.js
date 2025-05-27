/* eslint-env node */
module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
    es2021: true,
  },

  parser: 'vue-eslint-parser',

  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },

  plugins: ['vue', '@typescript-eslint'],

  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended'
    // 'plugin:prettier/recommended'
  ],

  rules: {
    // JavaScript / TypeScript
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-extra-semi': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-this-no-inferrable-types': 'off',
    

    // Vue 3 — all off
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'vue/html-indent': 'off',
    'vue/no-parsing-error': 'off',
    'vue/no-unused-components': 'off',
    'vue/no-unused-vars': 'off',
    'vue/comment-directive': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': 'off',
    'vue/valid-template-root': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/require-prop-types': 'off',
    'vue/no-mutating-props': 'off',
    'vue/no-template-shadow': 'off',
    'vue/multiline-html-element-content-newline': 'off',
  },


  ignorePatterns: ['node_modules/', 'dist/', 'android/', 'public/']
}
