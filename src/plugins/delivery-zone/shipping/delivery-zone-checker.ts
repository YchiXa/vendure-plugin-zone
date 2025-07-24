import {
  ShippingEligibilityChecker,
  LanguageCode,
  Injector,
} from "@vendure/core";
import { DeliveryZoneService } from "../services/delivery-zone.service";

let deliveryZoneService: DeliveryZoneService;

// Shipping eligibility checker for delivery zones
export const DeliveryZoneEligibilityChecker = new ShippingEligibilityChecker({
  code: "delivery-zone-checker",
  description: [
    {
      languageCode: LanguageCode.en,
      value: "Available only if the delivery address is inside a delivery zone",
    },
  ],
  args: {},

  // Initialize the checker and inject the DeliveryZoneService
  init: (injector: Injector) => {
    deliveryZoneService = injector.get(DeliveryZoneService);
  },

  // Check if the shipping address is within a delivery zone
  check: async (ctx, order) => {
    const address = order.shippingAddress;
    // If coordinates are missing, delivery is not eligible
    if (!address?.customFields?.latitude || !address?.customFields?.longitude) {
      return false;
    }

    // Find the delivery zone by coordinates
    const zone = await deliveryZoneService.findZoneByCoordinates(
      ctx,
      address.customFields.latitude,
      address.customFields.longitude
    );

    // Return true if a zone is found, otherwise false
    return !!zone;
  },
});
