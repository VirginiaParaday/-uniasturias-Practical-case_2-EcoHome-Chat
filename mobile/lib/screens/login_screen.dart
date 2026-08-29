import 'package:flutter/material.dart';

import '../auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.auth});

  final AuthState auth;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _userCtrl = TextEditingController(text: 'cliente');
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController(text: 'Cliente123!');
  bool _isSignup = false;

  @override
  void dispose() {
    _userCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final ok = _isSignup
        ? await widget.auth.signup(
            user: _userCtrl.text.trim(),
            email: _emailCtrl.text.trim(),
            password: _passCtrl.text,
          )
        : await widget.auth.login(_userCtrl.text.trim(), _passCtrl.text);
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(widget.auth.error ?? 'Operación fallida')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF2F6B3A),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 380),
          child: Card(
            margin: const EdgeInsets.all(24),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'EcoHome Store',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2F6B3A),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text('Mismo backend que React · JWT + catálogo + chat'),
                    const SizedBox(height: 16),
                    SegmentedButton<bool>(
                      segments: const [
                        ButtonSegment(value: false, label: Text('Ingresar')),
                        ButtonSegment(value: true, label: Text('Registro')),
                      ],
                      selected: {_isSignup},
                      onSelectionChanged: (value) => setState(() => _isSignup = value.first),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _userCtrl,
                      decoration: const InputDecoration(labelText: 'Usuario'),
                    ),
                    if (_isSignup) ...[
                      const SizedBox(height: 12),
                      TextField(
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(labelText: 'Email'),
                      ),
                    ],
                    const SizedBox(height: 12),
                    TextField(
                      controller: _passCtrl,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'Contraseña'),
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: widget.auth.loading ? null : _submit,
                      style: FilledButton.styleFrom(backgroundColor: const Color(0xFF2F6B3A)),
                      child: Text(
                        widget.auth.loading
                            ? 'Procesando...'
                            : _isSignup
                                ? 'Crear cuenta'
                                : 'Ingresar',
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'admin / Admin123!\ncliente / Cliente123!',
                      style: TextStyle(fontSize: 12, color: Colors.black54),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
