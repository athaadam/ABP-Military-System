import '../models/user.dart';
import 'api_service.dart';

class UserService {
  final ApiService _apiService = ApiService();

  List<User> _parseList(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    final list = map['data'] as List<dynamic>? ?? [];
    return list.map((e) => User.fromJson(e as Map<String, dynamic>)).toList();
  }

  User _parseOne(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    return User.fromJson(map['data'] as Map<String, dynamic>);
  }

  Future<List<User>> getAll() async {
    final response = await _apiService.get<Map<String, dynamic>>('/users');
    return _parseList(response.data);
  }

  Future<Map<String, dynamic>> getById(int id) async {
    final response = await _apiService.get<Map<String, dynamic>>('/users/$id');
    final map = response.data as Map<String, dynamic>;
    return map['data'] as Map<String, dynamic>;
  }

  Future<User> create({
    required String name,
    required String email,
    required String password,
    required String unitId,
  }) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '/users',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'role': 'admin',
        'unitId': unitId,
      },
    );
    return _parseOne(response.data);
  }

  Future<User> update(
    int id, {
    String? name,
    String? email,
    String? role,
    String? unitId,
  }) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (email != null) body['email'] = email;
    if (role != null) body['role'] = role;
    if (unitId != null) body['unitId'] = unitId;

    final response = await _apiService.put<Map<String, dynamic>>('/users/$id', data: body);
    return _parseOne(response.data);
  }

  Future<void> delete(int id) async {
    await _apiService.delete('/users/$id');
  }

  Future<String> resetPassword(int id) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '/users/$id/reset-password',
      data: {},
    );
    final map = response.data as Map<String, dynamic>;
    final data = map['data'] as Map<String, dynamic>;
    return data['password'] as String? ?? '';
  }
}
