import React, { useEffect, useRef } from 'react';

function EditarWaypoint({ waypoint, setWaypoint, onSave, onCancel, onDelete }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const ajustarAltura = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };
      ajustarAltura();
      textarea.addEventListener('input', ajustarAltura);
      return () => textarea.removeEventListener('input', ajustarAltura);
    }
  }, [waypoint?.descripcion]);

  if (!waypoint) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWaypoint(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = () => {
    const confirmado = window.confirm('¿Estás seguro de que quieres eliminar este waypoint?');
    if (confirmado) {
      onDelete(waypoint.id);
    }
  };

  return (
    <div className="editor-waypoint">
      <h3>Editar waypoint: {waypoint?.nombre || 'Ninguno seleccionado'}</h3>
      <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <div>
          <label>Nombre: </label>
          <input name="nombre" value={waypoint.nombre} onChange={handleChange} required />
        </div>

        <div>
          <label>Tipo: </label>
          <select name="tipo" value={waypoint.tipo} onChange={handleChange}>
            <option value="Agua potable">Agua potable</option>
            <option value="Aseos">Aseos</option>
            <option value="Cabaña">Cabaña</option>
            <option value="Cabaña rústica">Cabaña rústica</option>
            <option value="Cima">Cima</option>
            <option value="Collado">Collado</option>
            <option value="Cruz de montaña">Cruz de montaña</option>
            <option value="Fuente">Fuente</option>
            <option value="Mirador">Mirador</option>
            <option value="Monumento">Monumento</option>
            <option value="Otro">Otro</option>
            <option value="Refugio guardado">Refugio guardado</option>
            <option value="Refugio libre">Refugio libre</option>
            <option value="Teléfono de emergencia">Teléfono de emergencia</option>
          </select>
        </div>

        <div>
          <label>Descripción: </label>
          <textarea
            ref={textareaRef}
            name="descripcion"
            value={waypoint.descripcion}
            onChange={handleChange}
          />
        </div>

        <div className="botones">
          <button type="submit">💾 Guardar</button>
          <button type="button" onClick={onCancel}>❌ Cancelar</button>
          <button type="button" onClick={handleDelete}>🗑️ Eliminar</button>
        </div>
      </form>
    </div>
  );
}

export default EditarWaypoint;
