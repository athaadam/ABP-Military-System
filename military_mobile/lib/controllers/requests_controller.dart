import 'package:get/get.dart';
import '../models/request_model.dart';
import '../services/request_service.dart';

class RequestsController extends GetxController {
  final _requestService = RequestService();

  final requests = <RequestModel>[].obs;
  final isLoading = false.obs;
  final isCreating = false.obs;
  final isUpdating = false.obs;
  final isDeleting = false.obs;
  final isApproving = false.obs;
  final isRejecting = false.obs;
  final errorMessage = Rx<String?>(null);
  final successMessage = Rx<String?>(null);

  @override
  void onInit() {
    super.onInit();
    fetchRequests();
  }

  Future<void> fetchRequests() async {
    try {
      isLoading.value = true;
      errorMessage.value = null;

      final requestList = await _requestService.getAll();
      requests.value = requestList;
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to fetch requests');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createRequest({
    required String itemId,
    required String itemName,
    required int quantity,
    required String unit,
    required String reason,
  }) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      final normalizedItemName = itemName.trim();
      final normalizedReason = reason.trim();

      if (normalizedItemName.isEmpty || normalizedReason.isEmpty) {
        errorMessage.value = 'Item name and reason are required';
        return;
      }

      if (quantity <= 0) {
        errorMessage.value = 'Quantity must be greater than 0';
        return;
      }

      await _requestService.create(
        itemId: itemId,
        itemName: normalizedItemName,
        quantity: quantity,
        unit: unit,
        reason: normalizedReason,
      );

      successMessage.value = 'Request created successfully';
      await fetchRequests();
      Get.snackbar('Success', 'Request created successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to create request');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> updateRequest({
    required String id,
    required String itemId,
    required String itemName,
    required int quantity,
    required String unit,
    required String reason,
  }) async {
    try {
      isUpdating.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      final normalizedItemName = itemName.trim();
      final normalizedReason = reason.trim();

      if (normalizedItemName.isEmpty || normalizedReason.isEmpty) {
        errorMessage.value = 'Item name and reason are required';
        return;
      }

      if (quantity <= 0) {
        errorMessage.value = 'Quantity must be greater than 0';
        return;
      }

      await _requestService.update(
        id,
        itemId: itemId,
        itemName: normalizedItemName,
        quantity: quantity,
        unit: unit,
        reason: normalizedReason,
      );

      successMessage.value = 'Request updated successfully';
      await fetchRequests();
      Get.snackbar('Success', 'Request updated successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to update request');
    } finally {
      isUpdating.value = false;
    }
  }

  Future<void> approveRequest(String id) async {
    try {
      isApproving.value = true;
      errorMessage.value = null;

      await _requestService.approve(id);
      await fetchRequests();
      Get.snackbar('Success', 'Request approved successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to approve request');
    } finally {
      isApproving.value = false;
    }
  }

  Future<void> rejectRequest(String id) async {
    try {
      isRejecting.value = true;
      errorMessage.value = null;

      await _requestService.reject(id);
      await fetchRequests();
      Get.snackbar('Success', 'Request rejected successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to reject request');
    } finally {
      isRejecting.value = false;
    }
  }

  Future<void> deleteRequest(String id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = null;

      await _requestService.delete(id);
      await fetchRequests();
      Get.snackbar('Success', 'Request deleted successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to delete request');
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
        return 'Request not found';
      } else if (message.contains('Connection refused')) {
        return 'Cannot connect to server';
      }

      return message;
    }
    return null;
  }
}
