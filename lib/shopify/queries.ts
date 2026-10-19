/**
 * Storefront API GraphQL documents. Kept small on purpose: tokenless
 * access caps each query's cost at 1,000, so grids ask for card fields
 * only and the full variant list loads on the product page alone.
 */

const image = /* GraphQL */ `
  fragment image on Image {
    url
    altText
    width
    height
  }
`

const productCard = /* GraphQL */ `
  fragment productCard on Product {
    id
    handle
    title
    productType
    availableForSale
    createdAt
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
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      ...image
    }
    images(first: 2) {
      edges {
        node {
          ...image
        }
      }
    }
    vendor
    tags
    # Aliased so it can't clash with the full product's variants field.
    quickVariants: variants(first: 50) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
  ${image}
`

const product = /* GraphQL */ `
  fragment product on Product {
    ...productCard
    description
    descriptionHtml
    vendor
    tags
    updatedAt
    seo {
      title
      description
    }
    options {
      id
      name
      optionValues {
        name
      }
    }
    allImages: images(first: 20) {
      edges {
        node {
          ...image
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
            ...image
          }
        }
      }
    }
  }
  ${productCard}
`

const collection = /* GraphQL */ `
  fragment collection on Collection {
    id
    handle
    title
    description
    descriptionHtml
    updatedAt
    image {
      ...image
    }
    seo {
      title
      description
    }
  }
`

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections {
    collections(first: 100, sortKey: TITLE) {
      edges {
        node {
          ...collection
        }
      }
    }
  }
  ${collection}
  ${image}
`

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...collection
      products(first: 100, sortKey: COLLECTION_DEFAULT) {
        # Search & Discovery's filters for this collection.
        filters {
          id
          label
          type
          values {
            id
            label
            input
          }
        }
        edges {
          node {
            ...productCard
          }
        }
      }
    }
  }
  ${collection}
  ${productCard}
`

export const getProductsQuery = /* GraphQL */ `
  query getProducts($sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: 100, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          ...productCard
        }
      }
    }
  }
  ${productCard}
`

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${product}
`

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations(
    $productId: ID!
    $intent: ProductRecommendationIntent
  ) {
    productRecommendations(productId: $productId, intent: $intent) {
      ...productCard
    }
  }
  ${productCard}
`

export const searchProductsQuery = /* GraphQL */ `
  query searchProducts($query: String!) {
    search(
      query: $query
      first: 50
      types: [PRODUCT]
      unavailableProducts: LAST
    ) {
      totalCount
      edges {
        node {
          ... on Product {
            ...productCard
          }
        }
      }
    }
  }
  ${productCard}
`

const cart = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              image {
                ...image
              }
              product {
                handle
                title
                featuredImage {
                  ...image
                }
              }
            }
          }
        }
      }
    }
  }
  ${image}
`

export const getCartQuery = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...cart
    }
  }
  ${cart}
`

export const createCartMutation = /* GraphQL */ `
  mutation createCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...cart
      }
      userErrors {
        message
      }
    }
  }
  ${cart}
`

export const addToCartMutation = /* GraphQL */ `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
      userErrors {
        message
      }
    }
  }
  ${cart}
`

export const updateCartMutation = /* GraphQL */ `
  mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
      userErrors {
        message
      }
    }
  }
  ${cart}
`

export const removeFromCartMutation = /* GraphQL */ `
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cart
      }
      userErrors {
        message
      }
    }
  }
  ${cart}
`

export const predictiveSearchQuery = /* GraphQL */ `
  query predictiveSearch($query: String!) {
    predictiveSearch(
      query: $query
      limit: 5
      limitScope: EACH
      types: [QUERY, PRODUCT, COLLECTION]
      unavailableProducts: LAST
    ) {
      queries {
        text
      }
      products {
        ...productCard
      }
      collections {
        handle
        title
        image {
          ...image
        }
      }
    }
  }
  ${productCard}
`

/** Which products in a collection match one Search & Discovery filter value. */
export const getCollectionFilterIdsQuery = /* GraphQL */ `
  query getCollectionFilterIds($handle: String!, $filters: [ProductFilter!]) {
    collection(handle: $handle) {
      products(first: 250, filters: $filters) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`
