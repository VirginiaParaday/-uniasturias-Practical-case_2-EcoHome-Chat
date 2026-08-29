-- Actividad 2, Entregable 2: Modelo y tabla "messages" para persistencia del chat interno.

CREATE TABLE IF NOT EXISTS messages (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username   VARCHAR(50) NOT NULL,
    text       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indice para acelerar la consulta de "ultimos N mensajes" (Actividad 3)
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
