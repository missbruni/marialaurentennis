import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.tsx'],
    css: true,
    exclude: ['tests/e2e/**/*', '**/*.e2e.*', 'node_modules', 'dist']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
