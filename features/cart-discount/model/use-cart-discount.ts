import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@entities/cart'

export function useCartDiscount() {
  const cartStore = useCartStore()
  const { discountCodes, isLoading, error } = storeToRefs(cartStore)

  const code = ref('')
  const isApplying = ref(false)

  async function apply() {
    if (!code.value.trim()) return
    isApplying.value = true
    try {
      await cartStore.applyDiscountCode(code.value)
      code.value = ''
    } catch {
      // Error is already surfaced via cartStore.error.
    } finally {
      isApplying.value = false
    }
  }

  async function remove(discountCode: string) {
    try {
      await cartStore.removeDiscountCode(discountCode)
    } catch {
      // Error is already surfaced via cartStore.error.
    }
  }

  return { code, discountCodes, isApplying, isLoading, error, apply, remove }
}
