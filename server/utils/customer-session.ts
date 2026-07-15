import type { H3Event } from 'h3'

export interface CustomerSessionData {
  accessToken?: string
  refreshToken?: string
  idToken?: string
  /** Epoch ms */
  expiresAt?: number
  /** CSRF guard for the OAuth redirect — cleared once the callback validates it. */
  oauthState?: string
  /** PKCE code verifier for the in-flight login attempt — cleared once the callback exchanges it. */
  codeVerifier?: string
  /** Where to send the customer after a successful login. */
  returnTo?: string
}

/** Sealed, httpOnly cookie session holding the customer's OAuth tokens. */
export function useCustomerSession(event: H3Event) {
  const { password } = useRuntimeConfig().session

  return useSession<CustomerSessionData>(event, {
    password,
    name: 'shopbase_customer_session',
    maxAge: 60 * 60 * 24 * 30,
  })
}
