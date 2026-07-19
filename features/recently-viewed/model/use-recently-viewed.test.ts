import { beforeEach, describe, expect, it } from 'vitest'
import { useRecentlyViewed } from './use-recently-viewed'

beforeEach(() => {
  localStorage.clear()
})

describe('useRecentlyViewed', () => {
  it('adds the newest view to the front', () => {
    const { ids, record } = useRecentlyViewed()

    record('product-1')
    record('product-2')

    expect(ids.value).toEqual(['product-2', 'product-1'])
  })

  it('moves an already-viewed product back to the front instead of duplicating it', () => {
    const { ids, record } = useRecentlyViewed()

    record('product-1')
    record('product-2')
    record('product-1')

    expect(ids.value).toEqual(['product-1', 'product-2'])
  })

  it('caps the list at 8 items, dropping the oldest', () => {
    const { ids, record } = useRecentlyViewed()

    for (let i = 1; i <= 9; i++) record(`product-${i}`)

    expect(ids.value).toHaveLength(8)
    expect(ids.value[0]).toBe('product-9')
    expect(ids.value).not.toContain('product-1')
  })
})
