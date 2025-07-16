import React, { useEffect, useState } from 'react';

function EditarOpiniones({ waypoint }) {
  const [opiniones, setOpiniones] = useState([]);

  useEffect(() => {
    if (waypoint?.id) {
      console.log('📌 Waypoint recibido:', waypoint);

      fetch(`http://localhost:8000/api/opiniones/?ubicacion_id=${waypoint.id}`)
        .then(res => {
          console.log('🔄 Respuesta cruda del fetch:', res);
          return res.json();
        })
        .then(data => {
          console.log('📥 Datos recibidos del backend:', data);
          if (Array.isArray(data)) {
            setOpiniones(data);
          } else {
            console.warn('⚠️ El backend no devolvió un array:', data);
            setOpiniones([]);
          }
        })
        .catch(err => console.error('❌ Error cargando opiniones:', err));
    }
  }, [waypoint]);

  return (
    <div className="opiniones-wrapper">
      {/* Cabecera alineada */}
      <div className="opiniones-header">
        <h3>Opiniones sobre {waypoint?.nombre || 'el punto'}</h3>
        <div className="opiniones-toolbar">
          <button title="Añadir opinión">➕</button>
          <button title="Eliminar opiniones">❌</button>
        </div>
      </div>

      <div className="opinion-list">
        {opiniones.length === 0 ? (
          <p>No hay opiniones aún.</p>
        ) : (
          opiniones.map((op) => (
            <div key={op.id} className="opinion-row">
              <div><strong>{op.nombre_usuario || 'Anónimo'}:</strong></div>
              <div>{op.texto}</div>
              <div style={{ fontSize: '12px', color: '#555' }}>
                {new Date(op.fecha).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EditarOpiniones;
