import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useMarket } from '@entities/market'
import type { Money, Image, SelectedOption } from '@shared/types/common'
import {
  getCart,
  createCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  updateCartDiscountCodes,
} from '../api'
import type { Cart, CartLine } from './schema'

export interface OptimisticLineInfo {
  title: string
  productTitle: string
  productHandle: string
  image: Image | null
  price: Money
  selectedOptions: SelectedOption[]
}

function buildOptimisticLine(merchandiseId: string, quantity: number, info: OptimisticLineInfo): CartLine {
  return {
    id: `optimistic:${merchandiseId}:${Date.now()}`,
    quantity,
    cost: {
      totalAmount: {
        amount: (Number(info.price.amount) * quantity).toFixed(2),
        currencyCode: info.price.currencyCode,
      },
    },
    merchandise: {
      id: merchandiseId,
      title: info.title,
      image: info.image,
      price: info.price,
      selectedOptions: info.selectedOptions,
      product: { title: info.productTitle, handle: info.productHandle },
    },
  }
}

export const useCartStore = defineStore('cart', () => {
  // Only the cart id is persisted — the cart itself is always re-fetched
  // from Shopify so prices/stock never drift from what checkout will charge.
  const cartId = useStorage<string | null>('shop-base:cart-id', null)
  const cart = ref<Cart | null>(null)
  // A cart's currency is fixed at creation (see createCart's comment) — a
  // direct entities/cart -> entities/market dependency, not a features one,
  // so it stays a plain entity-to-entity relationship rather than reaching
  // into feature internals.
  const market = useMarket()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const lines = computed(() => cart.value?.lines ?? [])
  const lineCount = computed(() => cart.value?.totalQuantity ?? 0)
  // Shopify's Cart.cost.subtotalAmount already reflects applied discounts
  // (verified live: a 42%-off code dropped it directly, in lockstep with
  // totalAmount) — there's no separate "before discount" field to diff
  // against on a cart that hasn't reached checkout yet, so cost.totalAmount
  // isn't exposed here; it would always equal subtotal at this stage.
  const subtotal = computed(() => cart.value?.cost.subtotalAmount ?? null)
  const checkoutUrl = computed(() => cart.value?.checkoutUrl ?? null)
  const isEmpty = computed(() => lineCount.value === 0)
  const discountCodes = computed(() => cart.value?.discountCodes ?? [])

  /** Loads the persisted cart, if any. Call once on the client (SSR has no localStorage). */
  async function init() {
    if (isInitialized.value) return
    isInitialized.value = true
    if (!cartId.value) return

    isLoading.value = true
    error.value = null
    try {
      const existing = await getCart(cartId.value)
      cart.value = existing
      if (!existing) cartId.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load cart'
    } finally {
      isLoading.value = false
    }
  }

  async function ensureCart(): Promise<Cart> {
    if (cart.value) return cart.value

    if (cartId.value) {
      const existing = await getCart(cartId.value)
      if (existing) {
        cart.value = existing
        return existing
      }
    }

    const created = await createCart([], market.country.value)
    cartId.value = created.id
    cart.value = created
    return created
  }

  async function addLine(merchandiseId: string, quantity: number, info: OptimisticLineInfo) {
    error.value = null
    isLoading.value = true

    const snapshot = cart.value
    if (cart.value) {
      cart.value = {
        ...cart.value,
        totalQuantity: cart.value.totalQuantity + quantity,
        lines: [...cart.value.lines, buildOptimisticLine(merchandiseId, quantity, info)],
      }
    }

    try {
      const current = await ensureCart()
      cart.value = await addCartLines(current.id, [{ merchandiseId, quantity }])
    } catch (e) {
      cart.value = snapshot
      error.value = e instanceof Error ? e.message : 'Failed to add item to cart'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateLineQuantity(lineId: string, quantity: number) {
    if (!cart.value) return
    error.value = null

    const snapshot = cart.value
    const cartIdValue = cart.value.id
    cart.value = {
      ...cart.value,
      lines: cart.value.lines.map((line) => (line.id === lineId ? { ...line, quantity } : line)),
    }

    isLoading.value = true
    try {
      cart.value = await updateCartLines(cartIdValue, [{ id: lineId, quantity }])
    } catch (e) {
      cart.value = snapshot
      error.value = e instanceof Error ? e.message : 'Failed to update cart'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function removeLine(lineId: string) {
    if (!cart.value) return
    error.value = null

    const snapshot = cart.value
    const cartIdValue = cart.value.id
    cart.value = { ...cart.value, lines: cart.value.lines.filter((line) => line.id !== lineId) }

    isLoading.value = true
    try {
      cart.value = await removeCartLines(cartIdValue, [lineId])
    } catch (e) {
      cart.value = snapshot
      error.value = e instanceof Error ? e.message : 'Failed to remove item from cart'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Shopify's `cartDiscountCodesUpdate` takes the desired full set of codes,
   * not a single one to add/remove — both actions below just compute that
   * set from the current cart and send it. Not optimistic: unlike quantity
   * changes, whether a code is even valid can only be known from Shopify's
   * response, so the UI shows a loading state instead of guessing.
   */
  async function applyDiscountCode(code: string) {
    if (!cart.value || !code.trim()) return
    error.value = null

    const cartIdValue = cart.value.id
    const codes = [...new Set([...cart.value.discountCodes.map((c) => c.code), code.trim()])]

    isLoading.value = true
    try {
      cart.value = await updateCartDiscountCodes(cartIdValue, codes)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to apply discount code'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function removeDiscountCode(code: string) {
    if (!cart.value) return
    error.value = null

    const cartIdValue = cart.value.id
    const codes = cart.value.discountCodes.map((c) => c.code).filter((c) => c !== code)

    isLoading.value = true
    try {
      cart.value = await updateCartDiscountCodes(cartIdValue, codes)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove discount code'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    cart,
    lines,
    lineCount,
    subtotal,
    checkoutUrl,
    isEmpty,
    discountCodes,
    isLoading,
    error,
    init,
    addLine,
    updateLineQuantity,
    removeLine,
    applyDiscountCode,
    removeDiscountCode,
  }
})
