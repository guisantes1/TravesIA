import React, { useState, useEffect } from 'react';  // Añadimos useEffect
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Home from './components/Home';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Carga usuario/token guardado en localStorage al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ token, username });
    }
  }, []);

  // Función para actualizar user y guardar en localStorage
  const handleSetUser = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    setUser(userData);
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
  };

  return (
    <div className="main-scroll-wrapper">
      <div className="app-container">
        {user && <Header user={user} setUser={setUser} />}
  
        {!user ? (
          <>
            <Login setUser={handleSetUser} />
            {!showRegister && (
              <button
                onClick={toggleRegister}
                className="create-account-btn"
              >
                Crear una nueva cuenta
              </button>
            )}
            {showRegister && <Register />}
          </>
        ) : (
          <Home user={user} />
        )}
      </div>
    </div>
  );
  
}

export default App;
