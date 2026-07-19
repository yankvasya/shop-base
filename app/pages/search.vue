<script setup lang="ts">
import { computed } from 'vue'
import { searchProducts } from '@entities/product'
import { useMarket } from '@entities/market'

const { t } = useI18n()
useSeoMeta({ title: () => t('nav.search'), description: () => t('seo.searchDescription') })

const route = useRoute()
const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const { country } = useMarket()

const { data, pending, error, refresh } = await useAsyncData(
  () => `search-${query.value}-${country.value}`,
  () => (query.value ? searchProducts({ query: query.value, first: 12, country: country.value }) : null),
  { watch: [query, country] },
)

const products = computed(() => data.value?.nodes ?? [])
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <h1 class="mb-6 text-2xl font-bold">{{ $t('nav.search') }}</h1>

    <p v-if="!query" class="text-muted-foreground">{{ $t('search.placeholder') }}</p>

    <template v-else>
      <p v-if="!pending && !error && products.length === 0" class="text-muted-foreground">
        {{ $t('search.noResults', { query }) }}
      </p>
      <ProductGrid
        v-else
        :products="products"
        :is-loading="pending"
        :error="error?.message ?? null"
        @retry="refresh"
      />
    </template>
  </div>
</template>
