import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': import.meta.dirname },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**'],
    restoreMocks: true,
    env: {
      // lib/db.ts runs on bun:sqlite, so tests must run under Bun (`bun run test`).
      DB_PATH: ':memory:',
      BETTER_AUTH_SECRET: 'test-secret-at-least-32-characters-long',
    },
  },
});
