import { describe, expect, it } from 'vitest'
import { buildProductFilterQuery, type ProductFilterInput } from './build-filter-query'

function filters(overrides: Partial<ProductFilterInput> = {}): ProductFilterInput {
  return { inStockOnly: false, productType: '', tag: '', minPrice: '', maxPrice: '', ...overrides }
}

describe('buildProductFilterQuery', () => {
  it('returns undefined when no filters are active', () => {
    expect(buildProductFilterQuery(filters())).toBeUndefined()
  })

  it('builds an available_for_sale term for in-stock only', () => {
    expect(buildProductFilterQuery(filters({ inStockOnly: true }))).toBe('available_for_sale:true')
  })

  it('quotes product types containing whitespace', () => {
    expect(buildProductFilterQuery(filters({ productType: 'Snow Board' }))).toBe('product_type:"Snow Board"')
  })

  it('leaves single-word product types unquoted', () => {
    expect(buildProductFilterQuery(filters({ productType: 'Snowboard' }))).toBe('product_type:Snowboard')
  })

  it('strips embedded double quotes to avoid breaking the query syntax', () => {
    expect(buildProductFilterQuery(filters({ tag: 'sale"; other:x' }))).toBe('tag:"sale; other:x"')
  })

  it('builds a price range with both bounds', () => {
    expect(buildProductFilterQuery(filters({ minPrice: '10', maxPrice: '50' }))).toBe(
      'variants.price:>=10 variants.price:<=50',
    )
  })

  it('ignores non-numeric price input', () => {
    expect(buildProductFilterQuery(filters({ minPrice: 'abc' }))).toBeUndefined()
  })

  it('combines every active filter with implicit AND (space-separated)', () => {
    const query = buildProductFilterQuery(
      filters({ inStockOnly: true, productType: 'Snowboard', tag: 'sale', minPrice: '10', maxPrice: '50' }),
    )
    expect(query).toBe(
      'available_for_sale:true product_type:Snowboard tag:sale variants.price:>=10 variants.price:<=50',
    )
  })
})
