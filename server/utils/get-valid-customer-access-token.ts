import type { H3Event } from 'h3'
import { refreshCustomerTokens } from '@shared/api/shopify-customer'

const EXPIRY_BUFFER_MS = 60_000

/**
 * Returns a valid (non-expired) Customer Account API access token for the
 * current session, transparently refreshing it first if it's about to
 * expire. Returns null if the visitor isn't logged in, or the refresh
 * itself fails (refresh token expired/revoked) — in which case the
 * session is cleared so the next request sees a clean logged-out state.
 */
export async function getValidCustomerAccessToken(event: H3Event): Promise<string | null> {
  const session = await useCustomerSession(event)
  const { accessToken, refreshToken, expiresAt, idToken } = session.data

  if (!accessToken) return null

  const isExpired = !expiresAt || Date.now() > expiresAt - EXPIRY_BUFFER_MS
  if (!isExpired) return accessToken

  if (!refreshToken) {
    await session.clear()
    return null
  }

  try {
    const tokens = await refreshCustomerTokens(refreshToken, idToken)
    await session.update({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      expiresAt: tokens.expiresAt,
    })
    return tokens.accessToken
  } catch {
    await session.clear()
    return null
  }
}
