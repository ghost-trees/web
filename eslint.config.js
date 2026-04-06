import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config([
  // Always ignore build/output and large static data
  globalIgnores(['dist', 'build', 'node_modules', 'public/data/**']),

  // ---- JavaScript files ----
  {
    files: ['**/*.{js,cjs,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
  },

  // ---- Node build scripts (override the above for scripts) ----
  {
    files: ['scripts/**/*.{js,cjs,mjs}', 'build-bill-index.mjs'],
    languageOptions: {
      // Allow Node globals like `process`, `__dirname`, etc.
      globals: { ...globals.node },
    },
  },

  // ---- TypeScript / React files ----
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Type-aware TypeScript rules
      ...tseslint.configs.recommendedTypeChecked,
      // Or stricter:
      // ...tseslint.configs.strictTypeChecked,
      // Optional stylistic:
      // ...tseslint.configs.stylisticTypeChecked,

      // React hooks & Vite fast-refresh
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { react },
    settings: { react: { version: 'detect' } },
    rules: {
      // React 17+ / JSX runtime
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-key': 'warn',
      'react/no-unknown-property': 'warn',
    },
    // If soft guard for extra-long lines is desired, enable:
    // rules: {
    //   'max-len': ['warn', { code: 100, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreComments: true }],
    // },
  },
  // Keep this LAST: disables ESLint rules that conflict with Prettier
  eslintConfigPrettier,
]);
