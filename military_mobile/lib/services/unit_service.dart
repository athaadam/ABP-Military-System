import '../models/unit.dart';
import 'api_service.dart';

class UnitService {
  final ApiService _apiService = ApiService();

  List<Unit> _parseList(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    final list = map['data'] as List<dynamic>? ?? [];
    return list.map((e) => Unit.fromJson(e as Map<String, dynamic>)).toList();
  }

  Unit _parseOne(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    return Unit.fromJson(map['data'] as Map<String, dynamic>);
  }

  Future<List<Unit>> getAll() async {
    final response = await _apiService.get<Map<String, dynamic>>('/units');
    return _parseList(response.data);
  }

  Future<Unit> getById(String id) async {
    final response = await _apiService.get<Map<String, dynamic>>('/units/$id');
    return _parseOne(response.data);
  }

  Future<Unit> create({
    required String id,
    required String name,
    String? logo,
  }) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '/units',
      data: {
        'id': id,
        'name': name,
        'logo': logo,
      },
    );
    return _parseOne(response.data);
  }

  Future<Unit> update(
    String id, {
    required String name,
    String? logo,
  }) async {
    final response = await _apiService.put<Map<String, dynamic>>(
      '/units/$id',
      data: {
        'name': name,
        'logo': logo,
      },
    );
    return _parseOne(response.data);
  }

  Future<void> delete(String id) async {
    await _apiService.delete('/units/$id');
  }
}
