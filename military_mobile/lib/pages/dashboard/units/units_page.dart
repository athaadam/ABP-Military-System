import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../config/theme.dart';
import '../../../controllers/units_controller.dart';
import 'widgets/unit_list_item.dart';
import 'widgets/create_unit_modal.dart';
import 'widgets/edit_unit_modal.dart';
import 'widgets/delete_unit_dialog.dart';

class UnitsPage extends StatelessWidget {
  final _unitsController = Get.put(UnitsController());

  UnitsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Units'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          Obx(
            () => _unitsController.isLoading.value
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
                    onPressed: () => _unitsController.fetchUnits(),
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
          if (_unitsController.isLoading.value && _unitsController.units.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (_unitsController.errorMessage.value != null && _unitsController.units.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    _unitsController.errorMessage.value ?? 'Failed to load units',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _unitsController.fetchUnits(),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (_unitsController.units.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inbox, size: 48, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text(
                    'No units found',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showCreateModal(context),
                    icon: const Icon(Icons.add),
                    label: const Text('Create Unit'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => _unitsController.fetchUnits(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _unitsController.units.length,
              separatorBuilder: (context, index) => Divider(color: AppTheme.border),
              itemBuilder: (context, index) {
                final unit = _unitsController.units[index];
                return UnitListItem(
                  unit: unit,
                  onEdit: () => _showEditModal(context, unit),
                  onDelete: () => _showDeleteDialog(context, unit.id),
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
      builder: (context) => CreateUnitModal(controller: _unitsController),
    );
  }

  void _showEditModal(BuildContext context, dynamic unit) {
    showDialog(
      context: context,
      builder: (context) => EditUnitModal(
        controller: _unitsController,
        unit: unit,
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, String unitId) {
    showDialog(
      context: context,
      builder: (context) => DeleteUnitDialog(
        controller: _unitsController,
        unitId: unitId,
      ),
    );
  }
}
