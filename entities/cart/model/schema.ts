import { z } from 'zod'
import { moneySchema, imageSchema, edgeList } from '@shared/types/common'

export const cartMerchandiseSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: imageSchema.nullable(),
  price: moneySchema,
  selectedOptions: z.array(z.object({ name: z.string(), value: z.string() })),
  product: z.object({
    title: z.string(),
    handle: z.string(),
  }),
})

export const cartLineSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  cost: z.object({
    totalAmount: moneySchema,
  }),
  merchandise: cartMerchandiseSchema,
})

export const cartSchema = z.object({
  id: z.string(),
  checkoutUrl: z.string(),
  totalQuantity: z.number(),
  cost: z.object({
    subtotalAmount: moneySchema,
    totalAmount: moneySchema,
    totalTaxAmount: moneySchema.nullable(),
  }),
  lines: edgeList(cartLineSchema),
})

export type CartMerchandise = z.infer<typeof cartMerchandiseSchema>
export type CartLine = z.infer<typeof cartLineSchema>
export type Cart = z.infer<typeof cartSchema>
