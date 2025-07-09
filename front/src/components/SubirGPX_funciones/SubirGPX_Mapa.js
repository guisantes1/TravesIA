import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Icono para los marcadores
const icon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Componente que maneja la capa NoGapTileLayer y espera a que el plugin esté disponible
function NoGapTileLayer({ url, attribution }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let noGapLayer = null;
    let canceled = false;

    function tryAddLayer() {
      if (canceled) return;

      if (window.L && window.L.tileLayer && window.L.tileLayer.noGap) {
        // Limpia capas previas noGap
        map.eachLayer(layer => {
          if (layer.options && layer.options.noGap) {
            map.removeLayer(layer);
          }
        });

        noGapLayer = window.L.tileLayer.noGap(url, {
          attribution,
          noGap: true,
          detectRetina: true,
        });
        noGapLayer.addTo(map);
      } else {
        // Intenta de nuevo en 100 ms si el plugin no está listo
        setTimeout(tryAddLayer, 100);
      }
    }

    tryAddLayer();

    return () => {
      canceled = true;
      if (map && noGapLayer) {
        map.removeLayer(noGapLayer);
      }
    };
  }, [map, url, attribution]);

  return null;
}

// Componente para recentrar el mapa automáticamente según posiciones
function RecenterAutomatically({ positions }) {
  const map = useMap();
  React.useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = positions.reduce(
        (bounds, pos) => bounds.extend(pos),
        L.latLngBounds(positions[0], positions[0])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

export default function SubirGPX_Mapa({ geojson, waypoints, openWaypointForm }) {
  const [mapStyle, setMapStyle] = useState('osm');

  const tileLayers = {
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      name: "OpenStreetMap",
    },
    topo: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        'Map data: © <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
      name: "OpenTopoMap",
    },
    esri: {
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution:
        'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and others',
      name: "Esri Satellite",
    },
  };

  if (!geojson || !Array.isArray(geojson) || geojson.length === 0) return null;

  return (
    <div className="map-container" style={{ position: 'relative', height: 600 }}>
      <select
        className="map-style-selector"
        value={mapStyle}
        onChange={e => setMapStyle(e.target.value)}
      >
        {Object.entries(tileLayers).map(([key, layer]) => (
          <option key={key} value={key}>{layer.name}</option>
        ))}
      </select>

      <MapContainer center={geojson[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url={tileLayers[mapStyle].url}
        attribution={tileLayers[mapStyle].attribution}
        detectRetina={true}
        tileSize={512}         // tamaño más grande para mejor resolución
        zoomOffset={-1}        // compensar tileSize para zoom correcto
        updateWhenIdle={true}  // mejora rendimiento y refresco
        updateWhenZooming={false}
      />

        <Polyline positions={geojson} color="blue" />
        {waypoints.map(wp => (
          <Marker
            key={wp.id}
            position={[wp.lat, wp.lon]}
            icon={icon}
            eventHandlers={{ click: () => openWaypointForm(wp) }}
          >
            <Popup>
              <strong>{wp.name}</strong><br />
              {wp.desc}
            </Popup>
          </Marker>
        ))}
        <RecenterAutomatically positions={geojson} />
      </MapContainer>
    </div>
  );

}
