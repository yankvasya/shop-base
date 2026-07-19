<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getProductByHandle } from '@entities/product'
import { useMarket } from '@entities/market'
import { AddToCartForm } from '@features/add-to-cart'
import { RecentlyViewed, useRecentlyViewed } from '@features/recently-viewed'
import { Skeleton } from '@shared/ui/skeleton'

const route = useRoute()
const handle = computed(() => route.params.handle as string)
const { country } = useMarket()
const { record } = useRecentlyViewed()

const {
  data: product,
  pending,
  error,
} = await useAsyncData(
  () => `product-${handle.value}-${country.value}`,
  () => getProductByHandle(handle.value, country.value),
  {
    watch: [handle, country],
  },
)

watch(
  product,
  (value) => {
    if (value) record(value.id)
  },
  { immediate: true },
)

if (!pending.value && !error.value && !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

const selectedImageIndex = ref(0)

const metaDescription = computed(() => {
  const text = product.value?.description ?? ''
  return text.length > 160 ? `${text.slice(0, 157)}...` : text
})

useSeoMeta({
  title: () => product.value?.title,
  description: metaDescription,
  ogTitle: () => product.value?.title,
  ogDescription: metaDescription,
  ogImage: () => product.value?.images[0]?.url,
  ogType: 'website',
})

useHead(() => ({
  script: product.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.value.title,
            description: product.value.description,
            image: product.value.images.map((image) => image.url),
            offers: {
              '@type': 'Offer',
              priceCurrency: product.value.priceRange.minVariantPrice.currencyCode,
              price: product.value.priceRange.minVariantPrice.amount,
              availability: product.value.availableForSale
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
          }),
        },
      ]
    : [],
}))
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:py-10">
    <div v-if="pending" class="grid gap-10 md:grid-cols-2">
      <Skeleton class="aspect-square w-full rounded-lg" />
      <div class="space-y-4">
        <Skeleton class="h-8 w-2/3" />
        <Skeleton class="h-6 w-1/3" />
        <Skeleton class="h-32 w-full" />
      </div>
    </div>

    <p v-else-if="error" role="alert" class="text-destructive">{{ error.message }}</p>

    <div v-else-if="product" class="grid gap-10 md:grid-cols-2">
      <div class="flex flex-col gap-3">
        <div class="aspect-square overflow-hidden rounded-lg bg-muted">
          <NuxtImg
            v-if="product.images[selectedImageIndex]"
            :src="product.images[selectedImageIndex].url"
            :alt="product.images[selectedImageIndex].altText ?? product.title"
            width="600"
            height="600"
            loading="lazy"
            class="h-full w-full object-cover"
          />
        </div>
        <div v-if="product.images.length > 1" class="grid grid-cols-5 gap-2">
          <button
            v-for="(image, index) in product.images"
            :key="image.url"
            type="button"
            class="aspect-square overflow-hidden rounded-md ring-1 ring-border transition-all"
            :class="index === selectedImageIndex ? 'ring-2 ring-primary' : 'hover:ring-foreground/30'"
            @click="selectedImageIndex = index"
          >
            <NuxtImg
              :src="image.url"
              :alt="image.altText ?? product.title"
              width="150"
              height="150"
              loading="lazy"
              class="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <h1 class="text-2xl font-semibold tracking-tight">{{ product.title }}</h1>

        <AddToCartForm :product="product" />

        <div class="border-t pt-5">
          <h2 class="mb-1 text-sm font-medium">{{ $t('product.description') }}</h2>
          <p class="whitespace-pre-line text-sm text-muted-foreground">{{ product.description }}</p>
        </div>
      </div>
    </div>

    <ProductRecommendations v-if="product" :handle="product.handle" />
    <RecentlyViewed v-if="product" :exclude-id="product.id" />
  </div>
</template>
