import React from 'react';

export default function SubirGPX_Waypoint({
  waypoint,
  waypointForm,
  setWaypointForm,
  waypointTypes,
  onSave,
  onCancel
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setWaypointForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const newFiles = Array.from(e.target.files);
  
    setWaypointForm(prev => {
      const existingNames = new Set(prev.photos.map(f => f.name));
      const uniqueFiles = newFiles.filter(f => !existingNames.has(f.name));
  
      const combined = [...prev.photos, ...uniqueFiles].slice(0, 6);
      return { ...prev, photos: combined };
    });
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
  
    setWaypointForm(prev => {
      const existingNames = new Set(prev.photos.map(f => f.name));
      const uniqueFiles = droppedFiles.filter(f => !existingNames.has(f.name));
  
      const combined = [...prev.photos, ...uniqueFiles].slice(0, 6);
      return { ...prev, photos: combined };
    });
  };

  const removePhotoAtIndex = (indexToRemove) => {
    setWaypointForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="waypoint-form">
      <h3>Editar Waypoint: {waypoint.name}</h3>
      <div>
        <label>Tipo:</label>
        <select
          name="type"
          value={waypointForm.type}
          onChange={handleChange}
        >
          <option value="">Selecciona un tipo</option>
          {waypointTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Descripción:</label>
        <textarea
          name="description"
          value={waypointForm.description}
          onChange={handleChange}
          placeholder="Descripción del waypoint"
        />
      </div>
      <div
        className="file-drop-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <label>Fotos:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
        />
        <div className="photo-preview">
          {waypointForm.photos && waypointForm.photos.map((file, index) => (
            <div
              key={index}
              className="photo-thumbnail"
              style={{ position: 'relative' }}
            >
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
      <button onClick={onSave}>Guardar</button>
      <button className="cancel" onClick={onCancel}>Cancelar</button>
    </div>
  );
}
