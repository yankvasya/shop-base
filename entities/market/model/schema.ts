import { z } from 'zod'

export const currencySchema = z.object({
  isoCode: z.string(),
  symbol: z.string(),
})

export const countrySchema = z.object({
  isoCode: z.string(),
  name: z.string(),
  currency: currencySchema,
})

export const localizationSchema = z.object({
  availableCountries: z.array(countrySchema),
  country: countrySchema,
})

export type Currency = z.infer<typeof currencySchema>
export type Country = z.infer<typeof countrySchema>
export type Localization = z.infer<typeof localizationSchema>
