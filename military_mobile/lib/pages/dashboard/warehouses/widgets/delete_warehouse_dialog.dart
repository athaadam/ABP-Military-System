import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/warehouses_controller.dart';

class DeleteWarehouseDialog extends StatelessWidget {
  final WarehousesController controller;
  final String warehouseId;

  const DeleteWarehouseDialog({
    super.key,
    required this.controller,
    required this.warehouseId,
  });

  void _handleDelete() {
    controller.deleteWarehouse(warehouseId);
    Navigator.of(Get.context!).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.darkCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Delete Warehouse',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close),
                  color: Colors.grey,
                ),
              ],
            ),
            const SizedBox(height: 16),
            RichText(
              text: TextSpan(
                children: [
                  const TextSpan(
                    text: 'Are you sure you want to delete warehouse ',
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                  TextSpan(
                    text: warehouseId,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const TextSpan(
                    text: '? This action cannot be undone.',
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Obx(
              () => controller.errorMessage.value != null
                  ? Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: Colors.red.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Text(
                        controller.errorMessage.value ?? '',
                        style: const TextStyle(color: Colors.red, fontSize: 12),
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: AppTheme.border),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Obx(
                    () => ElevatedButton(
                      onPressed: controller.isDeleting.value ? null : _handleDelete,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: Text(
                        controller.isDeleting.value ? 'Deleting...' : 'Delete',
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
