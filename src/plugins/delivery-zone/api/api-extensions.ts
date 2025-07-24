import gql from 'graphql-tag';

// GraphQL schema extensions for DeliveryZone admin API
const deliveryZoneAdminApiExtensions = gql`
  # DeliveryZone entity type
  type DeliveryZone implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    coordinates: String!
    price: Int!
  }

  # Paginated list of delivery zones
  type DeliveryZoneList implements PaginatedList {
    items: [DeliveryZone!]!
    totalItems: Int!
  }

  # Generated at run-time by Vendure
  input DeliveryZoneListOptions

  # Query extensions for delivery zones
  extend type Query {
    deliveryZone(id: ID!): DeliveryZone
    deliveryZones(options: DeliveryZoneListOptions): DeliveryZoneList!
  }

  # Input type for creating a delivery zone
  input CreateDeliveryZoneInput {
    name: String!
    coordinates: String!
    price: Int!
  }

  # Input type for updating a delivery zone
  input UpdateDeliveryZoneInput {
    id: ID!
    name: String
    coordinates: String
    price: Int
  }

  # Mutation extensions for delivery zones
  extend type Mutation {
    createDeliveryZone(input: CreateDeliveryZoneInput!): DeliveryZone!
    updateDeliveryZone(input: UpdateDeliveryZoneInput!): DeliveryZone!
    deleteDeliveryZone(id: ID!): DeletionResponse!
  }
`;

// Export the schema extensions for use in the plugin
export const adminApiExtensions = gql`
  ${deliveryZoneAdminApiExtensions}
`;
