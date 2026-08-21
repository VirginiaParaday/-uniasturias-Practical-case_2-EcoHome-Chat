import 'package:flutter/foundation.dart';

/// Misma API que React (`VITE_API_URL` / `VITE_SOCKET_URL`).
/// Android emulador: 10.0.2.2 apunta al localhost de Windows.
/// iOS simulador / desktop / web: localhost.
///
/// Sobrescribe en runtime:
///   flutter run --dart-define=API_URL=http://192.168.1.10:4000
class AppConfig {
  static String get baseUrl {
    const fromEnv = String.fromEnvironment('API_URL');
    if (fromEnv.isNotEmpty) return fromEnv;

    if (kIsWeb) return 'http://localhost:4000';

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:4000';
      default:
        return 'http://localhost:4000';
    }
  }

  static String get apiUrl => '$baseUrl/api';
  static String get socketUrl => baseUrl;
}
