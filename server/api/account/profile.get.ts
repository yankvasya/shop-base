import { getCustomerProfile } from '@entities/customer'

export default defineEventHandler(async (event) => {
  const accessToken = await requireCustomerAccessToken(event)
  return getCustomerProfile(accessToken)
})
