import React, { useEffect, useState } from 'react';

function EditarOpiniones({ waypoint }) {
  const [opiniones, setOpiniones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaOpinion, setNuevaOpinion] = useState({
    texto: '',
    fecha: '',
    hora: '',
    fotos: []
  });
  

  const handlePhotoUpload = (e) => {
    const newFiles = Array.from(e.target.files);
  
    setNuevaOpinion(prev => {
      const existingNames = new Set(prev.fotos.map(f => f.name));
      const uniqueFiles = newFiles
        .filter(f => f.type.startsWith("image/"))
        .filter(f => !existingNames.has(f.name));
  
      const combined = [...prev.fotos, ...uniqueFiles].slice(0, 6);
      return { ...prev, fotos: combined };
    });
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
  
    setNuevaOpinion(prev => {
      const existingNames = new Set(prev.fotos.map(f => f.name));
      const uniqueFiles = droppedFiles
        .filter(f => f.type.startsWith("image/"))
        .filter(f => !existingNames.has(f.name));
  
      const combined = [...prev.fotos, ...uniqueFiles].slice(0, 6);
      return { ...prev, fotos: combined };
    });
  };
  
  const removePhotoAtIndex = (indexToRemove) => {
    setNuevaOpinion(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, index) => index !== indexToRemove)
    }));
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const convertirFotosABase64 = async (archivos) => {
    const promesas = archivos.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file); // Lee como base64
      });
    });
    return Promise.all(promesas);
  };
  
    
  
  const handleEnviarOpinion = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token');
    const fechaHora = `${nuevaOpinion.fecha}T${nuevaOpinion.hora}:00`;
    const fechaISO = new Date(fechaHora).toISOString();
  
    let fotosBase64 = [];
    try {
      fotosBase64 = await convertirFotosABase64(nuevaOpinion.fotos);
    } catch (err) {
      alert("Error procesando imágenes");
      return;
    }
  
    const payload = {
      ubicacion_id: waypoint.id,
      texto: nuevaOpinion.texto,
      fotos: JSON.stringify(fotosBase64)
    };
  
    console.log('📤 Enviando opinión...');
    console.log('🧾 Payload:', payload);
    console.log('🔑 Token:', token);
  
    fetch('http://localhost:8000/api/opiniones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        console.log('📩 Respuesta del servidor:', res.status, data);
  
        if (!res.ok) throw new Error(`${res.status} - ${data.detail || 'Error desconocido'}`);
        return data;
      })
      .then(data => {
        console.log('✅ Opinión guardada con éxito:', data);
        setOpiniones([...opiniones, data]);
        setMostrarFormulario(false);
        setNuevaOpinion({ texto: '', fecha: '', hora: '', fotos: [] });
      })
      .catch(err => {
        console.error('❌ Error enviando opinión:', err.message || err);
        alert(`Error al enviar la opinión: ${err.message}`);
      });
  };
  
  
  
  
  useEffect(() => {
    if (waypoint?.id) {
      console.log('📌 Waypoint recibido:', waypoint);

      fetch(`http://localhost:8000/api/opiniones/${waypoint.id}`)

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
          <button title="Añadir opinión" onClick={() => setMostrarFormulario(!mostrarFormulario)}>➕</button>          
          <button title="Eliminar opiniones">❌</button>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="editor-opinion">
          <h3>Afegir opinió</h3>

          <label>Comentari</label>
          <textarea
            placeholder="Escriu la teva opinió..."
            value={nuevaOpinion.texto}
            onChange={(e) => setNuevaOpinion({ ...nuevaOpinion, texto: e.target.value })}
            required
          />

          <label>Data</label>
          <input
            type="date"
            value={nuevaOpinion.fecha || ''}
            onChange={(e) => setNuevaOpinion({ ...nuevaOpinion, fecha: e.target.value })}
            required
          />

          <label>Hora</label>
          <input
            type="time"
            value={nuevaOpinion.hora || ''}
            onChange={(e) => setNuevaOpinion({ ...nuevaOpinion, hora: e.target.value })}
            required
          />

          <label>Fotos</label>
          <div
            className="file-drop-area"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
            />
            <div className="photo-preview">
              {nuevaOpinion.fotos?.map((file, index) => (
                <div key={index} className="photo-thumbnail" style={{ position: 'relative' }}>
                  <img
                    src={file instanceof File ? URL.createObjectURL(file) : file}
                    alt={`Foto ${index}`}
                  />
                  <div style={{ fontSize: '10px', maxWidth: '50px', wordWrap: 'break-word' }}>
                    {file.name || `Foto ${index + 1}`}
                  </div>
                  <button
                    onClick={() => removePhotoAtIndex(index)}
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      lineHeight: '18px',
                      padding: 0
                    }}
                    title="Eliminar foto"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="botones">
            <button type="button" onClick={() => setMostrarFormulario(false)}>Cancel·lar</button>
            <button type="button" onClick={handleEnviarOpinion}>Enviar</button>
          </div>
        </div>
      )}


      <div className="opinion-list">
        {opiniones.length === 0 ? (
          <p>No hay opiniones aún.</p>
        ) : (
          opiniones.map((op) => (
            <div key={op.id} className="opinion-row">
              <div className="op-header">
                <div className="nombre">{op.nombre_usuario || 'Anónimo'}</div>
                <div className="fecha">
                  {new Date(op.fecha).toLocaleDateString()} – {new Date(op.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="texto">{op.texto}</div>

              {op.fotos && (
                <div className="fotos">
                  {JSON.parse(op.fotos).map((url, i) => (
                    <img key={i} src={url} alt={`foto-${i}`} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EditarOpiniones;
