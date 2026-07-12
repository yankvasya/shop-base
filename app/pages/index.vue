<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getProducts, type ProductCard } from '@entities/product'
import { useProductSort, SortSelect } from '@features/product-sort'
import { useProductFilter, InStockFilter } from '@features/product-filter'

const { sortParams } = useProductSort()
const { filterQuery } = useProductFilter()

const products = ref<ProductCard[]>([])
const endCursor = ref<string | null>(null)
const hasNextPage = ref(false)
const isLoadingMore = ref(false)

const queryParams = computed(() => ({
  first: 12,
  sortKey: sortParams.value.sortKey,
  reverse: sortParams.value.reverse,
  query: filterQuery.value,
}))

const { data, pending, error, refresh } = await useAsyncData(
  'catalog',
  () => getProducts(queryParams.value),
  {
    watch: [queryParams],
  },
)

watch(
  data,
  (value) => {
    products.value = value?.nodes ?? []
    endCursor.value = value?.pageInfo.endCursor ?? null
    hasNextPage.value = value?.pageInfo.hasNextPage ?? false
  },
  { immediate: true },
)

async function loadMore() {
  if (!endCursor.value) return
  isLoadingMore.value = true
  try {
    const next = await getProducts({ ...queryParams.value, after: endCursor.value })
    products.value = [...products.value, ...next.nodes]
    endCursor.value = next.pageInfo.endCursor
    hasNextPage.value = next.pageInfo.hasNextPage
  } finally {
    isLoadingMore.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold">{{ $t('catalog.title') }}</h1>
      <div class="flex items-center gap-4">
        <InStockFilter />
        <SortSelect />
      </div>
    </div>

    <ProductGrid
      :products="products"
      :is-loading="pending"
      :is-loading-more="isLoadingMore"
      :error="error?.message ?? null"
      :has-next-page="hasNextPage"
      @load-more="loadMore"
      @retry="refresh"
    />
  </div>
</template>
