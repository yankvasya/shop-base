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

export type Money = z.infer<typeof moneySchema>
export type Image = z.infer<typeof imageSchema>
export type SelectedOption = z.infer<typeof selectedOptionSchema>
