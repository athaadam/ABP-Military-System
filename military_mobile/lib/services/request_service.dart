import '../models/request_model.dart';
import 'api_service.dart';

class RequestService {
  final ApiService _apiService = ApiService();

  List<RequestModel> _parseList(dynamic responseData) {
    final map = responseData as Map<String, dynamic>;
    final list = map['data'] as List<dynamic>? ?? [];
    return list.map((e) => RequestModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<RequestModel>> getMyRequests() async {
    final response = await _apiService.get<Map<String, dynamic>>('/requests/my');
    return _parseList(response.data);
  }

  Future<List<RequestModel>> getPendingRequests() async {
    final response = await _apiService.get<Map<String, dynamic>>('/requests/pending/list');
    return _parseList(response.data);
  }

  Future<RequestModel> getById(int id) async {
    final response = await _apiService.get<Map<String, dynamic>>('/requests/$id');
    final map = response.data as Map<String, dynamic>;
    return RequestModel.fromJson(map['data'] as Map<String, dynamic>);
  }

  Future<void> create({
    required int itemId,
    required int quantity,
    required String reason,
  }) async {
    await _apiService.post(
      '/requests',
      data: {
        'itemId': itemId,
        'quantity': quantity,
        'reason': reason,
      },
    );
  }

  Future<void> approve(int id) async {
    await _apiService.patch('/requests/$id/approve', data: {});
  }

  Future<void> reject(int id) async {
    await _apiService.patch('/requests/$id/reject', data: {});
  }
}
