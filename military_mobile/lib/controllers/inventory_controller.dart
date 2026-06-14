import 'package:get/get.dart';
import '../models/inventory_item.dart';
import '../services/inventory_service.dart';

class InventoryController extends GetxController {
  final _inventoryService = InventoryService();

  final items = <InventoryItem>[].obs;
  final isLoading = false.obs;
  final isCreating = false.obs;
  final isUpdating = false.obs;
  final isDeleting = false.obs;
  final errorMessage = Rx<String?>(null);
  final successMessage = Rx<String?>(null);

  @override
  void onInit() {
    super.onInit();
    fetchItems();
  }

  Future<void> fetchItems() async {
    try {
      isLoading.value = true;
      errorMessage.value = null;

      final itemList = await _inventoryService.getAll();
      items.value = itemList;
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to fetch inventory');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createItem({
    required String name,
    required String code,
    required String category,
    required int quantity,
    required String unit,
    required int minStock,
    required String warehouseId,
  }) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      final normalizedName = name.trim();
      final normalizedCode = code.trim().toUpperCase();
      final normalizedCategory = category.trim();

      if (normalizedName.isEmpty || normalizedCode.isEmpty || normalizedCategory.isEmpty) {
        errorMessage.value = 'Name, code, and category are required';
        return;
      }

      if (quantity < 0) {
        errorMessage.value = 'Quantity cannot be negative';
        return;
      }

      if (minStock < 0) {
        errorMessage.value = 'Minimum stock cannot be negative';
        return;
      }

      await _inventoryService.create(
        name: normalizedName,
        code: normalizedCode,
        category: normalizedCategory,
        quantity: quantity,
        unit: unit,
        minStock: minStock,
        warehouseId: warehouseId,
      );

      successMessage.value = 'Item created successfully';
      await fetchItems();

      Get.snackbar('Success', 'Item created successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to create item');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> updateItem({
    required String id,
    required String name,
    required String category,
    required int quantity,
    required String unit,
    required int minStock,
    required String warehouseId,
  }) async {
    try {
      isUpdating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      final normalizedName = name.trim();
      final normalizedCategory = category.trim();

      if (normalizedName.isEmpty || normalizedCategory.isEmpty) {
        errorMessage.value = 'Name and category are required';
        return;
      }

      if (quantity < 0) {
        errorMessage.value = 'Quantity cannot be negative';
        return;
      }

      if (minStock < 0) {
        errorMessage.value = 'Minimum stock cannot be negative';
        return;
      }

      await _inventoryService.update(
        id,
        name: normalizedName,
        category: normalizedCategory,
        quantity: quantity,
        unit: unit,
        minStock: minStock,
        warehouseId: warehouseId,
      );

      successMessage.value = 'Item updated successfully';
      await fetchItems();

      Get.snackbar('Success', 'Item updated successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to update item');
    } finally {
      isUpdating.value = false;
    }
  }

  Future<void> deleteItem(String id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = null;

      await _inventoryService.delete(id);

      await fetchItems();
      Get.snackbar('Success', 'Item deleted successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to delete item');
    } finally {
      isDeleting.value = false;
    }
  }

  String? _getErrorMessage(dynamic error) {
    if (error is Exception) {
      final message = error.toString();

      if (message.contains('401')) {
        return 'Unauthorized access';
      } else if (message.contains('404')) {
        return 'Item not found';
      } else if (message.contains('409')) {
        return 'Item code already exists';
      } else if (message.contains('Connection refused')) {
        return 'Cannot connect to server';
      }

      return message;
    }
    return null;
  }
}
