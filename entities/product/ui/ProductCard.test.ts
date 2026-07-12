import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ProductCard from './ProductCard.vue'
import type { ProductCard as ProductCardModel } from '../model/schema'

function makeProduct(overrides: Partial<ProductCardModel> = {}): ProductCardModel {
  return {
    id: 'gid://shopify/Product/1',
    handle: 'shirt',
    title: 'Classic Shirt',
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: '25.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '25.00', currencyCode: 'USD' },
    },
    images: [{ url: 'https://cdn.shopify.com/shirt.jpg', altText: 'Classic Shirt', width: 800, height: 800 }],
    ...overrides,
  }
}

function renderCard(product: ProductCardModel) {
  return render(ProductCard, {
    props: { product },
    global: {
      stubs: {
        NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
        NuxtImg: { template: '<img />', props: ['src', 'alt', 'width', 'height', 'loading'] },
      },
      mocks: { $t: (key: string) => key },
    },
  })
}

describe('ProductCard', () => {
  it('renders the title and formatted price', () => {
    renderCard(makeProduct())
    expect(screen.getByText('Classic Shirt')).toBeInTheDocument()
    expect(screen.getByText('$25.00')).toBeInTheDocument()
  })

  it('shows an out-of-stock badge when the product is unavailable', () => {
    renderCard(makeProduct({ availableForSale: false }))
    expect(screen.getByText('product.outOfStock')).toBeInTheDocument()
  })

  it('does not show the badge when the product is available', () => {
    renderCard(makeProduct({ availableForSale: true }))
    expect(screen.queryByText('product.outOfStock')).not.toBeInTheDocument()
  })
})
