import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/inventory_controller.dart';

class CreateInventoryModal extends StatefulWidget {
  final InventoryController controller;

  const CreateInventoryModal({
    super.key,
    required this.controller,
  });

  @override
  State<CreateInventoryModal> createState() => _CreateInventoryModalState();
}

class _CreateInventoryModalState extends State<CreateInventoryModal> {
  late TextEditingController _nameController;
  late TextEditingController _codeController;
  late TextEditingController _categoryController;
  late TextEditingController _quantityController;
  late TextEditingController _unitController;
  late TextEditingController _minStockController;
  late TextEditingController _warehouseIdController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _codeController = TextEditingController();
    _categoryController = TextEditingController();
    _quantityController = TextEditingController(text: '0');
    _unitController = TextEditingController(text: 'pcs');
    _minStockController = TextEditingController(text: '0');
    _warehouseIdController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _categoryController.dispose();
    _quantityController.dispose();
    _unitController.dispose();
    _minStockController.dispose();
    _warehouseIdController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    widget.controller.createItem(
      name: _nameController.text,
      code: _codeController.text,
      category: _categoryController.text,
      quantity: int.tryParse(_quantityController.text) ?? 0,
      unit: _unitController.text,
      minStock: int.tryParse(_minStockController.text) ?? 0,
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
                    'Add Inventory Item',
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
              _buildTextField(_nameController, 'Item Name', 'e.g., Rifle'),
              const SizedBox(height: 12),
              _buildTextField(_codeController, 'Item Code', 'e.g., RIF-001'),
              const SizedBox(height: 12),
              _buildTextField(_categoryController, 'Category', 'e.g., Weapons'),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      _quantityController,
                      'Quantity',
                      '0',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(_unitController, 'Unit', 'pcs'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildTextField(
                _minStockController,
                'Minimum Stock',
                '0',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              _buildTextField(_warehouseIdController, 'Warehouse ID', 'e.g., WH-01'),
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
                        onPressed: widget.controller.isCreating.value
                            ? null
                            : _handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text(
                          widget.controller.isCreating.value
                              ? 'Adding...'
                              : 'Add Item',
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
        const SizedBox(height: 4),
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
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ],
    );
  }
}
