// components/map/RegionMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix untuk icon marker Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Data GeoJSON sederhana
const REGION_GEOJSON: Record<string, any> = {
  Sumatera: {
    type: 'Feature',
    properties: { name: 'Sumatera', color: '#10b981' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [95.0, 5.5],
          [105.0, 5.5],
          [105.0, -5.5],
          [95.0, -5.5],
          [95.0, 5.5],
        ],
      ],
    },
  },

  Jawa: {
    type: 'Feature',
    properties: { name: 'Jawa', color: '#f59e0b' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [105.0, -6.0],
          [114.5, -6.0],
          [114.5, -8.8],
          [105.0, -8.8],
          [105.0, -6.0],
        ],
      ],
    },
  },

  Kalimantan: {
    type: 'Feature',
    properties: { name: 'Kalimantan', color: '#3b82f6' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [108.0, 4.5],
          [119.0, 4.5],
          [119.0, -4.0],
          [108.0, -4.0],
          [108.0, 4.5],
        ],
      ],
    },
  },

  Sulawesi: {
    type: 'Feature',
    properties: { name: 'Sulawesi', color: '#ef4444' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [118.0, 1.5],
          [125.0, 1.5],
          [125.0, -5.5],
          [118.0, -5.5],
          [118.0, 1.5],
        ],
      ],
    },
  },

  Papua: {
    type: 'Feature',
    properties: { name: 'Papua', color: '#8b5cf6' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [130.0, -1.0],
          [141.0, -1.0],
          [141.0, -8.5],
          [130.0, -8.5],
          [130.0, -1.0],
        ],
      ],
    },
  },

  Bali_Nusa: {
    type: 'Feature',
    properties: {
      name: 'Bali & Nusa Tenggara',
      color: '#ec489a',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [114.5, -6.5],
          [119.5, -6.5],
          [119.5, -10.0],
          [114.5, -10.0],
          [114.5, -6.5],
        ],
      ],
    },
  },
};

function MapBounds({
  regions,
  selectedRegion,
}: {
  regions: string[];
  selectedRegion: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedRegion && REGION_GEOJSON[selectedRegion]) {
      const bounds = L.geoJSON(
        REGION_GEOJSON[selectedRegion]
      ).getBounds();

      map.fitBounds(bounds, {
        padding: [30, 30],
      });
    } else if (regions.length > 0) {
      const allBounds = L.latLngBounds([]);

      regions.forEach((region) => {
        if (REGION_GEOJSON[region]) {
          allBounds.extend(
            L.geoJSON(REGION_GEOJSON[region]).getBounds()
          );
        }
      });

      if (allBounds.isValid()) {
        map.fitBounds(allBounds, {
          padding: [30, 30],
        });
      } else {
        map.setView([-2.5, 118.0], 5);
      }
    }
  }, [map, regions, selectedRegion]);

  return null;
}

interface RegionMapProps {
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
  availableRegions: string[];
}

export function RegionMap({
  selectedRegion,
  onRegionSelect,
  availableRegions,
}: RegionMapProps) {
  const [hoveredRegion, setHoveredRegion] =
    useState<string | null>(null);

  const getRegionStyle = (regionName: string) => {
    const isSelected = selectedRegion === regionName;
    const isHovered = hoveredRegion === regionName;

    return {
      fillColor:
        REGION_GEOJSON[regionName]?.properties.color ||
        '#6b7280',
      weight: isSelected ? 3 : isHovered ? 2 : 1,
      opacity: 0.8,
      color: isSelected
        ? '#000000'
        : isHovered
        ? '#333333'
        : '#ffffff',
      fillOpacity: isSelected
        ? 0.6
        : isHovered
        ? 0.4
        : 0.25,
    };
  };

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      <MapContainer
        center={[-2.5, 118.0]}
        zoom={5}
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains={['a', 'b', 'c', 'd']}
        />

        {Object.entries(REGION_GEOJSON).map(([name, data]) => {
          if (!availableRegions.includes(name)) {
            return null;
          }

          return (
            <GeoJSON
              key={name}
              data={data}
              style={() => getRegionStyle(name)}
              onEachFeature={(_, layer) => {
                layer.bindTooltip(name, {
                  sticky: true,
                });

                layer.on({
                  mouseover: () => {
                    setHoveredRegion(name);
                  },

                  mouseout: () => {
                    setHoveredRegion(null);
                  },

                  click: () => {
                    if (selectedRegion === name) {
                      onRegionSelect(null);
                    } else {
                      onRegionSelect(name);
                    }
                  },
                });
              }}
            />
          );
        })}

        <MapBounds
          regions={availableRegions}
          selectedRegion={selectedRegion}
        />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs shadow-md z-[1000]">
        <p className="font-medium text-gray-700 mb-1">
          Klik wilayah pada peta:
        </p>

        {availableRegions.map((region) => (
          <div
            key={region}
            className="flex items-center gap-2 mb-0.5"
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  REGION_GEOJSON[region]?.properties.color ||
                  '#6b7280',
              }}
            />

            <span
              className={
                selectedRegion === region
                  ? 'font-bold text-emerald-600'
                  : 'text-gray-600'
              }
            >
              {region}
            </span>

            {selectedRegion === region && (
              <span className="text-emerald-600">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}