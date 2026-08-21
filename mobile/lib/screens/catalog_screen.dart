import 'package:flutter/material.dart';

import '../api.dart';
import '../auth_state.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key, required this.auth});

  final AuthState auth;

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final _nameCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  List<dynamic> _products = [];
  bool _loading = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _priceCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final products = await widget.auth.api.products();
      setState(() => _products = products);
    } catch (err) {
      setState(() => _error = err.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _create() async {
    final name = _nameCtrl.text.trim();
    final price = num.tryParse(_priceCtrl.text.trim());
    if (name.isEmpty || price == null) {
      setState(() => _error = 'Nombre y precio son obligatorios');
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final data = await widget.auth.api.createProduct(
        name: name,
        price: price,
        description: _descCtrl.text.trim(),
      );
      final product = data['product'];
      final count = (data['productsCount'] as num?)?.toInt();
      setState(() {
        _products = [product, ..._products];
        _nameCtrl.clear();
        _priceCtrl.clear();
        _descCtrl.clear();
      });
      if (count != null) widget.auth.setProductsCount(count);
    } on ApiException catch (err) {
      setState(() => _error = err.message);
    } catch (err) {
      setState(() => _error = err.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  String _price(dynamic value) {
    final number = (value is num) ? value : num.tryParse('$value') ?? 0;
    return '\$${number.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Registrar producto', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                const Text(
                  'El creador se toma del JWT en el servidor. No se envía created_by.',
                  style: TextStyle(fontSize: 12, color: Colors.black54),
                ),
                TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Nombre')),
                TextField(
                  controller: _priceCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Precio (COP)'),
                ),
                TextField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Descripción')),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: _saving ? null : _create,
                  style: FilledButton.styleFrom(backgroundColor: const Color(0xFF2F6B3A)),
                  child: Text(_saving ? 'Guardando...' : 'Crear producto'),
                ),
              ],
            ),
          ),
        ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(_error!, style: const TextStyle(color: Colors.red)),
          ),
        const SizedBox(height: 12),
        if (_loading)
          const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
        else
          ..._products.map((raw) {
            final product = raw as Map<String, dynamic>;
            final creator = product['creator'] as Map<String, dynamic>?;
            return Card(
              child: ListTile(
                title: Text(product['name']?.toString() ?? ''),
                subtitle: Text(product['description']?.toString() ?? ''),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(_price(product['price']), style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text(
                      'Creado por: ${creator?['username'] ?? '-'}',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF2F6B3A)),
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }
}
