import { getCustomerOrders } from '@entities/order'

export default defineEventHandler(async (event) => {
  const accessToken = await requireCustomerAccessToken(event)
  const query = getQuery(event)

  const first = typeof query.first === 'string' ? Number(query.first) : undefined
  const after = typeof query.after === 'string' ? query.after : null

  return getCustomerOrders(accessToken, { first, after })
})
