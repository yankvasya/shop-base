// Import from the api subpath, not the entity's root barrel — the root
// barrel also re-exports `ui/ProductCard.vue`, which would otherwise get
// pulled into this server-only Nitro bundle with no Vue SFC loader wired
// in for it, breaking the build.
import { getProducts } from '@entities/product/api'

const LOCALES = ['en', 'ru'] as const

/** `en` is the default locale and unprefixed (`strategy: prefix_except_default`); `ru` is prefixed. */
function localizedPath(locale: (typeof LOCALES)[number], path: string) {
  return locale === 'en' ? path : `/${locale}${path}`
}

function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface SitemapUrl {
  path: string
  priority: string
  changefreq: string
}

function urlEntry(siteUrl: string, url: SitemapUrl) {
  const alternates = LOCALES.map(
    (locale) =>
      `<xhtml:link rel="alternate" hreflang="${locale}" href="${xmlEscape(siteUrl + localizedPath(locale, url.path))}" />`,
  ).join('')

  return LOCALES.map(
    (locale) => `
  <url>
    <loc>${xmlEscape(siteUrl + localizedPath(locale, url.path))}</loc>
    ${alternates}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  ).join('')
}

/**
 * Storefront API caps `first` at 250; a demo/small store fits in one page,
 * but this paginates to stay correct for larger catalogs, capped well
 * above what any reasonable store sitemap needs.
 */
async function getAllProductHandles() {
  const handles: string[] = []
  let after: string | null = null

  for (let i = 0; i < 20; i++) {
    const page = await getProducts({ first: 250, after })
    handles.push(...page.nodes.map((p) => p.handle))
    if (!page.pageInfo.hasNextPage) break
    after = page.pageInfo.endCursor
  }

  return handles
}

export default defineEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig().public
  setHeader(event, 'content-type', 'application/xml')

  if (!siteUrl) {
    return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" />'
  }

  const staticUrls: SitemapUrl[] = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/search', priority: '0.5', changefreq: 'weekly' },
  ]

  let productUrls: SitemapUrl[] = []
  try {
    const handles = await getAllProductHandles()
    productUrls = handles.map((handle) => ({
      path: `/products/${handle}`,
      priority: '0.8',
      changefreq: 'weekly',
    }))
  } catch {
    // If the Storefront API is unreachable, still serve the static URLs
    // rather than a 500 — search engines will pick up products on retry.
  }

  const body = [...staticUrls, ...productUrls].map((url) => urlEntry(siteUrl, url)).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}
</urlset>`
})
