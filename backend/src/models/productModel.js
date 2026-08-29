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

async function findProductById(id) {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.created_by, p.created_at,
            u.username AS creator_username
     FROM products p
     JOIN users u ON u.id = p.created_by
     WHERE p.id = $1`,
    [id]
  );
  return rows[0] ? mapProduct(rows[0]) : null;
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

async function updateProduct({ id, name, description, price, creatorUsername }) {
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $2, description = $3, price = $4
     WHERE id = $1
     RETURNING id, name, description, price, created_by, created_at`,
    [id, name, description || null, price]
  );
  if (!rows[0]) return null;
  return mapProduct({ ...rows[0], creator_username: creatorUsername });
}

async function deleteProduct(id) {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

async function countProductsByUser(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM products WHERE created_by = $1',
    [userId]
  );
  return rows[0].count;
}

module.exports = {
  listProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  countProductsByUser,
};
