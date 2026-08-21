# EcoHome Store — cliente Flutter (Unidad 3)

Misma API que React: `POST /api/auth/login`, `GET/POST /api/products`,
`GET /api/users/me/stats` y Socket.IO con JWT en el handshake.

Flutter **no está incluido** en este repo (el SDK no venía instalado en el PC).
Hay que generar las carpetas de plataforma una sola vez.

## 1. Instalar Flutter

https://docs.flutter.dev/get-started/install/windows

Comprueba:

```powershell
flutter doctor
```

## 2. Generar Android/iOS/Windows y correr

Desde la carpeta `mobile`:

```powershell
cd E:\Windows\Programming\Training\ecohome-chat\mobile
flutter create . --project-name ecohome_mobile --org com.ecohome
flutter pub get
```

HTTP en claro (el backend local es `http://`, no `https://`):

- Android: en `android/app/src/main/AndroidManifest.xml`, dentro de `<application>` añade
  `android:usesCleartextTraffic="true"`.
- iOS: en `ios/Runner/Info.plist` permite HTTP local (`NSAllowsArbitraryLoads` o excepción a localhost).

El backend debe estar en marcha (`pnpm run dev` en `backend`).

```powershell
flutter run
```

- **Emulador Android:** ya usa `http://10.0.2.2:4000` (localhost de Windows).
- **Móvil físico:** pasa la IP de tu PC:

```powershell
flutter run --dart-define=API_URL=http://192.168.1.10:4000
```

## 3. Flujo de evidencia

1. Login con `arturo` / `Arturo123!`
2. Catálogo: se listan los 14 productos seed y el AppBar muestra `arturo (14)`
3. Crear un producto → el badge pasa a `arturo (15)`
4. Pestaña Chat: enviar un mensaje y verlo también en React (`http://localhost:5173`)

Usuarios de prueba: los mismos del seed del backend (`arturo`, `ventas1`, `admin`, ...).
