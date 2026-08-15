const { Router } = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getLastMessages, getAllMessagesCount } = require('../models/messageModel');

const router = Router();

// GET /api/messages/recent -> mismo historial que se envia por socket al conectar.
// Sirve tambien como evidencia REST de persistencia (Actividad 2, Entregable 3).
router.get('/recent', requireAuth, async (req, res) => {
  try {
    const messages = await getLastMessages(10);
    res.json({ messages });
  } catch (err) {
    console.error('[messageRoutes./recent]', err);
    res.status(500).json({ message: 'Error obteniendo mensajes' });
  }
});

// GET /api/messages/verify -> endpoint de verificacion: cuenta total de mensajes guardados.
router.get('/verify', requireAuth, async (req, res) => {
  try {
    const total = await getAllMessagesCount();
    res.json({ total_messages_persisted: total });
  } catch (err) {
    console.error('[messageRoutes./verify]', err);
    res.status(500).json({ message: 'Error verificando persistencia' });
  }
});

module.exports = router;
