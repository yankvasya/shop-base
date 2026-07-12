import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useCartStore } from '@entities/cart'
import type { Product } from '@entities/product'
import { useAddToCart } from './use-add-to-cart'

vi.mock('@entities/cart', () => ({
  useCartStore: vi.fn(),
}))

function makeProduct(): Product {
  return {
    id: 'gid://shopify/Product/1',
    handle: 'shirt',
    title: 'Shirt',
    description: 'A shirt',
    descriptionHtml: '<p>A shirt</p>',
    availableForSale: true,
    options: [{ name: 'Size', values: ['S', 'M'] }],
    priceRange: {
      minVariantPrice: { amount: '20.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '20.00', currencyCode: 'USD' },
    },
    images: [{ url: 'https://cdn.shopify.com/shirt.jpg', altText: null, width: 800, height: 800 }],
    variants: [
      {
        id: 'variant-s',
        title: 'S',
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: 'S' }],
        price: { amount: '20.00', currencyCode: 'USD' },
        compareAtPrice: null,
        image: null,
      },
      {
        id: 'variant-m',
        title: 'M',
        availableForSale: false,
        selectedOptions: [{ name: 'Size', value: 'M' }],
        price: { amount: '20.00', currencyCode: 'USD' },
        compareAtPrice: null,
        image: null,
      },
    ],
  }
}

let addLine: ReturnType<typeof vi.fn>

beforeEach(() => {
  addLine = vi.fn().mockResolvedValue(undefined)
  vi.mocked(useCartStore).mockReturnValue({ addLine } as unknown as ReturnType<typeof useCartStore>)
})

describe('useAddToCart', () => {
  it('defaults to the first available-for-sale variant', () => {
    const { selectedVariant, canAddToCart } = useAddToCart(makeProduct())
    expect(selectedVariant.value?.id).toBe('variant-s')
    expect(canAddToCart.value).toBe(true)
  })

  it('flags the variant as unavailable when the selected combination is out of stock', () => {
    const { selectOption, selectedVariant, canAddToCart } = useAddToCart(makeProduct())
    selectOption('Size', 'M')
    expect(selectedVariant.value?.id).toBe('variant-m')
    expect(canAddToCart.value).toBe(false)
  })

  it('adds the selected variant to the cart with the right optimistic info', async () => {
    const product = makeProduct()
    const { addToCart, justAdded } = useAddToCart(product)

    await addToCart(2)

    expect(addLine).toHaveBeenCalledWith('variant-s', 2, {
      title: 'S',
      productTitle: 'Shirt',
      productHandle: 'shirt',
      image: product.images[0],
      price: { amount: '20.00', currencyCode: 'USD' },
      selectedOptions: [{ name: 'Size', value: 'S' }],
    })
    expect(justAdded.value).toBe(true)
  })

  it('does not add to cart when the selected variant is out of stock', async () => {
    const { selectOption, addToCart, error } = useAddToCart(makeProduct())
    selectOption('Size', 'M')

    await addToCart()

    expect(addLine).not.toHaveBeenCalled()
    expect(error.value).toBeTruthy()
  })

  it('surfaces the store error and clears the loading state when addLine rejects', async () => {
    addLine.mockRejectedValue(new Error('network down'))
    const { addToCart, error, isAdding } = useAddToCart(makeProduct())

    await addToCart()

    expect(error.value).toBe('network down')
    expect(isAdding.value).toBe(false)
  })
})
