import { z } from 'zod'
import { moneySchema, imageSchema, selectedOptionSchema } from '@shared/types/common'

/**
 * Schemas below validate the Storefront API response shape directly
 * (Shopify's Relay-style `edges { node }` connections included) and use
 * `.transform()` to flatten those connections into plain arrays in the
 * same pass. This is the runtime boundary check for all product API
 * responses: a malformed/unexpected payload fails `.parse()` here
 * instead of producing `undefined`s deep in a component.
 */

function edgeList<T extends z.ZodTypeAny>(node: T) {
  return z.object({ edges: z.array(z.object({ node })) }).transform((c) => c.edges.map((e) => e.node))
}

export const productImageSchema = imageSchema

export const productVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  availableForSale: z.boolean(),
  selectedOptions: z.array(selectedOptionSchema),
  price: moneySchema,
  compareAtPrice: moneySchema.nullable(),
  image: productImageSchema.nullable(),
})

export const productOptionSchema = z.object({
  name: z.string(),
  values: z.array(z.string()),
})

const priceRangeSchema = z.object({
  minVariantPrice: moneySchema,
  maxVariantPrice: moneySchema,
})

/** Full product detail — used on the PDP. */
export const productSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string(),
  descriptionHtml: z.string(),
  availableForSale: z.boolean(),
  options: z.array(productOptionSchema),
  priceRange: priceRangeSchema,
  images: edgeList(productImageSchema),
  variants: edgeList(productVariantSchema),
})

/** Lighter product shape — used in catalog grids / search results. */
export const productCardSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  availableForSale: z.boolean(),
  priceRange: priceRangeSchema,
  images: edgeList(productImageSchema.pick({ url: true, altText: true, width: true, height: true })),
})

export const pageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
})

export const productConnectionSchema = z
  .object({
    edges: z.array(z.object({ node: productCardSchema, cursor: z.string() })),
    pageInfo: pageInfoSchema,
  })
  .transform((c) => ({
    nodes: c.edges.map((e) => e.node),
    pageInfo: c.pageInfo,
  }))

export type ProductImage = z.infer<typeof productImageSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>
export type ProductOption = z.infer<typeof productOptionSchema>
export type Product = z.infer<typeof productSchema>
export type ProductCard = z.infer<typeof productCardSchema>
export type PageInfo = z.infer<typeof pageInfoSchema>
export type ProductConnection = z.infer<typeof productConnectionSchema>

export const productSortKeys = ['RELEVANCE', 'BEST_SELLING', 'PRICE', 'CREATED_AT', 'TITLE'] as const
export type ProductSortKey = (typeof productSortKeys)[number]
