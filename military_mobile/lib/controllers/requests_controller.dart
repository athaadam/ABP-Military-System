import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../models/request_model.dart';
import '../services/request_service.dart';

class RequestsController extends GetxController {
  final _requestService = RequestService();

  final requests = <RequestModel>[].obs;
  final isLoading = false.obs;
  final isCreating = false.obs;
  final isApproving = false.obs;
  final isRejecting = false.obs;
  final errorMessage = Rx<String?>(null);
  final successMessage = Rx<String?>(null);

  String get _userRole {
    try {
      final auth = Get.find<AuthController>();
      return auth.user.value?.role ?? 'user';
    } catch (_) {
      return 'user';
    }
  }

  bool get isAdminScope => _userRole == 'admin' || _userRole == 'superadmin';

  @override
  void onInit() {
    super.onInit();
    fetchRequests();
  }

  Future<void> fetchRequests() async {
    try {
      isLoading.value = true;
      errorMessage.value = null;

      if (isAdminScope) {
        requests.value = await _requestService.getPendingRequests();
      } else {
        requests.value = await _requestService.getMyRequests();
      }
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal memuat requests');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createRequest({
    required int itemId,
    required int quantity,
    required String reason,
  }) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;

      final normalizedReason = reason.trim();
      if (normalizedReason.isEmpty) {
        errorMessage.value = 'Alasan permintaan wajib diisi';
        return;
      }
      if (quantity <= 0) {
        errorMessage.value = 'Jumlah harus lebih dari 0';
        return;
      }

      await _requestService.create(
        itemId: itemId,
        quantity: quantity,
        reason: normalizedReason,
      );

      successMessage.value = 'Permintaan berhasil dibuat';
      await fetchRequests();
      Get.snackbar('Berhasil', 'Permintaan berhasil dibuat');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal membuat permintaan');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> approveRequest(int id) async {
    try {
      isApproving.value = true;
      errorMessage.value = null;
      await _requestService.approve(id);
      await fetchRequests();
      Get.snackbar('Berhasil', 'Permintaan disetujui');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal menyetujui permintaan');
    } finally {
      isApproving.value = false;
    }
  }

  Future<void> rejectRequest(int id) async {
    try {
      isRejecting.value = true;
      errorMessage.value = null;
      await _requestService.reject(id);
      await fetchRequests();
      Get.snackbar('Berhasil', 'Permintaan ditolak');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal menolak permintaan');
    } finally {
      isRejecting.value = false;
    }
  }

  String _getErrorMessage(dynamic error) {
    final msg = error.toString();
    if (msg.contains('401')) return 'Akses tidak diizinkan';
    if (msg.contains('403')) return 'Hanya admin yang dapat melakukan aksi ini';
    if (msg.contains('404')) return 'Permintaan tidak ditemukan';
    if (msg.contains('Insufficient stock')) return 'Stok tidak mencukupi';
    if (msg.contains('Connection refused')) return 'Tidak dapat terhubung ke server';
    return msg;
  }
}
