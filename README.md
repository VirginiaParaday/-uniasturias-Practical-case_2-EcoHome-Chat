# EcoHome Store — Chat interno + catálogo (Unidades 2 y 3)

Proyecto entregable de **Asturias Corporación Universitaria**.

- **Unidad 2:** chat interno en tiempo real (Express + Socket.IO + PostgreSQL + JWT + React).
- **Unidad 3:** el mismo backend se consume desde **React y Flutter**; catálogo con
  trazabilidad (`products.created_by`) y métrica `Usuario (N)`.

Gestor de paquetes: **pnpm**.

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
│   │   │   ├── messageModel.js  # saveMessage / getLastMessages (Actividad 2 y 3)
│   │   │   └── productModel.js  # catálogo + created_by (Unidad 3)
│   │   ├── controllers/authController.js
│   │   ├── middleware/authMiddleware.js  # JWT para rutas REST
│   │   ├── routes/
│   │   │   ├── authRoutes.js    # /api/auth/login, /register, /me
│   │   │   ├── messageRoutes.js # /api/messages/recent, /verify
│   │   │   ├── productRoutes.js # GET/POST /api/products
│   │   │   └── userRoutes.js    # GET /api/users/me/stats
│   │   └── sockets/chatSocket.js # io.use() JWT handshake + new-message (Actividad 1 y 2)
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_messages.sql
│   │   └── 003_create_products.sql
│   └── scripts/
│       ├── migrate.js
│       └── seed.js              # usuarios de prueba + 14 productos de arturo
├── frontend/                    # Web React (= /web-react del enunciado)
│   ├── pnpm-workspace.yaml
│   └── src/
│       ├── api.js
│       ├── socket.js
│       ├── context/AuthContext.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Catalog.jsx      # Unidad 3: creador + badge Usuario (N)
│           └── Chat.jsx
├── mobile/                      # Cliente Flutter (= /mobile-flutter del enunciado)
│   ├── lib/
│   └── README.md
├── db/                          # Scripts SQL de entrega (copia de backend/migrations)
├── postman/                     # Colección Postman del CRUD + auth
├── docker-compose.yml
├── backup_postgres.sql          # (opcional) dump de la base local, ver sección 7
└── README.md
```

---

## 2. Requisitos previos

- **Node.js 18 o superior** (probado con Node 24)
- **pnpm** — si no lo tienes instalado, actívalo con corepack (viene incluido con Node):
  ```bash
  corepack enable
  corepack prepare pnpm@latest --activate
  ```
- **Docker Desktop** (recomendado para PostgreSQL) o una instancia de PostgreSQL propia
- **Flutter SDK** (solo para el cliente móvil de la Unidad 3) — [instalación en Windows](https://docs.flutter.dev/get-started/install/windows). Comprueba con `flutter doctor`. No hace falta Android Studio si corres la app en **Windows desktop** o Chrome.

---

## 3. Puesta en marcha (paso a paso)

### 3.1 Levantar PostgreSQL

```bash
cd ecohome-chat
docker compose up -d
```

Esto crea una base `ecohome_chat` con usuario `ecohome` / password `ecohome123` en el
puerto **5433** del host (`5433:5432` en `docker-compose.yml`). Si ya tienes PostgreSQL
propio, omite este paso y ajusta las variables de entorno del backend.

> **Nota (Windows):** si al migrar más adelante te sale `password authentication failed`
> aunque las credenciales sean correctas, probablemente tengas otro PostgreSQL nativo
> escuchando también en el puerto 5432 (revisa con `netstat -ano | findstr :5432`). La
> solución más simple es cambiar el mapeo de puerto en `docker-compose.yml` a
> `"5433:5432"` y actualizar `DB_PORT=5433` en `backend/.env`. Ver sección 6 para más detalle.

### 3.2 Backend

```bash
cd backend
cp .env.example .env      # ajusta valores si es necesario
pnpm install
pnpm run migrate            # crea users, messages y products
pnpm run seed                # usuarios de prueba + catálogo de arturo
pnpm run dev                 # levanta el servidor en http://localhost:4000
```

Usuarios de prueba creados por el seed:

| usuario      | password        | rol        |
|--------------|------------------|------------|
| admin        | Admin123!        | admin      |
| cliente      | Cliente123!      | cliente    |
| arturo       | Arturo123!       | ventas     |
| ventas1      | Ventas123!       | ventas     |
| logistica1   | Logistica123!    | logistica  |
| soporte1     | Soporte123!      | soporte    |

### 3.3 Frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
pnpm install
```

