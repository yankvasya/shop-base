<script setup lang="ts">
import { Badge } from '@shared/ui/badge'
import { formatMoney } from '@shared/lib'
import type { ProductCard as ProductCardModel } from '../model/schema'

defineProps<{ product: ProductCardModel }>()
</script>

<template>
  <NuxtLink :to="`/products/${product.handle}`" class="group block">
    <div class="relative aspect-square overflow-hidden rounded-lg bg-muted">
      <NuxtImg
        v-if="product.images[0]"
        :src="product.images[0].url"
        :alt="product.images[0].altText ?? product.title"
        width="400"
        height="400"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        :class="{ 'opacity-60': !product.availableForSale }"
      />
      <Badge v-if="!product.availableForSale" variant="secondary" class="absolute left-2 top-2">
        {{ $t('product.outOfStock') }}
      </Badge>
    </div>
    <div class="mt-3 flex items-start justify-between gap-2">
      <p class="line-clamp-2 text-sm text-foreground/90">{{ product.title }}</p>
      <span class="shrink-0 text-sm font-semibold">{{
        formatMoney(product.priceRange.minVariantPrice)
      }}</span>
    </div>
  </NuxtLink>
</template>
