import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GPX from 'gpxparser';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import '../styles/SubirGPX.css';

const icon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const waypointTypes = [
  "peak",
  "collado",
  "river",
  "lake",
  "cave",
  "forest",
  "waterfall",
  // Añade más según OSM
];

export default function SubirGPX() {
  const [geojson, setGeojson] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [message, setMessage] = useState('Arrastra o selecciona un archivo GPX');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [waypointForm, setWaypointForm] = useState({ type: "", photos: [], description: "" });

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
        try {
          const gpx = new GPX();
          console.log("Contenido GPX leído:", reader.result); // 👈 AÑADE AQUÍ
          gpx.parse(String(reader.result));
      
          const trackPoints = [];
          
          gpx.tracks.forEach((track, i) => {
            if (!track.segments) {
              console.warn(`Track ${i} no tiene segmentos.`);
              return;
            }
            track.segments.forEach(segment => {
              if (!segment) return;
              segment.forEach(point => {
                trackPoints.push([point.lat, point.lon]);
              });
            });
          });
          
          
          
        
      
          const wpts = gpx.waypoints.map(wp => ({
            id: wp.name || Math.random().toString(36).substr(2, 9),
            lat: wp.lat,
            lon: wp.lon,
            name: wp.name || 'Waypoint',
            desc: wp.desc || '',
            type: "",
            photos: [],
          }));
      
          setGeojson(trackPoints.length > 0 ? trackPoints : null);
          setWaypoints(wpts);
          setMessage(`Archivo GPX cargado: ${file.name}`);
      
        } catch (e) {
          console.error("Error al parsear GPX:", e); // 👈 OPCIONAL
          setMessage('Error leyendo el archivo GPX.');
          setGeojson(null);
          setWaypoints([]);
        }
    };      

    reader.readAsText(file, 'UTF-8');

  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/gpx+xml': ['.gpx'] },
    multiple: false,
  });

  function openWaypointForm(wp) {
    setSelectedWaypoint(wp);
    setWaypointForm({
      type: wp.type || "",
      photos: wp.photos || [],
      description: wp.desc || ""
    });
  }

  function closeWaypointForm() {
    setSelectedWaypoint(null);
    setWaypointForm({ type: "", photos: [], description: "" });
  }

  function handleWaypointChange(e) {
    const { name, value } = e.target;
    setWaypointForm(prev => ({ ...prev, [name]: value }));
  }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files).slice(0, 6);
    setWaypointForm(prev => ({ ...prev, photos: files }));
  }

  function saveWaypointData() {
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
  }

  async function guardarRuta() {
    if (!geojson) return;
    // Aquí deberías convertir waypoints y fotos a formato para backend (multipart/form-data)
    // o separar subida de fotos y datos.
    alert("Función guardar ruta aún no implementada en backend.");
  }

  return (
    <div className="container-subir-gpx">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
        <input {...getInputProps()} />
        <p>{isDragActive ? "Suelta el archivo aquí..." : message}</p>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Fecha de la ruta: </label>
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      {geojson && (
        <>
          <MapContainer center={geojson[0]} zoom={13} style={{ height: 400, marginTop: 20 }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <Polyline positions={geojson} color="blue" />
            {waypoints.map(wp => (
              <Marker key={wp.id} position={[wp.lat, wp.lon]} icon={icon} eventHandlers={{ click: () => openWaypointForm(wp) }}>
                <Popup>
                  <strong>{wp.name}</strong><br />
                  {wp.desc}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <button onClick={guardarRuta} style={{ marginTop: 15, padding: '10px 20px', fontWeight: 'bold' }}>
            Guardar ruta
          </button>
        </>
      )}

      {selectedWaypoint && (
        <div className="waypoint-form">
          <h3>Editar Waypoint: {selectedWaypoint.name}</h3>
          <label>Tipo:</label>
          <select name="type" value={waypointForm.type} onChange={handleWaypointChange}>
            <option value="">-- Selecciona tipo --</option>
            {waypointTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <label>Descripción:</label>
          <textarea name="description" value={waypointForm.description} onChange={handleWaypointChange} rows={3} />

          <label>Fotos (máximo 6):</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
          />

          <button onClick={saveWaypointData} style={{ marginTop: 10 }}>
            Guardar waypoint
          </button>
          <button onClick={closeWaypointForm} style={{ marginLeft: 10 }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
