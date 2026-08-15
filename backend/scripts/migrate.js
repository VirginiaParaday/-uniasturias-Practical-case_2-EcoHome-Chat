// Ejecuta, en orden, todos los archivos .sql de la carpeta /migrations.
// Uso: npm run migrate
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/db');

async function migrate() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`[Migrate] Encontrados ${files.length} archivo(s) de migracion.`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`[Migrate] Ejecutando ${file} ...`);
    await pool.query(sql);
    console.log(`[Migrate] OK: ${file}`);
  }

  console.log('[Migrate] Todas las migraciones se ejecutaron correctamente.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('[Migrate] Error ejecutando migraciones:', err);
  process.exit(1);
});
