import type { Page } from '@playwright/test'

/**
 * Navigates and waits for hydration. In `pnpm dev` (unminified, unbundled),
 * client-side Vue listeners attach noticeably after first paint — an
 * interaction fired before that point (e.g. clicking a Reka Select trigger)
 * lands on a real but still inert DOM node and silently no-ops. Production
 * builds hydrate fast enough that this isn't an issue, but these tests
 * always run against the dev server (see README's "E2E tests" section), so
 * every navigation needs this before the first interaction.
 */
export async function goto(page: Page, path = '/') {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

/**
 * Opens the first product from the catalog grid and lands on its PDP.
 *
 * `waitForURL` alone isn't enough here: it resolves as soon as the client
 * router updates the address bar, which for a client-side nav happens
 * before the PDP's `useAsyncData` product fetch resolves — Nuxt keeps the
 * previous page's DOM mounted until then, so a same-tick assertion (e.g. an
 * unscoped `h1` check) can pass against the *old* page instead of the new
 * one. Waiting for the network to go idle covers the in-flight GraphQL
 * request too.
 */
export async function goToFirstProduct(page: Page) {
  await goto(page, '/')
  await page.locator('a[href^="/products/"]').first().click()
  await page.waitForURL(/\/products\//)
  await page.waitForLoadState('networkidle')
}

/**
 * Picks a value in every variant option Select on the PDP, if the product
 * has real variants (single-variant products skip the selector entirely —
 * see AddToCartForm.vue's `hasSelectableOptions`).
 */
export async function selectFirstAvailableVariant(page: Page) {
  const selects = page.getByTestId('option-select')
  const count = await selects.count()
  for (let i = 0; i < count; i++) {
    await selects.nth(i).click()
    await page.getByRole('option').first().click()
  }
}
