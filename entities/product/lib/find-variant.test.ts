import { describe, expect, it } from 'vitest'
import { findVariantBySelectedOptions, getDefaultSelectedOptions } from './find-variant'
import type { Product } from '../model/schema'

function makeProduct(): Product {
  return {
    id: 'gid://shopify/Product/1',
    handle: 'shirt',
    title: 'Shirt',
    description: '',
    descriptionHtml: '',
    availableForSale: true,
    options: [
      { name: 'Color', values: ['Black', 'White'] },
      { name: 'Size', values: ['S', 'M'] },
    ],
    priceRange: {
      minVariantPrice: { amount: '10.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '10.00', currencyCode: 'USD' },
    },
    images: [],
    variants: [
      {
        id: 'variant-black-s',
        title: 'Black / S',
        availableForSale: true,
        selectedOptions: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: 'S' },
        ],
        price: { amount: '10.00', currencyCode: 'USD' },
        compareAtPrice: null,
        image: null,
      },
      {
        id: 'variant-white-m',
        title: 'White / M',
        availableForSale: false,
        selectedOptions: [
          { name: 'Color', value: 'White' },
          { name: 'Size', value: 'M' },
        ],
        price: { amount: '10.00', currencyCode: 'USD' },
        compareAtPrice: null,
        image: null,
      },
    ],
  }
}

describe('findVariantBySelectedOptions', () => {
  it('returns undefined until every option is selected', () => {
    const product = makeProduct()
    expect(findVariantBySelectedOptions(product, { Color: 'Black' })).toBeUndefined()
  })

  it('finds the variant matching all selected options', () => {
    const product = makeProduct()
    const variant = findVariantBySelectedOptions(product, { Color: 'Black', Size: 'S' })
    expect(variant?.id).toBe('variant-black-s')
  })

  it('returns undefined when no variant matches the combination', () => {
    const product = makeProduct()
    expect(findVariantBySelectedOptions(product, { Color: 'Black', Size: 'M' })).toBeUndefined()
  })
})

describe('getDefaultSelectedOptions', () => {
  it('prefers the first available-for-sale variant', () => {
    const product = makeProduct()
    expect(getDefaultSelectedOptions(product)).toEqual({ Color: 'Black', Size: 'S' })
  })

  it('falls back to the first variant when none are available', () => {
    const product = makeProduct()
    product.variants.forEach((v) => (v.availableForSale = false))
    expect(getDefaultSelectedOptions(product)).toEqual({ Color: 'Black', Size: 'S' })
  })

  it('returns an empty object when the product has no variants', () => {
    const product = makeProduct()
    product.variants = []
    expect(getDefaultSelectedOptions(product)).toEqual({})
  })
})
