import { test, expect } from '@playwright/test'
import { goToFirstProduct, selectFirstAvailableVariant } from './utils'

test.describe('checkout', () => {
  test('the checkout button redirects to Shopify-hosted checkout', async ({ page }) => {
    await goToFirstProduct(page)
    await selectFirstAvailableVariant(page)
    await page.getByTestId('add-to-cart-button').click()
    await expect(page.getByText('Added to cart')).toBeVisible()

    await page.getByTestId('cart-trigger').click()
    await page.getByTestId('checkout-button').click()

    // Checkout is fully delegated to Shopify's hosted page (see
    // features/checkout-form) — we only assert the browser actually leaves
    // this app for the store's domain, not that a purchase completes.
    await page.waitForURL((url) => url.hostname !== 'localhost', { timeout: 15_000 })
    expect(page.url()).not.toContain('localhost')
  })
})
