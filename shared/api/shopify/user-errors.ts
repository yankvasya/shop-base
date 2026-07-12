import { ShopifyApiError } from './errors'

export interface UserError {
  field?: string[] | string | null
  message: string
}

export function assertNoUserErrors(userErrors: UserError[], context: string): void {
  if (userErrors.length > 0) {
    throw new ShopifyApiError(`${context}: ${userErrors.map((e) => e.message).join('; ')}`, {
      graphQLErrors: userErrors,
    })
  }
}
