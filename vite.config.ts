import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'my-lib/jsx-runtime': resolve(__dirname, './jsx/index.ts'),
      'my-lib/jsx-dev-runtime': resolve(__dirname, './jsx/index.ts'),
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'my-lib',
  },
  test: {
    environment: 'jsdom',
  },
});
