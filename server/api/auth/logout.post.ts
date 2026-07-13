import { getCustomerAccountEndpoints } from '@shared/api/shopify-customer'

export default defineEventHandler(async (event) => {
  const session = await useCustomerSession(event)
  const { idToken } = session.data
  const { siteUrl } = useRuntimeConfig().public

  await session.clear()

  if (!idToken) {
    return { redirectTo: '/' }
  }

  const endpoints = await getCustomerAccountEndpoints()
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: siteUrl,
  })

  return { redirectTo: `${endpoints.endSessionEndpoint}?${params.toString()}` }
})
