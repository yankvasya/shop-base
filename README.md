# ShopBase

A headless e-commerce storefront built on **Nuxt 4** against the **Shopify Storefront API** (GraphQL). Built as a
portfolio/demo project — the architecture and patterns here are meant to be a realistic starting point for a real
Shopify headless build, not a toy.

## Stack

- **Nuxt 4** / Vue 3 (Composition API, `<script setup>`), TypeScript strict mode
- **Pinia** — cart state, persisted client-side
- **VueUse** — `useStorage` for cart persistence, etc.
- **shadcn-vue + Tailwind CSS v4** — UI kit, used as-is (vendored into `shared/ui`)
- **Zod** — runtime validation of every Storefront API response, form/URL input parsing
- **@shopify/storefront-api-client** — GraphQL client for the Storefront API
- **@graphql-codegen** — generates TypeScript types from the live Storefront API schema
- **Vitest + Vue Testing Library** — unit tests
- **ESLint (flat config, via @nuxt/eslint) + Prettier**

## Architecture: Feature-Sliced Design

```
app/         Nuxt's own directory: app.vue, plugins, middleware, layouts, pages.
             This is the FSD "app" layer (init, providers, routing) — Nuxt requires
             pages/ to live here for file-based routing, so it's nested rather than
             top-level, unlike the other FSD layers below.
widgets/     Large independent UI blocks: Header, ProductGrid, CartDrawer, Footer.
features/    User scenarios: add-to-cart, product-filter, product-sort, product-search,
             checkout-form.
entities/    Business entities (product, cart, order) — each owns its types, Zod
             schemas, GraphQL queries/mutations, and API functions. Components NEVER
             call the Storefront API directly; they always go through entities/*/api.
shared/      UI kit (shared/ui, vendored shadcn-vue components), the Shopify API
             client (shared/api/shopify), generic utilities, and common types.
```

`widgets/`, `features/`, `entities/`, and `shared/` live at the **project root**, as
siblings of `app/` — not nested inside it. This is deliberate: Nuxt's `srcDir`
defaults to `app/`, which is where Nuxt's own conventions (pages, layouts, plugins)
have to live, but the FSD layers are project-wide concerns and shouldn't be forced
under Nuxt's directory. They're wired in via:

- `alias` in `nuxt.config.ts` (`@shared`, `@entities`, `@features`, `@widgets`) for imports
- `components` in `nuxt.config.ts` so `shared/ui/*` and `widgets/*` auto-import as components
- `@source` directives in `app/assets/css/main.css`, because Tailwind v4's automatic
  content detection only scans Nuxt's Vite root (`app/`) and would otherwise miss
  everything outside it
- `paths` in `tsconfig.json`, duplicating the `nuxt.config.ts` aliases — Nuxt's own
  generated tsconfig already resolves these correctly, but static tools that read
  `tsconfig.json` directly (like the shadcn-vue CLI) need it declared there too
- `dir.shared` in `nuxt.config.ts`, pointed away from its default (`'shared'`).
  Nuxt reserves a top-level `shared/` directory for isomorphic app/Nitro code
  (aliased `#shared`) and externalizes it in the production server build with
  no Vue SFC compiler attached to that path. Since our FSD `shared/` layer holds
  actual `.vue` components (`shared/ui`), leaving Nuxt's default in place makes
  `nuxt build` fail with `RollupError: ... Expression expected` the moment it
  tries to bundle a component from `shared/ui`. Redirecting `dir.shared`
  frees the name up for FSD.

Within each entity/feature/widget, the public surface is exported from an `index.ts`
barrel — consumers import from `@entities/cart`, never from
`@entities/cart/model/cart.store` directly.

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a Shopify **Storefront API** access token (Settings → Apps and sales
   channels → Develop apps, or a Headless sales channel) and copy `.env.example`
   to `.env`:

   ```bash
   cp .env.example .env
   ```

   ```
   NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   NUXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-storefront-api-token
   NUXT_PUBLIC_SHOPIFY_API_VERSION=2025-10
   ```

   The Storefront API token is a **public/publishable** token — it's meant to be
   exposed client-side, unlike the Admin API. Never put an Admin API token here.

3. (Optional, but recommended) Generate TypeScript types from your store's live
   schema:

   ```bash
   pnpm codegen
   ```

4. Run the dev server:

   ```bash
   pnpm dev
   ```

Without a `.env`, the app still boots — every page fetch fails gracefully into the
error/retry state built into `ProductGrid` and the product/search pages, since every
async call is wrapped in `useAsyncData` with explicit loading/error handling.

## Scripts

| Script                                       | What it does                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`                                   | Start the Nuxt dev server                                                             |
| `pnpm build`                                 | Production build                                                                      |
| `pnpm generate`                              | Static/prerendered build                                                              |
| `pnpm typecheck`                             | `vue-tsc --noEmit`                                                                    |
| `pnpm lint` / `lint:fix`                     | ESLint                                                                                |
| `pnpm format` / `format:check`               | Prettier                                                                              |
| `pnpm test` / `test:watch` / `test:coverage` | Vitest                                                                                |
| `pnpm codegen`                               | Regenerate `shared/types/storefront.generated.ts` from the live Storefront API schema |

## What's implemented

- Product catalog with SSR, cursor-based pagination (`useAsyncData` + "load more"),
  in-stock filter and sort — all synced to the URL query string
- Product detail page: clickable image gallery, option (color/size) selection,
  availability-aware add-to-cart
- Cart: Pinia store, cart id persisted to `localStorage` via VueUse, optimistic UI
  on add (the line appears immediately, then reconciles with the server response —
  or rolls back on failure)
- Checkout: redirects to Shopify's hosted checkout (`cart.checkoutUrl`) — this app
  never touches payment data
- Search page (Storefront `search` query)
- i18n: English + Russian (`i18n/locales/`), locale-prefixed routes
- Every Storefront API response is validated with Zod at the `shared/api/shopify`
  boundary before it reaches application code
- Loading/error states on every async call (catalog, PDP, search)
- Tests: `entities/product` (Zod schemas, variant selection), `entities/cart`
  (Pinia store — optimistic add, rollback on failure, quantity/remove), and the
  `add-to-cart` feature composable

## Not yet implemented

- shadcn-vue components were installed as-is (unstyled beyond the default theme) —
  visual customization is a follow-up
- Product filters are limited to "in stock only"; Shopify's `products(query:)`
  search syntax supports a lot more (product type, tags, price range) and can be
  extended in `features/product-filter`
- No order history / account area (would need the separate Shopify Customer
  Account API / OAuth flow — out of scope for this MVP, see `entities/order`)

## Known environment quirk

`eslint-flat-config-utils@3.x` (a transitive dep of `@nuxt/eslint`) calls
`Object.groupBy`, which doesn't exist before Node 21. If you're on Node 20.19.x
(officially still supported by ESLint 10), lint will crash with
`Object.groupBy is not a function`. `package.json` pins it back to `2.1.4` via a
`pnpm.overrides` entry to work around this — remove the override once you're on
Node 22+ or upstream fixes it.
