import type { Product, ProductVariant } from '../model/schema'

/**
 * Finds the variant matching a full set of selected options
 * (e.g. { Color: 'Black', Size: 'M' }). Returns undefined until every
 * option has been selected, mirroring how Shopify's own PDP behaves.
 */
export function findVariantBySelectedOptions(
  product: Product,
  selectedOptions: Record<string, string>,
): ProductVariant | undefined {
  if (Object.keys(selectedOptions).length < product.options.length) return undefined

  return product.variants.find((variant) =>
    variant.selectedOptions.every((option) => selectedOptions[option.name] === option.value),
  )
}

export function getDefaultSelectedOptions(product: Product): Record<string, string> {
  const firstAvailable = product.variants.find((v) => v.availableForSale) ?? product.variants[0]
  if (!firstAvailable) return {}

  return Object.fromEntries(firstAvailable.selectedOptions.map((o) => [o.name, o.value]))
}
