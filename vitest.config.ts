import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests-unit/setup.ts'],
    include: ['tests-unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Mock framer-motion so motion.* renders as plain elements
      'framer-motion': path.resolve(
        __dirname,
        './tests-unit/__mocks__/framer-motion.tsx'
      ),
    },
  },
});
