import React from 'react';
import '../styles/Header.css';

function Header({ user, setUser }) {
  function handleLogout() {
    setUser(null);
  }

  return (
    <div className="header">
      <span>Hola, {user.username}</span>
      <a href="#">Cambiar Contraseña</a>
      <a onClick={handleLogout}>Cerrar sesión</a>
    </div>
  );
}

export default Header;
