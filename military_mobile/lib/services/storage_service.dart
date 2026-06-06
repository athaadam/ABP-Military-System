import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class StorageService {
  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Future<void> saveToken(String token) async {
    await _prefs.setString('auth_token', token);
  }

  static String? getToken() {
    return _prefs.getString('auth_token');
  }

  static Future<void> saveUser(Map<String, dynamic> user) async {
    await _prefs.setString('user_data', jsonEncode(user));
  }

  static Map<String, dynamic>? getUser() {
    final userJson = _prefs.getString('user_data');
    if (userJson != null) {
      return jsonDecode(userJson) as Map<String, dynamic>;
    }
    return null;
  }

  static Future<void> clearAuth() async {
    await _prefs.remove('auth_token');
    await _prefs.remove('user_data');
  }

  static Future<void> clear() async {
    await _prefs.clear();
  }
}
