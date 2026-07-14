<script setup lang="ts">
import { Skeleton } from '@shared/ui/skeleton'

definePageMeta({ middleware: 'auth' })

const { data: profile, pending, error } = await useFetch('/api/account/profile', { key: 'account-profile' })
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-6">
    <h1 class="mb-6 text-2xl font-bold">{{ $t('account.myAccount') }}</h1>

    <Skeleton v-if="pending" class="h-16 w-full" />
    <p v-else-if="error" role="alert" class="text-destructive">{{ error.message }}</p>
    <div v-else-if="profile" class="space-y-1">
      <p class="text-lg font-medium">{{ profile.displayName }}</p>
      <p v-if="profile.emailAddress" class="text-muted-foreground">{{ profile.emailAddress }}</p>
    </div>

    <NuxtLink to="/account/orders" class="mt-6 inline-block text-primary hover:underline">
      {{ $t('account.orders') }} →
    </NuxtLink>
  </div>
</template>
