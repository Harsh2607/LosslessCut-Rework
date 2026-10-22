/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'warn',
      comment: 'Warn about circular dependencies in modules',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-main-to-renderer',
      severity: 'error',
      comment: 'Main process code must not depend on UI renderer components',
      from: {
        path: '^src/main',
      },
      to: {
        path: '^src/renderer',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    includeOnly: '^src',
  },
};
