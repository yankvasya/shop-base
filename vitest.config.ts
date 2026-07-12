import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['{entities,features,widgets,shared}/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['entities/**', 'features/**', 'widgets/**', 'shared/**'],
    },
  },
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '@entities': fileURLToPath(new URL('./entities', import.meta.url)),
      '@features': fileURLToPath(new URL('./features', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./widgets', import.meta.url)),
    },
  },
})
