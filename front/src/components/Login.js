import React, { useState } from 'react';
import '../styles/Login.css';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password })
      });
      if (!res.ok) throw new Error('Usuario no encontrado o contraseña incorrecta');
      const data = await res.json();
  
      // Guardamos token y username en localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', username);
  
      // Actualizamos estado global
      setUser({ username, token: data.access_token });
    } catch (err) {
      setError(err.message);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      <input
        placeholder="Email o usuario"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

export default Login;
