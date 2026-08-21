import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api.dart';

class AuthState extends ChangeNotifier {
  String? token;
  String? username;
  String? role;
  int? userId;
  int productsCount = 0;
  String? error;
  bool loading = false;

  bool get isLoggedIn => token != null && token!.isNotEmpty;

  EcoHomeApi get api => EcoHomeApi(token);

  Future<void> restore() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString('ecohome_token');
    username = prefs.getString('ecohome_username');
    role = prefs.getString('ecohome_role');
    userId = prefs.getInt('ecohome_user_id');
    productsCount = prefs.getInt('ecohome_products_count') ?? 0;
    notifyListeners();
  }

  Future<bool> login(String user, String password) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final data = await EcoHomeApi(null).login(user, password);
      final profile = data['user'] as Map<String, dynamic>;
      token = data['token'] as String;
      username = profile['username'] as String?;
      role = profile['role'] as String?;
      userId = profile['id'] as int?;
      productsCount = (profile['productsCount'] as num?)?.toInt() ?? 0;
      await _persist();
      return true;
    } catch (err) {
      error = err.toString();
      return false;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void setProductsCount(int value) {
    productsCount = value;
    SharedPreferences.getInstance().then((prefs) {
      prefs.setInt('ecohome_products_count', value);
    });
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('ecohome_token');
    await prefs.remove('ecohome_username');
    await prefs.remove('ecohome_role');
    await prefs.remove('ecohome_user_id');
    await prefs.remove('ecohome_products_count');
    token = null;
    username = null;
    role = null;
    userId = null;
    productsCount = 0;
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('ecohome_token', token ?? '');
    await prefs.setString('ecohome_username', username ?? '');
    await prefs.setString('ecohome_role', role ?? '');
    if (userId != null) await prefs.setInt('ecohome_user_id', userId!);
    await prefs.setInt('ecohome_products_count', productsCount);
  }
}
