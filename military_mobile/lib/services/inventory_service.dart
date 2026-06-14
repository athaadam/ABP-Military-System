import '../models/inventory_item.dart';
import 'api_service.dart';

class InventoryService {
  final ApiService _apiService = ApiService();

  Future<List<InventoryItem>> getAll() async {
    try {
      final response = await _apiService.get('/inventory');

      final List<dynamic> data = response.data as List<dynamic>? ?? [];
      return data.map((item) => InventoryItem.fromJson(item as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<InventoryItem> getById(String id) async {
    try {
      final response = await _apiService.get('/inventory/$id');
      return InventoryItem.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<InventoryItem> create({
    required String name,
    required String code,
    required String category,
    required int quantity,
    required String unit,
    required int minStock,
    required String warehouseId,
  }) async {
    try {
      final response = await _apiService.post(
        '/inventory',
        data: {
          'name': name,
          'code': code,
          'category': category,
          'quantity': quantity,
          'unit': unit,
          'min_stock': minStock,
          'warehouse_id': warehouseId,
        },
      );
      return InventoryItem.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<InventoryItem> update(
    String id, {
    required String name,
    required String category,
    required int quantity,
    required String unit,
    required int minStock,
    required String warehouseId,
  }) async {
    try {
      final response = await _apiService.put(
        '/inventory/$id',
        data: {
          'name': name,
          'category': category,
          'quantity': quantity,
          'unit': unit,
          'min_stock': minStock,
          'warehouse_id': warehouseId,
        },
      );
      return InventoryItem.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> delete(String id) async {
    try {
      await _apiService.delete('/inventory/$id');
    } catch (e) {
      rethrow;
    }
  }
}
