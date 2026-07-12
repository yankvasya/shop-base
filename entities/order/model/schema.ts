import { z } from 'zod'
import { moneySchema } from '@shared/types/common'

/**
 * Checkout itself is fully delegated to Shopify's hosted checkout — this
 * app never processes payments. This minimal shape is what's available
 * once the customer lands back on a confirmation route after paying;
 * fetching full order history would require the Shopify Customer
 * Account API (separate OAuth flow), which is out of scope for the MVP.
 */
export const orderSummarySchema = z.object({
  id: z.string(),
  orderNumber: z.number(),
  totalPrice: moneySchema,
  statusUrl: z.string(),
})

export type OrderSummary = z.infer<typeof orderSummarySchema>
