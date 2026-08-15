# EcoHome Store — Chat Interno Corporativo

Proyecto entregable del **Caso Práctico Unidad 2** (Asturias Corporación Universitaria).

Implementa un módulo de chat interno en tiempo real para los equipos de Ventas, Logística
y Soporte de EcoHome Store, resolviendo el problema descrito en el enunciado: comunicación
dispersa en WhatsApp/Messenger/correo, sin trazabilidad ni historial centralizado.

Stack: **Express.js + Socket.IO + PostgreSQL + JWT** (backend) y **React + Vite +
socket.io-client** (frontend).

---

## 1. Estructura del proyecto

```
ecohome-chat/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express + servidor HTTP + Socket.IO (Actividad 1)
│   │   ├── db.js                # Pool de conexión a PostgreSQL
│   │   ├── config/jwt.js
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   └── messageModel.js  # saveMessage / getLastMessages (Actividad 2 y 3)
│   │   ├── controllers/authController.js
│   │   ├── middleware/authMiddleware.js  # JWT para rutas REST
│   │   ├── routes/
│   │   │   ├── authRoutes.js    # /api/auth/login, /register, /me
│   │   │   └── messageRoutes.js # /api/messages/recent, /verify
│   │   └── sockets/chatSocket.js # io.use() JWT handshake + new-message (Actividad 1 y 2)
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   └── 002_create_messages.sql
│   └── scripts/
│       ├── migrate.js
│       └── seed.js              # crea usuarios de prueba
├── frontend/
│   └── src/
│       ├── api.js               # cliente REST (axios + JWT)
│       ├── socket.js            # cliente Socket.IO (envía token en el handshake)
│       ├── context/AuthContext.jsx
│       └── pages/
│           ├── Login.jsx        # Actividad 3, Entregable 1
│           └── Chat.jsx         # Actividad 3, Entregables 2 y 3
├── docker-compose.yml           # PostgreSQL listo para desarrollo
└── README.md
```

---

## 2. Requisitos previos

- Node.js 18 o superior
- Docker (recomendado para PostgreSQL) o una instancia de PostgreSQL propia

---

## 3. Puesta en marcha (paso a paso)

### 3.1 Levantar PostgreSQL

```bash
cd ecohome-chat
docker compose up -d
```

Esto crea una base `ecohome_chat` con usuario `ecohome` / password `ecohome123` en el
puerto `5432`. Si ya tienes PostgreSQL propio, omite este paso y ajusta las variables
de entorno del backend.

### 3.2 Backend

```bash
cd backend
cp .env.example .env      # ajusta valores si es necesario
npm install
npm run migrate            # crea las tablas users y messages
npm run seed                # crea usuarios de prueba
npm run dev                 # levanta el servidor en http://localhost:4000
```

Usuarios de prueba creados por el seed:

| usuario      | password        | rol        |
|--------------|------------------|------------|
| admin        | Admin123!        | admin      |
| ventas1      | Ventas123!       | ventas     |
| logistica1   | Logistica123!    | logistica  |
| soporte1     | Soporte123!      | soporte    |

### 3.3 Frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

### 3.4 Probar el chat con 2 usuarios en paralelo

1. Abre `http://localhost:5173` en dos navegadores/pestañas distintas (o una en
   incógnito).
2. Inicia sesión con `ventas1 / Ventas123!` en una, y `soporte1 / Soporte123!` en la
   otra.
3. Envía un mensaje desde una pestaña: debe aparecer instantáneamente en la otra.
4. Recarga la página: el historial debe mostrar los últimos 10 mensajes guardados en
   PostgreSQL.

---

## 4. Cómo el proyecto cumple cada actividad

### Actividad 1 — Backend en tiempo real con Socket.IO

| Entregable | Dónde está implementado |
|---|---|
| Servidor Socket.IO integrado a Express | `backend/src/server.js` (crea `http.createServer(app)` y monta `new Server(httpServer, ...)`) |
| Logs de conexión/desconexión | `backend/src/sockets/chatSocket.js` → `console.log` en `connection` y `disconnect` |
| Recepción de `new-message` | `socket.on('new-message', ...)` en `chatSocket.js` |
| Broadcast con `io.emit(...)` | Misma función, tras persistir el mensaje: `io.emit('new-message', saved)` |
| Prueba funcional (2 navegadores) | Sigue la guía de la sección 3.4; toma capturas o graba un video corto mostrando el mensaje llegando a ambas pestañas |

### Actividad 2 — Seguridad y persistencia: JWT + base de datos de mensajes

