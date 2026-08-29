require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const { registerChatSocket } = require('./sockets/chatSocket');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: corsOrigin.includes(',')
    ? corsOrigin.split(',').map((value) => value.trim())
    : corsOrigin,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Rutas REST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ecohome-chat-backend', time: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// ----------------------------------------------------------------------
// Actividad 1 / Entregable 1: Inicializacion del servidor WebSocket
// (Socket.IO) junto al servidor HTTP de Express.
// ----------------------------------------------------------------------
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
registerChatSocket(io);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`\n EcoHome Store - Backend (chat + catálogo)`);
  console.log(` Servidor HTTP + Socket.IO escuchando en http://localhost:${PORT}`);
  console.log(` Health check:            http://localhost:${PORT}/api/health`);
  console.log(` Signup:                  POST http://localhost:${PORT}/api/auth/signup`);
  console.log(` Login:                   POST http://localhost:${PORT}/api/auth/login`);
  console.log(` Catálogo CRUD:           GET/POST/PUT/DELETE http://localhost:${PORT}/api/products`);
  console.log(` Stats:                   GET  http://localhost:${PORT}/api/users/me/stats`);
  console.log(` Mensajes recientes:      GET  http://localhost:${PORT}/api/messages/recent\n`);
});

module.exports = { app, httpServer, io };
