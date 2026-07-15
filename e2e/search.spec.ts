import { test, expect } from '@playwright/test'
import { goto } from './utils'

test.describe('search', () => {
  test('searching for a real product term shows a result or a graceful empty state', async ({ page }) => {
    await goto(page, '/')
    const firstTitle = (await page.locator('a[href^="/products/"] p').first().textContent())?.trim()
    test.skip(!firstTitle, 'no catalog products to derive a search term from')

    const term = firstTitle!.split(/\s+/)[0]

    await page.getByPlaceholder('Search products...').fill(term)
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page).toHaveURL(new RegExp(`/search\\?q=${encodeURIComponent(term)}`))
    // A client-side nav to a page with its own `useAsyncData` fetch keeps
    // the previous page mounted (Suspense) until that fetch resolves — the
    // URL updates well before the Search heading actually appears.
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Search', level: 1 })).toBeVisible()

    const resultCount = await page.locator('a[href^="/products/"]').count()
    const noResultsVisible = await page
      .getByText(/No results for/)
      .isVisible()
      .catch(() => false)
    expect(resultCount > 0 || noResultsVisible).toBeTruthy()
  })
})