Si al instalar ves este aviso:
```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.21.5
```
es porque pnpm bloquea por seguridad los scripts `postinstall` hasta aprobarlos
explícitamente. El repo ya trae `frontend/pnpm-workspace.yaml` con `esbuild`
preaprobado, así que normalmente no debería salir; si de todas formas aparece, corre:
```bash
pnpm approve-builds esbuild
```
y confirma con `y`. Luego continúa:

```bash
pnpm run dev                 # http://localhost:5173
```

### 3.4 Cliente Flutter (`mobile/`)

El backend (sección 3.2) tiene que estar corriendo en `http://localhost:4000`.
Flutter **no reemplaza** a React: es un segundo cliente del mismo API.

**Importante:** los comandos de abajo se ejecutan **dentro de `mobile/`**, no en la
raíz del repo. Si corres `flutter create .` en `ecohome-chat\`, ensucias el proyecto
con `android/`, `ios/`, `windows/`, etc.

En Windows, la primera vez que uses plugins nativos (`http`, `shared_preferences`,
`socket_io_client`) hay que activar **Developer Mode**:

```powershell
start ms-settings:developers
```

Activa *Developer Mode*, cierra la terminal y abre otra.

```powershell
cd mobile
flutter pub get
flutter run -d windows
```

La primera compilación tarda unos minutos. Se abre una ventana de escritorio.
Login de prueba: `arturo` / `Arturo123!`.

Si `flutter devices` no lista Windows, o es la primera vez en esta carpeta y
faltan las carpetas de plataforma:

```powershell
cd mobile
flutter create . --project-name ecohome_mobile --org com.ecohome
flutter pub get
flutter run -d windows
```

Otras variantes (opcionales):

```powershell
flutter run -d chrome          # web; puede chocar con CORS
flutter run                    # elige dispositivo; Android pide Android SDK
```

- **Emulador Android:** la app ya usa `http://10.0.2.2:4000`. En
  `mobile/android/app/src/main/AndroidManifest.xml` debe estar
  `android:usesCleartextTraffic="true"` (HTTP local).
- **Móvil físico en la misma Wi‑Fi:**

```powershell
flutter run --dart-define=API_URL=http://192.168.1.10:4000
```

(sustituye por la IP de tu PC).

Más detalle: `mobile/README.md`.

### 3.5 Probar el chat con 2 usuarios en paralelo

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
| Prueba funcional (2 navegadores) | Sigue la guía de la sección 3.5; toma capturas o graba un video corto mostrando el mensaje llegando a ambas pestañas |

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
| Evidencia (2 usuarios en paralelo) | Repite la prueba de la sección 3.5 con 2 usuarios distintos y documenta con capturas/video: carga del historial + mensajes en vivo |

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
  `backend/.env` (o en las variables del servicio, si está desplegado) coincida
  exactamente con la URL del frontend (`http://localhost:5173` en local — protocolo,
  dominio y sin `/` al final).
- **`ECONNREFUSED` en el backend al iniciar**: PostgreSQL no está arriba o las
  credenciales en `.env` no coinciden con `docker-compose.yml`.
- **`password authentication failed for user "ecohome"`** aunque las credenciales del
  `.env` sean correctas: en Windows es común tener otro PostgreSQL (nativo, o de otro
  proyecto) escuchando también en el puerto 5432. Confírmalo con:
  ```powershell
  netstat -ano | findstr :5432
  ```
  Si ves más de un PID, cambia el mapeo en `docker-compose.yml` a `"5433:5432"`,
  actualiza `DB_PORT=5433` en `backend/.env`, y recrea el contenedor:
  ```powershell
  docker compose down -v
  docker compose up -d
  ```
