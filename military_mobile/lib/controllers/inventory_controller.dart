import 'package:get/get.dart';
import '../models/item.dart';
import '../services/inventory_service.dart';

class InventoryController extends GetxController {
  final _inventoryService = InventoryService();

  final items = <Item>[].obs;
  final isLoading = false.obs;
  final isCreating = false.obs;
  final isUpdating = false.obs;
  final isDeleting = false.obs;
  final errorMessage = Rx<String?>(null);
  final successMessage = Rx<String?>(null);

  static const List<String> categories = ['Persenjataan', 'Amunisi', 'Kendaraan Militer'];
  static const List<String> conditions = ['Aktif', 'Digunakan', 'Rusak', 'Perbaikan', 'Cadangan', 'Habis'];

  @override
  void onInit() {
    super.onInit();
    fetchItems();
  }

  Future<void> fetchItems() async {
    try {
      isLoading.value = true;
      errorMessage.value = null;
      items.value = await _inventoryService.getAll();
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal memuat inventory');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createItem({
    required String name,
    required String category,
    required int stock,
    required String condition,
    required int warehouseId,
  }) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;

      final normalizedName = name.trim();
      if (normalizedName.isEmpty) {
        errorMessage.value = 'Nama item wajib diisi';
        return;
      }
      if (stock < 0) {
        errorMessage.value = 'Stok tidak boleh negatif';
        return;
      }
      if (warehouseId <= 0) {
        errorMessage.value = 'Pilih gudang yang valid';
        return;
      }

      await _inventoryService.create(
        name: normalizedName,
        category: category,
        stock: stock,
        condition: condition,
        warehouseId: warehouseId,
      );

      successMessage.value = 'Item berhasil ditambahkan';
      await fetchItems();
      Get.snackbar('Berhasil', 'Item berhasil ditambahkan');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal menambahkan item');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> updateItem({
    required int id,
    String? name,
    String? category,
    int? stock,
    String? condition,
    int? warehouseId,
  }) async {
    try {
      isUpdating.value = true;
      errorMessage.value = null;

      await _inventoryService.update(
        id,
        name: name?.trim().isEmpty == true ? null : name?.trim(),
        category: category,
        stock: stock,
        condition: condition,
        warehouseId: warehouseId,
      );

      successMessage.value = 'Item berhasil diupdate';
      await fetchItems();
      Get.snackbar('Berhasil', 'Item berhasil diupdate');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal mengupdate item');
    } finally {
      isUpdating.value = false;
    }
  }

  Future<void> deleteItem(int id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = null;
      await _inventoryService.delete(id);
      await fetchItems();
      Get.snackbar('Berhasil', 'Item berhasil dihapus');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Gagal menghapus item');
    } finally {
      isDeleting.value = false;
    }
  }

  String _getErrorMessage(dynamic error) {
    final msg = error.toString();
    if (msg.contains('401')) return 'Akses tidak diizinkan';
    if (msg.contains('403')) return 'Anda tidak memiliki akses ke gudang ini';
    if (msg.contains('404')) return 'Item tidak ditemukan';
    if (msg.contains('Connection refused')) return 'Tidak dapat terhubung ke server';
    if (msg.contains('Insufficient stock')) return 'Stok tidak mencukupi';
    return msg;
  }
}
