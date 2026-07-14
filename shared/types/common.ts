import { z } from 'zod'

export const moneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string(),
})

export const imageSchema = z.object({
  url: z.string(),
  altText: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
})

export const selectedOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
})

export const pageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
})

/** Flattens a Relay-style `{ edges: [{ node }] }` connection into a plain array during parsing. */
export function edgeList<T extends z.ZodTypeAny>(node: T) {
  return z.object({ edges: z.array(z.object({ node })) }).transform((c) => c.edges.map((e) => e.node))
}

export type Money = z.infer<typeof moneySchema>
export type Image = z.infer<typeof imageSchema>
export type SelectedOption = z.infer<typeof selectedOptionSchema>
export type PageInfo = z.infer<typeof pageInfoSchema>
