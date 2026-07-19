import { z } from 'zod'
import { shopifyRequest } from '@shared/api/shopify'
import {
  productSchema,
  productConnectionSchema,
  productFilterOptionsSchema,
  productCardSchema,
  type Product,
  type ProductConnection,
  type ProductFilterOptions,
  type ProductSortKey,
  type ProductCard,
} from '../model/schema'
import {
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_LIST_QUERY,
  PRODUCT_FILTER_OPTIONS_QUERY,
  PRODUCT_SEARCH_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
} from './queries'

export interface GetProductsParams {
  first?: number
  after?: string | null
  sortKey?: ProductSortKey
  reverse?: boolean
  /** Shopify search syntax, e.g. `tag:sale` or `product_type:shoes` */
  query?: string
  /** Market to price/localize against — see entities/market. Defaults to the shop's own default market. */
  country?: string
}

export async function getProducts(params: GetProductsParams = {}): Promise<ProductConnection> {
  const { first = 12, after = null, sortKey = 'RELEVANCE', reverse = false, query, country = 'US' } = params

  const data = await shopifyRequest(PRODUCT_LIST_QUERY, z.object({ products: productConnectionSchema }), {
    first,
    after,
    sortKey,
    reverse,
    query,
    country,
  })

  return data.products
}

export async function getProductByHandle(handle: string, country = 'US'): Promise<Product | null> {
  const data = await shopifyRequest(
    PRODUCT_BY_HANDLE_QUERY,
    z.object({ product: productSchema.nullable() }),
    {
      handle,
      country,
    },
  )

  return data.product
}

export async function getProductFilterOptions(first = 250): Promise<ProductFilterOptions> {
  return shopifyRequest(PRODUCT_FILTER_OPTIONS_QUERY, productFilterOptionsSchema, { first })
}

export interface SearchProductsParams {
  query: string
  first?: number
  after?: string | null
  country?: string
}

export async function searchProducts(params: SearchProductsParams): Promise<ProductConnection> {
  const { query, first = 12, after = null, country = 'US' } = params

  const data = await shopifyRequest(PRODUCT_SEARCH_QUERY, z.object({ search: productConnectionSchema }), {
    query,
    first,
    after,
    country,
  })

  return data.search
}

/** Shopify's ML-based "related products" for a given product handle. Not paginated — a plain list. */
export async function getProductRecommendations(handle: string, country = 'US'): Promise<ProductCard[]> {
  const data = await shopifyRequest(
    PRODUCT_RECOMMENDATIONS_QUERY,
    z.object({ productRecommendations: z.array(productCardSchema) }),
    { productHandle: handle, country },
  )

  return data.productRecommendations
}
