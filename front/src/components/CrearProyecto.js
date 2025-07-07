import React, { useState } from 'react';
import '../styles/CrearProyecto.css';

export default function CrearProyecto() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hola! Dime qué ruta quieres planificar.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const botResponse = `Estoy generando tu ruta para: "${input}" (respuesta simulada).`;
      setMessages([...newMessages, { from: 'bot', text: botResponse }]);
      setLoading(false);
    }, 1500);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="crear-proyecto-container">
      <h2 className="crear-proyecto-title">Crear mi ruta</h2>
      <div className="crear-proyecto-chatbox">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`crear-proyecto-message ${msg.from}`}
          >
            <span className={`crear-proyecto-bubble ${msg.from}`}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p>Escribiendo...</p>}
      </div>

      <textarea
        rows={2}
        placeholder="Describe la ruta que quieres..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="crear-proyecto-textarea"
      />
      <button
        onClick={handleSend}
        disabled={loading}
        className="crear-proyecto-button"
      >
        Enviar
      </button>
    </div>
  );
}
