import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/i18n', '@nuxt/image', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Feature-Sliced Design layers live at the project root, as siblings of
  // the Nuxt `app/` directory (srcDir). These aliases make them importable
  // from anywhere without relative path spaghetti.
  alias: {
    '@widgets': fileURLToPath(new URL('./widgets', import.meta.url)),
    '@features': fileURLToPath(new URL('./features', import.meta.url)),
    '@entities': fileURLToPath(new URL('./entities', import.meta.url)),
    '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
  },

  // Nuxt reserves a top-level `shared/` directory for isomorphic app/Nitro
  // code (aliased `#shared`) and externalizes it in the SSR/Nitro bundle
  // with no Vue SFC compiler wired in for that path. Our FSD `shared/`
  // layer holds actual .vue components (shared/ui), which collides with
  // that convention and breaks the production build. Point Nuxt's
  // built-in mechanism at an unused directory name to free up `shared/`
  // for FSD instead.
  dir: {
    shared: 'shared-isomorphic',
  },

  // Only the UI kit and widgets are globally registered as components —
  // entities/features are imported explicitly (via the aliases above) to
  // keep FSD's public-API-per-slice boundary intact instead of blurring
  // it with global auto-imports.
  components: [
    { path: '~/components', pathPrefix: false },
    { path: '~~/shared/ui', pathPrefix: false, extensions: ['vue'] },
    { path: '~~/widgets', pathPrefix: false, extensions: ['vue'] },
  ],

  image: {
    domains: ['cdn.shopify.com'],
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'ru', language: 'ru-RU', file: 'ru.json', name: 'Русский' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  runtimeConfig: {
    public: {
      shopify: {
        storeDomain: '',
        storefrontToken: '',
        apiVersion: '2025-01',
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },
})
