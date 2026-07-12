export interface ProductFilterInput {
  inStockOnly: boolean
  productType: string
  tag: string
  minPrice: string
  maxPrice: string
}

/** Strips quotes and wraps in double quotes if the value contains whitespace. */
function quoteIfNeeded(value: string): string {
  const sanitized = value.replace(/"/g, '')
  return /\s/.test(sanitized) ? `"${sanitized}"` : sanitized
}

/**
 * Translates filter state into Shopify's Storefront search syntax
 * (https://shopify.dev/docs/api/usage/search-syntax). Terms are
 * implicitly AND-ed together.
 */
export function buildProductFilterQuery(filters: ProductFilterInput): string | undefined {
  const parts: string[] = []

  if (filters.inStockOnly) parts.push('available_for_sale:true')
  if (filters.productType) parts.push(`product_type:${quoteIfNeeded(filters.productType)}`)
  if (filters.tag) parts.push(`tag:${quoteIfNeeded(filters.tag)}`)
  if (filters.minPrice && !Number.isNaN(Number(filters.minPrice))) {
    parts.push(`variants.price:>=${Number(filters.minPrice)}`)
  }
  if (filters.maxPrice && !Number.isNaN(Number(filters.maxPrice))) {
    parts.push(`variants.price:<=${Number(filters.maxPrice)}`)
  }

  return parts.length > 0 ? parts.join(' ') : undefined
}
