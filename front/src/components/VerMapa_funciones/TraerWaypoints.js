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

// src/components/VerMapa_funciones/TraerWaypoints.js

const fetchWaypointsFromOSM = async (topLeft, bottomRight) => {
    const [lat1, lon1] = topLeft;
    const [lat2, lon2] = bottomRight;
  
    const bbox = `${lat2},${lon1},${lat1},${lon2}`;
  
    const query = `
        [out:json][timeout:25];
        (
        // 🔹 NODES (puntos individuales)
        node["tourism"="viewpoint"](${bbox});             // Miradores
        node["amenity"="shelter"](${bbox});               // Refugios simples
        node["natural"="peak"](${bbox});                  // Picos / cumbres
        node["natural"="spring"](${bbox});                // Fuentes naturales
        node["amenity"="drinking_water"](${bbox});        // Agua potable (grifo o similar)
        node["natural"="mountain_pass"](${bbox});         // Collados / pasos de montaña
        node["tourism"="alpine_hut"](${bbox});            // Refugios de montaña guardados
        node["man_made"="cross"](${bbox});                // Cruces en picos o pasos
        node["tourism"="wilderness_hut"](${bbox});        // Cabañas rústicas (Finlandia, Noruega)
        node["building"="cabin"](${bbox});                // Cabañas (puede ser redundante)
        node["amenity"="toilets"](${bbox});               // Baños (interesante en rutas largas)
        node["emergency"="phone"](${bbox});               // Teléfono de emergencia
        node["historic"="memorial"](${bbox});             // Monumentos conmemorativos

        // 🔸 WAYS (formas/polígonos con centro)
        way["amenity"="shelter"](${bbox});                // Refugios simples en forma de way
        way["tourism"="alpine_hut"](${bbox});             // Refugios grandes (guardados)
        way["natural"="spring"](${bbox});                 // Fuente en forma de way
        way["amenity"="drinking_water"](${bbox});         // Agua potable en forma de way
        way["natural"="mountain_pass"](${bbox});          // Collado como forma (raro)
        way["tourism"="viewpoint"](${bbox});              // Mirador en forma de área
        way["man_made"="cross"](${bbox});                 // Cruz como elemento visible
        way["historic"="memorial"](${bbox});              // Monumento conmemorativo

        );
        out center tags;
    `;
  
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const normalized = data.elements.map(el => {
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
  
        return {
          id: el.id,
          lat,
          lon,
          nombre,
          tipo: el.tags?.amenity || el.tags?.natural || el.tags?.tourism || 'desconocido'
        };
      }).filter(Boolean);
  
      return normalized;
    } catch (error) {
      console.error("❌ Error al consultar Overpass API:", error);
      return [];
    }
};  
     
export default fetchWaypointsFromOSM;
  
  
  
  

