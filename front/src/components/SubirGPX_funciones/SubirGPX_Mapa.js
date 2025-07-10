import React, { useState, useEffect } from 'react';
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
    const files = Array.from(e.target.files).slice(0, 6); // Limitar a 6 archivos
    setWaypointForm(prev => ({ ...prev, photos: files }));
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
  
      {/* FORMULARIO A LA DERECHA */}
      {selectedWaypoint && (
        <div className="waypoint-form" style={{
          width: '300px',
          padding: '15px',
          background: '#f9f9f9',
          border: '1px solid #ccc',
          borderRadius: '8px',
          height: 'fit-content'
        }}>
          <h3>Editar Waypoint: {selectedWaypoint.name}</h3>
          <div>
            <label>Tipo:</label>
            <select
              name="type"
              value={waypointForm.type}
              onChange={handleWaypointChange}
            >
              <option value="">Selecciona un tipo</option>
              {waypointTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 10 }}>
            <label>Descripción:</label>
            <textarea
              name="description"
              value={waypointForm.description}
              onChange={handleWaypointChange}
              placeholder="Descripción del waypoint"
              rows={4}
              style={{ width: '100%' }}
            />
          </div>
          <div
            className="file-drop-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{ marginTop: 10 }}
          >
            <label>Fotos:</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
            />
            <div className="photo-preview" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {waypointForm.photos && waypointForm.photos.map((file, index) => (
                <div key={index} className="photo-thumbnail">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    style={{ width: "50px", height: "50px", objectFit: "cover", margin: "5px", borderRadius: "5px" }}
                  />
                  <div style={{ fontSize: '10px' }}>{file.name}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={saveWaypointData} style={{ marginTop: 10 }}>Guardar</button>
          <button className="cancel" onClick={closeWaypointForm} style={{ marginTop: 5 }}>Cancelar</button>
        </div>
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
