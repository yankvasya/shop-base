<script setup lang="ts">
import { ProductCard, type ProductCard as ProductCardModel } from '@entities/product'
import { Skeleton } from '@shared/ui/skeleton'
import { Button } from '@shared/ui/button'

defineProps<{
  products: ProductCardModel[]
  isLoading: boolean
  isLoadingMore?: boolean
  error?: string | null
  hasNextPage?: boolean
}>()

const emit = defineEmits<{ loadMore: []; retry: [] }>()
</script>

<template>
  <div>
    <div v-if="error" role="alert" class="flex flex-col items-start gap-2 text-destructive">
      <p>{{ error }}</p>
      <Button variant="outline" size="sm" @click="emit('retry')">{{ $t('common.retry') }}</Button>
    </div>

    <div v-else-if="isLoading" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <Skeleton v-for="i in 8" :key="i" class="aspect-square w-full" />
    </div>

    <p v-else-if="products.length === 0" class="text-muted-foreground">{{ $t('catalog.noResults') }}</p>

    <template v-else>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <div v-if="hasNextPage" class="mt-6 flex justify-center">
        <Button variant="outline" :disabled="isLoadingMore" @click="emit('loadMore')">
          {{ isLoadingMore ? $t('common.loading') : $t('catalog.loadMore') }}
        </Button>
      </div>
    </template>
  </div>
</template>
