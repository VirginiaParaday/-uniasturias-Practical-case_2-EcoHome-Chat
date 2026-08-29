-- Proyecto de aplicación: rol cliente (signup público y usuario de demo).
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'ventas', 'logistica', 'soporte', 'cliente'));
