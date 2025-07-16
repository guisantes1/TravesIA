import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/VerMapa/VerMapa.css';
import '../styles/VerMapa/VerMapa-editor.css';

import fetchWaypointsFromOSM from './VerMapa_funciones/TraerWaypoints';
import EditarWaypoint from './VerMapa_funciones/EditarWaypoint';
import {
  refrescarRuta0,
  eliminarWaypoint,
  eliminarVisibles,
  guardarCambios
} from './VerMapa_funciones/helpers';

import EditarOpiniones from './VerMapa_funciones/EditarOpiniones.js'; // al principio del archivo


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

function CapturarMapa({ mapRef }) {
  const map = useMap();

  useEffect(() => {
    console.log("✅ Mapa capturado con useMap");
    mapRef.current = map;
  }, [map]);

  return null;
}


function VerMapa() {
  const [waypoints, setWaypoints] = useState([]);
  const [waypointSeleccionado, setWaypointSeleccionado] = useState(null);
  const [topLeft, setTopLeft] = useState([41.65, 1.75]);
  const [bottomRight, setBottomRight] = useState([41.55, 1.90]);
  const [pestanaActiva, setPestanaActiva] = useState('opiniones');
  const mapRef = useRef();

  useEffect(() => {
    fetch('http://localhost:8000/api/ubicaciones/?ruta_id=0')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const conNombre = data.filter(p => p.nombre && p.nombre.trim() !== '');
          setWaypoints(conNombre);
  
          if (mapRef.current && conNombre.length > 0) {
            const bounds = L.latLngBounds(conNombre.map(p => [p.lat, p.lon]));
            mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
            console.log('📍 Ajustando vista a bounds:', bounds);
          }
        }
      })
      .catch((error) => console.error('❌ Error cargando ruta 0 al iniciar:', error));
  }, []);
  

  const cargarDesdeOSM = async () => {
    const osmWaypoints = await fetchWaypointsFromOSM(topLeft, bottomRight);
    const conNombre = osmWaypoints.filter(p => p.nombre && p.nombre.trim() !== '');
  
    // 1. Obtener los existentes
    const existentesRes = await fetch('http://localhost:8000/api/ubicaciones/');
    const existentes = await existentesRes.json();
  
    // 2. Filtrar duplicados por lat/lon
    const nuevosWaypoints = conNombre.filter(punto => {
      return !existentes.some(ex =>
        Math.abs(ex.lat - punto.lat) < 0.00001 &&
        Math.abs(ex.lon - punto.lon) < 0.00001
      );
    });
  
    // 3. Preparar body para insertar
    const body = nuevosWaypoints.map(punto => ({
      nombre: punto.nombre,
      tipo: punto.tipo || 'otro',
      descripcion: punto.descripcion || '',
      lat: punto.lat,
      lon: punto.lon,
      ruta_id: 0
    }));
  
    if (body.length === 0) {
      console.log('✅ No hay puntos nuevos para insertar.');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:8000/api/ubicaciones/lote/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
  
      if (!res.ok) throw new Error(`Error ${res.status}`);
  
      refrescarRuta0(setWaypoints);
    } catch (err) {
      console.error('❌ Error insertando puntos en lote:', err);
    }
  };
  
  return (
    <div className={`map-wrapper ${waypointSeleccionado ? 'modo-edicion' : ''}`}>
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
      <div className="map-refresh-button">
        <button onClick={() => refrescarRuta0(setWaypoints)}>🔄 Refrescar</button>
        <button
          onClick={() => eliminarVisibles(mapRef, waypoints, () => refrescarRuta0(setWaypoints), () => setWaypointSeleccionado(null))}
          style={{ marginLeft: '10px', color: 'red' }}
        >
          🗑️ Eliminar visibles
        </button>

      </div>

        <MapContainer          
          zoom={13}
          scrollWheelZoom={true}                  
        >
          <CapturarMapa mapRef={mapRef} />  
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
              <Popup closeButton={false}>
                <div style={{ position: 'relative', minWidth: '160px', paddingTop: '10px' }}>
                  {/* Botón ❌ personalizado arriba a la derecha, fuera del contenido */}
                  <button
                    onClick={() => {
                      setWaypointSeleccionado(null);
                      setTimeout(() => {
                        if (mapRef.current) {
                          mapRef.current.closePopup();
                    
                          // ⚠️ Forzar repaint y refresh de tiles con más garantías
                          setTimeout(() => {
                            mapRef.current.invalidateSize(true);
                          }, 300); // espera pequeña para asegurar que el DOM ya ha cambiado
                        }
                      }, 300);
                    }}
                    className="popup-close-button"
                    aria-label="Cerrar popup"
                  >
                    ×
                  </button>

                  {/* Contenido del popup */}
                  <strong>{ubicacion.nombre}</strong><br />
                  <button
                    onClick={() => {
                      setWaypointSeleccionado(ubicacion);
                      setTimeout(() => {
                        if (mapRef.current) {
                          mapRef.current.invalidateSize();
                          mapRef.current.setView([ubicacion.lat, ubicacion.lon], mapRef.current.getZoom(), {
                            animate: true
                          });
                        }
                      }, 300);
                    }}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de que quieres eliminar "${ubicacion.nombre}"?`)) {
                        eliminarWaypoint(
                          ubicacion.id,
                          () => refrescarRuta0(setWaypoints),
                          () => setWaypointSeleccionado(null)
                        );
                      }
                    }}
                    style={{ marginLeft: '8px', color: 'red' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </Popup>


            </Marker>

          ))}
        </MapContainer>
      </div>
      {waypointSeleccionado && (
        <div className="editor-contenedor">
          <EditarWaypoint
            waypoint={waypointSeleccionado}
            setWaypoint={setWaypointSeleccionado}
            onSave={() => guardarCambios(waypointSeleccionado, () => refrescarRuta0(setWaypoints), () => setWaypointSeleccionado(null))}
            onCancel={() => {
              setWaypointSeleccionado(null);
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize();
                }
              }, 300);
            }}
            onDelete={(id) => {
              eliminarWaypoint(id, () => refrescarRuta0(setWaypoints), () => {
                setWaypointSeleccionado(null);
                setTimeout(() => {
                  if (mapRef.current) {
                    mapRef.current.invalidateSize();
                  }
                }, 300);
              });
            }}
          />
          <div className="editor-info">
            <div className="info-sidebar">
              <button
                onClick={() => setPestanaActiva('opiniones')}
                style={{
                  fontWeight: 'bold',
                  backgroundColor: pestanaActiva === 'opiniones' ? '#333' : '',
                  color: pestanaActiva === 'opiniones' ? 'white' : '',
                }}
              >
                Opiniones
              </button>
              <button
                onClick={() => setPestanaActiva('imagenes')}
                style={{
                  fontWeight: 'bold',
                  backgroundColor: pestanaActiva === 'imagenes' ? '#333' : '',
                  color: pestanaActiva === 'imagenes' ? 'white' : '',
                }}
              >
                Imágenes
              </button>
            </div>

            <div className="info-content" id="infoContent">
              {pestanaActiva === 'opiniones' && (
                <EditarOpiniones waypoint={waypointSeleccionado} />
              )}
              {pestanaActiva === 'imagenes' && <p>(Próximamente imágenes)</p>}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default VerMapa;
