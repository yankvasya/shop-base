<script setup lang="ts">
import { Checkbox } from '@shared/ui/checkbox'
import { useProductFilter } from '../model/use-product-filter'

const { inStockOnly, setInStockOnly } = useProductFilter()
</script>

<template>
  <label class="flex items-center gap-2 text-sm">
    <Checkbox :model-value="inStockOnly" @update:model-value="(value) => setInStockOnly(value === true)" />
    {{ $t('catalog.inStockOnly') }}
  </label>
</template>
