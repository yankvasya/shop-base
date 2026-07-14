import { getCustomerAccountEndpoints } from '@shared/api/shopify-customer'

/**
 * Kicks off the Customer Account API login flow. Confidential clients
 * (we hold a client secret server-side) don't need PKCE — just a `state`
 * value to guard against CSRF, stashed in the same session cookie that
 * will hold the tokens once the callback completes.
 */
export default defineEventHandler(async (event) => {
  const { clientId } = useRuntimeConfig().shopifyCustomerAccount
  const { siteUrl } = useRuntimeConfig().public

  const endpoints = await getCustomerAccountEndpoints()
  const state = crypto.randomUUID()

  const query = getQuery(event)
  const returnTo = typeof query.returnTo === 'string' ? query.returnTo : '/account'

  const session = await useCustomerSession(event)
  await session.update({ oauthState: state, returnTo })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${siteUrl}/api/auth/callback`,
    scope: 'openid email customer-account-api:full',
    state,
  })

  return sendRedirect(event, `${endpoints.authorizationEndpoint}?${params.toString()}`)
})
