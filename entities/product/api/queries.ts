export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCard on Product {
    id
    handle
    title
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
  }
`

export const PRODUCT_LIST_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query ProductList(
    $first: Int
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
    $country: CountryCode!
  ) @inContext(country: $country) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        cursor
        node {
          ...ProductCard
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!, $country: CountryCode!) @inContext(country: $country) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      availableForSale
      options {
        name
        values
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`

export const PRODUCT_FILTER_OPTIONS_QUERY = /* GraphQL */ `
  query ProductFilterOptions($first: Int!) {
    productTypes(first: $first) {
      nodes
    }
    productTags(first: $first) {
      nodes
    }
  }
`

export const PRODUCT_SEARCH_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query ProductSearch($query: String!, $first: Int, $after: String, $country: CountryCode!)
  @inContext(country: $country) {
    search(query: $query, first: $first, after: $after, types: [PRODUCT]) {
      edges {
        cursor
        node {
          ... on Product {
            ...ProductCard
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

// Unlike the other product queries, this one returns a plain list, not a
// Relay connection — no pagination, no edges/pageInfo to unwrap.
export const PRODUCT_RECOMMENDATIONS_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query ProductRecommendations($productHandle: String!, $country: CountryCode!)
  @inContext(country: $country) {
    productRecommendations(productHandle: $productHandle, intent: RELATED) {
      ...ProductCard
    }
  }
`

// Shopify's generic `nodes` field batch-fetches by global ID in one request
// — the efficient alternative to N separate `product(handle:)` calls, used
// here for "recently viewed" (a client-side list of IDs with no natural
// single query of their own). A stale ID (its product was deleted since
// being viewed) comes back as `null` rather than erroring the whole batch.
export const PRODUCT_NODES_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query ProductNodes($ids: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on Product {
        ...ProductCard
      }
    }
  }
`
