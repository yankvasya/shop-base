import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@entities/cart'

/**
 * Checkout is fully delegated to Shopify's hosted checkout page — this
 * app never collects payment details itself. "Checking out" here just
 * means redirecting the browser to `cart.checkoutUrl`.
 */
export function useCheckout() {
  const cartStore = useCartStore()
  const { checkoutUrl, isEmpty } = storeToRefs(cartStore)
  const isRedirecting = ref(false)

  function goToCheckout() {
    if (!checkoutUrl.value) return
    isRedirecting.value = true
    window.location.href = checkoutUrl.value
  }

  return { checkoutUrl, isEmpty, isRedirecting, goToCheckout }
}
