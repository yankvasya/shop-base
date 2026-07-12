<script setup lang="ts">
import { ref, watch } from 'vue'
import { getProductFilterOptions } from '@entities/product'
import { Checkbox } from '@shared/ui/checkbox'
import { Input } from '@shared/ui/input'
import { Button } from '@shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { useProductFilter } from '../model/use-product-filter'

/** Sentinel for the Select's "no filter" option — Reka's Select can't use an empty string value. */
const ALL = '__all__'

const {
  inStockOnly,
  productType,
  tag,
  minPrice,
  maxPrice,
  hasActiveFilters,
  setInStockOnly,
  setProductType,
  setTag,
  setPriceRange,
  clearFilters,
} = useProductFilter()

const { t } = useI18n()

const { data: options } = await useAsyncData('product-filter-options', () => getProductFilterOptions())

const minPriceInput = ref(minPrice.value)
const maxPriceInput = ref(maxPrice.value)

watch(minPrice, (value) => (minPriceInput.value = value))
watch(maxPrice, (value) => (maxPriceInput.value = value))

function applyPriceRange() {
  setPriceRange(String(minPriceInput.value ?? ''), String(maxPriceInput.value ?? ''))
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <label class="flex items-center gap-2 text-sm">
      <Checkbox :model-value="inStockOnly" @update:model-value="(value) => setInStockOnly(value === true)" />
      {{ t('catalog.inStockOnly') }}
    </label>

    <Select
      :model-value="productType || ALL"
      @update:model-value="(value) => setProductType(value === ALL ? '' : String(value))"
    >
      <SelectTrigger class="w-40">
        <SelectValue :placeholder="t('catalog.productType')" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem :value="ALL">{{ t('catalog.allTypes') }}</SelectItem>
        <SelectItem v-for="type in options?.productTypes ?? []" :key="type" :value="type">
          {{ type }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Select
      :model-value="tag || ALL"
      @update:model-value="(value) => setTag(value === ALL ? '' : String(value))"
    >
      <SelectTrigger class="w-40">
        <SelectValue :placeholder="t('catalog.tag')" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem :value="ALL">{{ t('catalog.allTags') }}</SelectItem>
        <SelectItem v-for="tagOption in options?.productTags ?? []" :key="tagOption" :value="tagOption">
          {{ tagOption }}
        </SelectItem>
      </SelectContent>
    </Select>

    <div class="flex items-center gap-1">
      <Input
        v-model="minPriceInput"
        type="number"
        min="0"
        :placeholder="t('catalog.minPrice')"
        class="w-24"
        @blur="applyPriceRange"
        @keyup.enter="applyPriceRange"
      />
      <span class="text-muted-foreground">–</span>
      <Input
        v-model="maxPriceInput"
        type="number"
        min="0"
        :placeholder="t('catalog.maxPrice')"
        class="w-24"
        @blur="applyPriceRange"
        @keyup.enter="applyPriceRange"
      />
    </div>

    <Button v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearFilters">
      {{ t('catalog.clearFilters') }}
    </Button>
  </div>
</template>
