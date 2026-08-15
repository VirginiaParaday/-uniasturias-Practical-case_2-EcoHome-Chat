const pool = require('../db');

// Actividad 2 / Entregable 3: persistencia automatica de cada mensaje entrante.
async function saveMessage({ userId, username, text }) {
  const { rows } = await pool.query(
    `INSERT INTO messages (user_id, username, text)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, username, text, created_at`,
    [userId, username, text]
  );
  return rows[0];
}

// Actividad 3 / Entregable 3: historial inicial con los ultimos 10 mensajes,
// devueltos en orden cronologico ascendente para pintarlos directamente en el chat.
async function getLastMessages(limit = 10) {
  const { rows } = await pool.query(
    `SELECT id, user_id, username, text, created_at
     FROM (
       SELECT id, user_id, username, text, created_at
       FROM messages
       ORDER BY created_at DESC
       LIMIT $1
     ) AS ultimos
     ORDER BY created_at ASC`,
    [limit]
  );
  return rows;
}

// Endpoint/consulta de verificacion pedido como evidencia en la Actividad 2.
async function getAllMessagesCount() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM messages');
  return rows[0].total;
}

module.exports = { saveMessage, getLastMessages, getAllMessagesCount };
