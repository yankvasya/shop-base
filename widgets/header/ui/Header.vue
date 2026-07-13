<script setup lang="ts">
import { Button } from '@shared/ui/button'
import { SearchBox } from '@features/product-search'
import { AuthMenu } from '@features/customer-auth'

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() =>
  (typeof locales.value === 'string' ? [] : locales.value).filter((l) => l.code !== locale.value),
)
</script>

<template>
  <header class="border-b">
    <div class="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
      <NuxtLink to="/" class="text-lg font-bold"> ShopBase </NuxtLink>

      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink to="/">{{ $t('nav.catalog') }}</NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <SearchBox />

        <Button v-for="loc in availableLocales" :key="loc.code" variant="ghost" size="sm" as-child>
          <NuxtLink :to="switchLocalePath(loc.code)">{{ loc.code.toUpperCase() }}</NuxtLink>
        </Button>

        <AuthMenu />
        <CartDrawer />
      </div>
    </div>
  </header>
</template>
