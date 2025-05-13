// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const rxjs = require('@smarttools/eslint-plugin-rxjs');
const typescriptEslintParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const a11y = require('eslint-plugin-jsx-a11y');

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    plugins: {
      rxjs,
      prettier,
      'jsx-a11y': a11y
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // General Best Practices
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { 'allow': ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['warn'],
      'no-magic-numbers': ['warn', { ignore: [0, 1, -1], enforceConst: true }],
      complexity: ['warn', 10],
      'max-lines-per-function': ['warn', { max: 50, skipComments: true }],
      'max-params': ['warn', 4],
      'max-depth': ['warn', 3],

      // RxJS Rules
      'rxjs/no-nested-subscribe': 'error',
      'rxjs/no-ignored-observable': 'off',
      'rxjs/no-ignored-subscription': 'off',
      'rxjs/no-subject-unsubscribe': 'error',
      'rxjs/no-unsafe-subject-next': 'error',
      'rxjs/finnish': ['error', {
        functions: false,
        methods: true,
        names: {
          '^canActivate$': false,
        },
        types: {
          '^EventEmitter$': false
        }
      }],
      // 'rxjs/prefer-angular-async-pipe': 'warn',
      // 'rxjs-prefer-angular-takeuntil': ['error', { alias: ['untilDestroyed'] }],
      // 'rxjs-angular/no-lifecycle-method-disposal': 'error',

      // Angular-Specific
      '@angular-eslint/no-empty-lifecycle-method': 'warn',
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component'] }],
      '@angular-eslint/directive-class-suffix': ['error', { suffixes: ['Directive'] }],
      '@angular-eslint/use-lifecycle-interface': 'warn',
      '@angular-eslint/use-component-view-encapsulation': 'warn',

      // Prettier
      'prettier/prettier': 'error',

      // Accessibility
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
