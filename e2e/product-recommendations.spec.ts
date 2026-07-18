import { test, expect } from '@playwright/test'
import { goto } from './utils'

test.describe('product recommendations', () => {
  test('shows related products on the PDP', async ({ page }) => {
    await goto(page, '/products/the-collection-snowboard-oxygen')

    await expect(page.getByRole('heading', { name: 'You may also like' })).toBeVisible()

    const recommendedLinks = page.locator('a[href^="/products/"]')
    await expect(recommendedLinks.first()).toBeVisible()
    expect(await recommendedLinks.count()).toBeGreaterThan(0)
  })
})
