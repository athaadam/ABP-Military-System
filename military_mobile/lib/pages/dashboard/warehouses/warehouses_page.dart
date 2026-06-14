import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../config/theme.dart';
import '../../../controllers/warehouses_controller.dart';
import 'widgets/warehouse_list_item.dart';
import 'widgets/create_warehouse_modal.dart';
import 'widgets/edit_warehouse_modal.dart';
import 'widgets/delete_warehouse_dialog.dart';

class WarehousesPage extends StatelessWidget {
  final _warehousesController = Get.put(WarehousesController());

  WarehousesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Warehouses'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          Obx(
            () => _warehousesController.isLoading.value
                ? const Padding(
                    padding: EdgeInsets.all(16),
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : IconButton(
                    icon: const Icon(Icons.refresh),
                    onPressed: () => _warehousesController.fetchWarehouses(),
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primary,
        onPressed: () => _showCreateModal(context),
        child: const Icon(Icons.add),
      ),
      body: Obx(
        () {
          if (_warehousesController.isLoading.value && _warehousesController.warehouses.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (_warehousesController.errorMessage.value != null && _warehousesController.warehouses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    _warehousesController.errorMessage.value ?? 'Failed to load warehouses',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _warehousesController.fetchWarehouses(),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (_warehousesController.warehouses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inbox, size: 48, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text(
                    'No warehouses found',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showCreateModal(context),
                    icon: const Icon(Icons.add),
                    label: const Text('Create Warehouse'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => _warehousesController.fetchWarehouses(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _warehousesController.warehouses.length,
              separatorBuilder: (context, index) => Divider(color: AppTheme.border),
              itemBuilder: (context, index) {
                final warehouse = _warehousesController.warehouses[index];
                return WarehouseListItem(
                  warehouse: warehouse,
                  onEdit: () => _showEditModal(context, warehouse),
                  onDelete: () => _showDeleteDialog(context, warehouse.id),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _showCreateModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => CreateWarehouseModal(controller: _warehousesController),
    );
  }

  void _showEditModal(BuildContext context, dynamic warehouse) {
    showDialog(
      context: context,
      builder: (context) => EditWarehouseModal(
        controller: _warehousesController,
        warehouse: warehouse,
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, String warehouseId) {
    showDialog(
      context: context,
      builder: (context) => DeleteWarehouseDialog(
        controller: _warehousesController,
        warehouseId: warehouseId,
      ),
    );
  }
}
