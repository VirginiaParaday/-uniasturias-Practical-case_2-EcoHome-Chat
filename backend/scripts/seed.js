// Crea usuarios de demostracion (uno por area del negocio) con password hasheada.
// Uso: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

const DEMO_USERS = [
  { username: 'admin', email: 'admin@ecohome.test', password: 'Admin123!', role: 'admin' },
  { username: 'ventas1', email: 'ventas1@ecohome.test', password: 'Ventas123!', role: 'ventas' },
  { username: 'logistica1', email: 'logistica1@ecohome.test', password: 'Logistica123!', role: 'logistica' },
  { username: 'soporte1', email: 'soporte1@ecohome.test', password: 'Soporte123!', role: 'soporte' },
];

async function seed() {
  for (const u of DEMO_USERS) {
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE username = $1', [u.username]);

    if (existing.length > 0) {
      console.log(`[Seed] Usuario "${u.username}" ya existe, se omite.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      [u.username, u.email, passwordHash, u.role]
    );
    console.log(`[Seed] Usuario creado: ${u.username} / ${u.password} (rol: ${u.role})`);
  }

  console.log('\n[Seed] Usuarios de prueba listos. Credenciales:');
  DEMO_USERS.forEach((u) => console.log(`  - ${u.username} / ${u.password}`));

  await pool.end();
}

seed().catch((err) => {
  console.error('[Seed] Error creando usuarios de prueba:', err);
  process.exit(1);
});
