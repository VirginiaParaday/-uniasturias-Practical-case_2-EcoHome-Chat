const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones a PostgreSQL. Se usa en toda la app (REST y Socket.IO)
// para garantizar persistencia real de usuarios y mensajes.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'ecohome_chat',
  user: process.env.DB_USER || 'ecohome',
  password: process.env.DB_PASSWORD || 'ecohome123',
});

pool.on('connect', () => {
  console.log('[DB] Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool de PostgreSQL', err);
  process.exit(1);
});

module.exports = pool;
