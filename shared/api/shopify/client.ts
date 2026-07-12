import { createStorefrontApiClient, type StorefrontApiClient } from '@shopify/storefront-api-client'

let client: StorefrontApiClient | null = null

/**
 * Lazily creates a singleton Storefront API client. The public runtime
 * config (store domain + publishable token) is fixed at server start /
 * build time, so a module-level singleton is safe to reuse across SSR
 * requests and on the client.
 */
export function useShopifyClient(): StorefrontApiClient {
  if (client) return client

  const config = useRuntimeConfig().public.shopify

  if (!config.storeDomain || !config.storefrontToken) {
    throw new Error(
      'Shopify Storefront API is not configured. Set NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN and ' +
        'NUXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN (see .env.example).',
    )
  }

  client = createStorefrontApiClient({
    storeDomain: config.storeDomain,
    apiVersion: config.apiVersion,
    publicAccessToken: config.storefrontToken,
    clientName: 'shop-base',
  })

  return client
}
