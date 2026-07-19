export const LOCALIZATION_QUERY = /* GraphQL */ `
  query Localization {
    localization {
      availableCountries {
        isoCode
        name
        currency {
          isoCode
          symbol
        }
      }
      country {
        isoCode
        name
        currency {
          isoCode
          symbol
        }
      }
    }
  }
`
