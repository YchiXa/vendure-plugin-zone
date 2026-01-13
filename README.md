# 📦 Delivery Zone Plugin for Vendure

**Delivery zone plugin for Vendure 3.3+**, implementing geo-zones on a map with management via a React Admin Dashboard. Allows calculation of delivery cost based on customer coordinates.

---

## 🚀 Features

- 🗺️ Display map with delivery zones (Leaflet + OpenStreetMap)
- ➕ Add, edit, and delete zones using an interactive UI
- 📐 Zones are defined as polygons on the map
- 📦 Calculate delivery cost based on the order address coordinates
- ✅ Shows the shipping method only if the address is within a zone
- ⚙️ Supports customFields `latitude`, `longitude` for `OrderAddress`
- 🧠 GraphQL CRUD API (Admin API)
- 📊 React Dashboard integration with Tailwind UI
- 📍 Address search (Nominatim) _(optional)_

---


## 📦 Installation

> Assumes you already have a working [Vendure](https://www.vendure.io/) project.

### 1. Install dependencies:

```bash
npm install leaflet react-leaflet react-leaflet-draw leaflet-draw @turf/turf
```

Connect the plugin in vendure-config.ts

```ts
import { DeliveryZonePlugin } from "./plugins/delivery-zone/delivery-zone.plugin";

export const config: VendureConfig = {
  plugins: [
    DeliveryZonePlugin.init({}),
    // other plugins...
  ],
};
```

Configure the React Dashboard (vite.config.mts)

```ts
vendureDashboardPlugin({
  vendureConfigPath: pathToFileURL(path.resolve(__dirname, './src/vendure-config.ts')),
  gqlTadaOutputPath: './src/gql',
}),
```

Generate the GraphQL SDK

```bash
npm run generate:gql
```

Add to package.json

```json
"scripts": {
  "generate:gql": "vite build --mode introspect"
}
```

Run migrations:

```bash
npx vendure migrate
npx vendure migrations:run
```

---

## 📌 Usage

### 🛠️ Creating Delivery Zones

- Open the React Dashboard
- Go to Settings → Delivery Zones
- Draw a zone on the map
- Specify the name and delivery price
- Save

### 📦 Setting up a Shipping Method

- Go to Settings → Shipping Methods
- Create a new shipping method
- Select:
  - zone-eligibility-checker
  - zone-shipping-calculator

### 🧪 Validations

- Zones must contain at least 3 points
- The polygon must be closed (the first and last points must match)
