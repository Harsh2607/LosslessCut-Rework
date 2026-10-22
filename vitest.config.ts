import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // `tsc --build` compiles src/common (tests included) into common-ts-dist. Don't discover those
    // compiled copies, or every test in src/common would also run a second time from the build output.
    exclude: [...configDefaults.exclude, 'common-ts-dist/**', 'test/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json', 'html'],
      reportsDirectory: 'coverage',
      include: [
        'src/renderer/src/util/duration.ts',
        'src/renderer/src/util/metadata.ts',
        'src/renderer/src/util/rate-calculator.ts',
        'src/main/ffmpegUtil.ts',
        'src/main/httpServerUtil.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/__snapshots__/**',
        'src/renderer/src/generated/**',
        'src/renderer/src/test/fixtures/**',
      ],
    },
  },
});
