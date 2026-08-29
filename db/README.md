# Scripts SQL (`/db`)

Copia de las migraciones que ejecuta `pnpm run migrate` desde `backend/`.
El origen de verdad sigue siendo `backend/migrations/`.

| Archivo | Tabla / cambio |
|---|---|
| `001_create_users.sql` | `users` |
| `002_create_messages.sql` | `messages` |
| `003_create_products.sql` | `products` + `created_by` |
| `004_add_role_cliente.sql` | rol `cliente` para signup |
