export interface CustomerAccountEndpoints {
  authorizationEndpoint: string
  tokenEndpoint: string
  endSessionEndpoint: string
  graphqlEndpoint: string
}

let cached: CustomerAccountEndpoints | null = null

interface OpenIdConfiguration {
  authorization_endpoint: string
  token_endpoint: string
  end_session_endpoint: string
}

interface CustomerAccountApiConfiguration {
  graphql_api: string
}

/**
 * Discovers the Customer Account API's OAuth + GraphQL endpoints from the
 * shop's well-known configuration documents
 * (https://shopify.dev/docs/api/customer). Cached in-memory for the
 * lifetime of the server process — Shopify's own guidance is to discover
 * once and reuse the URLs rather than hardcoding them.
 */
export async function getCustomerAccountEndpoints(): Promise<CustomerAccountEndpoints> {
  if (cached) return cached

  const { storeDomain } = useRuntimeConfig().public.shopify
  const origin = `https://${storeDomain}`

  const [openIdConfig, apiConfig] = await Promise.all([
    $fetch<OpenIdConfiguration>(`${origin}/.well-known/openid-configuration`),
    $fetch<CustomerAccountApiConfiguration>(`${origin}/.well-known/customer-account-api`),
  ])

  cached = {
    authorizationEndpoint: openIdConfig.authorization_endpoint,
    tokenEndpoint: openIdConfig.token_endpoint,
    endSessionEndpoint: openIdConfig.end_session_endpoint,
    graphqlEndpoint: apiConfig.graphql_api,
  }

  return cached
}
