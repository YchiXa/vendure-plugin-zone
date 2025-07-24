import { Inject, Injectable } from "@nestjs/common";
import {
  DeletionResponse,
  DeletionResult,
} from "@vendure/common/lib/generated-types";
import { ID, PaginatedList } from "@vendure/common/lib/shared-types";
import {
  ListQueryBuilder,
  ListQueryOptions,
  RelationPaths,
  RequestContext,
  TransactionalConnection,
  assertFound,
  patchEntity,
} from "@vendure/core";
import { DELIVERY_ZONE_PLUGIN_OPTIONS } from "../constants";
import { DeliveryZone } from "../entities/delivery-zone.entity";
import { PluginInitOptions } from "../types";

// Turf.js is used for geospatial analysis
import * as turf from "@turf/turf";

interface CreateDeliveryZoneInput {
  name: string;
  coordinates: string;
  price: number;
}

interface UpdateDeliveryZoneInput {
  id: ID;
  name?: string;
  coordinates?: string;
  price?: number;
}

/**
 * Service for managing delivery zones, including CRUD operations and geospatial search.
 */
@Injectable()
export class DeliveryZoneService {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
    @Inject(DELIVERY_ZONE_PLUGIN_OPTIONS) private options: PluginInitOptions
  ) {}

  /**
   * Returns a paginated list of all delivery zones.
   */
  findAll(
    ctx: RequestContext,
    options?: ListQueryOptions<DeliveryZone>,
    relations?: RelationPaths<DeliveryZone>
  ): Promise<PaginatedList<DeliveryZone>> {
    return this.listQueryBuilder
      .build(DeliveryZone, options, {
        relations,
        ctx,
      })
      .getManyAndCount()
      .then(([items, totalItems]) => ({
        items,
        totalItems,
      }));
  }

  /**
   * Returns a single delivery zone by ID.
   */
  findOne(
    ctx: RequestContext,
    id: ID,
    relations?: RelationPaths<DeliveryZone>
  ): Promise<DeliveryZone | null> {
    return this.connection.getRepository(ctx, DeliveryZone).findOne({
      where: { id },
      relations,
    });
  }

  /**
   * Creates a new delivery zone.
   */
  async create(
    ctx: RequestContext,
    input: CreateDeliveryZoneInput
  ): Promise<DeliveryZone> {
    const newEntityInstance = new DeliveryZone(input);
    const newEntity = await this.connection
      .getRepository(ctx, DeliveryZone)
      .save(newEntityInstance);
    return assertFound(this.findOne(ctx, newEntity.id));
  }

  /**
   * Updates an existing delivery zone.
   */
  async update(
    ctx: RequestContext,
    input: UpdateDeliveryZoneInput
  ): Promise<DeliveryZone> {
    const entity = await this.connection.getEntityOrThrow(
      ctx,
      DeliveryZone,
      input.id
    );
    const updatedEntity = patchEntity(entity, input);
    await this.connection
      .getRepository(ctx, DeliveryZone)
      .save(updatedEntity, { reload: false });
    return assertFound(this.findOne(ctx, updatedEntity.id));
  }

  /**
   * Deletes a delivery zone by ID.
   * Returns the deletion result and an optional error message.
   */
  async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
    const entity = await this.connection.getEntityOrThrow(
      ctx,
      DeliveryZone,
      id
    );
    try {
      await this.connection.getRepository(ctx, DeliveryZone).remove(entity);
      return {
        result: DeletionResult.DELETED,
      };
    } catch (e: any) {
      return {
        result: DeletionResult.NOT_DELETED,
        message: e.toString(),
      };
    }
  }

  /**
   * Returns the first delivery zone that contains the given coordinates.
   * Uses Turf.js for geospatial polygon search.
   */
  async findZoneByCoordinates(
    ctx: RequestContext,
    latitude: number,
    longitude: number
  ): Promise<DeliveryZone | undefined> {
    const zones = await this.connection.getRepository(ctx, DeliveryZone).find();

    for (const zone of zones) {
      try {
        const parsedCoords: [number, number][] = JSON.parse(zone.coordinates);

        // Prepare GeoJSON polygon: [[[lng, lat], ...]]
        const polygon = turf.polygon([
          parsedCoords.map(([lat, lng]) => [lng, lat]),
        ]);

        const point = turf.point([longitude, latitude]);
        const isInside = turf.booleanPointInPolygon(point, polygon);

        if (isInside) {
          return zone;
        }
      } catch (err) {
        console.warn(`⚠️ Failed to parse coordinates in zone ${zone.id}:`, err);
        continue;
      }
    }

    return undefined;
  }
}
