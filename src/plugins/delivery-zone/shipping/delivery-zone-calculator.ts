import {
  ShippingCalculator,
  LanguageCode,
  Injector,
  Order,
} from "@vendure/core";

import { DeliveryZoneService } from "../services/delivery-zone.service";

let deliveryZoneService: DeliveryZoneService;

// Shipping calculator for delivery zones
export const DeliveryZoneShippingCalculator = new ShippingCalculator({
  code: "delivery-zone-calculator",
  description: [
    {
      languageCode: LanguageCode.en,
      value: "Calculates delivery cost based on customer coordinates and zone",
    },
  ],
  args: {},

  // Initialize the calculator and inject the DeliveryZoneService
  init: (injector: Injector) => {
    deliveryZoneService = injector.get(DeliveryZoneService);
  },

  // Calculate the shipping price based on the delivery zone
  calculate: async (ctx, order) => {
    const address = order.shippingAddress;
    // If coordinates are missing, delivery is not possible, return zero price
    if (!address?.customFields?.latitude || !address?.customFields?.longitude) {
      return {
        price: 0,
        priceIncludesTax: ctx.channel.pricesIncludeTax,
        taxRate: 0,
      };
    }

    // Find the delivery zone by coordinates
    const zone = await deliveryZoneService.findZoneByCoordinates(
      ctx,
      address.customFields.latitude,
      address.customFields.longitude
    );

    // Use the price from the found zone, or zero if not found
    const price = zone?.price ?? 0;

    return {
      price,
      priceIncludesTax: ctx.channel.pricesIncludeTax,
      taxRate: 0,
    };
  },
});
