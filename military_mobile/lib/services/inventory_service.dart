import 'dart:convert';
import '../models/item.dart';
import 'api_service.dart';

class InventoryService {
  final ApiService _apiService = ApiService();

  List<Item> _parseList(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    final list = map['data'] as List<dynamic>? ?? [];
    return list.map((e) => Item.fromJson(e as Map<String, dynamic>)).toList();
  }

  Item _parseItem(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    return Item.fromJson(map['data'] as Map<String, dynamic>);
  }

  Future<List<Item>> getAll() async {
    final response = await _apiService.get<Map<String, dynamic>>('/items');
    return _parseList(response.data);
  }

  Future<Item> getById(int id) async {
    final response = await _apiService.get<Map<String, dynamic>>('/items/$id');
    return _parseItem(response.data);
  }

  Future<Item> create({
    required String name,
    required String category,
    required int stock,
    required String condition,
    required int warehouseId,
    String? imageUrl,
  }) async {
    final img = imageUrl?.isNotEmpty == true ? imageUrl! : _generatePlaceholder(name, category);
    final response = await _apiService.post<Map<String, dynamic>>(
      '/items',
      data: {
        'name': name,
        'category': category,
        'stock': stock,
        'condition': condition,
        'warehouseId': warehouseId,
        'imageUrl': img,
      },
    );
    return _parseItem(response.data);
  }

  Future<Item> update(
    int id, {
    String? name,
    String? category,
    int? stock,
    String? condition,
    int? warehouseId,
  }) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (category != null) body['category'] = category;
    if (stock != null) body['stock'] = stock;
    if (condition != null) body['condition'] = condition;
    if (warehouseId != null) body['warehouseId'] = warehouseId;

    final response = await _apiService.put<Map<String, dynamic>>('/items/$id', data: body);
    return _parseItem(response.data);
  }

  Future<void> delete(int id) async {
    await _apiService.delete('/items/$id');
  }

  String _generatePlaceholder(String name, String category) {
    final initials = name.trim().split(RegExp(r'\s+'))
        .take(2)
        .map((w) => w.isNotEmpty ? w[0].toUpperCase() : '')
        .join();
    final display = initials.isEmpty ? 'IT' : initials;
    const colors = {
      'Persenjataan': '#7f1d1d',
      'Amunisi': '#78350f',
      'Kendaraan Militer': '#164e63',
    };
    final bg = colors[category] ?? '#1e3a5f';
    final svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="36">'
        '<rect width="64" height="36" fill="$bg"/>'
        '<text x="4" y="26" fill="white" font-size="18" font-weight="bold">$display</text>'
        '</svg>';
    final encoded = base64.encode(utf8.encode(svg));
    return 'data:image/svg+xml;base64,$encoded';
  }
}
