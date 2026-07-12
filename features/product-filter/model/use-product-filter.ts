import { computed } from 'vue'
import { buildProductFilterQuery } from '../lib/build-filter-query'

function queryParam(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/** Reads/writes filter state from the URL query. */
export function useProductFilter() {
  const route = useRoute()
  const router = useRouter()

  const inStockOnly = computed(() => route.query.inStock === 'true')
  const productType = computed(() => queryParam(route.query.type))
  const tag = computed(() => queryParam(route.query.tag))
  const minPrice = computed(() => queryParam(route.query.minPrice))
  const maxPrice = computed(() => queryParam(route.query.maxPrice))

  const hasActiveFilters = computed(
    () => inStockOnly.value || !!productType.value || !!tag.value || !!minPrice.value || !!maxPrice.value,
  )

  const filterQuery = computed<string | undefined>(() =>
    buildProductFilterQuery({
      inStockOnly: inStockOnly.value,
      productType: productType.value,
      tag: tag.value,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
    }),
  )

  function updateFilters(patch: Record<string, string | undefined>) {
    router.push({ query: { ...route.query, ...patch, after: undefined } })
  }

  function setInStockOnly(value: boolean) {
    updateFilters({ inStock: value ? 'true' : undefined })
  }

  function setProductType(value: string) {
    updateFilters({ type: value || undefined })
  }

  function setTag(value: string) {
    updateFilters({ tag: value || undefined })
  }

  function setPriceRange(min: string, max: string) {
    updateFilters({ minPrice: min || undefined, maxPrice: max || undefined })
  }

  function clearFilters() {
    updateFilters({
      inStock: undefined,
      type: undefined,
      tag: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    })
  }

  return {
    inStockOnly,
    productType,
    tag,
    minPrice,
    maxPrice,
    hasActiveFilters,
    filterQuery,
    setInStockOnly,
    setProductType,
    setTag,
    setPriceRange,
    clearFilters,
  }
}
