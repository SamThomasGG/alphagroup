/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium'
        }
      ]
    },
    setupFiles: ['./src/test/setup.browser.ts'],
    include: ['src/**/*.browser.{test,spec}.{js,jsx,ts,tsx}']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});