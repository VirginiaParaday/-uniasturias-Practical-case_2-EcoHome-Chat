import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRecentMessages } from '../api';
import { connectSocket } from '../socket';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function Chat() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('conectando...');
  const [onlineEvents, setOnlineEvents] = useState([]);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    getRecentMessages()
      .then((history) => setMessages(history))
      .catch(() => {});

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setConnectionStatus('conectado'));
    socket.on('disconnect', () => setConnectionStatus('desconectado'));
    socket.on('connect_error', (err) => {
      setConnectionStatus(`error de conexion: ${err.message}`);
    });

    // Actividad 3 / Entregable 3: historial inicial (ultimos 10 mensajes).
    socket.on('message-history', (history) => {
      console.log('[Chat] Sesión iniciada. Cantidad de mensajes del chat:', history.length);
      setMessages(history);
    });

    // Actividad 1 / Entregable 2: recepcion de mensajes en tiempo real (broadcast).
    socket.on('new-message', (message) => {
      console.log('[Chat] Recibido de', message.username, ':', message.text);
      setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
    });

    socket.on('user-status', ({ username, status }) => {
      setOnlineEvents((prev) => [...prev.slice(-4), `${username} está ${status === 'online' ? 'en línea' : 'desconectado'}`]);
    });

    socket.on('chat-error', ({ message }) => {
      console.error('[Chat] Error del servidor:', message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('message-history');
      socket.off('new-message');
      socket.off('user-status');
      socket.off('chat-error');
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

    console.log('[Chat] Enviando:', trimmed);
    socketRef.current.emit('new-message', { text: trimmed }, (ack) => {
      if (!ack?.ok) {
        console.error('No se pudo enviar el mensaje:', ack?.error);
      }
    });

    setText('');
  }

  return (
    <div className="chat-page">
      <div className="chat-status-bar">
        <span>Chat interno</span>
        <span className={`status-pill status-${connectionStatus === 'conectado' ? 'ok' : 'warn'}`}>
          {connectionStatus}
        </span>
      </div>

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
