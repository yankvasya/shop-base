import { computed } from 'vue'
import type { ProductSortKey } from '@entities/product'

export const SORT_OPTIONS = [
  {
    value: 'relevance',
    labelKey: 'catalog.sort.relevance',
    sortKey: 'RELEVANCE' as ProductSortKey,
    reverse: false,
  },
  {
    value: 'best-selling',
    labelKey: 'catalog.sort.bestSelling',
    sortKey: 'BEST_SELLING' as ProductSortKey,
    reverse: false,
  },
  {
    value: 'price-asc',
    labelKey: 'catalog.sort.priceAsc',
    sortKey: 'PRICE' as ProductSortKey,
    reverse: false,
  },
  {
    value: 'price-desc',
    labelKey: 'catalog.sort.priceDesc',
    sortKey: 'PRICE' as ProductSortKey,
    reverse: true,
  },
  {
    value: 'newest',
    labelKey: 'catalog.sort.newest',
    sortKey: 'CREATED_AT' as ProductSortKey,
    reverse: true,
  },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]['value']

const DEFAULT_SORT: SortValue = 'relevance'

/** Reads/writes the `sort` URL query param — the single source of truth for catalog sort order. */
export function useProductSort() {
  const route = useRoute()
  const router = useRouter()

  const sortValue = computed<SortValue>(() => {
    const raw = route.query.sort
    return SORT_OPTIONS.find((o) => o.value === raw)?.value ?? DEFAULT_SORT
  })

  const sortParams = computed(() => {
    const option = SORT_OPTIONS.find((o) => o.value === sortValue.value) ?? SORT_OPTIONS[0]
    return { sortKey: option.sortKey, reverse: option.reverse }
  })

  function setSort(value: SortValue) {
    router.push({
      query: { ...route.query, sort: value === DEFAULT_SORT ? undefined : value, after: undefined },
    })
  }

  return { sortValue, sortParams, setSort, options: SORT_OPTIONS }
}
