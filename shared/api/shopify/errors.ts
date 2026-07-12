export class ShopifyApiError extends Error {
  readonly graphQLErrors?: unknown[]
  readonly networkStatusCode?: number

  constructor(message: string, options?: { graphQLErrors?: unknown[]; networkStatusCode?: number }) {
    super(message)
    this.name = 'ShopifyApiError'
    this.graphQLErrors = options?.graphQLErrors
    this.networkStatusCode = options?.networkStatusCode
  }
}
