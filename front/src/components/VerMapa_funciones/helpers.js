export const refrescarRuta0 = async (setWaypoints) => {
    console.log('🔄 Refrescando ruta 0...');
    try {
      const res = await fetch('http://localhost:8000/api/ubicaciones/?ruta_id=0');
      const data = await res.json();
      const conNombre = data.filter(p => p.nombre && p.nombre.trim() !== '');
      setWaypoints(conNombre);
    } catch (err) {
      console.error('❌ Error cargando ruta 0:', err);
    }
  };
  
  export async function eliminarWaypoint(id, refrescar, limpiarSeleccion) {
    const res = await fetch(`http://localhost:8000/api/ubicaciones/${id}`, {
      method: 'DELETE'
    });
  
    if (!res.ok) {
      console.error('❌ Error al eliminar:', res.status);
      return;
    }
  
    refrescar();
    limpiarSeleccion();
  }
  
  export async function eliminarVisibles(mapRef, waypoints, refrescar, limpiarSeleccion) {
    console.log("🧨 Botón 'Eliminar visibles' pulsado");
  
    if (!mapRef.current) {
      console.warn("❗ mapRef.current es null");
      return;
    }
  
    const bounds = mapRef.current.getBounds();
    const visibles = waypoints.filter(w =>
      bounds.contains([w.lat, w.lon])
    );
  
    if (visibles.length === 0) {
      alert("No hay waypoints visibles para eliminar.");
      return;
    }
  
    const confirmado = window.confirm(`¿Eliminar los ${visibles.length} waypoints visibles?`);
    if (!confirmado) return;
  
    try {
      await Promise.all(visibles.map(w =>
        fetch(`http://localhost:8000/api/ubicaciones/${w.id}`, { method: 'DELETE' })
      ));
      refrescar();
      limpiarSeleccion();
    } catch (err) {
      console.error('❌ Error eliminando puntos visibles:', err);
    }
  }
  
  export async function guardarCambios(waypoint, refrescar, limpiarSeleccion) {
    try {
      const res = await fetch(`http://localhost:8000/api/ubicaciones/${waypoint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waypoint)
      });
  
      if (!res.ok) throw new Error('Error al guardar');
  
      refrescar();
      limpiarSeleccion();
    } catch (err) {
      console.error('❌ Error al guardar cambios:', err);
    }
  }
  