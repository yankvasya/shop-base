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
server/      Nitro server routes — currently just the Customer Account API's OAuth
             flow and the account/orders endpoints it backs. Everything else in this
             app talks to Shopify's Storefront API directly (client-side/SSR, no
             server route needed); this is the one integration that has to be
             server-only, since it holds the session cookie (PKCE code verifier during
             login, then the access/refresh tokens) that must never reach client-side JS.
widgets/     Large independent UI blocks: Header, ProductGrid, CartDrawer, Footer.
features/    User scenarios: add-to-cart, product-filter, product-sort, product-search,
             checkout-form, customer-auth.
entities/    Business entities (product, cart, order, customer) — each owns its types,
             Zod schemas, GraphQL queries/mutations, and API functions. Components
             NEVER call the Storefront/Customer Account APIs directly; they always go
             through entities/*/api.
shared/      UI kit (shared/ui, vendored shadcn-vue components), the Shopify API
             clients (shared/api/shopify, shared/api/shopify-customer), generic
             utilities, and common types.
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

## Deployment

Deployed as a standard Nuxt SSR app — no framework-specific glue code needed. On **Vercel**:

1. Import the GitHub repo as a new Vercel project. Vercel detects Nuxt automatically and
   sets the right build command/output — no `vercel.json` or nitro preset override needed.
2. In the project's **Environment Variables** settings, add the same three variables from
   `.env.example` (`NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NUXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`,
   `NUXT_PUBLIC_SHOPIFY_API_VERSION`).
3. Deploy. `@nuxt/image`'s `cdn.shopify.com` domain allowlist (`nuxt.config.ts` → `image.domains`)
   already covers Shopify-hosted product images.

Other Nitro-supported targets (Netlify, Cloudflare Pages, a plain Node server via
`pnpm build && node .output/server/index.mjs`) work the same way — set the same three env
vars, no other platform-specific config required.

## Customer accounts (order history)

Logging in and viewing order history goes through Shopify's **Customer Account API** —
a separate OAuth 2.0 flow from the Storefront API, with its own credentials. Shopify
requires an **HTTPS** callback URL (no `localhost`/`http`), so this needs a deployed
URL (or a tunnel like ngrok) before you can test it — it won't work against plain
`pnpm dev` on its own.

**Setup, in the Shopify admin:**

1. **Settings → Customer accounts** → enable "Customer accounts"
2. Under the **Customer Account API credentials** section of that same page, check the
   **client type** — as of writing, Shopify only offers **public clients** for headless
   storefronts here (no client secret), so this app authenticates with **PKCE**
   (RFC 7636) instead of a confidential-client secret. If you ever see a confidential
   client type offered instead, the code here would need a small change back to
   secret-based token exchange.
3. Register the **callback URL**: `<NUXT_PUBLIC_SITE_URL>/api/auth/callback`
4. Copy the **client ID**

**Env vars** (see `.env.example`):

```
NUXT_PUBLIC_SITE_URL=https://your-deployed-domain.example.com
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=...
NUXT_SESSION_PASSWORD=...   # 32+ random chars, e.g. `openssl rand -base64 32`
```

**How it works:** `server/api/auth/login` generates a PKCE code verifier (stashed in
the session cookie) and its SHA-256 challenge, then redirects to Shopify's
authorization endpoint (discovered from the shop's `.well-known/openid-configuration`,
not hardcoded) with that challenge and a CSRF `state`. `server/api/auth/callback`
validates `state`, exchanges the code plus the stashed verifier for tokens
(`shared/api/shopify-customer/pkce.ts`, `token.ts`), and stores them in a sealed
httpOnly session cookie (`server/utils/customer-session.ts`, via h3's `useSession`) —
the tokens never reach client-side JS. `entities/customer` and `entities/order` call
the Customer Account API's GraphQL endpoint (also discovered, from
`.well-known/customer-account-api`) using that session's access token, proxied
through `server/api/account/*` routes.

**Caveat:** the OAuth mechanics (discovery, PKCE, token exchange/refresh, session
handling) are implemented against Shopify's documented endpoint behavior, but the
`Customer`/`Order`/`LineItem` field selections in `entities/customer` and
`entities/order` haven't been exercised against a live store yet — that needs the
setup above done first. Expect the same kind of small fixes we hit getting the
Storefront API right (wrong field name, unsupported argument) on the first real login.

## E2E tests (Playwright)

`e2e/` holds smoke tests that run against a real Nuxt dev server with no
mocking — catalog browsing, filters/sort, PDP + add-to-cart, cart drawer
quantity/remove, the checkout redirect, search, and the SEO routes
(`/sitemap.xml`, `/robots.txt`, `/ru`). They hit the same live Shopify store
as `pnpm dev`, so they need the same `.env` as local development (at minimum
`NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NUXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`,
`NUXT_SESSION_PASSWORD` — the last one because `AuthMenu` calls
`/api/auth/session` on every page load, which needs a session secret to boot
even if you never log in).

Run locally:

```bash
pnpm exec playwright install --with-deps chromium  # once
pnpm test:e2e
```

`playwright.config.ts` boots `pnpm dev` for you and waits for it to be ready
(`webServer`), so you don't need a server already running unless you want to
reuse one (`reuseExistingServer` is on outside of CI).

These are **not** part of the required `ci.yml` pipeline — every run adds
real carts/checkouts to the live store, and CI would need the store
credentials as secrets, which not everyone forking this repo will have. They
run instead in a separate `.github/workflows/e2e.yml`, triggered manually
(`workflow_dispatch`) or on a weekly schedule, gated behind these repo
secrets: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`,
`NUXT_SESSION_PASSWORD`.

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
| `pnpm test:e2e`                              | Playwright smoke tests against a real dev server (see "E2E tests" above)              |
| `pnpm codegen`                               | Regenerate `shared/types/storefront.generated.ts` from the live Storefront API schema |

## What's implemented

- Product catalog with SSR, cursor-based pagination (`useAsyncData` + "load more"),
  filters (in-stock, product type, tag, price range) and sort — all synced to the
  URL query string
- Product detail page: clickable image gallery, option (color/size) selection,
  availability-aware add-to-cart
- Cart: Pinia store, cart id persisted to `localStorage` via VueUse, optimistic UI
  on add (the line appears immediately, then reconciles with the server response —
  or rolls back on failure)
- Discount codes: apply/remove in the cart drawer (`cartDiscountCodesUpdate`), with
  per-code applicability shown (Shopify still returns an invalid code, just marked
  `applicable: false`, rather than erroring). `cost.subtotalAmount` already reflects
  any applied discount at the cart stage (verified live), so the subtotal shown is
  simply the discounted price — no separate "before/after" total to compute
- Checkout: redirects to Shopify's hosted checkout (`cart.checkoutUrl`) — this app
  never touches payment data
- Search page (Storefront `search` query)
- Product recommendations ("You may also like") on the PDP, via the Storefront API's
  ML-based `productRecommendations(productHandle:, intent: RELATED)` — a plain list,
  not paginated. Purely supplementary: a failed fetch or a product with no
  recommendations just means the section doesn't render, never an error on the page
- Multi-currency (Shopify Markets): a currency switcher in the header sets a
  `@inContext(country:)` on every product/search/recommendations query, so prices
  and currency symbols reflect the selected market end to end. A cart's currency
  is fixed at creation (`@inContext` only needed on `cartCreate`, verified live —
  a cart re-queried later with no context at all still reports the currency it was
  created in), so switching markets doesn't change an existing cart's prices, only
  new ones. Selection persists in a cookie (`entities/market`, shared by SSR and CSR)
- Customer login (Customer Account API, OAuth 2.0) and order history at `/account` —
  see the "Customer accounts" section above for setup and its current caveat
- i18n: English + Russian (`i18n/locales/`), locale-prefixed routes
- SEO: per-page title/description/Open Graph tags, `Product` JSON-LD structured
  data on the PDP, `hreflang` alternates for both locales, a dynamic
  `/sitemap.xml` covering every product handle, and `/robots.txt`
- Every Storefront API response is validated with Zod at the `shared/api/shopify`
  boundary before it reaches application code
- Loading/error states on every async call (catalog, PDP, search)
- Tests: `entities/product` (Zod schemas, variant selection), `entities/cart`
  (Pinia store — optimistic add, rollback on failure, quantity/remove), the
  `add-to-cart` feature composable, and the filter query-string builder
- E2E smoke tests (Playwright) against a real dev server — see "E2E tests" above

## Not yet implemented

- shadcn-vue components were installed as-is (unstyled beyond the default theme) —
  visual customization is a follow-up
- Customer profile editing / address book (read-only profile + order history only)
- Order detail lookup (`order(id:)`) is unverified against the live schema — see the
  "Customer accounts" caveat above

## Known environment quirk

`eslint-flat-config-utils@3.x` (a transitive dep of `@nuxt/eslint`) calls
`Object.groupBy`, which doesn't exist before Node 21. If you're on Node 20.19.x
(officially still supported by ESLint 10), lint will crash with
`Object.groupBy is not a function`. `package.json` pins it back to `2.1.4` via a
`pnpm.overrides` entry to work around this — remove the override once you're on
Node 22+ or upstream fixes it.
