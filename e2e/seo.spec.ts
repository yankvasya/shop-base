import { test, expect } from '@playwright/test'

test.describe('SEO routes', () => {
  test('sitemap.xml is reachable and lists product URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.ok()).toBeTruthy()

    const body = await response.text()
    expect(body).toContain('<urlset')
    expect(body).toContain('/products/')
  })

  test('robots.txt is reachable, disallows private routes, and links the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.ok()).toBeTruthy()

    const body = await response.text()
    expect(body).toContain('Disallow: /account')
    expect(body).toContain('Sitemap:')
  })
})

test.describe('i18n', () => {
  test('the Russian locale catalog page loads', async ({ page }) => {
    await page.goto('/ru')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page).toHaveURL(/\/ru/)
  })
})

// This file intentionally doesn't use the `goto` hydration-wait helper — none
// of the above interact with the page, they only assert on server-rendered
// output (or, for the sitemap/robots checks, don't touch a page at all).