- **Login devuelve 401**: confirma que corriste `pnpm run seed` y que usas exactamente
  las credenciales de la tabla de la sección 3.2.
- **El socket se desconecta inmediatamente**: revisa que el token no haya expirado
  (`JWT_EXPIRES_IN` en `.env`, por defecto 8h) y que se esté enviando en
  `auth: { token }` desde el cliente.
- **`ERR_PNPM_IGNORED_BUILDS` (esbuild) al instalar el frontend**: corre
  `pnpm approve-builds esbuild` y confirma con `y`; commitea el archivo que pnpm
  modifique (`pnpm-workspace.yaml`).
- **`Cannot find module 'pg-types'` (o cualquier módulo "perdido") al correr un script**:
  el `node_modules` quedó corrupto o a medias (pasa tras interrupciones, o al recrear
  el contenedor de Docker). Solución:
  ```powershell
  Remove-Item -Recurse -Force node_modules
  pnpm install
  ```

---

## 7. Respaldo de la base de datos local (opcional)

Si quieres archivar el proyecto completo (por ejemplo en un `.zip`/`.rar`) conservando
los datos actuales de tu PostgreSQL local, expórtalos a un dump SQL **dentro** de la
carpeta del proyecto antes de comprimir:

```bash
docker exec ecohome_chat_db pg_dump -U ecohome -d ecohome_chat > backup_postgres.sql
```

Para restaurarlo más adelante (después de `docker compose up -d` en una máquina nueva):

```bash
# Windows (PowerShell)
Get-Content backup_postgres.sql | docker exec -i ecohome_chat_db psql -U ecohome -d ecohome_chat

# macOS / Linux
cat backup_postgres.sql | docker exec -i ecohome_chat_db psql -U ecohome -d ecohome_chat
```

Antes de comprimir, borra las carpetas pesadas y regenerables (no hace falta
archivarlas, `pnpm install` las reconstruye en segundos):

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force backend\node_modules, frontend\node_modules, frontend\dist -ErrorAction SilentlyContinue

# macOS / Linux
rm -rf backend/node_modules frontend/node_modules frontend/dist
```

---

## 8. Unidad 3 — mismo backend, React + Flutter, trazabilidad

Requisito del enunciado: **no hay APIs paralelas**. Flutter llama a los mismos
endpoints que React. El creador de un producto **nunca** viaja en el body: se toma
del JWT (`req.user.id`).

### 8.1 Arranque extra (además de la sección 3)

Si el backend ya estaba corriendo, hay que **migrar y sembrar de nuevo** (tabla `products`
+ usuario `arturo` con 14 productos):

```powershell
cd backend
pnpm run migrate
pnpm run seed
pnpm run dev
```

React no cambia de puerto (`http://localhost:5173`). Tras login verás **Catálogo** y **Chat**.
El badge del header es `arturo (14)`. Crea un producto y pasa a `arturo (15)`.

Para Flutter sigue la **sección 3.4** (desde `mobile/`, `flutter run -d windows`).
Flujo de evidencia: `login → catálogo → chat → mensaje visible también en React`.

### 8.2 Contratos REST usados por ambos clientes

| Método | Ruta | Auth | Uso |
|---|---|---|---|
| POST | `/api/auth/signup` | no | registro (rol `cliente`) + JWT |
| POST | `/api/auth/register` | no | alias de signup |
| POST | `/api/auth/login` | no | JWT unificado |
| GET | `/api/auth/me` | Bearer | perfil + `productsCount` |
| GET | `/api/users/me` | Bearer | `{ username, productsCount }` |
| GET | `/api/users/me/stats` | Bearer | igual que `/users/me` |
| GET | `/api/products` | Bearer | catálogo con `creator.username` |
| GET | `/api/products/:id` | Bearer | un producto |
| POST | `/api/products` | Bearer | crea; `created_by` sale del token |
| PUT | `/api/products/:id` | Bearer | edita (autor o admin) |
| DELETE | `/api/products/:id` | Bearer | borra (autor o admin) |
| Socket.IO | `auth.token` | JWT handshake | conexión |
| Socket.IO | `messages` / `message-history` | — | últimos 10 al conectar |
| Socket.IO | `new-message` | — | envío y broadcast |

