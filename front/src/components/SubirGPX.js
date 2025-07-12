import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GPX from 'gpxparser';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import '../styles/SubirGPX/layout.css';
import '../styles/SubirGPX/map.css';
import '../styles/SubirGPX/waypoint-form.css';


import SubirGPX_Dropzone from './SubirGPX_funciones/SubirGPX_Dropzone';
import SubirGPX_Mapa from './SubirGPX_funciones/SubirGPX_Mapa';


const icon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});



export default function SubirGPX() {
  const [geojson, setGeojson] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [message, setMessage] = useState('Arrastra o selecciona un archivo GPX');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [waypointForm, setWaypointForm] = useState({ type: "", photos: [], description: "" });
  const [rutaDescripcion, setRutaDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const gpx = new GPX();
        console.log("Contenido GPX leído:", reader.result);
        gpx.parse(String(reader.result));
    
        const trackPoints = [];
        let tracksWithSegments = 0;
    
        gpx.tracks.forEach((track, i) => {
          let pointsAdded = false;
    
          if (track.segments && track.segments.length > 0) {
            track.segments.forEach(segment => {
              if (!segment) return;
              segment.forEach(point => {
                trackPoints.push([point.lat, point.lon]);
                pointsAdded = true;
              });
            });
          } else if (track.trkseg && track.trkseg.length > 0) {
            track.trkseg.forEach(segment => {
              if (!segment) return;
              segment.forEach(point => {
                trackPoints.push([point.lat, point.lon]);
                pointsAdded = true;
              });
            });
          } else if (track.points && track.points.length > 0) {
            track.points.forEach(point => {
              trackPoints.push([point.lat, point.lon]);
              pointsAdded = true;
            });
          } else {
            console.warn(`Track ${i} no tiene segmentos ni puntos accesibles.`);
          }
    
          if (pointsAdded) {
            tracksWithSegments++;
          }
        });
    
        if (tracksWithSegments === 0) {
          console.warn('Ningún track válido con segmentos encontrados.');
          setMessage('El archivo GPX no contiene datos de ruta válidos.');
          setGeojson(null);
          setWaypoints([]);
          setRutaDescripcion('');
          return;
        }
    
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
        setRutaDescripcion('');
    
      } catch (e) {
        console.error("Error al parsear GPX:", e);
        setMessage('Error leyendo el archivo GPX.');
        setGeojson(null);
        setWaypoints([]);
        setRutaDescripcion('');
      }
    };
    
    reader.readAsText(file, 'UTF-8');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/gpx+xml': ['.gpx'] },
    multiple: false,
  });


  async function guardarRuta() {
    if (!geojson) return;
  
    const nombreRuta = message.replace('Archivo GPX cargado: ', '').replace('.gpx', '');
    const descripcion = rutaDescripcion || '';
    const fecha = selectedDate.toISOString();
    const usuario_id = 1; // Sustituye si hay login
  
    try {
      // 1. Crear ruta en backend
      const rutaResponse = await fetch('http://localhost:8000/api/rutas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: nombreRuta,
          descripcion,
          fecha,
          usuario_id
        })
      });
  
      if (!rutaResponse.ok) throw new Error('Error al crear la ruta');
      const nuevaRuta = await rutaResponse.json();
  
      // 2. Crear ubicaciones (waypoints)
      for (const wp of waypoints) {
        await fetch('http://localhost:8000/api/ubicaciones/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: wp.name,
            lat: wp.lat,
            lon: wp.lon,
            tipo: wp.type || '',
            ruta_id: nuevaRuta.id
          })
        });
      }
  
      alert("Ruta y waypoints guardados con éxito");
  
    } catch (error) {
      console.error(error);
      alert("Hubo un error guardando la ruta");
    }
  }
  
  return (
    <div className="container-subir-gpx">
      <SubirGPX_Dropzone
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        message={message}
      />
  
      <div style={{ marginTop: 10 }}>
        <label>Fecha de la ruta: </label>
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
        />
      </div>
  
      <div style={{ marginTop: 10 }}>
        <label>Descripción de la ruta:</label>
        <textarea
          value={rutaDescripcion}
          onChange={e => setRutaDescripcion(e.target.value)}
          rows={3}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>
  
      {(Array.isArray(geojson) && geojson.length > 0) || waypoints.length > 0 ? (
        <>
          <SubirGPX_Mapa
            geojson={geojson}
            waypoints={waypoints}
            setWaypoints={setWaypoints}
          />

          <button
            onClick={guardarRuta}
            disabled={loading}
            style={{ marginTop: 15, padding: '10px 20px', fontWeight: 'bold' }}
          >
            {loading ? 'Guardando...' : 'Guardar ruta'}
          </button>
        </>
      ) : null}

  
 
    </div>
  );
  
}
