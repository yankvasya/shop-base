import { exchangeCodeForTokens } from '@shared/api/shopify-customer'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : undefined
  const state = typeof query.state === 'string' ? query.state : undefined

  const session = await useCustomerSession(event)
  const { oauthState, returnTo } = session.data

  if (!code || !state || !oauthState || state !== oauthState) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired login attempt' })
  }

  const { siteUrl } = useRuntimeConfig().public
  const tokens = await exchangeCodeForTokens(code, `${siteUrl}/api/auth/callback`)

  await session.update({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    idToken: tokens.idToken,
    expiresAt: tokens.expiresAt,
    oauthState: undefined,
    returnTo: undefined,
  })

  return sendRedirect(event, returnTo || '/account')
})
