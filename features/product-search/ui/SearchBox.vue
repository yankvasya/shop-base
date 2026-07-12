<script setup lang="ts">
import { Search } from '@lucide/vue'
import { Input } from '@shared/ui/input'
import { Button } from '@shared/ui/button'
import { useSearchBox } from '../model/use-search-box'

const { query, submit } = useSearchBox()
const { t } = useI18n()
</script>

<template>
  <form class="flex items-center gap-2" role="search" @submit.prevent="submit">
    <Input v-model="query" type="search" :placeholder="t('search.placeholder')" class="w-56" />
    <Button type="submit" size="icon" variant="outline" :aria-label="t('nav.search')">
      <Search class="h-4 w-4" />
    </Button>
  </form>
</template>
