import { test, expect } from '@playwright/test'
import { goto } from './utils'

test.describe('market switcher', () => {
  test('switching currency updates catalog prices via a real @inContext request', async ({ page }) => {
    await goto(page, '/')

    const firstPrice = page.locator('a[href^="/products/"]').first().locator('span').last()
    const priceBefore = await firstPrice.textContent()

    await page.getByTestId('market-select').click()
    const options = page.getByRole('option')
    const optionCount = await options.count()
    test.skip(optionCount < 2, 'store has fewer than 2 markets configured — nothing to switch to')

    // Pick whichever option isn't the one already selected.
    const currentLabel = (await page.getByTestId('market-select').textContent())?.trim()
    let switched = false
    for (let i = 0; i < optionCount; i++) {
      const option = options.nth(i)
      if ((await option.textContent())?.trim() !== currentLabel) {
        await option.click()
        switched = true
        break
      }
    }
    expect(switched).toBe(true)

    await page.waitForLoadState('networkidle')
    await expect(firstPrice).not.toHaveText(priceBefore ?? '')
  })
})
