import { z } from 'zod'
import { shopifyRequest } from '@shared/api/shopify'
import { localizationSchema, type Localization } from '../model/schema'
import { LOCALIZATION_QUERY } from './queries'

/**
 * The shop's configured Markets: every country customers can shop in, plus
 * the one this request would default to without an explicit `@inContext`
 * (Shopify's own IP/shop-default resolution — not something we replicate
 * client-side, just read back).
 */
export async function getLocalization(): Promise<Localization> {
  const data = await shopifyRequest(LOCALIZATION_QUERY, z.object({ localization: localizationSchema }))
  return data.localization
}
