const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { saveMessage, getLastMessages, getAllMessagesCount } = require('../models/messageModel');

// Al iniciar sesion (conectar al chat), muestra en consola cuantos mensajes hay.
async function logChatMessageCount(username) {
  const total = await getAllMessagesCount();
  console.log(`[Socket.IO] ${username} inició sesión. Cantidad de mensajes del chat: ${total}`);
  return total;
}

// Cuenta simple de usuarios conectados, util para logs y para un futuro
// indicador de "usuarios en linea" (evolucion mencionada en el enunciado).
const connectedUsers = new Map(); // socket.id -> { userId, username }

function registerChatSocket(io) {
  // --------------------------------------------------------------------
  // Actividad 2 / Entregable 1: Autenticacion real en WebSocket.
  // Middleware de Socket.IO que valida el JWT en el handshake, ANTES de
  // permitir la conexion. Si no hay token valido, la conexion se rechaza.
  // --------------------------------------------------------------------
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('AUTH_ERROR: token no proporcionado'));
      }

      const payload = jwt.verify(token, jwtConfig.secret);

      // Se asocia el socket con el usuario autenticado (user_id / username).
      socket.user = {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
      };

      return next();
    } catch (err) {
      return next(new Error('AUTH_ERROR: token invalido o expirado'));
    }
  });

  io.on('connection', async (socket) => {
    const { id: userId, username } = socket.user;

    connectedUsers.set(socket.id, { userId, username });
    console.log(`[Socket.IO] Usuario conectado: ${username} (socket: ${socket.id}). Total conectados: ${connectedUsers.size}`);

    // Se avisa a los demas (opcional, util para UI de presencia)
    socket.broadcast.emit('user-status', { username, status: 'online' });

    // ----------------------------------------------------------------
    // Actividad 3 / Entregable 3: al conectar, se envia el historial
    // con los ultimos 10 mensajes SOLO al socket que se acaba de unir.
    // ----------------------------------------------------------------
    try {
      const history = await getLastMessages(10);
      await logChatMessageCount(username);
      socket.emit('message-history', history);
    } catch (err) {
      console.error('[Socket.IO] Error cargando historial:', err);
      socket.emit('chat-error', { message: 'No se pudo cargar el historial de mensajes' });
    }

    // ----------------------------------------------------------------
    // Actividad 1 / Entregable 2 + Actividad 2 / Entregable 3:
    // Se recibe "new-message", se persiste en DB y luego se reenvia
    // (broadcast) a TODOS los clientes conectados con io.emit(...).
    // ----------------------------------------------------------------
    socket.on('new-message', async (payload, ack) => {
      try {
        const text = (payload?.text || '').toString().trim();

        if (!text) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Mensaje vacio' });
          return;
        }
        if (text.length > 2000) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Mensaje demasiado largo' });
          return;
        }

        // Persistencia automatica ANTES de reenviar (Actividad 2, Entregable 3).
        const saved = await saveMessage({ userId, username, text });
        console.log(`[Socket.IO] Mensaje recibido de ${username}: "${text}"`);

        // Broadcast a todos los clientes conectados, incluido el emisor,
        // para que todos rendericen el mismo estado desde la DB.
        io.emit('new-message', saved);
        console.log(`[Socket.IO] Broadcast a ${connectedUsers.size} usuario(s) conectado(s)`);

        if (typeof ack === 'function') ack({ ok: true, message: saved });
      } catch (err) {
        console.error('[Socket.IO] Error procesando new-message:', err);
        socket.emit('chat-error', { message: 'No se pudo enviar el mensaje' });
        if (typeof ack === 'function') ack({ ok: false, error: 'Error interno' });
      }
    });

    // ----------------------------------------------------------------
    // Actividad 1 / Entregable 1: log claro de desconexion.
    // ----------------------------------------------------------------
    socket.on('disconnect', (reason) => {
      connectedUsers.delete(socket.id);
      console.log(`[Socket.IO] Usuario desconectado: ${username} (motivo: ${reason}). Total conectados: ${connectedUsers.size}`);
      socket.broadcast.emit('user-status', { username, status: 'offline' });
    });
  });

  // Log de errores de conexion (por ejemplo, JWT invalido) a nivel de servidor.
  io.engine.on('connection_error', (err) => {
    console.log('[Socket.IO] connection_error:', err.message);
  });
}

module.exports = { registerChatSocket, connectedUsers };
