import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../auth_state.dart';
import '../config.dart';
import 'catalog_screen.dart';
import 'chat_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.auth});

  final AuthState auth;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;
  io.Socket? _socket;

  @override
  void initState() {
    super.initState();
    _listenProductCreated();
  }

  void _listenProductCreated() {
    final socket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': widget.auth.token})
          .enableForceNew()
          .build(),
    );
    socket.on('product-created', (raw) {
      final payload = Map<String, dynamic>.from(raw as Map);
      if (payload['userId'] == widget.auth.userId && payload['productsCount'] is num) {
        widget.auth.setProductsCount((payload['productsCount'] as num).toInt());
      }
    });
    _socket = socket;
  }

  @override
  void dispose() {
    _socket?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = widget.auth;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF2F6B3A),
        foregroundColor: Colors.white,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('EcoHome Store'),
            Text(
              '${auth.username} (${auth.productsCount})',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: auth.logout,
            child: const Text('Salir', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: IndexedStack(
        index: _index,
        children: [
          CatalogScreen(auth: auth),
          ChatScreen(auth: auth),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Catálogo'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Chat'),
        ],
      ),
    );
  }
}
