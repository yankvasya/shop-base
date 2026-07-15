<script setup lang="ts">
import { Button } from '@shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { formatMoney } from '@shared/lib'
import type { Product } from '@entities/product'
import { useAddToCart } from '../model/use-add-to-cart'

const props = defineProps<{ product: Product }>()

const {
  selectedOptions,
  selectedVariant,
  canAddToCart,
  isAdding,
  error,
  justAdded,
  selectOption,
  addToCart,
} = useAddToCart(props.product)

// Shopify's convention for products without real variants: a single
// "Title" option with the single value "Default Title" — not worth
// showing a selector for.
const hasSelectableOptions = computed(
  () => !(props.product.options.length === 1 && props.product.options[0].values[0] === 'Default Title'),
)
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="addToCart()">
    <template v-if="hasSelectableOptions">
      <div v-for="option in product.options" :key="option.name" class="flex flex-col gap-1.5">
        <label :for="`option-${option.name}`" class="text-sm font-medium">{{ option.name }}</label>
        <Select
          :model-value="selectedOptions[option.name]"
          @update:model-value="(value) => selectOption(option.name, String(value))"
        >
          <SelectTrigger :id="`option-${option.name}`" data-testid="option-select">
            <SelectValue :placeholder="$t('product.selectOptions')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="value in option.values" :key="value" :value="value">
              {{ value }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </template>

    <p v-if="selectedVariant" class="text-lg font-semibold text-primary">
      {{ formatMoney(selectedVariant.price) }}
    </p>

    <Button type="submit" :disabled="!canAddToCart || isAdding" data-testid="add-to-cart-button">
      <template v-if="isAdding">{{ $t('product.adding') }}</template>
      <template v-else-if="!selectedVariant || !canAddToCart">{{ $t('product.outOfStock') }}</template>
      <template v-else>{{ $t('product.addToCart') }}</template>
    </Button>

    <p v-if="justAdded" class="text-sm text-primary" role="status">{{ $t('product.added') }}</p>
    <p v-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
  </form>
</template>
