import { z } from 'zod'
import { getCustomerAccountEndpoints } from './discovery'

export interface CustomerTokens {
  accessToken: string
  refreshToken: string
  idToken: string
  /** Epoch ms */
  expiresAt: number
}

// The token endpoint is expected to always return an id_token on the
// initial exchange; Shopify's docs don't confirm it's repeated on every
// refresh, so that field is optional there and the caller falls back to
// the previously stored id_token.
const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  id_token: z.string().optional(),
  expires_in: z.number(),
})

function basicAuthHeader(): string {
  const { clientId, clientSecret } = useRuntimeConfig().shopifyCustomerAccount
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
}

async function requestTokens(body: Record<string, string>, fallbackIdToken = ''): Promise<CustomerTokens> {
  const endpoints = await getCustomerAccountEndpoints()

  const raw = await $fetch(endpoints.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams(body),
  })

  const parsed = tokenResponseSchema.parse(raw)

  return {
    accessToken: parsed.access_token,
    refreshToken: parsed.refresh_token,
    idToken: parsed.id_token ?? fallbackIdToken,
    expiresAt: Date.now() + parsed.expires_in * 1000,
  }
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<CustomerTokens> {
  const { clientId } = useRuntimeConfig().shopifyCustomerAccount

  return requestTokens({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
  })
}

export async function refreshCustomerTokens(
  refreshToken: string,
  currentIdToken = '',
): Promise<CustomerTokens> {
  const { clientId } = useRuntimeConfig().shopifyCustomerAccount

  return requestTokens(
    {
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    },
    currentIdToken,
  )
}
