import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from './cart.store'
import * as cartApi from '../api'
import type { Cart } from './schema'

vi.mock('../api')

// useMarket() reaches for useCookie/useAsyncData, Nuxt auto-imports that
// don't exist in this plain Vitest environment — mocked to a fixed market
// since these tests aren't about currency selection.
vi.mock('@entities/market', () => ({
  useMarket: () => ({ country: { value: 'US' }, availableCountries: { value: [] } }),
}))

const optimisticInfo = {
  title: 'Default',
  productTitle: 'Shirt',
  productHandle: 'shirt',
  image: null,
  price: { amount: '10.00', currencyCode: 'USD' },
  selectedOptions: [],
}

function makeCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: 'gid://shopify/Cart/1',
    checkoutUrl: 'https://checkout.shopify.com/1',
    totalQuantity: 0,
    cost: {
      subtotalAmount: { amount: '0.00', currencyCode: 'USD' },
      totalAmount: { amount: '0.00', currencyCode: 'USD' },
      totalTaxAmount: null,
    },
    lines: [],
    discountCodes: [],
    ...overrides,
  }
}

function makeLine(id: string, quantity: number) {
  return {
    id,
    quantity,
    cost: { totalAmount: { amount: '10.00', currencyCode: 'USD' } },
    merchandise: {
      id: 'variant-1',
      title: 'Default',
      image: null,
      price: { amount: '10.00', currencyCode: 'USD' },
      selectedOptions: [],
      product: { title: 'Shirt', handle: 'shirt' },
    },
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

describe('useCartStore.addLine', () => {
  it('creates a cart on the first add when none exists yet', async () => {
    const created = makeCart({ id: 'new-cart' })
    const afterAdd = makeCart({ id: 'new-cart', totalQuantity: 1, lines: [makeLine('line-1', 1)] })
    vi.mocked(cartApi.createCart).mockResolvedValue(created)
    vi.mocked(cartApi.addCartLines).mockResolvedValue(afterAdd)

    const store = useCartStore()
    await store.addLine('variant-1', 1, optimisticInfo)

    expect(cartApi.createCart).toHaveBeenCalledOnce()
    expect(cartApi.addCartLines).toHaveBeenCalledWith('new-cart', [
      { merchandiseId: 'variant-1', quantity: 1 },
    ])
    expect(store.cart).toEqual(afterAdd)
  })

  it('shows an optimistic line synchronously, before the network call resolves', async () => {
    const store = useCartStore()
    store.cart = makeCart({ id: 'cart-1' })

    let resolveAdd!: (cart: Cart) => void
    vi.mocked(cartApi.addCartLines).mockReturnValue(
      new Promise((resolve) => {
        resolveAdd = resolve
      }),
    )

    const pending = store.addLine('variant-1', 2, optimisticInfo)

    // The optimistic mutation happens synchronously, before addLine's first await.
    expect(store.cart?.totalQuantity).toBe(2)
    expect(store.cart?.lines).toHaveLength(1)
    expect(store.cart?.lines[0].id).toMatch(/^optimistic:/)
    expect(store.isLoading).toBe(true)

    resolveAdd(makeCart({ id: 'cart-1', totalQuantity: 2, lines: [makeLine('line-1', 2)] }))
    await pending

    expect(store.cart?.lines[0].id).toBe('line-1')
    expect(store.isLoading).toBe(false)
  })

  it('rolls back the optimistic line and sets an error when the mutation fails', async () => {
    const store = useCartStore()
    const original = makeCart({ id: 'cart-1', totalQuantity: 1, lines: [makeLine('line-1', 1)] })
    store.cart = original

    vi.mocked(cartApi.addCartLines).mockRejectedValue(new Error('out of stock'))

    await expect(store.addLine('variant-2', 1, optimisticInfo)).rejects.toThrow('out of stock')

    expect(store.cart).toEqual(original)
    expect(store.error).toBe('out of stock')
    expect(store.isLoading).toBe(false)
  })
})

describe('useCartStore.updateLineQuantity', () => {
  it('updates the line quantity via the API and syncs the returned cart', async () => {
    const store = useCartStore()
    store.cart = makeCart({ id: 'cart-1', totalQuantity: 1, lines: [makeLine('line-1', 1)] })

    const updated = makeCart({ id: 'cart-1', totalQuantity: 3, lines: [makeLine('line-1', 3)] })
    vi.mocked(cartApi.updateCartLines).mockResolvedValue(updated)

    await store.updateLineQuantity('line-1', 3)

    expect(cartApi.updateCartLines).toHaveBeenCalledWith('cart-1', [{ id: 'line-1', quantity: 3 }])
    expect(store.cart).toEqual(updated)
  })
})

describe('useCartStore.removeLine', () => {
  it('removes the line via the API and syncs the returned cart', async () => {
    const store = useCartStore()
    store.cart = makeCart({ id: 'cart-1', totalQuantity: 1, lines: [makeLine('line-1', 1)] })

    const updated = makeCart({ id: 'cart-1', totalQuantity: 0, lines: [] })
    vi.mocked(cartApi.removeCartLines).mockResolvedValue(updated)

    await store.removeLine('line-1')

    expect(cartApi.removeCartLines).toHaveBeenCalledWith('cart-1', ['line-1'])
    expect(store.cart).toEqual(updated)
  })
})

describe('useCartStore.applyDiscountCode', () => {
  it('sends the existing codes plus the new one and syncs the returned cart', async () => {
    const store = useCartStore()
    store.cart = makeCart({ id: 'cart-1', discountCodes: [{ code: 'EXISTING', applicable: true }] })

    const updated = makeCart({
      id: 'cart-1',
      discountCodes: [
        { code: 'EXISTING', applicable: true },
        { code: 'SAVE10', applicable: true },
      ],
    })
    vi.mocked(cartApi.updateCartDiscountCodes).mockResolvedValue(updated)

    await store.applyDiscountCode('SAVE10')

    expect(cartApi.updateCartDiscountCodes).toHaveBeenCalledWith('cart-1', ['EXISTING', 'SAVE10'])
    expect(store.cart).toEqual(updated)
  })

  it('sets an error and does not update the cart when the mutation fails', async () => {
    const store = useCartStore()
    const original = makeCart({ id: 'cart-1' })
    store.cart = original

    vi.mocked(cartApi.updateCartDiscountCodes).mockRejectedValue(new Error('invalid code'))

    await expect(store.applyDiscountCode('BADCODE')).rejects.toThrow('invalid code')

    expect(store.cart).toEqual(original)
    expect(store.error).toBe('invalid code')
    expect(store.isLoading).toBe(false)
  })

  it('does nothing for a blank code', async () => {
    const store = useCartStore()
    store.cart = makeCart({ id: 'cart-1' })

    await store.applyDiscountCode('   ')

    expect(cartApi.updateCartDiscountCodes).not.toHaveBeenCalled()
  })
})

describe('useCartStore.removeDiscountCode', () => {
  it('sends the remaining codes and syncs the returned cart', async () => {
    const store = useCartStore()
    store.cart = makeCart({
      id: 'cart-1',
      discountCodes: [
        { code: 'KEEP', applicable: true },
        { code: 'DROP', applicable: true },
      ],
    })

    const updated = makeCart({ id: 'cart-1', discountCodes: [{ code: 'KEEP', applicable: true }] })
    vi.mocked(cartApi.updateCartDiscountCodes).mockResolvedValue(updated)

    await store.removeDiscountCode('DROP')

    expect(cartApi.updateCartDiscountCodes).toHaveBeenCalledWith('cart-1', ['KEEP'])
    expect(store.cart).toEqual(updated)
  })
})
