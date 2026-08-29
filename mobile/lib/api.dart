import 'dart:convert';

import 'package:http/http.dart' as http;

import 'config.dart';

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

class EcoHomeApi {
  EcoHomeApi(this.token);
  final String? token;

  Map<String, String> get _headers {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<Map<String, dynamic>> signup({
    required String username,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiUrl}/auth/signup'),
      headers: _headers,
      body: jsonEncode({'username': username, 'email': email, 'password': password}),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiUrl}/auth/login'),
      headers: _headers,
      body: jsonEncode({'username': username, 'password': password}),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> me() async {
    final response = await http.get(
      Uri.parse('${AppConfig.apiUrl}/auth/me'),
      headers: _headers,
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> myStats() async {
    final response = await http.get(
      Uri.parse('${AppConfig.apiUrl}/users/me/stats'),
      headers: _headers,
    );
    return _decode(response);
  }

  Future<List<dynamic>> products() async {
    final response = await http.get(
      Uri.parse('${AppConfig.apiUrl}/products'),
      headers: _headers,
    );
    final data = _decode(response);
    return (data['products'] as List<dynamic>?) ?? [];
  }

  Future<Map<String, dynamic>> createProduct({
    required String name,
    required num price,
    String? description,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiUrl}/products'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'price': price,
        if (description != null && description.isNotEmpty) 'description': description,
      }),
    );
    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final body = response.body.isEmpty ? <String, dynamic>{} : jsonDecode(response.body);
    if (response.statusCode >= 400) {
      final message = body is Map ? (body['message'] ?? 'Error ${response.statusCode}') : 'Error ${response.statusCode}';
      throw ApiException(message.toString());
    }
    if (body is Map<String, dynamic>) return body;
    return {'data': body};
  }
}
