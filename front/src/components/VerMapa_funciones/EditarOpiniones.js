import React, { useEffect, useState } from 'react';

function EditarOpiniones({ waypoint }) {
  const [opiniones, setOpiniones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoOpinion, setEditandoOpinion] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(null);
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
      // Si ya es string (base64 ya existente), simplemente lo devolvemos
      if (typeof file === 'string') return Promise.resolve(file);
  
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file); // Lee como base64
      });
    });
    return Promise.all(promesas);
  };
  
  const handleEliminarOpinion = (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta opinión?')) return;
  
    const token = localStorage.getItem('token');
  
    fetch(`http://localhost:8000/api/opiniones/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Error al eliminar');
        }
        setOpiniones(opiniones.filter(op => op.id !== id));
      })
      .catch(err => {
        console.error('❌ Error al eliminar la opinión:', err);
        alert(`Error: ${err.message}`);
      });
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
      fecha: fechaISO,
      fotos: JSON.stringify(fotosBase64)
    };
  
    const url = editandoOpinion
      ? `http://localhost:8000/api/opiniones/${editandoOpinion.id}`
      : 'http://localhost:8000/api/opiniones';
  
    const method = editandoOpinion ? 'PUT' : 'POST';
  
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(`${res.status} - ${data.detail || 'Error desconocido'}`);
        return data;
      })
      .then(data => {
        if (editandoOpinion) {
          setOpiniones(opiniones.map(op => op.id === data.id ? data : op));
        } else {
          setOpiniones([...opiniones, data]);
        }
        resetFormulario();
      })
      .catch(err => {
        console.error('❌ Error al enviar/editar la opinión:', err);
        alert(`Error: ${err.message}`);
      });
  };
  
  const resetFormulario = () => {
    setNuevaOpinion({ texto: '', fecha: '', hora: '', fotos: [] });
    setEditandoOpinion(null);
    setMostrarFormulario(false);
  };

  const iniciarEdicion = (opinion) => {
    const fecha = new Date(opinion.fecha);
    setNuevaOpinion({
      texto: opinion.texto,
      fecha: fecha.toISOString().slice(0, 10),
      hora: fecha.toTimeString().slice(0, 5),
      fotos: opinion.fotos ? JSON.parse(opinion.fotos) : []
    });
    setEditandoOpinion(opinion);
    setMostrarFormulario(true);
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log('🧑 Usuario actual:', data); // <--- AÑADE AQUÍ
          setUsuarioActual(data);
        })
        .catch(err => {
          console.warn("⚠️ No se pudo obtener el usuario actual:", err);
          setUsuarioActual(null);
        });
    }
  }, []);
  
  
  
  useEffect(() => {
    if (waypoint?.id) {
      console.log('📌 Waypoint recibido:', waypoint);
  
      fetch(`http://localhost:8000/api/opiniones/${waypoint.id}`)
        .then(res => {
          console.log('🔄 Respuesta cruda del fetch:', res);
          return res.json();
        })
        .then(data => {
          console.log('📥 Opiniones recibidas del backend:', data); // <--- AÑADE AQUÍ
  
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
        </div>
      </div>

      {mostrarFormulario && (
        <div className="editor-opinion">
          <h3>Añadir opinión</h3>

          <label>Comentario</label>
          <textarea
            placeholder="Escriva su opinión..."
            value={nuevaOpinion.texto}
            onChange={(e) => setNuevaOpinion({ ...nuevaOpinion, texto: e.target.value })}
            required
          />

          <label>Fecha</label>
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
          opiniones.map((op) => {
            console.log(`👤 Comparando: usuarioActual.id = ${usuarioActual?.id}, op.usuario_id = ${op.usuario_id}`);
          
            return (
              <div key={op.id} className="opinion-row">
                <div className="op-header">
                  <div className="nombre">{op.nombre_usuario || 'Anónimo'}</div>
                  <div className="fecha">
                    {new Date(op.fecha).toLocaleDateString()} – {new Date(op.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {String(usuarioActual?.id) === String(op.usuario_id) && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => iniciarEdicion(op)}
                        title="Editar opinión"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleEliminarOpinion(op.id)}
                        title="Eliminar opinión"
                        style={{ color: 'red' }}
                      >
                        ❌
                      </button>
                    </div>
                  )}

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
            );
          })
          
        )}
      </div>
    </div>
  );
}

export default EditarOpiniones;
