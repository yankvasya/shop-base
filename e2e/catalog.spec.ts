import { test, expect } from '@playwright/test'
import { goto } from './utils'

test.describe('catalog', () => {
  test('loads products on the homepage', async ({ page }) => {
    await goto(page, '/')
    await expect(page.getByRole('heading', { name: 'Catalog', level: 1 })).toBeVisible()

    const productLinks = page.locator('a[href^="/products/"]')
    await expect(productLinks.first()).toBeVisible()
    expect(await productLinks.count()).toBeGreaterThan(0)
  })

  test('sorting updates the URL query', async ({ page }) => {
    await goto(page, '/')
    await page.getByTestId('sort-select').click()
    await page.getByRole('option', { name: 'Price: low to high' }).click()
    await expect(page).toHaveURL(/sort=price-asc/)
  })

  test('the in-stock-only filter updates the URL query and can be cleared', async ({ page }) => {
    await goto(page, '/')
    await page.getByTestId('filter-in-stock').click()
    await expect(page).toHaveURL(/inStock=true/)

    await page.getByTestId('filter-clear').click()
    await expect(page).not.toHaveURL(/inStock=true/)
  })
})
