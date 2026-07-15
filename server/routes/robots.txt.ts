export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public

  setHeader(event, 'content-type', 'text/plain')

  return [
    'User-agent: *',
    'Disallow: /api/',
    'Disallow: /account',
    ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`] : []),
  ].join('\n')
})
