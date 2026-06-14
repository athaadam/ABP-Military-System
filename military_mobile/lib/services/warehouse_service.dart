import '../models/warehouse.dart';
import 'api_service.dart';

class WarehouseService {
  final ApiService _apiService = ApiService();

  Future<List<Warehouse>> getAll() async {
    try {
      final response = await _apiService.get('/warehouses');

      final List<dynamic> data = response.data as List<dynamic>? ?? [];
      return data.map((warehouse) => Warehouse.fromJson(warehouse as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Warehouse> getById(String id) async {
    try {
      final response = await _apiService.get('/warehouses/$id');
      return Warehouse.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<Warehouse> create({
    required String id,
    required String name,
    required String location,
    required int capacity,
  }) async {
    try {
      final response = await _apiService.post(
        '/warehouses',
        data: {
          'id': id,
          'name': name,
          'location': location,
          'capacity': capacity,
        },
      );
      return Warehouse.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<Warehouse> update(
    String id, {
    required String name,
    required String location,
    required int capacity,
  }) async {
    try {
      final response = await _apiService.put(
        '/warehouses/$id',
        data: {
          'name': name,
          'location': location,
          'capacity': capacity,
        },
      );
      return Warehouse.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> delete(String id) async {
    try {
      await _apiService.delete('/warehouses/$id');
    } catch (e) {
      rethrow;
    }
  }
}
