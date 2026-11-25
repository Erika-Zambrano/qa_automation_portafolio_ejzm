import js from '@eslint/js';
import globals from 'globals';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';
import expectStyle from './eslint-rules/expect-style.mjs';

const TITLE_VERBS = 'validate|create|navigate|display|switch';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'web/**', 'docs/**', 'perf/**', '**/dist/**', '.vercel/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    files: ['scripts/**', 'evals/**', 'api/**'],
    rules: { 'no-console': 'off' },
  },

  {
    files: ['tests/**', 'pages/**', 'utils/**'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': ['error', { assertFunctionNames: ['expect', 'expectError', 'expectFieldError', 'expectOk'] }],
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': ['error', { allowConditional: true }],
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/valid-title': 'error',
    },
  },

  {
    files: ['tests/playground-api/**'],
    rules: {
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
    },
  },

  {
    files: ['tests/ui/**'],
    plugins: { local: { rules: { 'expect-style': expectStyle } } },
    rules: {
      'local/expect-style': 'error',
      'playwright/prefer-locator': 'off',
      'playwright/valid-title': [
        'error',
        {
          mustMatch: { test: [`^Should (${TITLE_VERBS}) .+`, 'Test titles must start with "Should" followed by validate, create, navigate, display or switch'] },
          disallowedWords: ['test', 'should work', 'works'],
        },
      ],
    },
  },
);
