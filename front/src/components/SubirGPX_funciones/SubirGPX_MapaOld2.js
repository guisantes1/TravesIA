import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fitBounds } from '@math.gl/web-mercator';

const markerIconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';

export default function SubirGPX_Mapa({ geojson, waypoints, openWaypointForm }) {
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapStyle, setMapStyle] = useState('topo');
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 1,
  });

  const mapStyles = {
    topo: '/opentopo-raster-style.json',
    osm: '/osm-raster-style.json',    
    esri: '/esri-satellite-style.json',
  };

  if (!geojson || !Array.isArray(geojson) || geojson.length === 0) return null;

  // GeoJSON para la línea (lon, lat)
  const lineGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: geojson.map(([lat, lon]) => [lon, lat]),
    },
  };

  // Ajusta la vista para que se vean todos los waypoints al cargar o cuando cambian
  useEffect(() => {
    if (!waypoints || waypoints.length === 0) return;

    const coords = waypoints.map(wp => [wp.lon, wp.lat]);
    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const padding = 40;
    const width = 900;  // coincide con CSS ancho del contenedor padre
    const height = 800; // coincide con CSS altura fija

    const { longitude, latitude, zoom } = fitBounds({
      width,
      height,
      bounds: [
        [minLon, minLat],
        [maxLon, maxLat],
      ],
      padding,
    });

    setViewState(vs => ({
      ...vs,
      longitude,
      latitude,
      zoom,
    }));
  }, [waypoints]);

  return (
    <div className="map-container" style={{ position: 'relative', width: '900px', height: '675px' }}>
      <select
        className="map-style-selector"
        value={mapStyle}
        onChange={e => setMapStyle(e.target.value)}
        style={{ position: 'absolute', zIndex: 1000, top: 10, right: 10 }}
      >
        {Object.entries(mapStyles).map(([key]) => (
          <option key={key} value={key}>{key.toUpperCase()}</option>
        ))}
      </select>

      <Map
        {...viewState}
        onMove={evt => setViewState(vs => ({ ...vs, ...evt.viewState }))}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyles[mapStyle]}
      >
        <NavigationControl position="top-left" />

        <Source id="route" type="geojson" data={lineGeoJSON}>
          <Layer
            id="routeLine"
            type="line"
            paint={{
              'line-color': '#0074D9',
              'line-width': 4,
            }}
          />
        </Source>

        {waypoints.map(wp => (
          <Marker
            key={wp.id}
            longitude={wp.lon}
            latitude={wp.lat}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupInfo(wp);
            }}
          >
            <img
              src={markerIconUrl}
              alt={wp.name}
              style={{ width: 25, height: 41, cursor: 'pointer' }}
            />
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            longitude={popupInfo.lon}
            latitude={popupInfo.lat}
            anchor="top"
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              <strong>{popupInfo.name}</strong><br />
              {popupInfo.desc}<br />
              <button onClick={() => openWaypointForm(popupInfo)}>Editar</button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

