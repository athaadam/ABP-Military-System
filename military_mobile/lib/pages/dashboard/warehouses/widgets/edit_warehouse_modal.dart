import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/warehouses_controller.dart';
import '../../../../models/warehouse.dart';

class EditWarehouseModal extends StatefulWidget {
  final WarehousesController controller;
  final Warehouse warehouse;

  const EditWarehouseModal({
    super.key,
    required this.controller,
    required this.warehouse,
  });

  @override
  State<EditWarehouseModal> createState() => _EditWarehouseModalState();
}

class _EditWarehouseModalState extends State<EditWarehouseModal> {
  late TextEditingController _nameController;
  late TextEditingController _locationController;
  late TextEditingController _capacityController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.warehouse.name);
    _locationController = TextEditingController(text: widget.warehouse.location);
    _capacityController = TextEditingController(text: widget.warehouse.capacity.toString());
  }

  @override
  void dispose() {
    _nameController.dispose();
    _locationController.dispose();
    _capacityController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    widget.controller.updateWarehouse(
      id: widget.warehouse.id,
      name: _nameController.text,
      location: _locationController.text,
      capacity: int.tryParse(_capacityController.text) ?? widget.warehouse.capacity,
    );

    if (widget.controller.errorMessage.value == null) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.darkCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SingleChildScrollView(
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
                    'Edit Warehouse',
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
              const SizedBox(height: 20),
              Text(
                'Warehouse Code',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Text(
                  widget.warehouse.id,
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Warehouse code cannot be changed',
                style: TextStyle(
                  fontSize: 11,
                  color: AppTheme.textTertiary,
                ),
              ),
              const SizedBox(height: 16),
              _buildTextField(_nameController, 'Warehouse Name', 'Enter warehouse name'),
              const SizedBox(height: 16),
              _buildTextField(_locationController, 'Location', 'Enter location'),
              const SizedBox(height: 16),
              _buildTextField(
                _capacityController,
                'Capacity',
                'Enter capacity',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),
              Obx(
                () => widget.controller.errorMessage.value != null
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
                          widget.controller.errorMessage.value ?? '',
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
                        onPressed: widget.controller.isUpdating.value
                            ? null
                            : _handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text(
                          widget.controller.isUpdating.value
                              ? 'Updating...'
                              : 'Update',
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
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    String hint, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppTheme.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: TextStyle(color: AppTheme.textPrimary),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: AppTheme.textTertiary),
            filled: true,
            fillColor: AppTheme.darkSurface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppTheme.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppTheme.border),
            ),
          ),
        ),
      ],
    );
  }
}
