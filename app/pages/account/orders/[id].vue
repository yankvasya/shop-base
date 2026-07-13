<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@shared/ui/skeleton'
import { formatMoney } from '@shared/lib'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
// route.params.id is already decoded by vue-router (real slashes in the
// GID) — re-encode it for the internal API call, whose [id] route param
// expects the same encoded form used to build the link here.
const encodedId = computed(() => encodeURIComponent(route.params.id as string))

const {
  data: order,
  pending,
  error,
} = await useFetch(() => `/api/account/orders/${encodedId.value}`, {
  key: () => `account-order-${encodedId.value}`,
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-6">
    <NuxtLink to="/account/orders" class="mb-4 inline-block text-sm text-muted-foreground hover:underline">
      ← {{ $t('account.backToOrders') }}
    </NuxtLink>

    <Skeleton v-if="pending" class="h-64 w-full" />
    <p v-else-if="error" role="alert" class="text-destructive">{{ error.message }}</p>

    <div v-else-if="order">
      <h1 class="mb-2 text-2xl font-bold">{{ $t('account.orderNumber', { number: order.name }) }}</h1>
      <p class="mb-6 text-sm text-muted-foreground">{{ order.fulfillmentStatus }}</p>

      <ul class="divide-y">
        <li v-for="(item, index) in order.lineItems" :key="index" class="flex items-center gap-4 py-4">
          <NuxtImg
            v-if="item.image"
            :src="item.image.url"
            :alt="item.image.altText ?? item.name"
            width="64"
            height="64"
            loading="lazy"
            class="h-16 w-16 rounded-md object-cover"
          />
          <div class="flex-1">
            <p class="font-medium">{{ item.name }}</p>
            <p class="text-sm text-muted-foreground">{{ $t('cart.quantity') }}: {{ item.quantity }}</p>
          </div>
          <p v-if="item.totalPrice" class="font-semibold">{{ formatMoney(item.totalPrice) }}</p>
        </li>
      </ul>

      <div class="mt-6 flex justify-between border-t pt-4 font-semibold">
        <span>{{ $t('account.orderTotal') }}</span>
        <span>{{ formatMoney(order.totalPrice) }}</span>
      </div>
    </div>
  </div>
</template>
