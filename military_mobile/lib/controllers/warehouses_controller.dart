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

      final warehouseList = await _warehouseService.getAll();
      warehouses.value = warehouseList;
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to fetch warehouses');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createWarehouse({
    required String id,
    required String name,
    required String location,
    required int capacity,
  }) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      final normalizedId = id.trim().toUpperCase();
      final normalizedName = name.trim();
      final normalizedLocation = location.trim();

      if (normalizedId.isEmpty || normalizedName.isEmpty || normalizedLocation.isEmpty) {
        errorMessage.value = 'All fields are required';
        return;
      }

      if (capacity <= 0) {
        errorMessage.value = 'Capacity must be greater than 0';
        return;
      }

      await _warehouseService.create(
        id: normalizedId,
        name: normalizedName,
        location: normalizedLocation,
        capacity: capacity,
      );

      successMessage.value = 'Warehouse created successfully';
      await fetchWarehouses();

      Get.snackbar('Success', 'Warehouse created successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to create warehouse');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> updateWarehouse({
    required String id,
    required String name,
    required String location,
    required int capacity,
  }) async {
    try {
      isUpdating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      final normalizedName = name.trim();
      final normalizedLocation = location.trim();

      if (normalizedName.isEmpty || normalizedLocation.isEmpty) {
        errorMessage.value = 'All fields are required';
        return;
      }

      if (capacity <= 0) {
        errorMessage.value = 'Capacity must be greater than 0';
        return;
      }

      await _warehouseService.update(
        id,
        name: normalizedName,
        location: normalizedLocation,
        capacity: capacity,
      );

      successMessage.value = 'Warehouse updated successfully';
      await fetchWarehouses();

      Get.snackbar('Success', 'Warehouse updated successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to update warehouse');
    } finally {
      isUpdating.value = false;
    }
  }

  Future<void> deleteWarehouse(String id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = null;

      await _warehouseService.delete(id);

      await fetchWarehouses();
      Get.snackbar('Success', 'Warehouse deleted successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to delete warehouse');
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
        return 'Warehouse not found';
      } else if (message.contains('409')) {
        return 'Warehouse code already exists';
      } else if (message.contains('Connection refused')) {
        return 'Cannot connect to server';
      }

      return message;
    }
    return null;
  }
}
