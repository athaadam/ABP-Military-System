import '../models/warehouse.dart';
import 'api_service.dart';

class WarehouseService {
  final ApiService _apiService = ApiService();

  List<Warehouse> _parseList(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    final list = map['data'] as List<dynamic>? ?? [];
    return list.map((e) => Warehouse.fromJson(e as Map<String, dynamic>)).toList();
  }

  Warehouse _parseOne(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    return Warehouse.fromJson(map['data'] as Map<String, dynamic>);
  }

  Future<List<Warehouse>> getAll() async {
    final response = await _apiService.get<Map<String, dynamic>>('/warehouses');
    return _parseList(response.data);
  }

  Future<Warehouse> getById(int id) async {
    final response = await _apiService.get<Map<String, dynamic>>('/warehouses/$id');
    return _parseOne(response.data);
  }

  Future<Warehouse> create({
    required String name,
    required String unitId,
  }) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '/warehouses',
      data: {
        'name': name,
        'unitId': unitId,
      },
    );
    return _parseOne(response.data);
  }

  Future<Warehouse> update(
    int id, {
    String? name,
    String? unitId,
  }) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (unitId != null) body['unitId'] = unitId;

    final response = await _apiService.put<Map<String, dynamic>>('/warehouses/$id', data: body);
    return _parseOne(response.data);
  }

  Future<void> delete(int id) async {
    await _apiService.delete('/warehouses/$id');
  }
}
