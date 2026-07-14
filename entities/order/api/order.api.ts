import { z } from 'zod'
import { customerAccountRequest } from '@shared/api/shopify-customer'
import {
  orderConnectionSchema,
  orderDetailSchema,
  type OrderConnection,
  type OrderDetail,
} from '../model/schema'
import { CUSTOMER_ORDERS_QUERY, CUSTOMER_ORDER_QUERY } from './queries'

export interface GetCustomerOrdersParams {
  first?: number
  after?: string | null
}

export async function getCustomerOrders(
  accessToken: string,
  params: GetCustomerOrdersParams = {},
): Promise<OrderConnection> {
  const { first = 10, after = null } = params

  const data = await customerAccountRequest(
    accessToken,
    CUSTOMER_ORDERS_QUERY,
    z.object({ customer: z.object({ orders: orderConnectionSchema }) }),
    { first, after },
  )

  return data.customer.orders
}

export async function getCustomerOrder(accessToken: string, id: string): Promise<OrderDetail | null> {
  const data = await customerAccountRequest(
    accessToken,
    CUSTOMER_ORDER_QUERY,
    z.object({ order: orderDetailSchema.nullable() }),
    { id },
  )

  return data.order
}
