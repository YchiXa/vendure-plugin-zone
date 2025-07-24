import path from "path";
import {
  LanguageCode,
  PluginCommonModule,
  Type,
  VendurePlugin,
} from "@vendure/core";

import { DELIVERY_ZONE_PLUGIN_OPTIONS } from "./constants";
import { PluginInitOptions } from "./types";
import { DeliveryZone } from "./entities/delivery-zone.entity";
import { DeliveryZoneService } from "./services/delivery-zone.service";
import { DeliveryZoneAdminResolver } from "./api/delivery-zone-admin.resolver";
import { adminApiExtensions } from "./api/api-extensions";
import { DeliveryZoneShippingCalculator } from "./shipping/delivery-zone-calculator";
import { DeliveryZoneEligibilityChecker } from "./shipping/delivery-zone-checker";

// Main plugin decorator
@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    {
      provide: DELIVERY_ZONE_PLUGIN_OPTIONS,
      useFactory: () => DeliveryZonePlugin.options,
    },
    DeliveryZoneService,
  ],
  entities: [DeliveryZone], // Register custom entity
  compatibility: "^3.0.0",

  dashboard: "./dashboard/index.tsx", // Path to dashboard entry

  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [DeliveryZoneAdminResolver],
  },

  configuration: (config) => {
    // Add custom fields for latitude and longitude to the delivery address
    config.customFields.Address.push(
      {
        name: "latitude",
        type: "float",
        label: [{ languageCode: LanguageCode.en, value: "Latitude" }],
      },
      {
        name: "longitude",
        type: "float",
        label: [{ languageCode: LanguageCode.en, value: "Longitude" }],
      }
    );

    // Register custom shipping calculator and eligibility checker
    config.shippingOptions.shippingCalculators.push(
      DeliveryZoneShippingCalculator
    );
    config.shippingOptions.shippingEligibilityCheckers.push(
      DeliveryZoneEligibilityChecker
    );

    return config;
  },
})
export class DeliveryZonePlugin {
  static options: PluginInitOptions;

  /**
   * Initialize the plugin with custom options
   */
  static init(options: PluginInitOptions): Type<DeliveryZonePlugin> {
    this.options = options;
    return DeliveryZonePlugin;
  }
}
