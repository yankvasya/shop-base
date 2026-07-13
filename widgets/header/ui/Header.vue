<script setup lang="ts">
import { Button } from '@shared/ui/button'
import { SearchBox } from '@features/product-search'

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() =>
  (typeof locales.value === 'string' ? [] : locales.value).filter((l) => l.code !== locale.value),
)
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
    <div class="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5">
      <NuxtLink to="/" class="text-lg font-semibold tracking-tight">ShopBase</NuxtLink>

      <nav class="flex items-center gap-4 text-sm text-muted-foreground">
        <NuxtLink to="/" class="transition-colors hover:text-foreground">{{ $t('nav.catalog') }}</NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <SearchBox />

        <Button v-for="loc in availableLocales" :key="loc.code" variant="ghost" size="sm" as-child>
          <NuxtLink :to="switchLocalePath(loc.code)">{{ loc.code.toUpperCase() }}</NuxtLink>
        </Button>

        <CartDrawer />
      </div>
    </div>
  </header>
</template>
