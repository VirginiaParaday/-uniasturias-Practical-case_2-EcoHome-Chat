require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { registerChatSocket } = require('./sockets/chatSocket');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Rutas REST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ecohome-chat-backend', time: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// ----------------------------------------------------------------------
// Actividad 1 / Entregable 1: Inicializacion del servidor WebSocket
// (Socket.IO) junto al servidor HTTP de Express.
// ----------------------------------------------------------------------
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

registerChatSocket(io);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`\n EcoHome Store - Chat interno`);
  console.log(` Servidor HTTP + Socket.IO escuchando en http://localhost:${PORT}`);
  console.log(` Health check:            http://localhost:${PORT}/api/health`);
  console.log(` Login:                   POST http://localhost:${PORT}/api/auth/login`);
  console.log(` Mensajes recientes:      GET  http://localhost:${PORT}/api/messages/recent\n`);
});

module.exports = { app, httpServer, io };
