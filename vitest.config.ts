import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Use forks so tests that need process.chdir() (charter/history/archive
    // workdir setup) can run. Vitest's default worker_threads pool blocks
    // process.chdir().
    pool: 'forks',
  },
});
