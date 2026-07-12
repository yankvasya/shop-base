import type { z } from 'zod'
import { useShopifyClient } from './client'
import { ShopifyApiError } from './errors'

/**
 * Executes a Storefront API GraphQL document and validates the response
 * shape against a Zod schema. Every entity API module should go through
 * this instead of touching the raw client, so malformed API responses
 * fail fast with a readable error instead of propagating `undefined`s.
 */
export async function shopifyRequest<TSchema extends z.ZodType>(
  document: string,
  schema: TSchema,
  variables?: Record<string, unknown>,
): Promise<z.infer<TSchema>> {
  const client = useShopifyClient()
  const { data, errors } = await client.request(document, { variables })

  if (errors) {
    const detail = errors.graphQLErrors?.map((e) => e.message).join('; ')
    const message = detail || errors.message || 'Shopify Storefront API request failed'
    if (import.meta.dev) {
      console.error('[shopify]', message, errors.graphQLErrors ?? errors)
    }
    throw new ShopifyApiError(message, {
      graphQLErrors: errors.graphQLErrors,
      networkStatusCode: errors.networkStatusCode,
    })
  }

  return schema.parse(data)
}
