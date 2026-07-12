import type { CodegenConfig } from '@graphql-codegen/cli'

const storeDomain = process.env.NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const storefrontToken = process.env.NUXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
const apiVersion = process.env.NUXT_PUBLIC_SHOPIFY_API_VERSION ?? '2025-10'

if (!storeDomain || !storefrontToken) {
  throw new Error(
    'Codegen needs live Shopify credentials to introspect the Storefront API schema. ' +
      'Copy .env.example to .env and fill in NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN / ' +
      'NUXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN, then run `pnpm codegen` again.',
  )
}

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [`https://${storeDomain}/api/${apiVersion}/graphql.json`]: {
        headers: {
          'X-Shopify-Storefront-Access-Token': storefrontToken,
          'Content-Type': 'application/json',
        },
      },
    },
  ],
  // Picks up template literals tagged with the `/* GraphQL */` magic
  // comment inside entities/*/api and features/*/model — see e.g.
  // entities/product/api/queries.ts.
  documents: ['entities/**/*.ts', 'features/**/*.ts'],
  generates: {
    'shared/types/storefront.generated.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        scalars: {
          DateTime: 'string',
          Decimal: 'string',
          HTML: 'string',
          URL: 'string',
          UnsignedInt64: 'string',
          Color: 'string',
          JSON: 'Record<string, unknown>',
          ARN: 'string',
          Handle: 'string',
        },
        avoidOptionals: false,
        skipTypename: true,
        enumsAsTypes: true,
      },
    },
  },
}

export default config
