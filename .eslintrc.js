module.exports = {
  'env': {
    'es6': true,
    'node': true
  },
  'extends': [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended'
  ],
  'parser': '@typescript-eslint/parser',
  'plugins': [
    '@typescript-eslint'
  ],
  'settings': {
    'import/resolver': {
      'node': {
        'extensions': ['.ts'],
        'moduleDirectory': ['node_modules', 'src/']
      }
    }
  },
  'rules': {
    'no-restricted-syntax': 0,
    'import/no-unresolved': 0,
    'use-isnan': 0,
    'max-classes-per-file': 0,
    'no-unused-vars': 0,
    'guard-for-in': 0,
    'prefer-destructuring': 0,
    'import/extensions': [0, 'ignorePackages'],
  }
};
