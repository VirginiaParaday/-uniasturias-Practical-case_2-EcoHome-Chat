import 'package:flutter/material.dart';

import 'auth_state.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const EcoHomeApp());
}

class EcoHomeApp extends StatefulWidget {
  const EcoHomeApp({super.key});

  @override
  State<EcoHomeApp> createState() => _EcoHomeAppState();
}

class _EcoHomeAppState extends State<EcoHomeApp> {
  final AuthState _auth = AuthState();

  @override
  void initState() {
    super.initState();
    _auth.addListener(_onAuth);
    _auth.restore();
  }

  void _onAuth() => setState(() {});

  @override
  void dispose() {
    _auth.removeListener(_onAuth);
    _auth.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EcoHome Store',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2F6B3A)),
        useMaterial3: true,
      ),
      home: _auth.isLoggedIn ? HomeScreen(auth: _auth) : LoginScreen(auth: _auth),
    );
  }
}
