import type { z } from 'zod'
import { ShopifyApiError } from '../shopify/errors'
import { getCustomerAccountEndpoints } from './discovery'

interface CustomerAccountGraphQLResponse {
  data?: unknown
  errors?: { message: string }[]
}

/**
 * Executes a Customer Account API GraphQL document. Unlike the Storefront
 * API client, there's no single app-wide token — the caller passes the
 * current customer's access token explicitly, since it comes from a
 * per-request session rather than static config.
 */
export async function customerAccountRequest<TSchema extends z.ZodType>(
  accessToken: string,
  document: string,
  schema: TSchema,
  variables?: Record<string, unknown>,
): Promise<z.infer<TSchema>> {
  const endpoints = await getCustomerAccountEndpoints()

  const response = await $fetch<CustomerAccountGraphQLResponse>(endpoints.graphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: { query: document, variables },
  })

  if (response.errors?.length) {
    const message = response.errors.map((e) => e.message).join('; ')
    if (import.meta.dev) {
      console.error('[shopify-customer]', message, response.errors)
    }
    throw new ShopifyApiError(message, { graphQLErrors: response.errors })
  }

  return schema.parse(response.data)
}
