import React, { useState } from 'react';
import '../styles/Home.css';

import CrearProyecto from './CrearProyecto';
import SubirGPX from './SubirGPX';
import VerProyectos from './VerProyectos';

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
      </nav>
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
}

export default Home;
