<script setup lang="ts">
import { Button } from '@shared/ui/button'
import { useCheckout } from '../model/use-checkout'

const { isEmpty, isRedirecting, goToCheckout } = useCheckout()
</script>

<template>
  <Button class="w-full" :disabled="isEmpty || isRedirecting" @click="goToCheckout">
    {{ $t('cart.checkout') }}
  </Button>
</template>
