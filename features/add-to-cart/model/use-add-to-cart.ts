import { computed, reactive, ref } from 'vue'
import { useCartStore } from '@entities/cart'
import { findVariantBySelectedOptions, getDefaultSelectedOptions, type Product } from '@entities/product'

export function useAddToCart(product: Product) {
  const cartStore = useCartStore()
  const selectedOptions = reactive<Record<string, string>>(getDefaultSelectedOptions(product))
  const isAdding = ref(false)
  const error = ref<string | null>(null)
  const justAdded = ref(false)

  const selectedVariant = computed(() => findVariantBySelectedOptions(product, selectedOptions))
  const canAddToCart = computed(() => selectedVariant.value?.availableForSale ?? false)

  function selectOption(name: string, value: string) {
    selectedOptions[name] = value
    justAdded.value = false
  }

  async function addToCart(quantity = 1) {
    const variant = selectedVariant.value
    if (!variant) {
      error.value = 'Please select all options'
      return
    }
    if (!variant.availableForSale) {
      error.value = 'This variant is out of stock'
      return
    }

    error.value = null
    isAdding.value = true
    justAdded.value = false

    try {
      await cartStore.addLine(variant.id, quantity, {
        title: variant.title,
        productTitle: product.title,
        productHandle: product.handle,
        image: variant.image ?? product.images[0] ?? null,
        price: variant.price,
        selectedOptions: variant.selectedOptions,
      })
      justAdded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add item to cart'
    } finally {
      isAdding.value = false
    }
  }

  return {
    selectedOptions,
    selectedVariant,
    canAddToCart,
    isAdding,
    error,
    justAdded,
    selectOption,
    addToCart,
  }
}
