<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { useMarket } from '@entities/market'

const { country, availableCountries } = useMarket()
</script>

<template>
  <Select
    v-if="availableCountries.length > 1"
    :model-value="country"
    @update:model-value="(value) => (country = String(value))"
  >
    <SelectTrigger class="w-20" data-testid="market-select" :aria-label="$t('market.selectCurrency')">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="c in availableCountries" :key="c.isoCode" :value="c.isoCode">
        {{ c.currency.isoCode }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
