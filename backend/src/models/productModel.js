const pool = require('../db');

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    createdAt: row.created_at,
    createdBy: row.created_by,
    creator: {
      id: row.created_by,
      username: row.creator_username,
    },
  };
}

async function listProducts() {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.created_by, p.created_at,
            u.username AS creator_username
     FROM products p
     JOIN users u ON u.id = p.created_by
     ORDER BY p.created_at DESC`
  );
  return rows.map(mapProduct);
}

async function createProduct({ name, description, price, createdBy, creatorUsername }) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, description, price, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, price, created_by, created_at`,
    [name, description || null, price, createdBy]
  );

  const row = rows[0];
  return mapProduct({ ...row, creator_username: creatorUsername });
}

async function countProductsByUser(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM products WHERE created_by = $1',
    [userId]
  );
  return rows[0].count;
}

module.exports = { listProducts, createProduct, countProductsByUser };
