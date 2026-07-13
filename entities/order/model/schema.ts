import { z } from 'zod'
import { moneySchema, imageSchema, pageInfoSchema, edgeList } from '@shared/types/common'

/**
 * Orders are fetched through the Customer Account API once a customer is
 * logged in (see entities/order/api and server/api/account/orders).
 * Field names verified against Shopify's GraphQL reference
 * (shopify.dev/docs/api/customer/latest/objects/Order, .../LineItem) —
 * not yet exercised against a live store; see entities/customer's schema
 * comment for why.
 */

export const orderLineItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  totalPrice: moneySchema.nullable(),
  image: imageSchema.nullable(),
})

export const orderSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number(),
  processedAt: z.string(),
  financialStatus: z.string().nullable(),
  fulfillmentStatus: z.string(),
  totalPrice: moneySchema,
})

export const orderDetailSchema = orderSummarySchema.extend({
  lineItems: edgeList(orderLineItemSchema),
})

export const orderConnectionSchema = z
  .object({
    edges: z.array(z.object({ node: orderSummarySchema, cursor: z.string() })),
    pageInfo: pageInfoSchema,
  })
  .transform((c) => ({
    nodes: c.edges.map((e) => e.node),
    pageInfo: c.pageInfo,
  }))

export type OrderLineItem = z.infer<typeof orderLineItemSchema>
export type OrderSummary = z.infer<typeof orderSummarySchema>
export type OrderDetail = z.infer<typeof orderDetailSchema>
export type OrderConnection = z.infer<typeof orderConnectionSchema>
