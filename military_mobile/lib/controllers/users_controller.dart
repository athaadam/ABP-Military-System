import 'package:get/get.dart';
import '../models/user.dart';
import '../models/unit.dart';
import '../services/user_service.dart';
import '../services/unit_service.dart';

class UsersController extends GetxController {
  final _userService = UserService();
  final _unitService = UnitService();

  final users = <User>[].obs;
  final units = <Unit>[].obs;
  final isLoading = false.obs;
  final isCreating = false.obs;
  final isUpdating = false.obs;
  final isDeleting = false.obs;
  final isResetting = false.obs;
  final errorMessage = Rx<String?>(null);
  final successMessage = Rx<String?>(null);
  final newPassword = Rx<String?>(null);

  @override
  void onInit() {
    super.onInit();
    fetchData();
  }

  Future<void> fetchData() async {
    try {
      isLoading.value = true;
      errorMessage.value = null;
      final results = await Future.wait([
        _userService.getAll(),
        _unitService.getAll(),
      ]);
      users.value = results[0] as List<User>;
      units.value = results[1] as List<Unit>;
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
    } finally {
      isLoading.value = false;
    }
  }

  String getUnitName(String unitId) {
    final unit = units.firstWhereOrNull((u) => u.id == unitId);
    return unit?.name ?? unitId;
  }

  Future<void> createUser({
    required String name,
    required String email,
    required String password,
    required String unitId,
  }) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      if (name.trim().isEmpty || email.trim().isEmpty || password.isEmpty || unitId.trim().isEmpty) {
        errorMessage.value = 'Semua field wajib diisi';
        return;
      }
      if (password.length < 6) {
        errorMessage.value = 'Password minimal 6 karakter';
        return;
      }

      await _userService.create(
        name: name.trim(),
        email: email.trim(),
        password: password,
        unitId: unitId.trim(),
      );

      successMessage.value = 'Akun admin berhasil dibuat';
      await fetchData();
      Get.snackbar('Berhasil', 'Akun admin berhasil dibuat');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal membuat akun');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> updateUser(
    int id, {
    String? name,
    String? email,
    String? role,
    String? unitId,
  }) async {
    try {
      isUpdating.value = true;
      errorMessage.value = null;

      await _userService.update(id, name: name, email: email, role: role, unitId: unitId);

      await fetchData();
      Get.snackbar('Berhasil', 'User berhasil diupdate');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal mengupdate user');
    } finally {
      isUpdating.value = false;
    }
  }

  Future<void> deleteUser(int id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = null;
      await _userService.delete(id);
      await fetchData();
      Get.snackbar('Berhasil', 'User berhasil dihapus');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal menghapus user');
    } finally {
      isDeleting.value = false;
    }
  }

  Future<void> resetPassword(int id) async {
    try {
      isResetting.value = true;
      errorMessage.value = null;
      newPassword.value = null;
      final pwd = await _userService.resetPassword(id);
      newPassword.value = pwd;
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal reset password');
    } finally {
      isResetting.value = false;
    }
  }

  String _getErrorMessage(dynamic error) {
    final msg = error.toString();
    if (msg.contains('401')) return 'Akses tidak diizinkan';
    if (msg.contains('403')) return 'Hanya superadmin yang dapat mengelola users';
    if (msg.contains('404')) return 'User tidak ditemukan';
    if (msg.contains('409')) return 'Email sudah terdaftar';
    if (msg.contains('Connection refused')) return 'Tidak dapat terhubung ke server';
    return msg;
  }
}
