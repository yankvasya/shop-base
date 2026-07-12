import { describe, expect, it } from 'vitest'
import { productSchema, productCardSchema, productConnectionSchema } from './schema'

function rawImage() {
  return { url: 'https://cdn.shopify.com/img.jpg', altText: null, width: 800, height: 800 }
}

function rawMoney(amount = '19.99') {
  return { amount, currencyCode: 'USD' }
}

describe('productCardSchema', () => {
  it('flattens the images connection into a plain array', () => {
    const result = productCardSchema.parse({
      id: 'gid://shopify/Product/1',
      handle: 'test-product',
      title: 'Test Product',
      availableForSale: true,
      priceRange: { minVariantPrice: rawMoney(), maxVariantPrice: rawMoney() },
      images: { edges: [{ node: rawImage() }] },
    })

    expect(result.images).toEqual([rawImage()])
  })

  it('rejects a payload missing required fields', () => {
    expect(() =>
      productCardSchema.parse({
        id: 'gid://shopify/Product/1',
        handle: 'test-product',
        // title missing
        availableForSale: true,
        priceRange: { minVariantPrice: rawMoney(), maxVariantPrice: rawMoney() },
        images: { edges: [] },
      }),
    ).toThrow()
  })
})

describe('productSchema', () => {
  it('flattens both images and variants connections', () => {
    const variant = {
      id: 'gid://shopify/ProductVariant/1',
      title: 'Small / Black',
      availableForSale: true,
      selectedOptions: [{ name: 'Size', value: 'Small' }],
      price: rawMoney(),
      compareAtPrice: null,
      image: null,
    }

    const result = productSchema.parse({
      id: 'gid://shopify/Product/1',
      handle: 'test-product',
      title: 'Test Product',
      description: 'A product',
      descriptionHtml: '<p>A product</p>',
      availableForSale: true,
      options: [{ name: 'Size', values: ['Small'] }],
      priceRange: { minVariantPrice: rawMoney(), maxVariantPrice: rawMoney() },
      images: { edges: [{ node: rawImage() }] },
      variants: { edges: [{ node: variant }] },
    })

    expect(result.images).toEqual([rawImage()])
    expect(result.variants).toEqual([variant])
  })
})

describe('productConnectionSchema', () => {
  it('flattens edges into nodes and preserves pageInfo', () => {
    const card = {
      id: 'gid://shopify/Product/1',
      handle: 'a',
      title: 'A',
      availableForSale: true,
      priceRange: { minVariantPrice: rawMoney(), maxVariantPrice: rawMoney() },
      images: { edges: [] },
    }

    const result = productConnectionSchema.parse({
      edges: [{ node: card, cursor: 'cursor-1' }],
      pageInfo: { hasNextPage: true, hasPreviousPage: false, startCursor: null, endCursor: 'cursor-1' },
    })

    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0].handle).toBe('a')
    expect(result.pageInfo.hasNextPage).toBe(true)
  })
})
