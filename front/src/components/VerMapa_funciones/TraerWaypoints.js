import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const { BaseLayer } = LayersControl;

function AjustarVista({ waypoints }) {
  const map = useMap();

  useEffect(() => {
    if (waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      console.log('📍 Ajustando vista a bounds:', bounds);
    }
  }, [waypoints, map]);

  return null;
}

function VerMapa() {
  const [waypoints, setWaypoints] = useState([]);

  useEffect(() => {
    console.log('📡 Fetching /api/ubicaciones/');
    fetch('http://localhost:8000/api/ubicaciones/')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          console.log(`✅ ${data.length} ubicaciones recibidas`);
          setWaypoints(data);
        } else {
          console.warn('⚠️ La respuesta no es un array:', typeof data, data);
        }
      })
      .catch((error) => {
        console.error('❌ Error cargando ubicaciones:', error);
      });
  }, []);

  return (
    <div className="map-wrapper">
      <h2 className="map-title">Mapa general</h2>
      <div className="map-container">
      <MapContainer
        center={[41.6, 1.83]}
        zoom={13}
        scrollWheelZoom={true}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
              detectRetina={true}
            />
          </BaseLayer>
          <BaseLayer name="OpenTopoMap">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution="© OpenTopoMap"
            />
          </BaseLayer>
          <BaseLayer name="Satélite Esri">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri"
            />
          </BaseLayer>
        </LayersControl>

        <AjustarVista waypoints={waypoints} />

        {waypoints.map((ubicacion) => (
          <Marker key={ubicacion.id} position={[ubicacion.lat, ubicacion.lon]}>
            <Popup>{ubicacion.nombre}</Popup>
          </Marker>
        ))}
      </MapContainer>

      </div>
    </div>
  );
}

const fetchWaypointsFromOSM = async (topLeft, bottomRight) => {
  const [lat1, lon1] = topLeft;
  const [lat2, lon2] = bottomRight;

  const bbox = `${lat2},${lon1},${lat1},${lon2}`;

  const query = `
    [out:json][timeout:25];
    (
      node["tourism"="viewpoint"](${bbox});
      node["amenity"="shelter"](${bbox});
      node["natural"="peak"](${bbox});
      node["natural"="spring"](${bbox});
      node["amenity"="drinking_water"](${bbox});
      node["natural"="mountain_pass"](${bbox});
      node["tourism"="alpine_hut"](${bbox});
      node["man_made"="cross"](${bbox});
      node["tourism"="wilderness_hut"](${bbox});
      node["building"="cabin"](${bbox});
      node["amenity"="toilets"](${bbox});
      node["emergency"="phone"](${bbox});
      node["historic"="memorial"](${bbox});

      way["amenity"="shelter"](${bbox});
      way["tourism"="alpine_hut"](${bbox});
      way["natural"="spring"](${bbox});
      way["amenity"="drinking_water"](${bbox});
      way["natural"="mountain_pass"](${bbox});
      way["tourism"="viewpoint"](${bbox});
      way["man_made"="cross"](${bbox});
      way["historic"="memorial"](${bbox});
    );
    out center tags;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const traducirTipo = (tags) => {
    if (tags.tourism === "viewpoint") return "Mirador";
    if (tags.amenity === "shelter") return "Refugio libre";
    if (tags.amenity === "drinking_water") return "Agua potable";
    if (tags.natural === "peak") return "Cima";
    if (tags.natural === "spring") return "Fuente";
    if (tags.natural === "mountain_pass") return "Collado";
    if (tags.tourism === "alpine_hut") return "Refugio guardado";
    if (tags.man_made === "cross") return "Cruz de montaña";
    if (tags.tourism === "wilderness_hut") return "Cabaña rústica";
    if (tags.building === "cabin") return "Cabaña";
    if (tags.amenity === "toilets") return "Aseos";
    if (tags.emergency === "phone") return "Teléfono de emergencia";
    if (tags.historic === "memorial") return "Monumento";
    return "Otro";
  };

  const obtenerResumenWikipedia = async (nombre) => {
    const nombreWiki = nombre.trim().replace(/\s+/g, '_');  // <-- reemplaza espacios por "_"
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${nombreWiki}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.extract || null;
    } catch {
      return null;
    }
  };
  

  try {
    const response = await fetch(url);
    const data = await response.json();

    const normalized = await Promise.all(data.elements.map(async el => {
      let lat = el.lat || el.center?.lat;
      let lon = el.lon || el.center?.lon;
    
      if ((!lat || !lon) && el.type === 'way' && el.geometry?.length) {
        const avgLat = el.geometry.reduce((sum, p) => sum + p.lat, 0) / el.geometry.length;
        const avgLon = el.geometry.reduce((sum, p) => sum + p.lon, 0) / el.geometry.length;
        lat = avgLat;
        lon = avgLon;
      }
    
      const nombre = el.tags?.name?.trim();
      if (!lat || !lon || !nombre) return null;
    
      const tipo = traducirTipo(el.tags);
      const fallbackDescripcion = el.tags?.description || el.tags?.note || '';
      const resumenWiki = await obtenerResumenWikipedia(nombre);
    
      return {
        id: el.id,
        lat,
        lon,
        nombre,
        tipo,
        descripcion: resumenWiki || fallbackDescripcion
      };
    }));
    
    // 👇 Añade este console.log justo antes de devolver
    console.log("✅ Waypoints normalizados para enviar:", normalized.filter(Boolean));
    
    return normalized.filter(Boolean);
    
  } catch (error) {
    console.error("❌ Error al consultar Overpass API:", error);
    return [];
  }
};

export default fetchWaypointsFromOSM;

  
  
  

