import { computed } from 'vue'

/**
 * Reads/writes filter state from the URL query. Currently a single
 * "in stock only" toggle, translated into Shopify's Storefront search
 * syntax (https://shopify.dev/docs/api/storefront/reference/products/products)
 * — more filters (product type, tags) can be added the same way.
 */
export function useProductFilter() {
  const route = useRoute()
  const router = useRouter()

  const inStockOnly = computed(() => route.query.inStock === 'true')
  const hasActiveFilters = computed(() => inStockOnly.value)

  const filterQuery = computed<string | undefined>(() =>
    inStockOnly.value ? 'available_for_sale:true' : undefined,
  )

  function setInStockOnly(value: boolean) {
    router.push({
      query: { ...route.query, inStock: value ? 'true' : undefined, after: undefined },
    })
  }

  function clearFilters() {
    router.push({ query: { ...route.query, inStock: undefined, after: undefined } })
  }

  return { inStockOnly, hasActiveFilters, filterQuery, setInStockOnly, clearFilters }
}
