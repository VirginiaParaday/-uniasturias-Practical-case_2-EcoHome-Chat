-- Actividad 2 (soporte): Base de usuarios ya existente (heredada de la fase anterior)
-- Se incluye aqui para que el proyecto sea ejecutable de forma autonoma.

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'ventas'
                  CHECK (role IN ('admin', 'ventas', 'logistica', 'soporte')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
