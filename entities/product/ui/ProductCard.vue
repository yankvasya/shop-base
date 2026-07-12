<script setup lang="ts">
import { Card, CardContent } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'
import { formatMoney } from '@shared/lib'
import type { ProductCard as ProductCardModel } from '../model/schema'

defineProps<{ product: ProductCardModel }>()
</script>

<template>
  <NuxtLink :to="`/products/${product.handle}`" class="block">
    <Card class="overflow-hidden py-0 transition-shadow hover:shadow-md">
      <div class="aspect-square bg-muted">
        <NuxtImg
          v-if="product.images[0]"
          :src="product.images[0].url"
          :alt="product.images[0].altText ?? product.title"
          width="400"
          height="400"
          loading="lazy"
          class="h-full w-full object-cover"
        />
      </div>
      <CardContent class="flex flex-col gap-1 p-3">
        <p class="line-clamp-2 text-sm font-medium">{{ product.title }}</p>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold">{{ formatMoney(product.priceRange.minVariantPrice) }}</span>
          <Badge v-if="!product.availableForSale" variant="secondary">{{ $t('product.outOfStock') }}</Badge>
        </div>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
