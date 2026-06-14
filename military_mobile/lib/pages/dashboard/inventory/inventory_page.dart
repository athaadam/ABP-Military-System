import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../config/theme.dart';
import '../../../controllers/inventory_controller.dart';
import '../../../controllers/warehouses_controller.dart';
import '../../../models/item.dart';
import 'widgets/inventory_list_item.dart';
import 'widgets/create_inventory_modal.dart';
import 'widgets/edit_inventory_modal.dart';
import 'widgets/delete_inventory_dialog.dart';

class InventoryPage extends StatelessWidget {
  final InventoryController _inventoryController = Get.put(InventoryController());
  final WarehousesController _warehousesController = Get.isRegistered<WarehousesController>()
      ? Get.find<WarehousesController>()
      : Get.put(WarehousesController());

  InventoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Inventory'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          Obx(
            () => _inventoryController.isLoading.value
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
                    onPressed: () => _inventoryController.fetchItems(),
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
          if (_inventoryController.isLoading.value && _inventoryController.items.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (_inventoryController.errorMessage.value != null &&
              _inventoryController.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    _inventoryController.errorMessage.value ?? 'Gagal memuat inventory',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _inventoryController.fetchItems(),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          if (_inventoryController.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inbox, size: 48, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text(
                    'Belum ada item inventory',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showCreateModal(context),
                    icon: const Icon(Icons.add),
                    label: const Text('Tambah Item'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => _inventoryController.fetchItems(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _inventoryController.items.length,
              separatorBuilder: (context, index) => Divider(color: AppTheme.border),
              itemBuilder: (context, index) {
                final item = _inventoryController.items[index];
                return InventoryListItem(
                  item: item,
                  onEdit: () => _showEditModal(context, item),
                  onDelete: () => _showDeleteDialog(context, item),
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
      builder: (context) => CreateInventoryModal(
        controller: _inventoryController,
        warehouses: _warehousesController.warehouses,
      ),
    );
  }

  void _showEditModal(BuildContext context, Item item) {
    showDialog(
      context: context,
      builder: (context) => EditInventoryModal(
        controller: _inventoryController,
        item: item,
        warehouses: _warehousesController.warehouses,
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, Item item) {
    showDialog(
      context: context,
      builder: (context) => DeleteInventoryDialog(
        controller: _inventoryController,
        itemId: item.id,
        itemName: item.name,
      ),
    );
  }
}
