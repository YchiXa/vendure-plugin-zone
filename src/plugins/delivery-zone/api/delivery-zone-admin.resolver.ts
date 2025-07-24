import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import {
  DeletionResponse,
  Permission,
} from "@vendure/common/lib/generated-types";
import {
  Allow,
  Ctx,
  ID,
  ListQueryOptions,
  PaginatedList,
  RelationPaths,
  Relations,
  RequestContext,
  Transaction,
} from "@vendure/core";
import { DeliveryZone } from "../entities/delivery-zone.entity";
import { DeliveryZoneService } from "../services/delivery-zone.service";

// Input type for creating a delivery zone
interface CreateDeliveryZoneInput {
  name: string;
  coordinates: string;
  price: number;
  // Define the input fields here
}
// Input type for updating a delivery zone
interface UpdateDeliveryZoneInput {
  id: ID;
  name?: string;
  coordinates?: string;
  price?: number;
  // Define the input fields here
}

/**
 * Resolver for admin operations on DeliveryZone entities.
 * Provides queries and mutations for managing delivery zones.
 */
@Resolver()
export class DeliveryZoneAdminResolver {
  constructor(private deliveryZoneService: DeliveryZoneService) {}

  /**
   * Returns a single delivery zone by ID.
   * Requires SuperAdmin permission.
   */
  @Query()
  @Allow(Permission.SuperAdmin)
  async deliveryZone(
    @Ctx() ctx: RequestContext,
    @Args() args: { id: ID },
    @Relations(DeliveryZone) relations: RelationPaths<DeliveryZone>
  ): Promise<DeliveryZone | null> {
    return this.deliveryZoneService.findOne(ctx, args.id, relations);
  }

  /**
   * Returns a paginated list of delivery zones.
   * Requires SuperAdmin permission.
   */
  @Query()
  @Allow(Permission.SuperAdmin)
  async deliveryZones(
    @Ctx() ctx: RequestContext,
    @Args() args: { options: ListQueryOptions<DeliveryZone> },
    @Relations(DeliveryZone) relations: RelationPaths<DeliveryZone>
  ): Promise<PaginatedList<DeliveryZone>> {
    return this.deliveryZoneService.findAll(
      ctx,
      args.options || undefined,
      relations
    );
  }

  /**
   * Creates a new delivery zone.
   * Requires SuperAdmin permission.
   * Runs in a transaction.
   */
  @Mutation()
  @Transaction()
  @Allow(Permission.SuperAdmin)
  async createDeliveryZone(
    @Ctx() ctx: RequestContext,
    @Args() args: { input: CreateDeliveryZoneInput }
  ): Promise<DeliveryZone> {
    return this.deliveryZoneService.create(ctx, args.input);
  }

  /**
   * Updates an existing delivery zone.
   * Requires SuperAdmin permission.
   * Runs in a transaction.
   */
  @Mutation()
  @Transaction()
  @Allow(Permission.SuperAdmin)
  async updateDeliveryZone(
    @Ctx() ctx: RequestContext,
    @Args() args: { input: UpdateDeliveryZoneInput }
  ): Promise<DeliveryZone> {
    return this.deliveryZoneService.update(ctx, args.input);
  }

  /**
   * Deletes a delivery zone by ID.
   * Requires SuperAdmin permission.
   * Runs in a transaction.
   */
  @Mutation()
  @Transaction()
  @Allow(Permission.SuperAdmin)
  async deleteDeliveryZone(
    @Ctx() ctx: RequestContext,
    @Args() args: { id: ID }
  ): Promise<DeletionResponse> {
    return this.deliveryZoneService.delete(ctx, args.id);
  }
}
