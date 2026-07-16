import { z } from 'zod'
import { shopifyRequest, assertNoUserErrors } from '@shared/api/shopify'
import { cartSchema, type Cart } from '../model/schema'
import {
  CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
} from './queries'

const userErrorSchema = z.object({
  field: z.array(z.string()).nullable().optional(),
  message: z.string(),
})

function cartPayloadSchema() {
  return z.object({ cart: cartSchema.nullable(), userErrors: z.array(userErrorSchema) })
}

function unwrapCartPayload(payload: z.infer<ReturnType<typeof cartPayloadSchema>>, context: string): Cart {
  assertNoUserErrors(payload.userErrors, context)
  if (!payload.cart) throw new Error(`${context}: Shopify returned no cart`)
  return payload.cart
}

export interface CartLineInput {
  merchandiseId: string
  quantity?: number
}

export interface CartLineUpdateInput {
  id: string
  quantity: number
}

export async function getCart(id: string): Promise<Cart | null> {
  const data = await shopifyRequest(CART_QUERY, z.object({ cart: cartSchema.nullable() }), { id })
  return data.cart
}

export async function createCart(lines: CartLineInput[] = []): Promise<Cart> {
  const data = await shopifyRequest(CART_CREATE_MUTATION, z.object({ cartCreate: cartPayloadSchema() }), {
    lines,
  })
  return unwrapCartPayload(data.cartCreate, 'Failed to create cart')
}

export async function addCartLines(cartId: string, lines: CartLineInput[]): Promise<Cart> {
  const data = await shopifyRequest(
    CART_LINES_ADD_MUTATION,
    z.object({ cartLinesAdd: cartPayloadSchema() }),
    { cartId, lines },
  )
  return unwrapCartPayload(data.cartLinesAdd, 'Failed to add item to cart')
}

export async function updateCartLines(cartId: string, lines: CartLineUpdateInput[]): Promise<Cart> {
  const data = await shopifyRequest(
    CART_LINES_UPDATE_MUTATION,
    z.object({ cartLinesUpdate: cartPayloadSchema() }),
    { cartId, lines },
  )
  return unwrapCartPayload(data.cartLinesUpdate, 'Failed to update cart')
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyRequest(
    CART_LINES_REMOVE_MUTATION,
    z.object({ cartLinesRemove: cartPayloadSchema() }),
    { cartId, lineIds },
  )
  return unwrapCartPayload(data.cartLinesRemove, 'Failed to remove item from cart')
}

/**
 * Replaces the cart's full set of applied discount codes — Shopify's API
 * takes the desired end state, not a single code to add/remove, so callers
 * pass the complete list they want applied.
 */
export async function updateCartDiscountCodes(cartId: string, discountCodes: string[]): Promise<Cart> {
  const data = await shopifyRequest(
    CART_DISCOUNT_CODES_UPDATE_MUTATION,
    z.object({ cartDiscountCodesUpdate: cartPayloadSchema() }),
    { cartId, discountCodes },
  )
  return unwrapCartPayload(data.cartDiscountCodesUpdate, 'Failed to update discount codes')
}
