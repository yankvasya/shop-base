import { test, expect } from '@playwright/test'
import { goto } from './utils'

test.describe('recently viewed', () => {
  test('shows a previously-visited product, excluding the current one', async ({ page }) => {
    await goto(page, '/')

    const links = page.locator('a[href^="/products/"]')
    const firstHref = await links.nth(0).getAttribute('href')
    const secondHref = await links.nth(1).getAttribute('href')
    test.skip(!firstHref || !secondHref, 'catalog needs at least 2 products for this test')

    await page.goto(firstHref!)
    await page.waitForLoadState('networkidle')

    await page.goto(secondHref!)
    await page.waitForLoadState('networkidle')

    const section = page.getByRole('heading', { name: 'Recently viewed' }).locator('xpath=..')
    await expect(section.locator(`a[href="${firstHref}"]`)).toBeVisible()
    await expect(section.locator(`a[href="${secondHref}"]`)).toHaveCount(0)
  })
})
