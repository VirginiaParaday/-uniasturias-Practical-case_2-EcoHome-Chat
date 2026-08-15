const pool = require('../db');

async function findByUsername(username) {
  const { rows } = await pool.query(
    'SELECT id, username, email, password_hash, role FROM users WHERE username = $1',
    [username]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, username, email, role FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ username, email, passwordHash, role = 'ventas' }) {
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, role, created_at`,
    [username, email, passwordHash, role]
  );
  return rows[0];
}

module.exports = { findByUsername, findById, createUser };
