import 'package:dio/dio.dart';
import '../models/item.dart';
import '../models/request_model.dart';
import '../models/warehouse.dart';
import '../models/unit.dart';
import 'storage_service.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  late Dio _dio;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: Duration(seconds: 30),
        receiveTimeout: Duration(seconds: 30),
        contentType: 'application/json',
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = StorageService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            StorageService.clearAuth();
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
    );
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.delete<T>(
      path,
      queryParameters: queryParameters,
    );
  }

  Future<List<Item>> fetchItems() async {
    final res = await get<Map<String, dynamic>>('/items');
    final data = (res.data!['data'] as List<dynamic>);
    return data.map((e) => Item.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<RequestModel>> fetchMyRequests() async {
    final res = await get<Map<String, dynamic>>('/requests/my');
    final data = (res.data!['data'] as List<dynamic>);
    return data.map((e) => RequestModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<RequestModel>> fetchPendingRequests() async {
    final res = await get<Map<String, dynamic>>('/requests/pending/list');
    final data = (res.data!['data'] as List<dynamic>);
    return data.map((e) => RequestModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Warehouse>> fetchWarehouses() async {
    final res = await get<Map<String, dynamic>>('/warehouses');
    final data = (res.data!['data'] as List<dynamic>);
    return data.map((e) => Warehouse.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Unit>> fetchUnits() async {
    final res = await get<Map<String, dynamic>>('/units');
    final data = (res.data!['data'] as List<dynamic>);
    return data.map((e) => Unit.fromJson(e as Map<String, dynamic>)).toList();
  }
}
