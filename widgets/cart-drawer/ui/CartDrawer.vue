<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ShoppingCart, Minus, Plus, X } from '@lucide/vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@shared/ui/sheet'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { formatMoney } from '@shared/lib'
import { useCartStore } from '@entities/cart'
import { CheckoutButton } from '@features/checkout-form'

const cartStore = useCartStore()
const { lines, lineCount, subtotal, isLoading, error, isEmpty } = storeToRefs(cartStore)

const isOpen = ref(false)
const pendingLineId = ref<string | null>(null)

async function changeQuantity(lineId: string, quantity: number) {
  if (quantity < 1) return
  pendingLineId.value = lineId
  try {
    await cartStore.updateLineQuantity(lineId, quantity)
  } finally {
    pendingLineId.value = null
  }
}

async function removeLine(lineId: string) {
  pendingLineId.value = lineId
  try {
    await cartStore.removeLine(lineId)
  } finally {
    pendingLineId.value = null
  }
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button variant="outline" size="icon" class="relative" :aria-label="$t('nav.cart')">
        <ShoppingCart class="h-4 w-4" />
        <Badge v-if="lineCount > 0" class="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1">
          {{ lineCount }}
        </Badge>
      </Button>
    </SheetTrigger>

    <SheetContent side="right" class="flex w-full flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{{ $t('cart.title') }}</SheetTitle>
      </SheetHeader>

      <p v-if="error" role="alert" class="px-4 text-sm text-destructive">{{ error }}</p>

      <p v-if="isEmpty && !isLoading" class="px-4 text-muted-foreground">{{ $t('cart.empty') }}</p>

      <div v-else class="flex-1 space-y-4 overflow-y-auto px-4">
        <div v-for="line in lines" :key="line.id" class="flex gap-3 border-b pb-4">
          <NuxtImg
            v-if="line.merchandise.image"
            :src="line.merchandise.image.url"
            :alt="line.merchandise.image.altText ?? line.merchandise.product.title"
            width="72"
            height="72"
            loading="lazy"
            class="h-18 w-18 rounded-lg object-cover"
          />
          <div class="flex flex-1 flex-col gap-1">
            <p class="text-sm font-medium">{{ line.merchandise.product.title }}</p>
            <p v-if="line.merchandise.title !== 'Default Title'" class="text-xs text-muted-foreground">
              {{ line.merchandise.title }}
            </p>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                :disabled="pendingLineId === line.id || line.quantity <= 1"
                :aria-label="$t('cart.quantity')"
                @click="changeQuantity(line.id, line.quantity - 1)"
              >
                <Minus class="h-3 w-3" />
              </Button>
              <span class="w-6 text-center text-sm">{{ line.quantity }}</span>
              <Button
                variant="outline"
                size="icon-sm"
                :disabled="pendingLineId === line.id"
                :aria-label="$t('cart.quantity')"
                @click="changeQuantity(line.id, line.quantity + 1)"
              >
                <Plus class="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="ml-auto"
                :disabled="pendingLineId === line.id"
                :aria-label="$t('cart.remove')"
                @click="removeLine(line.id)"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
            <p class="text-sm font-semibold">{{ formatMoney(line.cost.totalAmount) }}</p>
          </div>
        </div>
      </div>

      <SheetFooter v-if="!isEmpty" class="flex-col gap-3 border-t pt-4">
        <div class="flex w-full items-center justify-between text-sm font-medium">
          <span>{{ $t('cart.subtotal') }}</span>
          <span v-if="subtotal" class="text-base font-semibold text-primary">{{
            formatMoney(subtotal)
          }}</span>
        </div>
        <CheckoutButton />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
