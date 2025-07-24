// Dashboard extension entry for Delivery Zones
import { defineDashboardExtension } from "@vendure/dashboard";
import { DeliveryZonesPage } from "./pages/DeliveryZonesPage";

export default defineDashboardExtension({
  routes: [
    {
      path: "/delivery-zones",
      component: () => <DeliveryZonesPage />,
      navMenuItem: {
        id: "delivery-zones",
        sectionId: "settings",
        title: "Delivery Zones", // Translated from Russian
      },
    },
  ],
});
