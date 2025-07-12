import React, { useState } from 'react';
import '../styles/Home.css';

import CrearProyecto from './CrearProyecto';
import SubirGPX from './SubirGPX';
import VerProyectos from './VerProyectos';
import VerMapa from './VerMapa'; // <-- Importa el nuevo componente

function Home() {
  const [activeTab, setActiveTab] = useState('crear');

  const renderContent = () => {
    switch (activeTab) {
      case 'crear':
        return <CrearProyecto />;
      case 'subir':
        return <SubirGPX />;
      case 'proyectos':
        return <VerProyectos />;
      case 'mapa':
        return <VerMapa />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <nav className="sidebar">
        <button className={activeTab === 'crear' ? 'active' : ''} onClick={() => setActiveTab('crear')}>
          🏞 Crear mi ruta
        </button>
        <button className={activeTab === 'subir' ? 'active' : ''} onClick={() => setActiveTab('subir')}>
          🗻 Subir mis rutas
        </button>
        <button className={activeTab === 'proyectos' ? 'active' : ''} onClick={() => setActiveTab('proyectos')}>
          📁 Todos mis proyectos
        </button>
        <button className={activeTab === 'mapa' ? 'active' : ''} onClick={() => setActiveTab('mapa')}>
          🗺️ Ver Mapa
        </button>
      </nav>
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
}

export default Home;
