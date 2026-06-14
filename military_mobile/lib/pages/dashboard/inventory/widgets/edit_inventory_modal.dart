import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/inventory_controller.dart';
import '../../../../models/inventory_item.dart';

class EditInventoryModal extends StatefulWidget {
  final InventoryController controller;
  final InventoryItem item;

  const EditInventoryModal({
    super.key,
    required this.controller,
    required this.item,
  });

  @override
  State<EditInventoryModal> createState() => _EditInventoryModalState();
}

class _EditInventoryModalState extends State<EditInventoryModal> {
  late TextEditingController _nameController;
  late TextEditingController _categoryController;
  late TextEditingController _quantityController;
  late TextEditingController _unitController;
  late TextEditingController _minStockController;
  late TextEditingController _warehouseIdController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.item.name);
    _categoryController = TextEditingController(text: widget.item.category);
    _quantityController = TextEditingController(text: widget.item.quantity.toString());
    _unitController = TextEditingController(text: widget.item.unit);
    _minStockController = TextEditingController(text: widget.item.minStock.toString());
    _warehouseIdController = TextEditingController(text: widget.item.warehouseId);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _categoryController.dispose();
    _quantityController.dispose();
    _unitController.dispose();
    _minStockController.dispose();
    _warehouseIdController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    widget.controller.updateItem(
      id: widget.item.id,
      name: _nameController.text,
      category: _categoryController.text,
      quantity: int.tryParse(_quantityController.text) ?? widget.item.quantity,
      unit: _unitController.text,
      minStock: int.tryParse(_minStockController.text) ?? widget.item.minStock,
      warehouseId: _warehouseIdController.text,
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
                    'Edit Item',
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
              _buildReadOnlyField('Item Code', widget.item.code),
              const SizedBox(height: 12),
              _buildTextField(_nameController, 'Item Name'),
              const SizedBox(height: 12),
              _buildTextField(_categoryController, 'Category'),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      _quantityController,
                      'Quantity',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(_unitController, 'Unit'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildTextField(
                _minStockController,
                'Minimum Stock',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              _buildTextField(_warehouseIdController, 'Warehouse ID'),
              const SizedBox(height: 20),
              Obx(
                () => widget.controller.errorMessage.value != null
                    ? Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
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

  Widget _buildReadOnlyField(String label, String value) {
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
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppTheme.darkSurface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppTheme.border),
          ),
          child: Text(
            value,
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label, {
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
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: TextStyle(color: AppTheme.textPrimary),
          decoration: InputDecoration(
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
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ],
    );
  }
}
