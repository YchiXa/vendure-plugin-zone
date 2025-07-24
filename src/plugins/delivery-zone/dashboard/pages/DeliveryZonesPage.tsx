import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon as LeafletPolygon,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { graphql } from "@/gql";
import { useMutation, useQuery } from "@tanstack/react-query";
import { requester } from "../../../../../../munchy-store/src/utils/api";
import type { ResultOf } from "@/gql";

// Type for a delivery zone
type DeliveryZone = {
  id: string;
  name: string;
  price: number;
  coordinates: string;
};

const deliveryZonesQuery = graphql(`
  query DeliveryZones {
    deliveryZones {
      items {
        id
        name
        price
        coordinates
      }
    }
  }
`);

const createZoneMutation = graphql(`
  mutation CreateZone($input: CreateDeliveryZoneInput!) {
    createDeliveryZone(input: $input) {
      id
    }
  }
`);

const updateZoneMutation = graphql(`
  mutation UpdateZone($input: UpdateDeliveryZoneInput!) {
    updateDeliveryZone(input: $input) {
      id
    }
  }
`);

const deleteZoneMutation = graphql(`
  mutation DeleteZone($id: ID!) {
    deleteDeliveryZone(id: $id) {
      result
    }
  }
`);

/**
 * Page component for managing delivery zones on a map.
 * Allows creating, editing, and deleting zones with polygon drawing.
 */
export const DeliveryZonesPage: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [draftCoords, setDraftCoords] = useState<[number, number][] | null>(
    null
  );
  const [form, setForm] = useState<{ name: string; price: string }>({
    name: "",
    price: "",
  });

  const { data, refetch } = useQuery<DeliveryZone[], Error>({
    queryKey: ["deliveryZones"],
    queryFn: async () => {
      const res = await requester(deliveryZonesQuery, {}, {});
      // @ts-expect-error
      return res.deliveryZones.items as DeliveryZone[];
    },
  });

  const createZone = useMutation<
    ResultOf<typeof createZoneMutation>,
    Error,
    { name: string; price: number; coordinates: string }
  >({
    mutationFn: async (input) => {
      return requester(createZoneMutation, { input }, {});
    },
    onSuccess: () => refetch(),
  });

  const updateZone = useMutation<
    ResultOf<typeof updateZoneMutation>,
    Error,
    { id: string; coordinates: string }
  >({
    mutationFn: async (input) => {
      return requester(updateZoneMutation, { input }, {});
    },
    onSuccess: () => refetch(),
  });

  const deleteZone = useMutation<
    ResultOf<typeof deleteZoneMutation>,
    Error,
    string
  >({
    mutationFn: async (id) => {
      return requester(deleteZoneMutation, { id }, {});
    },
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (data) {
      setZones(data);
    }
  }, [data]);

  // Validate that the polygon is closed and has at least 3 points
  const isValidPolygon = (coords: [number, number][]) => {
    if (coords.length < 3) return false;
    const first = coords[0];
    const last = coords[coords.length - 1];
    return first[0] === last[0] && first[1] === last[1];
  };

  // Handle creation of a new polygon on the map
  const handleCreated = (e: any) => {
    const latlngs = e.layer.getLatLngs()[0];
    let coords: [number, number][] = latlngs.map((p: any) => [p.lat, p.lng]);

    // Manually close the polygon if needed
    if (
      coords.length >= 3 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push(coords[0]);
    }

    if (!isValidPolygon(coords)) {
      alert("A polygon must have at least 3 points and be closed");
      return;
    }

    setDraftCoords(coords);
  };

  // Save a new delivery zone
  const handleSave = () => {
    if (!form.name || isNaN(+form.price) || !draftCoords) return;

    createZone.mutate({
      name: form.name,
      price: +form.price,
      coordinates: JSON.stringify(draftCoords),
    });

    setDraftCoords(null);
    setForm({ name: "", price: "" });
  };

  // Cancel adding or editing a zone
  const handleCancel = () => {
    setDraftCoords(null);
    setForm({ name: "", price: "" });
  };

  // Handle editing of existing polygons
  const handleEdited = (e: any) => {
    Object.values(e.layers._layers).forEach((layer: any) => {
      const coords = layer.getLatLngs()[0].map((p: any) => [p.lat, p.lng]) as [
        number,
        number,
      ][];
      const zoneId = layer.options.id;

      if (!isValidPolygon(coords)) {
        alert("The updated polygon is invalid. Cancelled.");
        refetch();
        return;
      }

      updateZone.mutate({ id: zoneId, coordinates: JSON.stringify(coords) });
    });
  };

  // Handle deletion of polygons
  const handleDeleted = (e: any) => {
    Object.values(e.layers._layers).forEach((layer: any) => {
      const zoneId = layer.options.id;
      deleteZone.mutate(zoneId);
    });
  };

  return (
    <div className="flex">
      <div className="w-3/4 p-4">
        <h1 className="text-2xl font-bold mb-4">Delivery Zones</h1>

        <MapContainer
          center={[55.75, 37.6] as [number, number]}
          zoom={12 as number}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            attribution={"© OpenStreetMap contributors" as string}
            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" as string}
          />
          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{
                rectangle: false,
                circle: false,
                marker: false,
                polyline: false,
                polygon: true,
              }}
              edit={{
                edit: true,
                remove: true,
              }}
              onCreated={handleCreated}
              onEdited={handleEdited}
              onDeleted={handleDeleted}
            />

            {zones.map((zone) => {
              try {
                const coords = JSON.parse(zone.coordinates);
                return (
                  <LeafletPolygon
                    key={zone.id}
                    positions={coords}
                    pathOptions={{ color: "blue" }}
                  />
                );
              } catch {
                return null;
              }
            })}

            {draftCoords && (
              <LeafletPolygon
                positions={draftCoords}
                pathOptions={{ color: "green", dashArray: "5" }}
              />
            )}
          </FeatureGroup>
        </MapContainer>
      </div>

      <div className="w-1/4 p-4 border-l bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Add Delivery Zone</h2>
        {!draftCoords ? (
          <p className="text-sm text-gray-600">Draw a zone on the map.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Zone Name
              </label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery Price (in cents)
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-1 bg-green-600 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-1 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
