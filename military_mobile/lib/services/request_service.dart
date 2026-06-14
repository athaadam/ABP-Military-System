import '../models/request_model.dart';
import 'api_service.dart';

class RequestService {
  final ApiService _apiService = ApiService();

  Future<List<RequestModel>> getAll() async {
    try {
      final response = await _apiService.get('/requests');
      final List<dynamic> data = response.data as List<dynamic>? ?? [];
      return data.map((item) => RequestModel.fromJson(item as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<RequestModel> getById(String id) async {
    try {
      final response = await _apiService.get('/requests/$id');
      return RequestModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<RequestModel> create({
    required String itemId,
    required String itemName,
    required int quantity,
    required String unit,
    required String reason,
  }) async {
    try {
      final response = await _apiService.post(
        '/requests',
        data: {
          'item_id': itemId,
          'item_name': itemName,
          'quantity': quantity,
          'unit': unit,
          'reason': reason,
        },
      );
      return RequestModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<RequestModel> update(
    String id, {
    required String itemId,
    required String itemName,
    required int quantity,
    required String unit,
    required String reason,
  }) async {
    try {
      final response = await _apiService.put(
        '/requests/$id',
        data: {
          'item_id': itemId,
          'item_name': itemName,
          'quantity': quantity,
          'unit': unit,
          'reason': reason,
        },
      );
      return RequestModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<RequestModel> approve(String id) async {
    try {
      final response = await _apiService.put(
        '/requests/$id/approve',
        data: {},
      );
      return RequestModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<RequestModel> reject(String id) async {
    try {
      final response = await _apiService.put(
        '/requests/$id/reject',
        data: {},
      );
      return RequestModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> delete(String id) async {
    try {
      await _apiService.delete('/requests/$id');
    } catch (e) {
      rethrow;
    }
  }
}
