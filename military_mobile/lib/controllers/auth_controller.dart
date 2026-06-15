import 'package:get/get.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthController extends GetxController {
  final _apiService = ApiService();

  final isLoading = false.obs;
  final isRegistering = false.obs;
  final isAuthenticated = false.obs;
  final user = Rx<User?>(null);
  final errorMessage = Rx<String?>(null);

  @override
  void onInit() {
    super.onInit();
    _checkAuthentication();
  }

  void _checkAuthentication() {
    final token = StorageService.getToken();
    final userData = StorageService.getUser();

    if (token != null && userData != null) {
      isAuthenticated.value = true;
      user.value = User.fromJson(userData);
    }
  }

  Future<void> login(String email, String password) async {
    try {
      isLoading.value = true;
      errorMessage.value = null;

      final response = await _apiService.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      final authResponse = AuthResponse.fromJson(
        response.data as Map<String, dynamic>,
      );

      if (!authResponse.user.isUser) {
        errorMessage.value = 'Akses ditolak. Aplikasi ini hanya untuk anggota.';
        return;
      }

      await StorageService.saveToken(authResponse.token);
      await StorageService.saveUser(authResponse.user.toJson());

      user.value = authResponse.user;
      isAuthenticated.value = true;

      Get.offAllNamed('/user-dashboard');
    } on Exception catch (e) {
      errorMessage.value = e.toString();
      Get.snackbar('Error', 'Login failed: ${errorMessage.value}');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String unitId,
  }) async {
    try {
      isRegistering.value = true;
      errorMessage.value = null;

      await _apiService.post(
        '/auth/register',
        data: {
          'name': name,
          'email': email,
          'password': password,
          'unitId': unitId,
          'role': 'user',
        },
      );

      Get.back();
      Get.snackbar('Berhasil', 'Akun berhasil dibuat! Silakan login.',
          duration: const Duration(seconds: 3));
    } on Exception catch (e) {
      final msg = e.toString();
      if (msg.contains('409') || msg.contains('already')) {
        errorMessage.value = 'Email sudah terdaftar';
      } else if (msg.contains('Connection refused')) {
        errorMessage.value = 'Tidak dapat terhubung ke server';
      } else if (msg.contains('400')) {
        errorMessage.value = 'Data tidak valid, periksa kembali';
      } else {
        errorMessage.value = 'Pendaftaran gagal, coba lagi';
      }
    } finally {
      isRegistering.value = false;
    }
  }

  Future<void> logout() async {
    try {
      await StorageService.clearAuth();
      user.value = null;
      isAuthenticated.value = false;
      Get.offAllNamed('/login');
    } catch (e) {
      Get.snackbar('Error', 'Logout failed');
    }
  }
}