Ejemplo Postman/cURL (Actividad 2):

```powershell
# Login
curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"arturo\",\"password\":\"Arturo123!\"}"

# Crear (pega el token; NO envíes created_by)
curl -s -X POST http://localhost:4000/api/products -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Maceta de barro\",\"price\":25000}"

# Listar (el JSON incluye creator.username)
curl -s http://localhost:4000/api/products -H "Authorization: Bearer TOKEN"

# Contador
curl -s http://localhost:4000/api/users/me/stats -H "Authorization: Bearer TOKEN"
```

SQL de auditoría:

```powershell
docker exec -it ecohome_chat_db psql -U ecohome -d ecohome_chat -c "SELECT p.id, p.name, u.username FROM products p JOIN users u ON u.id = p.created_by ORDER BY p.id;"
```

### 8.3 Texto para el informe (copiar y ajustar)

**Actividad 1.** La app Flutter reutiliza el backend existente. El login llama a
`POST /api/auth/login` y guarda el JWT. El catálogo usa `GET /api/products` con
`Authorization: Bearer`. El chat usa Socket.IO con `auth: { token }`, los mismos
eventos que React (`message-history`, `new-message`). No se crearon rutas `/mobile`.

**Actividad 2.** Se añadió `products.created_by` (FK a `users.id`). En
`POST /api/products` el creador se toma de `req.user.id` (JWT). Las consultas
devuelven `creator.username`. Un cliente no puede atribuir un producto a otro usuario.

**Actividad 3.** React y Flutter muestran el creador en cada producto y el badge
`username (N)` con `productsCount` de `/api/auth/me` o `/api/users/me/stats`.
Tras un alta, la respuesta incluye el nuevo contador y se emite `product-created`
por Socket.IO para actualizar la UI al instante (p. ej. `arturo (14)` → `arturo (15)`).

---

## 9. Proyecto de aplicación — paquete de entrega

El enunciado pide `/backend`, `/web-react`, `/mobile-flutter` y `/db`. En este repo:

| Enunciado | Carpeta real |
|---|---|
| `/backend` | `backend/` |
| `/web-react` | `frontend/` |
| `/mobile-flutter` | `mobile/` |
| `/db` | `db/` (copia de `backend/migrations/`) |

`pnpm run migrate` lee **`backend/migrations/`**. Tras clonar, corre también
`004_add_role_cliente.sql` (incluido en migrate) y `pnpm run seed` para crear
`admin` / `cliente`.

### Variables de entorno (`backend/.env`)

| Variable | Ejemplo | Uso |
|---|---|---|
| `PORT` | `4000` | HTTP + Socket.IO |
| `DB_HOST` | `localhost` | PostgreSQL |
| `DB_PORT` | `5433` | puerto del host (Docker) |
| `DB_NAME` | `ecohome_chat` | base |
| `DB_USER` | `ecohome` | usuario |
| `DB_PASSWORD` | `ecohome123` | clave |
| `JWT_SECRET` | (cambiar en prod) | firma del token |
| `JWT_EXPIRES_IN` | `8h` | vigencia |
| `CORS_ORIGIN` | `http://localhost:5173` | origen React |

Frontend (`frontend/.env`): `VITE_API_URL=http://localhost:4000/api`,
`VITE_SOCKET_URL=http://localhost:4000`.

### Cómo correr (resumen)

1. `docker compose up -d`
2. `backend`: `pnpm install` → `pnpm run migrate` → `pnpm run seed` → `pnpm run dev`
3. `frontend`: `pnpm install` → `pnpm run dev` → http://localhost:5173
4. `mobile`: `flutter pub get` → `flutter run -d windows`

### Postman

Importa `postman/EcoHome-Store.postman_collection.json`.
Login → copia `token` a la variable de colección → CRUD de productos.

### Build móvil (evidencia)

```powershell
cd mobile
flutter build windows
# si hay Android SDK:
flutter build apk
```

El APK queda en `mobile/build/app/outputs/flutter-apk/`. Sin SDK de Android,
`flutter build windows` y `flutter doctor` sirven como evidencia de build.
