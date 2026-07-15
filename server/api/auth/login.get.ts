import {
  getCustomerAccountEndpoints,
  generateCodeVerifier,
  codeChallengeFromVerifier,
} from '@shared/api/shopify-customer'

/**
 * Kicks off the Customer Account API login flow. Shopify only offers
 * public clients for headless storefronts (no client secret), so this
 * uses PKCE: a `code_verifier` is generated per attempt and stashed in
 * the session, and only its SHA-256 `code_challenge` is sent here — the
 * verifier itself is presented later, in the callback's token exchange.
 * `state` is a separate, standard CSRF guard.
 */
export default defineEventHandler(async (event) => {
  const { clientId } = useRuntimeConfig().shopifyCustomerAccount
  const { siteUrl } = useRuntimeConfig().public

  const endpoints = await getCustomerAccountEndpoints()
  const state = crypto.randomUUID()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = codeChallengeFromVerifier(codeVerifier)

  const query = getQuery(event)
  const returnTo = typeof query.returnTo === 'string' ? query.returnTo : '/account'

  const session = await useCustomerSession(event)
  await session.update({ oauthState: state, codeVerifier, returnTo })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${siteUrl}/api/auth/callback`,
    scope: 'openid email customer-account-api:full',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return sendRedirect(event, `${endpoints.authorizationEndpoint}?${params.toString()}`)
})
