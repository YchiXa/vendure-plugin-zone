import type { introspection } from "./graphql-env.d.ts";
import { initGraphQLTada } from "gql.tada";

// GraphQL SDK initialization and ready-to-use queries/mutations for Delivery Zones
export const graphql = initGraphQLTada<{
  disableMasking: true;
  introspection: introspection;
  scalars: {
    DateTime: string;
    JSON: any;
    Money: number;
  };
}>();

// Types
export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
export { readFragment } from "gql.tada";

// Ready-to-use GraphQL queries and mutations:

export const GetDeliveryZones = graphql(`
  query GetDeliveryZones {
    deliveryZones {
      id
      name
      price
      coordinates
    }
  }
`);

export const GetDeliveryZone = graphql(`
  query GetDeliveryZone($id: ID!) {
    deliveryZone(id: $id) {
      id
      name
      price
      coordinates
    }
  }
`);

export const CreateDeliveryZone = graphql(`
  mutation CreateDeliveryZone($input: CreateDeliveryZoneInput!) {
    createDeliveryZone(input: $input) {
      id
      name
    }
  }
`);

export const UpdateDeliveryZone = graphql(`
  mutation UpdateDeliveryZone($input: UpdateDeliveryZoneInput!) {
    updateDeliveryZone(input: $input) {
      id
      name
    }
  }
`);

export const DeleteDeliveryZone = graphql(`
  mutation DeleteDeliveryZone($id: ID!) {
    deleteDeliveryZone(id: $id) {
      result
      message
    }
  }
`);
