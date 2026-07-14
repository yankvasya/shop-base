import { z } from 'zod'

/**
 * Field names verified against Shopify's Customer Account API GraphQL
 * reference (shopify.dev/docs/api/customer/latest/objects/Customer,
 * .../CustomerAddress, .../CustomerEmailAddress) — not yet exercised
 * against a live store, since that needs the Phase 0 Shopify-side setup
 * (Customer Account API credentials) to be completed first.
 */

export const customerAddressSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  company: z.string().nullable(),
  address1: z.string().nullable(),
  address2: z.string().nullable(),
  city: z.string().nullable(),
  zip: z.string().nullable(),
  territoryCode: z.string().nullable(),
  zoneCode: z.string().nullable(),
  phoneNumber: z.string().nullable(),
})

export const customerSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  displayName: z.string(),
  emailAddress: z
    .object({ emailAddress: z.string() })
    .nullable()
    .transform((e) => e?.emailAddress ?? null),
  defaultAddress: customerAddressSchema.nullable(),
})

export type CustomerAddress = z.infer<typeof customerAddressSchema>
export type Customer = z.infer<typeof customerSchema>
