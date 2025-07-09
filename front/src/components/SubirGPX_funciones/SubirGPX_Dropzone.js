import React from 'react';

export default function SubirGPX_Dropzone({ getRootProps, getInputProps, isDragActive, message }) {
  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
      <input {...getInputProps()} />
      <p>{isDragActive ? "Suelta el archivo aquí..." : message}</p>
    </div>
  );
}
