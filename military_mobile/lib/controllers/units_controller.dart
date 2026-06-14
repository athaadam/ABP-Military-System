import 'package:get/get.dart';
import '../models/unit.dart';
import '../services/unit_service.dart';

class UnitsController extends GetxController {
  final _unitService = UnitService();

  final units = <Unit>[].obs;
  final isLoading = false.obs;
  final isCreating = false.obs;
  final isUpdating = false.obs;
  final isDeleting = false.obs;
  final errorMessage = Rx<String?>(null);
  final successMessage = Rx<String?>(null);

  @override
  void onInit() {
    super.onInit();
    fetchUnits();
  }

  Future<void> fetchUnits() async {
    try {
      isLoading.value = true;
      errorMessage.value = null;

      final unitList = await _unitService.getAll();
      units.value = unitList;
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to fetch units');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createUnit({
    required String id,
    required String name,
    String? logo,
  }) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      final normalizedId = id.trim().toUpperCase();
      final normalizedName = name.trim();

      if (normalizedId.isEmpty || normalizedName.isEmpty) {
        errorMessage.value = 'Unit code and name are required';
        return;
      }

      if (!RegExp(r'^[A-Z0-9\-_]{3,50}$').hasMatch(normalizedId)) {
        errorMessage.value = 'Unit code must be 3-50 characters (letters, numbers, dash, underscore)';
        return;
      }

      await _unitService.create(
        id: normalizedId,
        name: normalizedName,
        logo: logo,
      );

      successMessage.value = 'Unit created successfully';
      await fetchUnits();

      Get.snackbar('Success', 'Unit created successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to create unit');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> updateUnit({
    required String id,
    required String name,
    String? logo,
  }) async {
    try {
      isUpdating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      final normalizedName = name.trim();

      if (normalizedName.isEmpty) {
        errorMessage.value = 'Unit name is required';
        return;
      }

      await _unitService.update(
        id,
        name: normalizedName,
        logo: logo,
      );

      successMessage.value = 'Unit updated successfully';
      await fetchUnits();

      Get.snackbar('Success', 'Unit updated successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to update unit');
    } finally {
      isUpdating.value = false;
    }
  }

  Future<void> deleteUnit(String id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = null;

      await _unitService.delete(id);

      await fetchUnits();
      Get.snackbar('Success', 'Unit deleted successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to delete unit');
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
        return 'Unit not found';
      } else if (message.contains('409')) {
        return 'Unit code already exists';
      } else if (message.contains('Connection refused')) {
        return 'Cannot connect to server';
      }

      return message;
    }
    return null;
  }
}
