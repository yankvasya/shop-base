import { describe, expect, it } from 'vitest'
import { formatMoney } from './format-money'

describe('formatMoney', () => {
  it('formats a USD amount with the currency symbol', () => {
    expect(formatMoney({ amount: '19.99', currencyCode: 'USD' })).toBe('$19.99')
  })

  it('rounds to the currency default fraction digits', () => {
    expect(formatMoney({ amount: '5', currencyCode: 'USD' })).toBe('$5.00')
  })

  it('formats a different currency with its own locale-aware format', () => {
    expect(formatMoney({ amount: '10', currencyCode: 'EUR' })).toBe('€10.00')
  })
})
