module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  // add your custom rules here
  ignorePatterns: ['api'],
  rules: {
    'no-unused-vars': 'off',
    semi: 'off',
    'prefer-const': 'off',
    'no-console': 'warn',
    'space-before-function-paren': ['error', 'never'],
    'spaced-comment': 'off',
    'no-trailing-spaces': 'warn',
    'vue/singleline-html-element-content-new': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off'
  }
}
