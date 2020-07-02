module.exports = {
  extends: '@lucasecdb',
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-underscore-dangle': [
      1,
      { allow: ['_id', '__NAME__', '__WB_MANIFEST', '__APOLLO_STATE__'] },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'react/no-unescaped-entities': 'off',
  },
  settings: {
    react: {
      version: '16.8',
    },
  },
}