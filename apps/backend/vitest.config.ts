import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.d.ts',
        'src/main.ts',
        'src/prisma/seed.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});