| Entregable | Dónde está implementado |
|---|---|
| Validación de JWT en el handshake del socket | `io.use((socket, next) => { ... jwt.verify(token, ...) })` en `chatSocket.js` |
| Asociación socket ↔ usuario autenticado | `socket.user = { id, username, role }`, usado luego en `new-message` |
| Script SQL para tabla `messages` | `backend/migrations/002_create_messages.sql` (`id`, `user_id` FK, `username`, `text`, `created_at`) |
| Persistencia automática antes de reenviar | `saveMessage(...)` se llama **antes** de `io.emit(...)` en `chatSocket.js` |
| Evidencia de persistencia | Endpoint `GET /api/messages/verify` (requiere JWT) devuelve el total de mensajes guardados; también puedes correr `SELECT * FROM messages ORDER BY created_at DESC;` directamente en PostgreSQL |

Verificación rápida por API (usa el token devuelto por `/api/auth/login`):

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:4000/api/messages/verify
curl -H "Authorization: Bearer <TOKEN>" http://localhost:4000/api/messages/recent
```

Verificación por SQL:

```bash
docker exec -it ecohome_chat_db psql -U ecohome -d ecohome_chat -c "SELECT id, username, text, created_at FROM messages ORDER BY created_at DESC LIMIT 10;"
```

### Actividad 3 — Frontend React completo: login + chat con historial + tiempo real

| Entregable | Dónde está implementado |
|---|---|
| Login con JWT | `frontend/src/pages/Login.jsx` + `AuthContext.jsx` (`loginRequest` en `api.js`) |
| Token guardado y usado para acceder al chat | `localStorage.setItem('ecohome_token', ...)`, leído por `App.jsx` para decidir Login vs Chat |
| Pantalla de chat (listado + input + botón enviar) | `frontend/src/pages/Chat.jsx` |
| Conexión a Socket.IO enviando el token | `frontend/src/socket.js` → `io(SOCKET_URL, { auth: { token } })` |
| Carga de historial (últimos 10) | Backend emite `message-history` al conectar (`chatSocket.js`); frontend lo escucha en `Chat.jsx` (`socket.on('message-history', ...)`) |
| Envío/recepción en tiempo real | `socket.emit('new-message', { text })` al enviar; `socket.on('new-message', ...)` actualiza el listado para todos los clientes conectados |
| Evidencia (2 usuarios en paralelo) | Repite la prueba de la sección 3.4 con 2 usuarios distintos y documenta con capturas/video: carga del historial + mensajes en vivo |

---

## 5. Decisiones técnicas relevantes

- **JWT en el handshake, no en query string plano**: se envía en `socket.handshake.auth.token`,
  validado con un middleware `io.use()` antes de aceptar la conexión — así ningún usuario
  no autenticado llega a `io.on('connection', ...)`.
- **Persistencia antes de broadcast**: garantiza que si el servidor se reinicia justo
  después de un mensaje, este ya quedó guardado (cumple la condición "el chat debe
  funcionar incluso si el servidor se reinicia").
- **Historial ordenado correctamente**: la consulta trae los últimos 10 por `created_at DESC`
  y luego los reordena `ASC` para pintarlos en orden cronológico natural en el chat.
- **Roles de usuario** (`admin`, `ventas`, `logistica`, `soporte`) ya están en el modelo de
  `users`, dejando la base lista para reglas de autorización más finas (por ejemplo,
  canales separados por área) como evolución futura, tal como pide la gerencia en el
  enunciado.
- **Escalabilidad futura**: separar `io.use()` (auth) de la lógica de negocio en
  `sockets/chatSocket.js` facilita añadir salas (`socket.join(room)`) para separar
  Ventas/Logística/Soporte sin reescribir el núcleo, y el modelo REST ya expone
  endpoints reutilizables por una futura app móvil.

---

## 6. Solución de problemas

- **El frontend no conecta al socket / error de CORS**: revisa que `CORS_ORIGIN` en
  `backend/.env` coincida con la URL del frontend (`http://localhost:5173` por defecto).
- **`ECONNREFUSED` en el backend al iniciar**: PostgreSQL no está arriba o las
  credenciales en `.env` no coinciden con `docker-compose.yml`.
- **Login devuelve 401**: confirma que corriste `npm run seed` y que usas exactamente
  las credenciales de la tabla de la sección 3.2.
- **El socket se desconecta inmediatamente**: revisa que el token no haya expirado
  (`JWT_EXPIRES_IN` en `.env`, por defecto 8h) y que se esté enviando en
  `auth: { token }` desde el cliente.
