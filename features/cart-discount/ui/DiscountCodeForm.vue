<script setup lang="ts">
import { X, AlertCircle } from '@lucide/vue'
import { Input } from '@shared/ui/input'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { useCartDiscount } from '../model/use-cart-discount'

const { code, discountCodes, isApplying, isLoading, error, apply, remove } = useCartDiscount()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-2">
    <form class="flex items-center gap-2" @submit.prevent="apply">
      <Input
        v-model="code"
        type="text"
        :placeholder="$t('cart.discountPlaceholder')"
        :disabled="isApplying"
        class="h-8 min-w-0 text-sm"
        data-testid="discount-code-input"
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        class="shrink-0"
        :disabled="isApplying || !code.trim()"
        data-testid="discount-code-apply"
      >
        {{ isApplying ? $t('cart.discountApplying') : $t('cart.discountApply') }}
      </Button>
    </form>

    <!--
      Codes can be arbitrarily long — `max-w` + `truncate` on the code span
      keeps the badge from forcing this flex row (and the fixed-width Sheet
      it lives in) wider than the drawer. The "not applicable" state is
      conveyed by color + icon + a title tooltip, not more inline text,
      for the same reason.
    -->
    <div v-if="discountCodes.length > 0" class="flex min-w-0 flex-wrap gap-1.5">
      <Badge
        v-for="discount in discountCodes"
        :key="discount.code"
        :variant="discount.applicable ? 'secondary' : 'destructive'"
        :title="discount.applicable ? undefined : $t('cart.discountNotApplicable')"
        class="max-w-[200px]"
        data-testid="discount-code-badge"
      >
        <AlertCircle v-if="!discount.applicable" class="h-3 w-3 shrink-0" />
        <span class="min-w-0 truncate">{{ discount.code }}</span>
        <button
          type="button"
          class="shrink-0 rounded-full hover:opacity-70"
          :disabled="isLoading"
          :aria-label="$t('cart.discountRemove', { code: discount.code })"
          data-testid="discount-code-remove"
          @click="remove(discount.code)"
        >
          <X class="h-3 w-3" />
        </button>
      </Badge>
    </div>

    <p v-if="error" role="alert" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
