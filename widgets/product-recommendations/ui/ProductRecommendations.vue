<script setup lang="ts">
import { getProductRecommendations } from '@entities/product'
import { useMarket } from '@entities/market'

const props = defineProps<{ handle: string }>()
const { country } = useMarket()

// Recommendations are supplementary, not core PDP content — a failed fetch
// (or a product with none, e.g. Shopify's ML model has too little data)
// just means the section doesn't render, never an error box on the page.
const { data: products } = await useAsyncData(
  () => `product-recommendations-${props.handle}-${country.value}`,
  () => getProductRecommendations(props.handle, country.value).catch(() => []),
  { watch: [() => props.handle, country] },
)
</script>

<template>
  <div v-if="products && products.length > 0" class="mt-12 border-t pt-8">
    <h2 class="mb-6 text-lg font-semibold tracking-tight">{{ $t('product.recommendations') }}</h2>
    <ProductGrid :products="products" :is-loading="false" />
  </div>
</template>
