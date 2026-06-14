import '../models/unit.dart';
import 'api_service.dart';

class UnitService {
  final ApiService _apiService = ApiService();

  Future<List<Unit>> getAll() async {
    try {
      final response = await _apiService.get('/units');

      final List<dynamic> data = response.data as List<dynamic>? ?? [];
      return data.map((unit) => Unit.fromJson(unit as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Unit> getById(String id) async {
    try {
      final response = await _apiService.get('/units/$id');
      return Unit.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<Unit> create({
    required String id,
    required String name,
    String? logo,
  }) async {
    try {
      final response = await _apiService.post(
        '/units',
        data: {
          'id': id,
          'name': name,
          'logo': logo,
        },
      );
      return Unit.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<Unit> update(
    String id, {
    required String name,
    String? logo,
  }) async {
    try {
      final response = await _apiService.put(
        '/units/$id',
        data: {
          'name': name,
          'logo': logo,
        },
      );
      return Unit.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> delete(String id) async {
    try {
      await _apiService.delete('/units/$id');
    } catch (e) {
      rethrow;
    }
  }
}
