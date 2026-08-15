import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket } from '../socket';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function Chat() {
  const { token, user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('conectando...');
  const [onlineEvents, setOnlineEvents] = useState([]);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setConnectionStatus('conectado'));
    socket.on('disconnect', () => setConnectionStatus('desconectado'));
    socket.on('connect_error', (err) => {
      setConnectionStatus(`error de conexion: ${err.message}`);
    });

    // Actividad 3 / Entregable 3: historial inicial (ultimos 10 mensajes).
    socket.on('message-history', (history) => {
      setMessages(history);
    });

    // Actividad 1 / Entregable 2: recepcion de mensajes en tiempo real (broadcast).
    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user-status', ({ username, status }) => {
      setOnlineEvents((prev) => [...prev.slice(-4), `${username} está ${status === 'online' ? 'en línea' : 'desconectado'}`]);
    });

    socket.on('chat-error', ({ message }) => {
      console.error('[Chat] Error del servidor:', message);
    });

    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !socketRef.current) return;

    socketRef.current.emit('new-message', { text: trimmed }, (ack) => {
      if (!ack?.ok) {
        console.error('No se pudo enviar el mensaje:', ack?.error);
      }
    });

    setText('');
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <h2>EcoHome Store · Chat interno</h2>
          <span className={`status-pill status-${connectionStatus === 'conectado' ? 'ok' : 'warn'}`}>
            {connectionStatus}
          </span>
        </div>
        <div className="chat-user">
          <span>
            {user?.username} <em>({user?.role})</em>
          </span>
          <button onClick={logout} className="logout-btn">Cerrar sesión</button>
        </div>
      </header>

      <main className="chat-messages">
        {messages.length === 0 && (
          <p className="empty-hint">Aún no hay mensajes. Sé el primero en escribir.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`message-bubble ${m.username === user?.username ? 'own' : ''}`}
          >
            <div className="message-meta">
              <strong>{m.username}</strong>
              <span>{formatTime(m.created_at)}</span>
            </div>
            <p>{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      {onlineEvents.length > 0 && (
        <div className="presence-log">
          {onlineEvents.map((ev, i) => (
            <div key={i}>{ev}</div>
          ))}
        </div>
      )}

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje para el equipo..."
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
