import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import SubirGPX_Waypoint from './SubirGPX_Waypoint';

// Icono para los marcadores
const icon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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

export default function SubirGPX_Mapa({ geojson, waypoints, setWaypoints }) {
  const [mapStyle, setMapStyle] = useState('osm');
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [waypointForm, setWaypointForm] = useState({
    type: "",
    photos: [],
    description: ""
  });

  const { BaseLayer } = LayersControl;

  // Abre el formulario para editar un waypoint
  const openWaypointForm = (wp) => {
    console.log("Waypoint clicked:", wp);  // Verifica los datos al hacer clic
    setSelectedWaypoint(wp);
  };

  // Cuando selectedWaypoint cambie, actualizamos waypointForm
  useEffect(() => {
    if (selectedWaypoint) {
      setWaypointForm({
        type: selectedWaypoint.type || "",
        photos: selectedWaypoint.photos || [],
        description: selectedWaypoint.desc || "",
      });
    }
  }, [selectedWaypoint]);

  // Maneja la carga de fotos (max 6 fotos)
  const handlePhotoUpload = (e) => {
    const newFiles = Array.from(e.target.files).slice(0, 6);
  
    // Si ya hay fotos cargadas, las acumulamos (sin pasarnos de 6)
    setWaypointForm(prev => {
      const combined = [...prev.photos, ...newFiles].slice(0, 6);
      return { ...prev, photos: combined };
    });
  };
  

  // Establecer la zona de "arrastrar y soltar" (Drag-and-drop)
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).slice(0, 6); // Limitar a 6 archivos
    setWaypointForm(prev => ({ ...prev, photos: files }));
  };

  // Prevenir el comportamiento por defecto cuando el archivo es arrastrado
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Cierra el formulario de edición
  const closeWaypointForm = () => {
    setSelectedWaypoint(null);
    setWaypointForm({ type: "", photos: [], description: "" });
  };

  // Maneja los cambios en los campos del formulario
  const handleWaypointChange = (e) => {
    const { name, value } = e.target;
    setWaypointForm(prev => ({ ...prev, [name]: value }));
  };

  const removePhotoAtIndex = (indexToRemove) => {
    setWaypointForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Guarda los cambios en el waypoint
  const saveWaypointData = () => {
    setWaypoints(prev =>
      prev.map(wp => {
        if (wp.id === selectedWaypoint.id) {
          return {
            ...wp,
            type: waypointForm.type,
            photos: waypointForm.photos,
            desc: waypointForm.description,
          };
        }
        return wp;
      })
    );
    closeWaypointForm();
  };

  if (!geojson || !Array.isArray(geojson) || geojson.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* MAPA A LA IZQUIERDA */}
      <div className="map-container" style={{ position: 'relative', width: '900px', height: '675px' }}>
  
        <MapContainer center={geojson[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <LayersControl position="topright">
            <BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
            </BaseLayer>
            <BaseLayer name="OpenTopoMap">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution="Map data: © OpenTopoMap contributors"
              />
            </BaseLayer>
            <BaseLayer name="Esri Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and others"
              />
            </BaseLayer>
          </LayersControl>
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
  
      {/* FORMULARIO A LA DERECHA */}
      {selectedWaypoint && (
        <SubirGPX_Waypoint
          waypoint={selectedWaypoint}
          waypointForm={waypointForm}
          setWaypointForm={setWaypointForm}
          waypointTypes={waypointTypes}
          onSave={saveWaypointData}
          onCancel={closeWaypointForm}
        />
      )}

    </div>
  );
  
}

// Tipos de waypoint
const waypointTypes = [
  "Cima",
  "Collado",
  "Río",
  "Lago",
  "Cueva",
  "Bosque",
  "Cascada",
  // Puedes agregar más tipos según necesites
];
