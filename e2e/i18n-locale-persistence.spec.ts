import { test, expect } from '@playwright/test'
import { goto } from './utils'

// Regression coverage for a real bug: several internal links/redirects
// (ProductCard, the header logo/nav, search) used raw string paths instead
// of the locale-aware `localePath()` helper, so any click from within the
// /ru/ locale silently dropped back to the unprefixed (English) route.
test.describe('i18n locale persistence', () => {
  test('clicking a product card from the RU catalog stays in the RU locale', async ({ page }) => {
    await goto(page, '/ru')

    const firstProduct = page.locator('a[href^="/ru/products/"]').first()
    await expect(firstProduct).toBeVisible()
    await firstProduct.click()

    await expect(page).toHaveURL(/\/ru\/products\//)
  })

  test('searching from the RU catalog stays in the RU locale', async ({ page }) => {
    await goto(page, '/ru')

    await page.getByPlaceholder('Поиск товаров...').fill('Snowboard')
    await page.getByRole('button', { name: 'Поиск' }).click()

    await expect(page).toHaveURL(/\/ru\/search\?q=Snowboard/)
  })

  test('the header logo and catalog nav link stay in the RU locale', async ({ page }) => {
    await goto(page, '/ru')

    await expect(page.getByRole('link', { name: 'ShopBase' })).toHaveAttribute('href', '/ru')
    await expect(page.getByRole('link', { name: 'Каталог' })).toHaveAttribute('href', '/ru')
  })
})
