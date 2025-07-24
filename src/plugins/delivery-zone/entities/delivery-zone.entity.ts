import { DeepPartial, VendureEntity } from "@vendure/core";
import { Column, Entity } from "typeorm";

/**
 * Entity representing a delivery zone with a name, coordinates (as JSON), and price.
 */
@Entity()
export class DeliveryZone extends VendureEntity {
  constructor(input?: DeepPartial<DeliveryZone>) {
    super(input);
  }

  @Column()
  name: string;

  @Column("text") // JSON with the list of coordinates
  coordinates: string;

  @Column()
  price: number;
}
