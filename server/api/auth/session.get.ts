/** Lets the client know whether a customer is logged in, without ever exposing the raw tokens. */
export default defineEventHandler(async (event) => {
  const accessToken = await getValidCustomerAccessToken(event)
  return { isLoggedIn: !!accessToken }
})
