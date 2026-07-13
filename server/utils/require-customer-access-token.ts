import type { H3Event } from 'h3'

/** Like getValidCustomerAccessToken, but 401s instead of returning null. */
export async function requireCustomerAccessToken(event: H3Event): Promise<string> {
  const accessToken = await getValidCustomerAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not logged in' })
  }
  return accessToken
}
