import { test, expect } from '@playwright/test'
import { goToFirstProduct, selectFirstAvailableVariant } from './utils'

test.describe('cart discount codes', () => {
  test('applying an invalid code shows it as not applicable, and it can be removed', async ({ page }) => {
    await goToFirstProduct(page)
    await selectFirstAvailableVariant(page)
    await page.getByTestId('add-to-cart-button').click()
    await expect(page.getByText('Added to cart')).toBeVisible()

    await page.getByTestId('cart-trigger').click()
    await page.getByTestId('discount-code-input').fill('TOTALLY_FAKE_CODE_XYZ')
    await page.getByTestId('discount-code-apply').click()

    const badge = page.getByTestId('discount-code-badge')
    await expect(badge).toContainText('TOTALLY_FAKE_CODE_XYZ')
    await expect(badge).toHaveAttribute('title', 'not valid for this cart')

    // An inapplicable code doesn't change what the customer owes.
    await expect(page.getByTestId('cart-total')).toHaveCount(0)

    await page.getByTestId('discount-code-remove').click()
    await expect(badge).toHaveCount(0)
  })
})
