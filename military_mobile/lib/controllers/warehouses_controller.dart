import 'package:get/get.dart';
import '../models/warehouse.dart';
import '../services/warehouse_service.dart';

class WarehousesController extends GetxController {
  final _warehouseService = WarehouseService();

  final warehouses = <Warehouse>[].obs;
  final isLoading = false.obs;
  final isCreating = false.obs;
  final isUpdating = false.obs;
  final isDeleting = false.obs;
  final errorMessage = Rx<String?>(null);
  final successMessage = Rx<String?>(null);

  @override
  void onInit() {
    super.onInit();
    fetchWarehouses();
  }

  Future<void> fetchWarehouses() async {
    try {
      isLoading.value = true;
      errorMessage.value = null;
      warehouses.value = await _warehouseService.getAll();
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal memuat gudang');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createWarehouse({
    required String name,
    required String unitId,
  }) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;

      final normalizedName = name.trim();
      final normalizedUnitId = unitId.trim();

      if (normalizedName.isEmpty || normalizedUnitId.isEmpty) {
        errorMessage.value = 'Nama gudang dan Unit ID wajib diisi';
        return;
      }

      await _warehouseService.create(name: normalizedName, unitId: normalizedUnitId);

      successMessage.value = 'Gudang berhasil dibuat';
      await fetchWarehouses();
      Get.snackbar('Berhasil', 'Gudang berhasil dibuat');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal membuat gudang');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> updateWarehouse({
    required int id,
    String? name,
    String? unitId,
  }) async {
    try {
      isUpdating.value = true;
      errorMessage.value = null;

      final normalizedName = name?.trim();
      if (normalizedName?.isEmpty == true) {
        errorMessage.value = 'Nama gudang tidak boleh kosong';
        return;
      }

      await _warehouseService.update(id, name: normalizedName, unitId: unitId?.trim());

      successMessage.value = 'Gudang berhasil diupdate';
      await fetchWarehouses();
      Get.snackbar('Berhasil', 'Gudang berhasil diupdate');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal mengupdate gudang');
    } finally {
      isUpdating.value = false;
    }
  }

  Future<void> deleteWarehouse(int id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = null;
      await _warehouseService.delete(id);
      await fetchWarehouses();
      Get.snackbar('Berhasil', 'Gudang berhasil dihapus');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal menghapus gudang');
    } finally {
      isDeleting.value = false;
    }
  }

  String _getErrorMessage(dynamic error) {
    final msg = error.toString();
    if (msg.contains('401')) return 'Akses tidak diizinkan';
    if (msg.contains('403')) return 'Admin hanya dapat mengelola gudang di unit mereka';
    if (msg.contains('404')) return 'Gudang tidak ditemukan';
    if (msg.contains('Connection refused')) return 'Tidak dapat terhubung ke server';
    return msg;
  }
}
