import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/VerMapa/VerMapa.css';

import fetchWaypointsFromOSM from './VerMapa_funciones/TraerWaypoints';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const { BaseLayer } = LayersControl;

function UsarLimites({ setTopLeft, setBottomRight }) {
  useMapEvents({
    moveend: (e) => {
      const bounds = e.target.getBounds();
      setTopLeft([bounds.getNorth(), bounds.getWest()]);
      setBottomRight([bounds.getSouth(), bounds.getEast()]);
    }
  });
  return null;
}

function VerMapa() {
  const [waypoints, setWaypoints] = useState([]);
  const [topLeft, setTopLeft] = useState([41.65, 1.75]);
  const [bottomRight, setBottomRight] = useState([41.55, 1.90]);

  useEffect(() => {
    fetch('http://localhost:8000/api/ubicaciones/')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const conNombre = data.filter(p => p.nombre && p.nombre.trim() !== '');
          setWaypoints(conNombre);
        }
      })
      .catch((error) => console.error('❌ Error cargando ubicaciones:', error));
  }, []);

  const cargarDesdeOSM = async () => {
    const osmWaypoints = await fetchWaypointsFromOSM(topLeft, bottomRight);
    const conNombre = osmWaypoints.filter(p => p.nombre && p.nombre.trim() !== '');
    setWaypoints(conNombre);
  };

  return (
    <div className="map-wrapper">
      <h2 className="map-title">Mapa general</h2>

      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <p>🧭 Zona actual (auto desde mapa):</p>
        <code>
          Arriba izquierda: [{topLeft[0].toFixed(5)}, {topLeft[1].toFixed(5)}] | 
          Abajo derecha: [{bottomRight[0].toFixed(5)}, {bottomRight[1].toFixed(5)}]
        </code>
        <br />
        <button onClick={cargarDesdeOSM} style={{ marginTop: '8px' }}>
          Cargar desde OpenStreetMap
        </button>
      </div>

      <div className="map-container">
        <MapContainer center={[41.6, 1.83]} zoom={13} scrollWheelZoom={true} style={{ height: '500px' }}>
          <LayersControl position="topright">
            <BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
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

          <UsarLimites setTopLeft={setTopLeft} setBottomRight={setBottomRight} />

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

export default VerMapa;
