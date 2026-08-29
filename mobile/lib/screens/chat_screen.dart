import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../auth_state.dart';
import '../config.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, required this.auth});

  final AuthState auth;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _textCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  io.Socket? _socket;
  String _status = 'conectando...';

  @override
  void initState() {
    super.initState();
    _connect();
  }

  void _connect() {
    final socket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': widget.auth.token})
          .disableAutoConnect()
          .build(),
    );

    socket.onConnect((_) {
      if (!mounted) return;
      setState(() => _status = 'conectado');
    });
    socket.onDisconnect((_) {
      if (!mounted) return;
      setState(() => _status = 'desconectado');
    });
    socket.onConnectError((err) {
      if (!mounted) return;
      setState(() => _status = 'error: $err');
    });
    void applyHistory(dynamic history) {
      if (!mounted) return;
      final list = (history as List<dynamic>)
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();
      setState(() {
        _messages
          ..clear()
          ..addAll(list);
      });
      _jumpToEnd();
    }

    socket.on('message-history', applyHistory);
    socket.on('messages', applyHistory);
    socket.on('new-message', (raw) {
      if (!mounted) return;
      final message = Map<String, dynamic>.from(raw as Map);
      setState(() {
        if (_messages.any((item) => item['id'] == message['id'])) return;
        _messages.add(message);
      });
      _jumpToEnd();
    });

    socket.connect();
    _socket = socket;
  }

  void _jumpToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollCtrl.hasClients) return;
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    });
  }

  void _send() {
    final text = _textCtrl.text.trim();
    if (text.isEmpty) return;
    _socket?.emit('new-message', {'text': text});
    _textCtrl.clear();
  }

  @override
  void dispose() {
    _socket?.dispose();
    _textCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          color: const Color(0xFFEEF4EC),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text('Chat interno · $_status'),
        ),
        Expanded(
          child: ListView.builder(
            controller: _scrollCtrl,
            padding: const EdgeInsets.all(12),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final message = _messages[index];
              final mine = message['username'] == widget.auth.username;
              return Align(
                alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  constraints: const BoxConstraints(maxWidth: 280),
                  decoration: BoxDecoration(
                    color: mine ? const Color(0xFFD9F0DC) : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 2)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${message['username'] ?? ''}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      Text('${message['text'] ?? ''}'),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _textCtrl,
                  decoration: const InputDecoration(
                    hintText: 'Escribe un mensaje...',
                    border: OutlineInputBorder(),
                  ),
                  onSubmitted: (_) => _send(),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: _send,
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF2F6B3A)),
                child: const Text('Enviar'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
