import { test, expect } from '@playwright/test'
import { goToFirstProduct, selectFirstAvailableVariant } from './utils'

test.describe('product detail page', () => {
  test('shows product info and adds it to the cart', async ({ page }) => {
    await goToFirstProduct(page)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await selectFirstAvailableVariant(page)

    const addButton = page.getByTestId('add-to-cart-button')
    await expect(addButton).toBeEnabled()
    await addButton.click()

    await expect(page.getByText('Added to cart')).toBeVisible()
    await expect(page.getByTestId('cart-count')).toHaveText('1')
  })
})
