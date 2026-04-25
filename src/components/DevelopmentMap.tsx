"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import type { DevelopmentSummary } from "@/app/api/developments/route";

// Fix Leaflet default icons (Next.js / webpack issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl:        "/leaflet/marker-icon.png",
  shadowUrl:      "/leaflet/marker-shadow.png",
});

const BRAND = "#D4AF37";

// ─── Cluster icon ─────────────────────────────────────────────────────────────

function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  const size  = count < 10 ? 36 : count < 50 ? 42 : 48;
  const bg    = count < 10 ? BRAND : count < 50 ? "#f97316" : "#ef4444";
  return L.divIcon({
    html: `<div style="
      background:${bg};color:#fff;width:${size}px;height:${size}px;
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:12px;border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.25)
    ">${count}</div>`,
    className: "",
    iconSize:  L.point(size, size, true),
  });
}

// ─── DrawControls (inner component, uses useMap) ─────────────────────────────

interface DrawControlsProps {
  onBoundsChange: (b: L.LatLngBounds | null) => void;
}

function DrawControls({ onBoundsChange }: DrawControlsProps) {
  const map        = useMap();
  const drawnRef   = useRef<L.FeatureGroup | null>(null);
  const boundsRef  = useRef<L.LatLngBounds | null>(null);
  const [hasArea, setHasArea] = useState(false);

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnRef.current = drawnItems;

    // Dynamically import leaflet-draw (avoids SSR issues)
    import("leaflet-draw").then(() => {
      map.on("draw:created", (e: any) => {
        drawnItems.clearLayers();
        drawnItems.addLayer(e.layer);
        boundsRef.current = (e.layer as L.Rectangle).getBounds();
        setHasArea(true);
      });
      map.on("draw:deleted", () => {
        boundsRef.current = null;
        setHasArea(false);
        onBoundsChange(null);
      });
    });

    return () => {
      map.removeLayer(drawnItems);
      map.off("draw:created");
      map.off("draw:deleted");
    };
  }, [map, onBoundsChange]);

  function startDraw() {
    import("leaflet-draw").then(() => {
      const LD = L as any;
      const drawer = new LD.Draw.Rectangle(map, {
        shapeOptions: {
          color:       BRAND,
          fillColor:   BRAND,
          fillOpacity: 0.15,
          weight:      2,
        },
      });
      drawer.enable();
    });
  }

  function eraseArea() {
    drawnRef.current?.clearLayers();
    boundsRef.current = null;
    setHasArea(false);
    onBoundsChange(null);
  }

  function searchArea() {
    if (boundsRef.current) onBoundsChange(boundsRef.current);
  }

  return (
    <div
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2"
      // Stop map clicks from propagating through the button bar
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={startDraw}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 shadow hover:bg-gray-50 transition-colors"
      >
        ✏️ Draw Area
      </button>
      <button
        onClick={eraseArea}
        disabled={!hasArea}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 shadow hover:bg-gray-50 transition-colors disabled:opacity-40"
      >
        🗑 Erase Area
      </button>
      <button
        onClick={searchArea}
        disabled={!hasArea}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow transition-colors disabled:opacity-40"
        style={{ backgroundColor: BRAND }}
      >
        🔍 Search This Area
      </button>
    </div>
  );
}

// ─── HideSoldToggle ───────────────────────────────────────────────────────────

function HideSoldToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow border border-gray-200"
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <span className="text-xs text-gray-600 font-medium">Hide sold?</span>
      <div
        onClick={() => onChange(!value)}
        className="relative w-8 h-4 rounded-full cursor-pointer transition-colors duration-200"
        style={{ backgroundColor: value ? BRAND : "#e2e8f0" }}
      >
        <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-4" : ""}`} />
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export interface DevelopmentMapProps {
  developments: DevelopmentSummary[];
  hideSold: boolean;
  onHideSoldChange: (v: boolean) => void;
  onAreaSelect: (bounds: L.LatLngBounds | null) => void;
}

export default function DevelopmentMap({
  developments,
  hideSold,
  onHideSoldChange,
  onAreaSelect,
}: DevelopmentMapProps) {
  // Only show developments that have coordinates
  const withCoords = developments.filter(d => d.lat !== null && d.lng !== null);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={[40, -3]}
        zoom={6}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
        >
          {withCoords.map(dev => (
            <Marker
              key={dev.devId}
              position={[dev.lat!, dev.lng!]}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-xs">
                  <p className="font-semibold text-gray-900">{dev.name || dev.devId}</p>
                  <p className="text-gray-500">{dev.town}</p>
                  {dev.minPrice > 0 && (
                    <p className="font-medium mt-0.5" style={{ color: BRAND }}>
                      From {dev.minPrice.toLocaleString("fr-FR")} €
                    </p>
                  )}
                  <p className="text-gray-400">{dev.unitCount} unit{dev.unitCount > 1 ? "s" : ""}</p>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>

        <DrawControls onBoundsChange={onAreaSelect} />
        <HideSoldToggle value={hideSold} onChange={onHideSoldChange} />
      </MapContainer>

      {withCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="bg-white/90 px-4 py-2 rounded-lg text-sm text-gray-500 shadow">
            No coordinates available for these developments
          </p>
        </div>
      )}
    </div>
  );
}
