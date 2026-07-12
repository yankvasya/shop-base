import { useCartStore } from '@entities/cart'

export default defineNuxtPlugin(() => {
  const cartStore = useCartStore()
  void cartStore.init()
})
