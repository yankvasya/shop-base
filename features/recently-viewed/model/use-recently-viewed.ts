import { useStorage } from '@vueuse/core'

const MAX_ITEMS = 8

/** Most-recently-viewed product IDs, persisted client-side — deduplicated, capped, newest first. */
export function useRecentlyViewed() {
  const ids = useStorage<string[]>('shop-base:recently-viewed', [])

  function record(productId: string) {
    const withoutCurrent = ids.value.filter((id) => id !== productId)
    ids.value = [productId, ...withoutCurrent].slice(0, MAX_ITEMS)
  }

  return { ids, record }
}
