import { test, expect } from '@playwright/test'
import { goToFirstProduct, selectFirstAvailableVariant } from './utils'

test.describe('cart drawer', () => {
  test('quantity and remove controls update the cart', async ({ page }) => {
    await goToFirstProduct(page)
    await selectFirstAvailableVariant(page)
    await page.getByTestId('add-to-cart-button').click()
    await expect(page.getByText('Added to cart')).toBeVisible()

    await page.getByTestId('cart-trigger').click()
    const line = page.getByTestId('cart-line')
    await expect(line).toBeVisible()
    await expect(page.getByTestId('cart-line-quantity')).toHaveText('1')

    await page.getByTestId('cart-line-increment').click()
    await expect(page.getByTestId('cart-line-quantity')).toHaveText('2')
    await expect(page.getByTestId('cart-count')).toHaveText('2')

    await page.getByTestId('cart-line-decrement').click()
    await expect(page.getByTestId('cart-line-quantity')).toHaveText('1')

    await expect(page.getByTestId('cart-subtotal')).toBeVisible()

    await page.getByTestId('cart-line-remove').click()
    await expect(line).not.toBeVisible()
    await expect(page.getByText('Your cart is empty')).toBeVisible()
  })
})
