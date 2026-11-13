import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/reports/**', '**/playwright-report/**', '**/test-results/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      'no-console': 'off',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['test-scripts/scripts/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/expect-expect': ['error', { assertFunctionNames: ['expect'] }],
    },
  },
  {
    files: ['test-scripts/src/**/*.ts'],
    plugins: playwright.configs['flat/recommended'].plugins,
    rules: {
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
    },
  },
  prettier,
);
