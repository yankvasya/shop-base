export const CUSTOMER_PROFILE_QUERY = /* GraphQL */ `
  query CustomerProfile {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        zip
        territoryCode
        zoneCode
        phoneNumber
      }
    }
  }
`
