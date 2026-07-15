<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { useProductSort } from '../model/use-product-sort'

const { sortValue, setSort, options } = useProductSort()
const { t } = useI18n()
</script>

<template>
  <Select :model-value="sortValue" @update:model-value="(value) => setSort(value as typeof sortValue)">
    <SelectTrigger class="w-56" data-testid="sort-select">
      <SelectValue :placeholder="t('catalog.sortBy')" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="option.value" :value="option.value">
        {{ t(option.labelKey) }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
