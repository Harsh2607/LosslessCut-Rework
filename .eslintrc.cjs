module.exports = {
  extends: ['mifi'],
  rules: {
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/interactive-supports-focus': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'react/no-unused-prop-types': 0,
    'react/jsx-props-no-spreading': 0,
    'func-call-spacing': 0,
    'no-void': ['error', { allowAsStatement: true }],
    'unicorn/number-literal-case': 0,
  },

  overrides: [
    {
      files: ['./src/renderer/**/*.{js,cjs,mjs,jsx,ts,tsx,mts}'],
      env: {
        node: false,
        browser: true,
      },
      rules: {
        'no-console': 0,
        'import/no-extraneous-dependencies': 0,
        'unicorn/prefer-global-this': 0,
      },
    },
    {
      files: ['./src/preload/**/*.{js,cjs,jsx,ts,tsx}'],
      env: {
        browser: true,
      },
      rules: {
        'no-console': 0,
        'import/no-extraneous-dependencies': 0,
        'unicorn/prefer-global-this': 0,
      },
    },
    {
      files: [
        './script/**/*.{js,cjs,mjs,jsx,ts,tsx,mts}',
        './website/**/*.{js,cjs,mjs,jsx,ts,tsx,mts}',
        './test/**/*.{js,cjs,mjs,jsx,ts,tsx,mts}',
        '**/*.test.{js,ts,tsx}',
        '**/*.spec.{js,ts,tsx}',
        'electron.vite.config.ts',
        'playwright.config.ts',
        'vitest.config.ts',
      ],
      rules: {
        'import/no-extraneous-dependencies': ['error', {
          devDependencies: true,
          optionalDependencies: false,
        }],
        'no-console': 0,
      },
    },
  ],
};
