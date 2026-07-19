<script setup lang="ts">
import { computed } from 'vue'
import { getProductsByIds } from '@entities/product'
import { useMarket } from '@entities/market'
import { useRecentlyViewed } from '../model/use-recently-viewed'

// The current product is always excluded, even though `record()` in the PDP
// page may or may not have already added it by the time this runs — the
// filter makes that ordering irrelevant.
const props = defineProps<{ excludeId: string }>()

const { ids } = useRecentlyViewed()
const { country } = useMarket()

const otherIds = computed(() => ids.value.filter((id) => id !== props.excludeId))

const { data: products } = await useAsyncData(
  () => `recently-viewed-${otherIds.value.join(',')}-${country.value}`,
  () => getProductsByIds(otherIds.value, country.value),
  { watch: [otherIds, country] },
)
</script>

<template>
  <div v-if="products && products.length > 0" class="mt-12 border-t pt-8">
    <h2 class="mb-6 text-lg font-semibold tracking-tight">{{ $t('product.recentlyViewed') }}</h2>
    <ProductGrid :products="products" :is-loading="false" />
  </div>
</template>
