import { getCustomerOrder } from '@entities/order'

export default defineEventHandler(async (event) => {
  const accessToken = await requireCustomerAccessToken(event)
  const rawId = getRouterParam(event, 'id')
  if (!rawId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing order id' })
  }

  // Shopify's order IDs are GIDs (gid://shopify/Order/123) and contain
  // slashes, so the client must encodeURIComponent() them into the URL.
  const order = await getCustomerOrder(accessToken, decodeURIComponent(rawId))
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  return order
})
