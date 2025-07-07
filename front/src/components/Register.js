import React, { useState } from 'react';
import '../styles/Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:8000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          full_name: fullName,
          password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error en registro');
      }
      setMessage('Registro exitoso. Revisa tu email para confirmar.');
      setEmail('');
      setUsername('');
      setFullName('');
      setPassword('');
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Registro</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        placeholder="Nombre de usuario"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <input
        placeholder="Nombre completo"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Registrarse</button>
      {message && <div className="message">{message}</div>}
    </form>
  );
}

export default Register;
