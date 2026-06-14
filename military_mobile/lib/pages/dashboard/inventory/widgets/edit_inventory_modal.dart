import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/inventory_controller.dart';
import '../../../../models/item.dart';
import '../../../../models/warehouse.dart';

class EditInventoryModal extends StatefulWidget {
  final InventoryController controller;
  final Item item;
  final List<Warehouse> warehouses;

  const EditInventoryModal({
    super.key,
    required this.controller,
    required this.item,
    required this.warehouses,
  });

  @override
  State<EditInventoryModal> createState() => _EditInventoryModalState();
}

class _EditInventoryModalState extends State<EditInventoryModal> {
  late TextEditingController _nameController;
  late TextEditingController _stockController;
  late String _selectedCategory;
  late String _selectedCondition;
  late int _selectedWarehouseId;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.item.name);
    _stockController = TextEditingController(text: widget.item.stock.toString());

    _selectedCategory = InventoryController.categories.contains(widget.item.category)
        ? widget.item.category
        : InventoryController.categories.first;

    _selectedCondition = InventoryController.conditions.contains(widget.item.condition)
        ? widget.item.condition
        : InventoryController.conditions.first;

    final match = widget.warehouses.any((w) => w.id == widget.item.warehouseId);
    _selectedWarehouseId = match
        ? widget.item.warehouseId
        : (widget.warehouses.isNotEmpty ? widget.warehouses.first.id : widget.item.warehouseId);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _stockController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    widget.controller.errorMessage.value = null;

    await widget.controller.updateItem(
      id: widget.item.id,
      name: _nameController.text,
      category: _selectedCategory,
      stock: int.tryParse(_stockController.text) ?? widget.item.stock,
      condition: _selectedCondition,
      warehouseId: _selectedWarehouseId,
    );

    if (widget.controller.errorMessage.value == null && mounted) {
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
              _buildTextField(_nameController, 'Nama Item'),
              const SizedBox(height: 12),
              _buildDropdown<String>(
                label: 'Kategori',
                value: _selectedCategory,
                items: InventoryController.categories,
                itemLabel: (c) => c,
                onChanged: (v) => setState(() => _selectedCategory = v ?? _selectedCategory),
              ),
              const SizedBox(height: 12),
              _buildTextField(
                _stockController,
                'Stok',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              _buildDropdown<String>(
                label: 'Kondisi',
                value: _selectedCondition,
                items: InventoryController.conditions,
                itemLabel: (c) => c,
                onChanged: (v) => setState(() => _selectedCondition = v ?? _selectedCondition),
              ),
              const SizedBox(height: 12),
              _buildDropdown<int>(
                label: 'Gudang',
                value: _selectedWarehouseId,
                items: widget.warehouses.map((w) => w.id).toList(),
                itemLabel: (id) => widget.warehouses.firstWhere((w) => w.id == id).name,
                onChanged: (v) => setState(() => _selectedWarehouseId = v ?? _selectedWarehouseId),
                emptyHint: 'Tidak ada gudang tersedia',
              ),
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
                      child: const Text('Batal'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Obx(
                      () => ElevatedButton(
                        onPressed: widget.controller.isUpdating.value ? null : _handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text(
                          widget.controller.isUpdating.value ? 'Menyimpan...' : 'Simpan',
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

  Widget _buildDropdown<T>({
    required String label,
    required T? value,
    required List<T> items,
    required String Function(T) itemLabel,
    required void Function(T?) onChanged,
    String? emptyHint,
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
        items.isEmpty
            ? Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Text(
                  emptyHint ?? 'Tidak ada pilihan',
                  style: TextStyle(color: AppTheme.textTertiary, fontSize: 14),
                ),
              )
            : Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: DropdownButton<T>(
                  value: value,
                  isExpanded: true,
                  dropdownColor: AppTheme.darkCard,
                  style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                  underline: const SizedBox.shrink(),
                  items: items
                      .map((item) => DropdownMenuItem<T>(
                            value: item,
                            child: Text(itemLabel(item)),
                          ))
                      .toList(),
                  onChanged: onChanged,
                ),
              ),
      ],
    );
  }
}
