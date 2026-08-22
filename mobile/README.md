# EcoHome Store — cliente Flutter (Unidad 3)

Misma API que React: `POST /api/auth/login`, `GET/POST /api/products`,
`GET /api/users/me/stats` y Socket.IO con JWT en el handshake.

La guía corta de arranque (junto a Docker, backend y frontend) está en el
**README de la raíz, sección 3.4**. Aquí va el detalle.

## 1. Requisitos

- Flutter SDK: https://docs.flutter.dev/get-started/install/windows
- Backend en marcha (`pnpm run dev` en `backend`, `http://localhost:4000`)
- En Windows, **Developer Mode** (symlinks de plugins):

```powershell
start ms-settings:developers
```

Comprueba el SDK:

```powershell
flutter doctor
```

No hace falta Android Studio si usas **Windows desktop** (`-d windows`).

## 2. Correr (desde `mobile/`, nunca desde la raíz del repo)

```powershell
cd E:\Windows\Programming\Training\ecohome-chat\mobile
flutter pub get
flutter run -d windows
```

Si faltan las carpetas `android/`, `ios/`, `windows/`:

```powershell
flutter create . --project-name ecohome_mobile --org com.ecohome
flutter pub get
flutter run -d windows
```

Login: `arturo` / `Arturo123!`

### Otros destinos

```powershell
flutter run -d chrome
flutter run --dart-define=API_URL=http://192.168.1.10:4000
```

- **Emulador Android:** `http://10.0.2.2:4000`. En
  `android/app/src/main/AndroidManifest.xml` debe estar
  `android:usesCleartextTraffic="true"`.
- **Windows / iOS simulador / web:** `http://localhost:4000`.

## 3. Flujo de evidencia

1. Login con `arturo` / `Arturo123!`
2. Catálogo: productos seed y AppBar `arturo (14)` (o el N actual)
3. Crear un producto → el badge pasa a `arturo (15)`
4. Pestaña Chat: el mensaje también aparece en React (`http://localhost:5173`)
