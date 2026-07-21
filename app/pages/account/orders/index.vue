<script setup lang="ts">
import { Skeleton } from '@shared/ui/skeleton'
import { formatMoney } from '@shared/lib'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
useSeoMeta({ title: () => t('account.orders'), robots: 'noindex, nofollow' })
const localePath = useLocalePath()

const { data, pending, error } = await useFetch('/api/account/orders', { key: 'account-orders' })

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value)
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-6">
    <h1 class="mb-6 text-2xl font-bold">{{ $t('account.orders') }}</h1>

    <div v-if="pending" class="space-y-3">
      <Skeleton v-for="i in 3" :key="i" class="h-20 w-full" />
    </div>
    <p v-else-if="error" role="alert" class="text-destructive">{{ error.message }}</p>
    <p v-else-if="!data?.nodes.length" class="text-muted-foreground">{{ $t('account.noOrders') }}</p>

    <ul v-else class="divide-y">
      <li v-for="order in data.nodes" :key="order.id" class="flex items-center justify-between py-4">
        <div>
          <p class="font-medium">{{ $t('account.orderNumber', { number: order.name }) }}</p>
          <p class="text-sm text-muted-foreground">
            {{ $t('account.orderDate', { date: formatDate(order.processedAt) }) }}
          </p>
        </div>
        <div class="text-right">
          <p class="font-semibold">{{ formatMoney(order.totalPrice) }}</p>
          <NuxtLink
            :to="localePath(`/account/orders/${encodeURIComponent(order.id)}`)"
            class="text-sm text-primary hover:underline"
          >
            {{ $t('account.viewOrder') }}
          </NuxtLink>
        </div>
      </li>
    </ul>
  </div>
</template>
