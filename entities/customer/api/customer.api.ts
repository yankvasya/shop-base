import { z } from 'zod'
import { customerAccountRequest } from '@shared/api/shopify-customer'
import { customerSchema, type Customer } from '../model/schema'
import { CUSTOMER_PROFILE_QUERY } from './queries'

export async function getCustomerProfile(accessToken: string): Promise<Customer> {
  const data = await customerAccountRequest(
    accessToken,
    CUSTOMER_PROFILE_QUERY,
    z.object({ customer: customerSchema }),
  )
  return data.customer
}
