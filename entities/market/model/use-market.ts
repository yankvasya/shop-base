import { computed } from 'vue'
import { getLocalization } from '../api'

/**
 * Selected market (country → currency), persisted in a cookie so SSR and
 * CSR agree on which currency to request from the Storefront API. Falls
 * back to the shop's own default market (`localization.country`, Shopify's
 * IP/shop-default resolution) until the customer picks one explicitly, and
 * further back to 'US' if that fetch hasn't resolved yet — `country` always
 * returns a real value, never null, so callers never need to guard it.
 *
 * Lives at the entity level (not in a feature) because entities/cart's
 * store needs it too, and features can't depend on other features'
 * internals — this is exactly the kind of cross-cutting selection state
 * FSD expects at the entity layer.
 */
export function useMarket() {
  const countryCookie = useCookie<string | null>('shop-base:country', { default: () => null })

  const { data } = useAsyncData('market-localization', () => getLocalization())

  const availableCountries = computed(() => data.value?.availableCountries ?? [])
  const defaultCountry = computed(() => data.value?.country.isoCode ?? 'US')

  const country = computed({
    get: () => countryCookie.value ?? defaultCountry.value,
    set: (value: string) => {
      countryCookie.value = value
    },
  })

  return { country, availableCountries }
}
