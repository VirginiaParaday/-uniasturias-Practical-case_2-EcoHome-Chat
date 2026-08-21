// Crea usuarios de demostracion y el catálogo inicial de Arturo (Unidad 3).
// Uso: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

const DEMO_USERS = [
  { username: 'admin', email: 'admin@ecohome.test', password: 'Admin123!', role: 'admin' },
  { username: 'ventas1', email: 'ventas1@ecohome.test', password: 'Ventas123!', role: 'ventas' },
  { username: 'logistica1', email: 'logistica1@ecohome.test', password: 'Logistica123!', role: 'logistica' },
  { username: 'soporte1', email: 'soporte1@ecohome.test', password: 'Soporte123!', role: 'soporte' },
  { username: 'arturo', email: 'arturo@ecohome.test', password: 'Arturo123!', role: 'ventas' },
];

const ARTURO_PRODUCTS = [
  { name: 'Kit de compostaje doméstico', description: 'Compostera de 20 L para residuos orgánicos', price: 89000 },
  { name: 'Bombillo LED 9W', description: 'Equivalente a 60 W, luz cálida', price: 12000 },
  { name: 'Panel solar 50W', description: 'Panel monocristalino para uso residencial', price: 245000 },
  { name: 'Filtro de agua de carbón', description: 'Reduce cloro y sedimentos', price: 67000 },
  { name: 'Bolsa reutilizable de yute', description: 'Pack de 3 unidades', price: 18000 },
  { name: 'Regadera de goteo', description: 'Riego eficiente para huerta urbana', price: 35000 },
  { name: 'Termo de bambú 500 ml', description: 'Libre de BPA', price: 42000 },
  { name: 'Cepillo de dientes de bambú', description: 'Pack familiar de 4', price: 22000 },
  { name: 'Inodoro ahorrador de agua', description: 'Doble descarga 3/6 L', price: 389000 },
  { name: 'Maceta auto-riego', description: 'Ideal para hierbas aromáticas', price: 28000 },
  { name: 'Cargador solar USB', description: '10 000 mAh con panel plegable', price: 129000 },
  { name: 'Detergente ecológico 1 L', description: 'Biodegradable, sin fosfatos', price: 19000 },
  { name: 'Aislante de ventanas', description: 'Kit para 4 paneles', price: 54000 },
  { name: 'Lámpara solar de jardín', description: 'Estaca LED con sensor crepuscular', price: 31000 },
];

async function ensureUser(user) {
  const { rows: existing } = await pool.query('SELECT id FROM users WHERE username = $1', [user.username]);

  if (existing.length > 0) {
    console.log(`[Seed] Usuario "${user.username}" ya existe, se omite.`);
    return existing[0].id;
  }

  const passwordHash = await bcrypt.hash(user.password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [user.username, user.email, passwordHash, user.role]
  );
  console.log(`[Seed] Usuario creado: ${user.username} / ${user.password} (rol: ${user.role})`);
  return rows[0].id;
}

async function seedArturoProducts(arturoId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM products WHERE created_by = $1',
    [arturoId]
  );

  if (rows[0].count > 0) {
    console.log(`[Seed] Arturo ya tiene ${rows[0].count} producto(s), no se duplican.`);
    return;
  }

  for (const product of ARTURO_PRODUCTS) {
    await pool.query(
      `INSERT INTO products (name, description, price, created_by)
       VALUES ($1, $2, $3, $4)`,
      [product.name, product.description, product.price, arturoId]
    );
  }

  console.log(`[Seed] Catálogo inicial: ${ARTURO_PRODUCTS.length} productos asociados a arturo.`);
}

async function seed() {
  let arturoId = null;

  for (const user of DEMO_USERS) {
    const id = await ensureUser(user);
    if (user.username === 'arturo') arturoId = id;
  }

  if (arturoId) {
    await seedArturoProducts(arturoId);
  }

  console.log('\n[Seed] Usuarios de prueba listos. Credenciales:');
  DEMO_USERS.forEach((u) => console.log(`  - ${u.username} / ${u.password}`));
  console.log('\n[Seed] Métrica inicial de Unidad 3: arturo (14) productos.');

  await pool.end();
}

seed().catch((err) => {
  console.error('[Seed] Error creando datos de prueba:', err);
  process.exit(1);
});
